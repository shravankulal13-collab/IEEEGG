import { v4 as uuidv4 } from 'uuid';
import { isPostgresConnected, pool, query } from '../../config/database.js';
import type {
  CreatePublicReportInput,
  PublicFeedItem,
  PublicHealthPost,
  PublicIncidentReport,
  PublicReaction,
  PublicReportCategory,
} from './public.types.js';

const fallbackReports = new Map<string, PublicIncidentReport>();
const fallbackReactions = new Map<string, { userId: string; reaction: PublicReaction }>();
const fallbackHealthPosts = new Map<string, PublicHealthPost>();
const fallbackLikes = new Map<string, string>();

function mapRow(row: any): PublicIncidentReport {
  return {
    post_type: 'emergency',
    ...row,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    trust_score: Number(row.trust_score || 0),
    total_votes: Number(row.total_votes || 0),
    confirm_votes: Number(row.confirm_votes || 0),
    dispute_votes: Number(row.dispute_votes || 0),
  };
}

export class PublicRepository {
  async list(userId?: string): Promise<PublicFeedItem[]> {
    if (pool && isPostgresConnected) {
      try {
        const emergencyResult = await query(`
          SELECT ir.id, ir.reporter_id, ir.image_url,
                 ST_Y(ir.location::geometry) AS latitude,
                 ST_X(ir.location::geometry) AS longitude,
                 ir.description, ir.category, ir.status, ir.trust_score,
                 ir.total_votes, ir.confirm_votes, ir.dispute_votes,
                 ir.incident_id, ir.created_at, ir.updated_at,
                 r.reaction AS user_reaction
          FROM incident_reports ir
          LEFT JOIN incident_reactions r
            ON r.incident_id = ir.id AND r.user_id = $1
          ORDER BY ir.created_at DESC
          LIMIT 100
        `, [userId || null]);
        const healthResult = await query(`
          SELECT hp.id, hp.author_id, hp.image_url, hp.title, hp.description,
                 hp.created_at,
                 COUNT(pe.id)::int AS like_count,
                 CASE WHEN $1::text IS NULL THEN NULL
                   WHEN COUNT(pe_user.id) > 0 THEN 'like' ELSE NULL END AS user_reaction
          FROM health_posts hp
          LEFT JOIN public_engagement pe ON pe.post_id = hp.id
          LEFT JOIN public_engagement pe_user
            ON pe_user.post_id = hp.id AND pe_user.user_id = $1 AND pe_user.reaction = 'like'
          GROUP BY hp.id
          ORDER BY hp.created_at DESC
          LIMIT 100
        `, [userId || null]);
        return [...emergencyResult.rows.map(mapRow), ...healthResult.rows.map((row) => ({
          ...row,
          post_type: 'health' as const,
          like_count: Number(row.like_count || 0),
        }))].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } catch {
        // Use the in-memory fallback when local PostgreSQL is unavailable.
      }
    }

    const emergencies = Array.from(fallbackReports.values()).map((report) => ({
        ...report,
        user_reaction: userId
          ? fallbackReactions.get(`${report.id}:${userId}`)?.reaction || null
          : null,
      }));
    const healthPosts = Array.from(fallbackHealthPosts.values()).map((post) => ({
      ...post,
      like_count: Array.from(fallbackLikes.values()).filter((postId) => postId === post.id).length,
      user_reaction: userId && fallbackLikes.get(`${post.id}:${userId}`) ? 'like' as const : null,
    }));
    return [...emergencies, ...healthPosts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async create(input: CreatePublicReportInput): Promise<PublicIncidentReport> {
    const id = uuidv4();
    if (pool && isPostgresConnected) {
      try {
        const result = await query(`
          INSERT INTO incident_reports (id, reporter_id, image_url, location, description, category)
          VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326)::geography, $6, $7)
          RETURNING id, reporter_id, image_url,
                    ST_Y(location::geometry) AS latitude,
                    ST_X(location::geometry) AS longitude,
                    description, category, status, trust_score,
                    total_votes, confirm_votes, dispute_votes,
                    incident_id, created_at, updated_at
        `, [id, input.reporterId, input.imageUrl, input.longitude, input.latitude, input.description || null, input.category]);
        return mapRow(result.rows[0]);
      } catch {
        // Use the in-memory fallback.
      }
    }

    const now = new Date().toISOString();
    const report: PublicIncidentReport = {
      post_type: 'emergency',
      id,
      reporter_id: input.reporterId,
      image_url: input.imageUrl,
      latitude: input.latitude,
      longitude: input.longitude,
      description: input.description || null,
      category: input.category,
      status: 'pending',
      trust_score: 0,
      total_votes: 0,
      confirm_votes: 0,
      dispute_votes: 0,
      incident_id: null,
      created_at: now,
      updated_at: now,
    };
    fallbackReports.set(id, report);
    return report;
  }

  async createHealthPost(input: { authorId: string; imageUrl: string; title: string; description: string }): Promise<PublicHealthPost> {
    const id = uuidv4();
    if (pool && isPostgresConnected) {
      try {
        const result = await query(`
          INSERT INTO health_posts (id, author_id, image_url, title, description)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, author_id, image_url, title, description, created_at
        `, [id, input.authorId, input.imageUrl, input.title, input.description]);
        return { ...result.rows[0], post_type: 'health', like_count: 0, user_reaction: null };
      } catch {
        // Use the in-memory fallback.
      }
    }
    const post: PublicHealthPost = {
      post_type: 'health',
      id,
      author_id: input.authorId,
      image_url: input.imageUrl,
      title: input.title,
      description: input.description,
      created_at: new Date().toISOString(),
      like_count: 0,
      user_reaction: null,
    };
    fallbackHealthPosts.set(id, post);
    return post;
  }

  async likeHealthPost(postId: string, userId: string): Promise<PublicHealthPost> {
    if (pool && isPostgresConnected) {
      await query(`
        INSERT INTO public_engagement (post_id, user_id, reaction)
        VALUES ($1, $2, 'like')
        ON CONFLICT (post_id, user_id) DO NOTHING
      `, [postId, userId]);
      const result = await query(`
        SELECT hp.id, hp.author_id, hp.image_url, hp.title, hp.description, hp.created_at,
               COUNT(pe.id)::int AS like_count
        FROM health_posts hp
        LEFT JOIN public_engagement pe ON pe.post_id = hp.id
        WHERE hp.id = $1
        GROUP BY hp.id
      `, [postId]);
      if (!result.rows[0]) throw new Error('Health post not found');
      return { ...result.rows[0], post_type: 'health', like_count: Number(result.rows[0].like_count || 0), user_reaction: 'like' };
    }
    if (!fallbackHealthPosts.has(postId)) throw new Error('Health post not found');
    fallbackLikes.set(`${postId}:${userId}`, postId);
    const post = fallbackHealthPosts.get(postId)!;
    return { ...post, like_count: Array.from(fallbackLikes.values()).filter((id) => id === postId).length, user_reaction: 'like' };
  }

  async addReaction(reportId: string, userId: string, reaction: PublicReaction): Promise<PublicIncidentReport> {
    if (pool && isPostgresConnected) {
      const result = await query(`
        INSERT INTO incident_reactions (incident_id, user_id, reaction)
        VALUES ($1, $2, $3)
        ON CONFLICT (incident_id, user_id) DO UPDATE SET reaction = EXCLUDED.reaction
        RETURNING id
      `, [reportId, userId, reaction]);
      if (!result.rows[0]) throw new Error('Unable to record reaction');
      return this.recalculate(reportId);
    }

    const existing = Array.from(fallbackReactions.entries()).find(([, value]) => value.userId === userId && fallbackReports.has(reportId));
    if (existing) fallbackReactions.delete(existing[0]);
    fallbackReactions.set(`${reportId}:${userId}`, { userId, reaction });
    return this.recalculate(reportId);
  }

  async recalculate(reportId: string): Promise<PublicIncidentReport> {
    if (pool && isPostgresConnected) {
      const result = await query(`
        WITH counts AS (
          SELECT COUNT(*)::int AS total,
                 COUNT(*) FILTER (WHERE reaction = 'confirm')::int AS confirms,
                 COUNT(*) FILTER (WHERE reaction = 'dispute')::int AS disputes
          FROM incident_reactions WHERE incident_id = $1
        )
        UPDATE incident_reports ir
        SET total_votes = counts.total,
            confirm_votes = counts.confirms,
            dispute_votes = counts.disputes,
            trust_score = CASE WHEN counts.total = 0 THEN 0
              ELSE ROUND((counts.confirms - counts.disputes)::numeric / counts.total, 4) END,
            updated_at = NOW()
        FROM counts
        WHERE ir.id = $1
        RETURNING ir.id, ir.reporter_id, ir.image_url,
                  ST_Y(ir.location::geometry) AS latitude,
                  ST_X(ir.location::geometry) AS longitude,
                  ir.description, ir.category, ir.status, ir.trust_score,
                  ir.total_votes, ir.confirm_votes, ir.dispute_votes,
                  ir.incident_id, ir.created_at, ir.updated_at
      `, [reportId]);
      if (!result.rows[0]) throw new Error('Public report not found');
      return mapRow(result.rows[0]);
    }

    const report = fallbackReports.get(reportId);
    if (!report) throw new Error('Public report not found');
    const reactions = Array.from(fallbackReactions.entries())
      .filter(([key]) => key.startsWith(`${reportId}:`))
      .map(([, value]) => value);
    const confirms = reactions.filter((item) => item.reaction === 'confirm').length;
    const disputes = reactions.length - confirms;
    const updated = {
      ...report,
      total_votes: reactions.length,
      confirm_votes: confirms,
      dispute_votes: disputes,
      trust_score: reactions.length ? (confirms - disputes) / reactions.length : 0,
      updated_at: new Date().toISOString(),
    };
    fallbackReports.set(reportId, updated);
    return updated;
  }

  async markEscalated(reportId: string, incidentId: string, status: 'verified' | 'dispatched'): Promise<PublicIncidentReport> {
    if (pool && isPostgresConnected) {
      const result = await query(`
        UPDATE incident_reports SET status = $1, incident_id = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING id, reporter_id, image_url,
                  ST_Y(location::geometry) AS latitude,
                  ST_X(location::geometry) AS longitude,
                  description, category, status, trust_score,
                  total_votes, confirm_votes, dispute_votes,
                  incident_id, created_at, updated_at
      `, [status, incidentId, reportId]);
      return mapRow(result.rows[0]);
    }
    const report = fallbackReports.get(reportId);
    if (!report) throw new Error('Public report not found');
    const updated = { ...report, status, incident_id: incidentId, updated_at: new Date().toISOString() };
    fallbackReports.set(reportId, updated);
    return updated;
  }

  async findById(reportId: string): Promise<PublicIncidentReport | null> {
    if (pool && isPostgresConnected) {
      const result = await query(`
        SELECT id, reporter_id, image_url,
               ST_Y(location::geometry) AS latitude,
               ST_X(location::geometry) AS longitude,
               description, category, status, trust_score,
               total_votes, confirm_votes, dispute_votes,
               incident_id, created_at, updated_at
        FROM incident_reports WHERE id = $1
      `, [reportId]);
      return result.rows[0] ? mapRow(result.rows[0]) : null;
    }
    return fallbackReports.get(reportId) || null;
  }
}

export const publicRepository = new PublicRepository();
