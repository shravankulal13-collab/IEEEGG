export type PublicReportCategory = 'accident' | 'fire' | 'medical' | 'other';
export type PublicReportStatus = 'pending' | 'verified' | 'dispatched' | 'disputed';
export type PublicReaction = 'confirm' | 'dispute';
export type PublicPostType = 'emergency' | 'health';

export interface PublicIncidentReport {
  post_type: 'emergency';
  id: string;
  reporter_id: string;
  image_url: string;
  latitude: number;
  longitude: number;
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

export interface CreatePublicReportInput {
  reporterId: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  description?: string;
  category: PublicReportCategory;
}
