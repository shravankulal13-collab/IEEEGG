-- Public incident reports and community reactions.
CREATE TABLE IF NOT EXISTS incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  location GEOGRAPHY(Point, 4326) NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('accident', 'fire', 'medical', 'other')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'dispatched', 'disputed')),
  trust_score NUMERIC(6, 4) NOT NULL DEFAULT 0,
  total_votes INTEGER NOT NULL DEFAULT 0,
  confirm_votes INTEGER NOT NULL DEFAULT 0,
  dispute_votes INTEGER NOT NULL DEFAULT 0,
  incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS incident_reports_created_at_idx ON incident_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS incident_reports_status_idx ON incident_reports (status);

CREATE TABLE IF NOT EXISTS incident_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incident_reports(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  reaction TEXT NOT NULL CHECK (reaction IN ('confirm', 'dispute')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (incident_id, user_id)
);

CREATE INDEX IF NOT EXISTS incident_reactions_incident_id_idx ON incident_reactions (incident_id);

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.incident_reports;
  EXCEPTION WHEN duplicate_object THEN NULL;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.incident_reactions;
  EXCEPTION WHEN duplicate_object THEN NULL;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
END $$;
