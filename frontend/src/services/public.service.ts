import { createClient, type RealtimeChannel } from '@supabase/supabase-js';
import { apiRequest } from './api';

export type PublicReportCategory = 'accident' | 'fire' | 'medical' | 'other';
export type PublicReportStatus = 'pending' | 'verified' | 'dispatched' | 'disputed';
export type PublicReaction = 'confirm' | 'dispute';
export type PublicPostType = 'emergency' | 'health';

export interface PublicIncidentReport {
  post_type: 'emergency';
  id: string;
  reporter_id: string;
  image_url: string;
  latitude?: number;
  longitude?: number;
  description: string | null;
  category: PublicReportCategory;
  status: PublicReportStatus;
  trust_score: number;
  total_votes: number;
  confirm_votes: number;
  dispute_votes: number;
  incident_id: string | null;
  created_at: string;
  updated_at: string;
  user_reaction?: PublicReaction | null;
}

export interface PublicHealthPost {
  post_type: 'health';
  id: string;
  author_id: string;
  image_url: string;
  title: string;
  description: string;
  created_at: string;
  like_count: number;
  user_reaction?: 'like' | null;
}

export type PublicFeedItem = PublicIncidentReport | PublicHealthPost;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const publicService = {
  async list(): Promise<PublicFeedItem[]> {
    const response = await apiRequest<{ data: PublicFeedItem[] }>('/public');
    return response.data || [];
  },

  async create(input: {
    image: File;
    latitude?: number;
    longitude?: number;
    category?: PublicReportCategory;
    postType?: PublicPostType;
    title?: string;
    description?: string;
  }): Promise<PublicIncidentReport> {
    const form = new FormData();
    form.append('image', input.image);
    if (input.latitude !== undefined && input.longitude !== undefined) {
      form.append('latitude', String(input.latitude));
      form.append('longitude', String(input.longitude));
    }
    if (input.category) form.append('category', input.category);
    form.append('postType', input.postType || 'emergency');
    if (input.title) form.append('title', input.title);
    if (input.description) form.append('description', input.description);
    const response = await apiRequest<{ data: PublicIncidentReport }>('/public', { method: 'POST', body: form });
    return response.data;
  },

  async likeHealthPost(postId: string): Promise<PublicHealthPost> {
    const response = await apiRequest<{ data: PublicHealthPost }>(`/public/${postId}/likes`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response.data;
  },

  async react(reportId: string, reaction: PublicReaction): Promise<PublicIncidentReport> {
    const response = await apiRequest<{ data: PublicIncidentReport }>(`/public/${reportId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ reaction }),
    });
    return response.data;
  },

  subscribe(onChange: () => void): RealtimeChannel | null {
    if (!supabase) return null;
    return supabase
      .channel('public-incident-reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incident_reports' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incident_reactions' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'health_posts' }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'public_engagement' }, onChange)
      .subscribe();
  },

  async unsubscribe(channel: RealtimeChannel | null) {
    if (channel && supabase) await supabase.removeChannel(channel);
  },
};
