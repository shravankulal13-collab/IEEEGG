-- ============================================================
-- PRIMARY OWNER: SK
-- ROLE: Core Platform + Backend Integration Lead
-- MODULE: Database Migrations - Initial Schema
-- NOTE: Shared dependency -- changes require team coordination.
-- ============================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. ENUMS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM (
            'citizen',
            'dispatcher',
            'ambulance_driver',
            'hospital_admin',
            'hospital_staff',
            'system_admin'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'emergency_type') THEN
        CREATE TYPE emergency_type AS ENUM (
            'medical',
            'accident',
            'fire',
            'police',
            'natural_disaster',
            'industrial',
            'other'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_status') THEN
        CREATE TYPE incident_status AS ENUM (
            'reported',
            'verifying',
            'verified',
            'dispatching',
            'dispatched',
            'en_route',
            'arrived',
            'transporting',
            'resolved',
            'cancelled',
            'false_report',
            'expired'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status') THEN
        CREATE TYPE verification_status AS ENUM (
            'pending',
            'verified',
            'suspicious',
            'rejected',
            'manual_review'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ambulance_status') THEN
        CREATE TYPE ambulance_status AS ENUM (
            'available',
            'reserved',
            'dispatched',
            'en_route_to_incident',
            'on_scene',
            'transporting',
            'at_hospital',
            'returning',
            'maintenance',
            'offline'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dispatch_status') THEN
        CREATE TYPE dispatch_status AS ENUM (
            'pending',
            'assigned',
            'accepted',
            'rejected',
            'en_route',
            'arrived',
            'transporting',
            'completed',
            'cancelled',
            'reassigned'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'route_provider') THEN
        CREATE TYPE route_provider AS ENUM (
            'mappls',
            'waze',
            'osrm',
            'fallback',
            'manual'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'route_status') THEN
        CREATE TYPE route_status AS ENUM (
            'planned',
            'active',
            'rerouted',
            'completed',
            'cancelled',
            'failed'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'traffic_severity') THEN
        CREATE TYPE traffic_severity AS ENUM (
            'low',
            'moderate',
            'high',
            'severe',
            'blocked',
            'unknown'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hospital_status') THEN
        CREATE TYPE hospital_status AS ENUM (
            'active',
            'busy',
            'temporarily_unavailable',
            'offline'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bed_status') THEN
        CREATE TYPE bed_status AS ENUM (
            'available',
            'occupied',
            'reserved',
            'maintenance',
            'blocked'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_status') THEN
        CREATE TYPE resource_status AS ENUM (
            'available',
            'occupied',
            'maintenance',
            'unavailable'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM (
            'incident_created',
            'incident_verified',
            'ambulance_dispatched',
            'ambulance_assigned',
            'ambulance_arriving',
            'route_changed',
            'traffic_alert',
            'hospital_selected',
            'hospital_capacity',
            'dispatch_reassigned',
            'incident_cancelled',
            'system_alert'
        );
    END IF;
END $$;

-- 2. COMMON UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 3. PROFILES TABLE (Supabase auth.users or local mock fallback)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT UNIQUE,
    password_hash TEXT,
    role user_role NOT NULL DEFAULT 'citizen',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(is_active);

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- 4. EMERGENCY CONTACTS
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT,
    phone TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user ON emergency_contacts(user_id);

-- 5. INCIDENTS TABLE
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_number BIGINT GENERATED ALWAYS AS IDENTITY UNIQUE,
    reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    emergency_type emergency_type NOT NULL,
    title TEXT,
    description TEXT,
    status incident_status NOT NULL DEFAULT 'reported',
    verification_status verification_status NOT NULL DEFAULT 'pending',
    verification_score NUMERIC(5,2) CHECK (verification_score IS NULL OR (verification_score >= 0 AND verification_score <= 100)),
    severity SMALLINT CHECK (severity IS NULL OR severity BETWEEN 1 AND 5),
    people_affected INTEGER CHECK (people_affected IS NULL OR people_affected >= 0),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    address TEXT,
    landmark TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    source TEXT DEFAULT 'citizen_app',
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_emergency_type ON incidents(emergency_type);
CREATE INDEX IF NOT EXISTS idx_incidents_verification ON incidents(verification_status);
CREATE INDEX IF NOT EXISTS idx_incidents_reported_by ON incidents(reported_by);
CREATE INDEX IF NOT EXISTS idx_incidents_location ON incidents USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_incidents_reported_at ON incidents(reported_at DESC);

CREATE OR REPLACE FUNCTION set_incident_location()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::GEOGRAPHY;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS incidents_location_trigger ON incidents;
CREATE TRIGGER incidents_location_trigger
BEFORE INSERT OR UPDATE OF latitude, longitude ON incidents
FOR EACH ROW
EXECUTE FUNCTION set_incident_location();

DROP TRIGGER IF EXISTS incidents_updated_at ON incidents;
CREATE TRIGGER incidents_updated_at
BEFORE UPDATE ON incidents
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- 6. INCIDENT VERIFICATION
CREATE TABLE IF NOT EXISTS incident_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    verifier_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    verification_method TEXT NOT NULL,
    result verification_status NOT NULL,
    confidence_score NUMERIC(5,2) CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 100)),
    evidence JSONB DEFAULT '{}'::JSONB,
    notes TEXT,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incident_verifications_incident ON incident_verifications(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_verifications_status ON incident_verifications(result);

-- 7. INCIDENT LOCATION UPDATES
CREATE TABLE IF NOT EXISTS incident_location_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    accuracy_meters DOUBLE PRECISION,
    speed_kmh DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incident_location_updates_incident ON incident_location_updates(incident_id, recorded_at DESC);
