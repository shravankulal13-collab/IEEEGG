import { env } from '../../config/env.js';
import { incidentService } from '../incidents/incident.service.js';
import { DispatchService } from '../dispatch/dispatch.service.js';
import { publicRepository } from './public.repository.js';
import type {
  CreatePublicReportInput,
  PublicIncidentReport,
  PublicReaction,
  PublicReportCategory,
} from './public.types.js';

const TRUST_THRESHOLD = 0.7;
const MINIMUM_VOTES = 5;

function toEmergencyType(category: PublicReportCategory) {
  return category === 'medical' ? 'medical' : category === 'accident' ? 'accident' : category === 'fire' ? 'fire' : 'other';
}

export class PublicService {
  async list(userId?: string) {
    return publicRepository.list(userId);
  }

  async createReport(input: CreatePublicReportInput) {
    return publicRepository.create(input);
  }

  async createHealthPost(input: { authorId: string; imageUrl: string; title: string; description: string }) {
    return publicRepository.createHealthPost(input);
  }

  async likeHealthPost(postId: string, userId: string) {
    return publicRepository.likeHealthPost(postId, userId);
  }

  async react(reportId: string, userId: string, reaction: PublicReaction) {
    const report = await publicRepository.addReaction(reportId, userId, reaction);
    if (report.status === 'pending' && report.total_votes >= MINIMUM_VOTES && report.trust_score >= TRUST_THRESHOLD) {
      return this.escalate(report);
    }
    return report;
  }

  async uploadImage(file: { buffer: Buffer; mimetype: string; originalname: string }) {
    if (env.SUPABASE_URL && env.SUPABASE_SECRET_KEY) {
      const extension = file.originalname.split('.').pop()?.replace(/[^a-z0-9]/gi, '') || 'jpg';
      const path = `public-reports/${crypto.randomUUID()}.${extension}`;
      const response = await fetch(`${env.SUPABASE_URL}/storage/v1/object/public-reports/${path}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.SUPABASE_SECRET_KEY}`,
          apikey: env.SUPABASE_SECRET_KEY,
          'Content-Type': file.mimetype,
          'x-upsert': 'false',
        },
        body: file.buffer,
      });
      if (!response.ok) throw new Error(`Supabase Storage upload failed (${response.status})`);
      return `${env.SUPABASE_URL}/storage/v1/object/public-reports/${path}`;
    }

    // Local development fallback; production should configure Supabase Storage.
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  }

  private async escalate(report: PublicIncidentReport) {
    const incident = await incidentService.createIncident({
      emergencyType: toEmergencyType(report.category),
      title: `Public ${report.category} report`,
      description: report.description || 'Community-confirmed incident report.',
      latitude: report.latitude,
      longitude: report.longitude,
      severity: report.category === 'medical' || report.category === 'fire' ? 4 : 3,
      address: `Public report coordinates (${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)})`,
      source: 'public_report',
      metadata: { publicReportId: report.id, trustScore: report.trust_score, voteCount: report.total_votes },
    }, report.reporter_id);

    let status: 'verified' | 'dispatched' = 'verified';
    try {
      await new DispatchService().handleNewEmergency({
        location: { lat: report.latitude, lng: report.longitude },
        severity: 'HIGH',
        requiresICU: report.category === 'medical',
        requiredEquipment: report.category === 'medical' ? ['Oxygen Supply'] : [],
        requiredSpecialists: report.category === 'medical' ? ['Emergency Medicine'] : [],
      });
      status = 'dispatched';
      await incidentService.updateIncidentStatus(incident.id, { status: 'dispatching' });
    } catch {
      // The report remains verified when dispatch infrastructure has no available unit.
      await incidentService.updateIncidentStatus(incident.id, { status: 'verified' });
    }

    return publicRepository.markEscalated(report.id, incident.id, status);
  }
}

export const publicService = new PublicService();
