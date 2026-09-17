-- Health posts share the public feed but never enter emergency dispatch.
CREATE TABLE IF NOT EXISTS health_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS health_posts_created_at_idx ON health_posts (created_at DESC);

CREATE TABLE IF NOT EXISTS public_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES health_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  reaction TEXT NOT NULL DEFAULT 'like' CHECK (reaction = 'like'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS public_engagement_post_id_idx ON public_engagement (post_id);

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.health_posts;
  EXCEPTION WHEN duplicate_object THEN NULL;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.public_engagement;
  EXCEPTION WHEN duplicate_object THEN NULL;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
END $$;
