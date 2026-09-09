-- ============================================================
-- PRIMARY OWNER: SK
-- ROLE: Core Platform + Backend Integration Lead
-- MODULE: Database Schema & Spatial Architecture
-- NOTE: Shared dependency -- changes require team coordination.
-- ============================================================
-- ============================================================
-- PRIMARY OWNER: SK
-- ROLE: Core Platform + Backend Integration Lead
-- MODULE: Database Schema & Spatial Architecture
-- NOTE: Shared dependency -- changes require team coordination.
-- ============================================================
-- ============================================================
-- PRIMARY OWNER: SK
-- ROLE: Core Platform + Backend Integration Lead
-- MODULE: Database Schema & Spatial Architecture
-- NOTE: Shared dependency -- changes require team coordination.
-- ============================================================
-- ============================================================
-- EMERGENCY RESPONSE PLATFORM
-- SUPABASE / POSTGRESQL + POSTGIS
--
-- Covers:
--   Citizens
--   Emergency incidents
--   Incident verification
--   Ambulances
--   Live ambulance tracking
--   Dispatch
--   Dynamic routing
--   Traffic
--   Hospitals
--   Beds / doctors / resources
--   Hospital selection
--   Notifications
--   Emergency contacts
--   Provider health / fallback
--   Audit logs
--   Realtime
--
-- NO MOCK DATA IS INSERTED
-- ============================================================


-- ============================================================
-- 0. EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- 1. ENUM TYPES
-- ============================================================

DO $$
BEGIN

    CREATE TYPE user_role AS ENUM (
        'citizen',
        'dispatcher',
        'ambulance_driver',
        'hospital_admin',
        'hospital_staff',
        'system_admin'
    );

EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


DO $$
BEGIN

    CREATE TYPE emergency_type AS ENUM (
        'medical',
        'accident',
        'fire',
        'police',
        'natural_disaster',
        'industrial',
        'other'
    );

EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


DO $$
BEGIN

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

EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


DO $$
BEGIN

    CREATE TYPE verification_status AS ENUM (
        'pending',
        'verified',
        'suspicious',
        'rejected',
        'manual_review'
    );

EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


DO $$
BEGIN

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

EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


DO $$
BEGIN

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

EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


DO $$
BEGIN

    CREATE TYPE route_provider AS ENUM (
        'mappls',
        'waze',
        'osrm',
        'fallback',
        'manual'
    );

EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


DO $$
BEGIN

    CREATE TYPE route_status AS ENUM (
        'planned',
        'active',
        'rerouted',
        'completed',
        'cancelled',
        'failed'
    );

EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


DO $$
BEGIN

    CREATE TYPE traffic_severity AS ENUM (
        'low',
        'moderate',
        'high',
        'severe',
        'blocked',
        'unknown'
    );

EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


DO $$
BEGIN

    CREATE TYPE hospital_status AS ENUM (
        'active',
        'busy',
        'temporarily_unavailable',
        'offline'
    );

EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


DO $$
BEGIN

    CREATE TYPE bed_status AS ENUM (
        'available',
        'occupied',
        'reserved',
        'maintenance',
        'blocked'
    );

EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


DO $$
BEGIN

    CREATE TYPE resource_status AS ENUM (
        'available',
        'occupied',
        'maintenance',
        'unavailable'
    );

EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


DO $$
BEGIN

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

EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- 2. COMMON UPDATED_AT FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


-- ============================================================
-- 3. PROFILES
-- Connected to Supabase auth.users
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    full_name TEXT NOT NULL,

    phone TEXT,

    email TEXT,

    role user_role NOT NULL DEFAULT 'citizen',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_profiles_role
ON profiles(role);

CREATE INDEX IF NOT EXISTS idx_profiles_active
ON profiles(is_active);


CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 4. EMERGENCY CONTACTS
-- ============================================================

CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    name TEXT NOT NULL,

    relationship TEXT,

    phone TEXT NOT NULL,

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user
ON emergency_contacts(user_id);


CREATE TRIGGER emergency_contacts_updated_at
BEFORE UPDATE ON emergency_contacts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 5. INCIDENTS
-- Central emergency event table
-- ============================================================

CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    incident_number BIGINT GENERATED ALWAYS AS IDENTITY UNIQUE,

    reported_by UUID
        REFERENCES profiles(id)
        ON DELETE SET NULL,

    emergency_type emergency_type NOT NULL,

    title TEXT,

    description TEXT,

    status incident_status NOT NULL DEFAULT 'reported',

    verification_status verification_status
        NOT NULL DEFAULT 'pending',

    verification_score NUMERIC(5,2)
        CHECK (
            verification_score IS NULL
            OR (
                verification_score >= 0
                AND verification_score <= 100
            )
        ),

    severity SMALLINT
        CHECK (
            severity IS NULL
            OR severity BETWEEN 1 AND 5
        ),

    people_affected INTEGER
        CHECK (
            people_affected IS NULL
            OR people_affected >= 0
        ),

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


CREATE INDEX IF NOT EXISTS idx_incidents_status
ON incidents(status);

CREATE INDEX IF NOT EXISTS idx_incidents_emergency_type
ON incidents(emergency_type);

CREATE INDEX IF NOT EXISTS idx_incidents_verification
ON incidents(verification_status);

CREATE INDEX IF NOT EXISTS idx_incidents_reported_by
ON incidents(reported_by);

CREATE INDEX IF NOT EXISTS idx_incidents_location
ON incidents USING GIST(location);

CREATE INDEX IF NOT EXISTS idx_incidents_reported_at
ON incidents(reported_at DESC);


CREATE OR REPLACE FUNCTION set_incident_location()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    IF NEW.latitude IS NOT NULL
       AND NEW.longitude IS NOT NULL THEN

        NEW.location =
            ST_SetSRID(
                ST_MakePoint(
                    NEW.longitude,
                    NEW.latitude
                ),
                4326
            )::GEOGRAPHY;

    END IF;

    RETURN NEW;
END;
$$;


CREATE TRIGGER incidents_location_trigger
BEFORE INSERT OR UPDATE OF latitude, longitude
ON incidents
FOR EACH ROW
EXECUTE FUNCTION set_incident_location();


CREATE TRIGGER incidents_updated_at
BEFORE UPDATE ON incidents
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 6. INCIDENT VERIFICATION
-- Multiple verification signals
-- ============================================================

CREATE TABLE IF NOT EXISTS incident_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    incident_id UUID NOT NULL
        REFERENCES incidents(id)
        ON DELETE CASCADE,

    verifier_user_id UUID
        REFERENCES profiles(id)
        ON DELETE SET NULL,

    verification_method TEXT NOT NULL,

    result verification_status NOT NULL,

    confidence_score NUMERIC(5,2)
        CHECK (
            confidence_score IS NULL
            OR (
                confidence_score >= 0
                AND confidence_score <= 100
            )
        ),

    evidence JSONB DEFAULT '{}'::JSONB,

    notes TEXT,

    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_incident_verifications_incident
ON incident_verifications(incident_id);

CREATE INDEX IF NOT EXISTS idx_incident_verifications_status
ON incident_verifications(result);


-- ============================================================
-- 7. INCIDENT LOCATION UPDATES
-- Tracks movement / location history of the incident reporter
-- ============================================================

CREATE TABLE IF NOT EXISTS incident_location_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    incident_id UUID NOT NULL
        REFERENCES incidents(id)
        ON DELETE CASCADE,

    latitude DOUBLE PRECISION NOT NULL,

    longitude DOUBLE PRECISION NOT NULL,

    location GEOGRAPHY(POINT, 4326),

    accuracy_meters DOUBLE PRECISION,

    speed_kmh DOUBLE PRECISION,

    heading DOUBLE PRECISION,

    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_incident_location_updates_incident
ON incident_location_updates(incident_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_incident_location_updates_location
ON incident_location_updates USING GIST(location);


CREATE OR REPLACE FUNCTION set_incident_update_location()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    NEW.location =
        ST_SetSRID(
            ST_MakePoint(
                NEW.longitude,
                NEW.latitude
            ),
            4326
        )::GEOGRAPHY;

    RETURN NEW;

END;
$$;


CREATE TRIGGER incident_location_update_trigger
BEFORE INSERT OR UPDATE OF latitude, longitude
ON incident_location_updates
FOR EACH ROW
EXECUTE FUNCTION set_incident_update_location();


-- ============================================================
-- 8. AMBULANCES
-- ============================================================

CREATE TABLE IF NOT EXISTS ambulances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    ambulance_number TEXT NOT NULL UNIQUE,

    registration_number TEXT UNIQUE,

    organization_name TEXT,

    driver_id UUID
        REFERENCES profiles(id)
        ON DELETE SET NULL,

    status ambulance_status NOT NULL DEFAULT 'offline',

    emergency_capable BOOLEAN NOT NULL DEFAULT TRUE,

    ambulance_type TEXT,

    equipment JSONB DEFAULT '{}'::JSONB,

    current_latitude DOUBLE PRECISION,

    current_longitude DOUBLE PRECISION,

    current_location GEOGRAPHY(POINT, 4326),

    current_speed_kmh DOUBLE PRECISION,

    current_heading DOUBLE PRECISION,

    gps_accuracy_meters DOUBLE PRECISION,

    last_gps_update TIMESTAMPTZ,

    current_incident_id UUID
        REFERENCES incidents(id)
        ON DELETE SET NULL,

    current_hospital_id UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_ambulances_status
ON ambulances(status);

CREATE INDEX IF NOT EXISTS idx_ambulances_location
ON ambulances USING GIST(current_location);

CREATE INDEX IF NOT EXISTS idx_ambulances_incident
ON ambulances(current_incident_id);

CREATE INDEX IF NOT EXISTS idx_ambulances_driver
ON ambulances(driver_id);


CREATE OR REPLACE FUNCTION set_ambulance_location()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    IF NEW.current_latitude IS NOT NULL
       AND NEW.current_longitude IS NOT NULL THEN

        NEW.current_location =
            ST_SetSRID(
                ST_MakePoint(
                    NEW.current_longitude,
                    NEW.current_latitude
                ),
                4326
            )::GEOGRAPHY;

    END IF;

    RETURN NEW;
END;
$$;


CREATE TRIGGER ambulance_location_trigger
BEFORE INSERT OR UPDATE OF current_latitude, current_longitude
ON ambulances
FOR EACH ROW
EXECUTE FUNCTION set_ambulance_location();


CREATE TRIGGER ambulances_updated_at
BEFORE UPDATE ON ambulances
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 9. AMBULANCE LOCATION HISTORY
-- Critical for REAL live tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS ambulance_location_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    ambulance_id UUID NOT NULL
        REFERENCES ambulances(id)
        ON DELETE CASCADE,

    latitude DOUBLE PRECISION NOT NULL,

    longitude DOUBLE PRECISION NOT NULL,

    location GEOGRAPHY(POINT, 4326),

    accuracy_meters DOUBLE PRECISION,

    speed_kmh DOUBLE PRECISION,

    heading DOUBLE PRECISION,

    source TEXT DEFAULT 'ambulance_app',

    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_ambulance_history_ambulance_time
ON ambulance_location_history(ambulance_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_ambulance_history_location
ON ambulance_location_history USING GIST(location);


CREATE OR REPLACE FUNCTION set_ambulance_history_location()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    NEW.location =
        ST_SetSRID(
            ST_MakePoint(
                NEW.longitude,
                NEW.latitude
            ),
            4326
        )::GEOGRAPHY;

    RETURN NEW;

END;
$$;


CREATE TRIGGER ambulance_history_location_trigger
BEFORE INSERT OR UPDATE OF latitude, longitude
ON ambulance_location_history
FOR EACH ROW
EXECUTE FUNCTION set_ambulance_history_location();


-- ============================================================
-- 10. HOSPITALS
-- ============================================================

CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,

    registration_number TEXT UNIQUE,

    phone TEXT,

    emergency_phone TEXT,

    address TEXT,

    city TEXT,

    state TEXT,

    country TEXT DEFAULT 'India',

    latitude DOUBLE PRECISION NOT NULL,

    longitude DOUBLE PRECISION NOT NULL,

    location GEOGRAPHY(POINT, 4326),

    status hospital_status NOT NULL DEFAULT 'active',

    emergency_department BOOLEAN NOT NULL DEFAULT TRUE,

    trauma_center BOOLEAN NOT NULL DEFAULT FALSE,

    icu_available BOOLEAN NOT NULL DEFAULT FALSE,

    ambulance_receiving BOOLEAN NOT NULL DEFAULT TRUE,

    total_beds INTEGER DEFAULT 0,

    available_beds INTEGER DEFAULT 0,

    total_icu_beds INTEGER DEFAULT 0,

    available_icu_beds INTEGER DEFAULT 0,

    total_doctors INTEGER DEFAULT 0,

    available_doctors INTEGER DEFAULT 0,

    last_capacity_update TIMESTAMPTZ,

    metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (available_beds >= 0),

    CHECK (total_beds >= 0),

    CHECK (available_beds <= total_beds),

    CHECK (available_icu_beds >= 0),

    CHECK (total_icu_beds >= 0),

    CHECK (available_icu_beds <= total_icu_beds),

    CHECK (available_doctors >= 0),

    CHECK (total_doctors >= 0),

    CHECK (available_doctors <= total_doctors)
);


CREATE INDEX IF NOT EXISTS idx_hospitals_location
ON hospitals USING GIST(location);

CREATE INDEX IF NOT EXISTS idx_hospitals_status
ON hospitals(status);

CREATE INDEX IF NOT EXISTS idx_hospitals_emergency
ON hospitals(emergency_department);

CREATE INDEX IF NOT EXISTS idx_hospitals_city
ON hospitals(city);


CREATE OR REPLACE FUNCTION set_hospital_location()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    NEW.location =
        ST_SetSRID(
            ST_MakePoint(
                NEW.longitude,
                NEW.latitude
            ),
            4326
        )::GEOGRAPHY;

    RETURN NEW;

END;
$$;


CREATE TRIGGER hospital_location_trigger
BEFORE INSERT OR UPDATE OF latitude, longitude
ON hospitals
FOR EACH ROW
EXECUTE FUNCTION set_hospital_location();


CREATE TRIGGER hospitals_updated_at
BEFORE UPDATE ON hospitals
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 11. HOSPITAL BEDS
-- ============================================================

CREATE TABLE IF NOT EXISTS hospital_beds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    hospital_id UUID NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

    bed_number TEXT,

    ward TEXT,

    bed_type TEXT NOT NULL DEFAULT 'general',

    status bed_status NOT NULL DEFAULT 'available',

    reserved_for_incident_id UUID
        REFERENCES incidents(id)
        ON DELETE SET NULL,

    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(hospital_id, bed_number)
);


CREATE INDEX IF NOT EXISTS idx_hospital_beds_hospital
ON hospital_beds(hospital_id);

CREATE INDEX IF NOT EXISTS idx_hospital_beds_status
ON hospital_beds(status);

CREATE INDEX IF NOT EXISTS idx_hospital_beds_type
ON hospital_beds(bed_type);


-- ============================================================
-- 12. HOSPITAL DOCTORS
-- ============================================================

CREATE TABLE IF NOT EXISTS hospital_doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    hospital_id UUID NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

    name TEXT NOT NULL,

    specialization TEXT,

    department TEXT,

    phone TEXT,

    available BOOLEAN NOT NULL DEFAULT FALSE,

    on_duty BOOLEAN NOT NULL DEFAULT FALSE,

    current_case_incident_id UUID
        REFERENCES incidents(id)
        ON DELETE SET NULL,

    last_status_update TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_hospital_doctors_hospital
ON hospital_doctors(hospital_id);

CREATE INDEX IF NOT EXISTS idx_hospital_doctors_available
ON hospital_doctors(available, on_duty);

CREATE INDEX IF NOT EXISTS idx_hospital_doctors_specialization
ON hospital_doctors(specialization);


CREATE TRIGGER hospital_doctors_updated_at
BEFORE UPDATE ON hospital_doctors
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 13. HOSPITAL RESOURCES
-- ICU / ventilator / oxygen / trauma / etc.
-- ============================================================

CREATE TABLE IF NOT EXISTS hospital_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    hospital_id UUID NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

    resource_type TEXT NOT NULL,

    total_quantity INTEGER NOT NULL DEFAULT 0,

    available_quantity INTEGER NOT NULL DEFAULT 0,

    status resource_status NOT NULL DEFAULT 'available',

    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (total_quantity >= 0),

    CHECK (available_quantity >= 0),

    CHECK (available_quantity <= total_quantity),

    UNIQUE(hospital_id, resource_type)
);


CREATE INDEX IF NOT EXISTS idx_hospital_resources_hospital
ON hospital_resources(hospital_id);

CREATE INDEX IF NOT EXISTS idx_hospital_resources_type
ON hospital_resources(resource_type);


-- ============================================================
-- 14. HOSPITAL CAPACITY HISTORY
-- Useful for analytics and reliability
-- ============================================================

CREATE TABLE IF NOT EXISTS hospital_capacity_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    hospital_id UUID NOT NULL
        REFERENCES hospitals(id)
        ON DELETE CASCADE,

    total_beds INTEGER NOT NULL DEFAULT 0,

    available_beds INTEGER NOT NULL DEFAULT 0,

    total_icu_beds INTEGER NOT NULL DEFAULT 0,

    available_icu_beds INTEGER NOT NULL DEFAULT 0,

    total_doctors INTEGER NOT NULL DEFAULT 0,

    available_doctors INTEGER NOT NULL DEFAULT 0,

    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_hospital_capacity_history
ON hospital_capacity_history(hospital_id, recorded_at DESC);


-- ============================================================
-- 15. DISPATCHES
-- An incident can have multiple dispatch attempts / reassignments
-- ============================================================

CREATE TABLE IF NOT EXISTS dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    incident_id UUID NOT NULL
        REFERENCES incidents(id)
        ON DELETE CASCADE,

    ambulance_id UUID NOT NULL
        REFERENCES ambulances(id)
        ON DELETE RESTRICT,

    dispatcher_id UUID
        REFERENCES profiles(id)
        ON DELETE SET NULL,

    status dispatch_status NOT NULL DEFAULT 'pending',

    assignment_reason TEXT,

    dispatch_priority SMALLINT DEFAULT 3
        CHECK (
            dispatch_priority BETWEEN 1 AND 5
        ),

    estimated_distance_km NUMERIC(10,2),

    estimated_eta_seconds INTEGER,

    dispatched_at TIMESTAMPTZ,

    accepted_at TIMESTAMPTZ,

    arrived_at TIMESTAMPTZ,

    transport_started_at TIMESTAMPTZ,

    completed_at TIMESTAMPTZ,

    cancelled_at TIMESTAMPTZ,

    cancellation_reason TEXT,

    rejection_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_dispatches_incident
ON dispatches(incident_id);

CREATE INDEX IF NOT EXISTS idx_dispatches_ambulance
ON dispatches(ambulance_id);

CREATE INDEX IF NOT EXISTS idx_dispatches_status
ON dispatches(status);

CREATE INDEX IF NOT EXISTS idx_dispatches_created
ON dispatches(created_at DESC);


CREATE TRIGGER dispatches_updated_at
BEFORE UPDATE ON dispatches
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 16. ROUTES
-- Every route calculation / rerouting attempt
-- ============================================================

CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    incident_id UUID
        REFERENCES incidents(id)
        ON DELETE CASCADE,

    dispatch_id UUID
        REFERENCES dispatches(id)
        ON DELETE CASCADE,

    ambulance_id UUID
        REFERENCES ambulances(id)
        ON DELETE CASCADE,

    origin_latitude DOUBLE PRECISION,

    origin_longitude DOUBLE PRECISION,

    destination_latitude DOUBLE PRECISION,

    destination_longitude DOUBLE PRECISION,

    provider route_provider NOT NULL,

    status route_status NOT NULL DEFAULT 'planned',

    distance_meters INTEGER,

    duration_seconds INTEGER,

    traffic_delay_seconds INTEGER DEFAULT 0,

    route_polyline TEXT,

    route_geometry GEOGRAPHY(LINESTRING, 4326),

    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    activated_at TIMESTAMPTZ,

    completed_at TIMESTAMPTZ,

    failure_reason TEXT,

    provider_response JSONB DEFAULT '{}'::JSONB
);


CREATE INDEX IF NOT EXISTS idx_routes_incident
ON routes(incident_id);

CREATE INDEX IF NOT EXISTS idx_routes_dispatch
ON routes(dispatch_id);

CREATE INDEX IF NOT EXISTS idx_routes_ambulance
ON routes(ambulance_id);

CREATE INDEX IF NOT EXISTS idx_routes_provider
ON routes(provider);

CREATE INDEX IF NOT EXISTS idx_routes_status
ON routes(status);


-- ============================================================
-- 17. ROUTE REROUTE EVENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS route_reroute_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    route_id UUID NOT NULL
        REFERENCES routes(id)
        ON DELETE CASCADE,

    incident_id UUID
        REFERENCES incidents(id)
        ON DELETE CASCADE,

    ambulance_id UUID
        REFERENCES ambulances(id)
        ON DELETE CASCADE,

    old_provider route_provider,

    new_provider route_provider,

    reason TEXT NOT NULL,

    traffic_severity traffic_severity,

    old_eta_seconds INTEGER,

    new_eta_seconds INTEGER,

    old_distance_meters INTEGER,

    new_distance_meters INTEGER,

    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    metadata JSONB DEFAULT '{}'::JSONB
);


CREATE INDEX IF NOT EXISTS idx_reroute_events_route
ON route_reroute_events(route_id);

CREATE INDEX IF NOT EXISTS idx_reroute_events_incident
ON route_reroute_events(incident_id);

CREATE INDEX IF NOT EXISTS idx_reroute_events_time
ON route_reroute_events(triggered_at DESC);


-- ============================================================
-- 18. TRAFFIC EVENTS
-- Provider-independent normalized traffic data
-- ============================================================

CREATE TABLE IF NOT EXISTS traffic_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    provider route_provider NOT NULL,

    external_event_id TEXT,

    latitude DOUBLE PRECISION,

    longitude DOUBLE PRECISION,

    location GEOGRAPHY(POINT, 4326),

    road_name TEXT,

    severity traffic_severity NOT NULL DEFAULT 'unknown',

    description TEXT,

    speed_kmh DOUBLE PRECISION,

    delay_seconds INTEGER,

    blocked BOOLEAN NOT NULL DEFAULT FALSE,

    started_at TIMESTAMPTZ,

    ended_at TIMESTAMPTZ,

    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    expires_at TIMESTAMPTZ,

    raw_data JSONB DEFAULT '{}'::JSONB
);


CREATE INDEX IF NOT EXISTS idx_traffic_events_location
ON traffic_events USING GIST(location);

CREATE INDEX IF NOT EXISTS idx_traffic_events_provider
ON traffic_events(provider);

CREATE INDEX IF NOT EXISTS idx_traffic_events_severity
ON traffic_events(severity);

CREATE INDEX IF NOT EXISTS idx_traffic_events_detected
ON traffic_events(detected_at DESC);


CREATE OR REPLACE FUNCTION set_traffic_location()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    IF NEW.latitude IS NOT NULL
       AND NEW.longitude IS NOT NULL THEN

        NEW.location =
            ST_SetSRID(
                ST_MakePoint(
                    NEW.longitude,
                    NEW.latitude
                ),
                4326
            )::GEOGRAPHY;

    END IF;

    RETURN NEW;

END;
$$;


CREATE TRIGGER traffic_location_trigger
BEFORE INSERT OR UPDATE OF latitude, longitude
ON traffic_events
FOR EACH ROW
EXECUTE FUNCTION set_traffic_location();


-- ============================================================
-- 19. PROVIDER HEALTH
-- Prevents Mappls/Waze/etc. becoming a single point of failure
-- ============================================================

CREATE TABLE IF NOT EXISTS provider_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    provider route_provider NOT NULL UNIQUE,

    is_available BOOLEAN NOT NULL DEFAULT TRUE,

    last_success_at TIMESTAMPTZ,

    last_failure_at TIMESTAMPTZ,

    consecutive_failures INTEGER NOT NULL DEFAULT 0,

    average_latency_ms INTEGER,

    last_error TEXT,

    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 20. HOSPITAL SELECTIONS
-- Records why a hospital was selected
-- ============================================================

CREATE TABLE IF NOT EXISTS hospital_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    incident_id UUID NOT NULL
        REFERENCES incidents(id)
        ON DELETE CASCADE,

    hospital_id UUID NOT NULL
        REFERENCES hospitals(id)
        ON DELETE RESTRICT,

    dispatch_id UUID
        REFERENCES dispatches(id)
        ON DELETE SET NULL,

    distance_meters INTEGER,

    eta_seconds INTEGER,

    available_beds INTEGER,

    available_icu_beds INTEGER,

    available_doctors INTEGER,

    trauma_capable BOOLEAN,

    score NUMERIC(10,2),

    selection_reason JSONB DEFAULT '{}'::JSONB,

    is_selected BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_hospital_selections_incident
ON hospital_selections(incident_id);

CREATE INDEX IF NOT EXISTS idx_hospital_selections_hospital
ON hospital_selections(hospital_id);

CREATE INDEX IF NOT EXISTS idx_hospital_selections_selected
ON hospital_selections(is_selected);


-- ============================================================
-- 21. HOSPITAL ARRIVALS
-- ============================================================

CREATE TABLE IF NOT EXISTS hospital_arrivals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    incident_id UUID NOT NULL
        REFERENCES incidents(id)
        ON DELETE CASCADE,

    ambulance_id UUID NOT NULL
        REFERENCES ambulances(id)
        ON DELETE RESTRICT,

    hospital_id UUID NOT NULL
        REFERENCES hospitals(id)
        ON DELETE RESTRICT,

    arrival_status TEXT NOT NULL DEFAULT 'expected',

    expected_arrival_at TIMESTAMPTZ,

    actual_arrival_at TIMESTAMPTZ,

    patient_handover_at TIMESTAMPTZ,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_hospital_arrivals_incident
ON hospital_arrivals(incident_id);

CREATE INDEX IF NOT EXISTS idx_hospital_arrivals_hospital
ON hospital_arrivals(hospital_id);


CREATE TRIGGER hospital_arrivals_updated_at
BEFORE UPDATE ON hospital_arrivals
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 22. NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    incident_id UUID
        REFERENCES incidents(id)
        ON DELETE CASCADE,

    notification_type notification_type NOT NULL,

    title TEXT NOT NULL,

    message TEXT NOT NULL,

    data JSONB DEFAULT '{}'::JSONB,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    read_at TIMESTAMPTZ
);


CREATE INDEX IF NOT EXISTS idx_notifications_user
ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
ON notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_incident
ON notifications(incident_id);

CREATE INDEX IF NOT EXISTS idx_notifications_created
ON notifications(created_at DESC);


-- ============================================================
-- 23. AUDIT LOGS
-- Complete operational history
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    actor_user_id UUID
        REFERENCES profiles(id)
        ON DELETE SET NULL,

    action TEXT NOT NULL,

    entity_type TEXT NOT NULL,

    entity_id UUID,

    old_data JSONB,

    new_data JSONB,

    ip_address INET,

    user_agent TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_audit_logs_actor
ON audit_logs(actor_user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
ON audit_logs(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created
ON audit_logs(created_at DESC);


-- ============================================================
-- 24. SYSTEM EVENTS
-- Internal event stream
-- ============================================================

CREATE TABLE IF NOT EXISTS system_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    event_type TEXT NOT NULL,

    incident_id UUID
        REFERENCES incidents(id)
        ON DELETE CASCADE,

    ambulance_id UUID
        REFERENCES ambulances(id)
        ON DELETE CASCADE,

    dispatch_id UUID
        REFERENCES dispatches(id)
        ON DELETE CASCADE,

    severity TEXT DEFAULT 'info',

    message TEXT,

    payload JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_system_events_incident
ON system_events(incident_id);

CREATE INDEX IF NOT EXISTS idx_system_events_created
ON system_events(created_at DESC);


-- ============================================================
-- 25. FUNCTION:
-- FIND NEAREST AVAILABLE AMBULANCES
-- ============================================================

CREATE OR REPLACE FUNCTION find_nearest_available_ambulances(
    incident_lat DOUBLE PRECISION,
    incident_lon DOUBLE PRECISION,
    result_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    ambulance_id UUID,
    ambulance_number TEXT,
    status ambulance_status,
    distance_meters DOUBLE PRECISION,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
)
LANGUAGE SQL
AS $$
    SELECT
        a.id,
        a.ambulance_number,
        a.status,

        ST_Distance(
            a.current_location,
            ST_SetSRID(
                ST_MakePoint(
                    incident_lon,
                    incident_lat
                ),
                4326
            )::GEOGRAPHY
        ) AS distance_meters,

        a.current_latitude,
        a.current_longitude

    FROM ambulances a

    WHERE a.status = 'available'

      AND a.current_location IS NOT NULL

      AND a.emergency_capable = TRUE

    ORDER BY
        a.current_location <->
        ST_SetSRID(
            ST_MakePoint(
                incident_lon,
                incident_lat
            ),
            4326
        )::GEOGRAPHY

    LIMIT result_limit;
$$;


-- ============================================================
-- 26. FUNCTION:
-- FIND NEAREST HOSPITALS
-- ============================================================

CREATE OR REPLACE FUNCTION find_nearest_hospitals(
    incident_lat DOUBLE PRECISION,
    incident_lon DOUBLE PRECISION,
    result_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    hospital_id UUID,
    hospital_name TEXT,
    distance_meters DOUBLE PRECISION,
    available_beds INTEGER,
    available_icu_beds INTEGER,
    available_doctors INTEGER,
    status hospital_status
)
LANGUAGE SQL
AS $$
    SELECT
        h.id,
        h.name,

        ST_Distance(
            h.location,
            ST_SetSRID(
                ST_MakePoint(
                    incident_lon,
                    incident_lat
                ),
                4326
            )::GEOGRAPHY
        ) AS distance_meters,

        h.available_beds,
        h.available_icu_beds,
        h.available_doctors,
        h.status

    FROM hospitals h

    WHERE h.status IN ('active', 'busy')

      AND h.emergency_department = TRUE

      AND h.ambulance_receiving = TRUE

    ORDER BY
        h.location <->
        ST_SetSRID(
            ST_MakePoint(
                incident_lon,
                incident_lat
            ),
            4326
        )::GEOGRAPHY

    LIMIT result_limit;
$$;


-- ============================================================
-- 27. FUNCTION:
-- UPDATE AMBULANCE LIVE LOCATION
-- ============================================================

CREATE OR REPLACE FUNCTION update_ambulance_location(
    p_ambulance_id UUID,
    p_latitude DOUBLE PRECISION,
    p_longitude DOUBLE PRECISION,
    p_speed_kmh DOUBLE PRECISION DEFAULT NULL,
    p_heading DOUBLE PRECISION DEFAULT NULL,
    p_accuracy_meters DOUBLE PRECISION DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN

    UPDATE ambulances

    SET
        current_latitude = p_latitude,
        current_longitude = p_longitude,
        current_speed_kmh = p_speed_kmh,
        current_heading = p_heading,
        gps_accuracy_meters = p_accuracy_meters,
        last_gps_update = NOW(),
        updated_at = NOW()

    WHERE id = p_ambulance_id;


    INSERT INTO ambulance_location_history (
        ambulance_id,
        latitude,
        longitude,
        speed_kmh,
        heading,
        accuracy_meters,
        source
    )

    VALUES (
        p_ambulance_id,
        p_latitude,
        p_longitude,
        p_speed_kmh,
        p_heading,
        p_accuracy_meters,
        'ambulance_app'
    );

END;
$$;


-- ============================================================
-- 28. FUNCTION:
-- CREATE PROFILE WHEN USER SIGNS UP
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN

    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        role
    )

    VALUES (
        NEW.id,

        COALESCE(
            NEW.raw_user_meta_data ->> 'full_name',
            'User'
        ),

        NEW.email,

        'citizen'
    )

    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;

END;
$$;


DROP TRIGGER IF EXISTS on_auth_user_created
ON auth.users;


CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- 29. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

ALTER TABLE incident_verifications ENABLE ROW LEVEL SECURITY;

ALTER TABLE incident_location_updates ENABLE ROW LEVEL SECURITY;

ALTER TABLE ambulances ENABLE ROW LEVEL SECURITY;

ALTER TABLE ambulance_location_history ENABLE ROW LEVEL SECURITY;

ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

ALTER TABLE hospital_beds ENABLE ROW LEVEL SECURITY;

ALTER TABLE hospital_doctors ENABLE ROW LEVEL SECURITY;

ALTER TABLE hospital_resources ENABLE ROW LEVEL SECURITY;

ALTER TABLE hospital_capacity_history ENABLE ROW LEVEL SECURITY;

ALTER TABLE dispatches ENABLE ROW LEVEL SECURITY;

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

ALTER TABLE route_reroute_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE traffic_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE provider_health ENABLE ROW LEVEL SECURITY;

ALTER TABLE hospital_selections ENABLE ROW LEVEL SECURITY;

ALTER TABLE hospital_arrivals ENABLE ROW LEVEL SECURITY;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 30. PROFILES POLICIES
-- ============================================================

DROP POLICY IF EXISTS profiles_select_own
ON profiles;

CREATE POLICY profiles_select_own
ON profiles
FOR SELECT
TO authenticated
USING (
    id = auth.uid()
);


-- ============================================================
-- 31. EMERGENCY CONTACT POLICIES
-- ============================================================

DROP POLICY IF EXISTS emergency_contacts_own
ON emergency_contacts;

CREATE POLICY emergency_contacts_own
ON emergency_contacts
FOR ALL
TO authenticated
USING (
    user_id = auth.uid()
)
WITH CHECK (
    user_id = auth.uid()
);


-- ============================================================
-- 32. INCIDENT POLICIES
-- Citizens can create incidents.
-- Users can see incidents.
-- Backend/service role can perform privileged operations.
-- ============================================================

DROP POLICY IF EXISTS incidents_insert_authenticated
ON incidents;

CREATE POLICY incidents_insert_authenticated
ON incidents
FOR INSERT
TO authenticated
WITH CHECK (
    reported_by = auth.uid()
);


DROP POLICY IF EXISTS incidents_select_authenticated
ON incidents;

CREATE POLICY incidents_select_authenticated
ON incidents
FOR SELECT
TO authenticated
USING (
    TRUE
);


-- ============================================================
-- 33. INCIDENT LOCATION UPDATE POLICIES
-- ============================================================

DROP POLICY IF EXISTS incident_location_select_authenticated
ON incident_location_updates;

CREATE POLICY incident_location_select_authenticated
ON incident_location_updates
FOR SELECT
TO authenticated
USING (
    TRUE
);


-- ============================================================
-- 34. AMBULANCE READ POLICY
-- Allows dashboards / authenticated clients to see live status.
-- Writes should normally happen through backend.
-- ============================================================

DROP POLICY IF EXISTS ambulances_select_authenticated
ON ambulances;

CREATE POLICY ambulances_select_authenticated
ON ambulances
FOR SELECT
TO authenticated
USING (
    TRUE
);


-- ============================================================
-- 35. AMBULANCE LOCATION HISTORY READ
-- ============================================================

DROP POLICY IF EXISTS ambulance_history_select_authenticated
ON ambulance_location_history;

CREATE POLICY ambulance_history_select_authenticated
ON ambulance_location_history
FOR SELECT
TO authenticated
USING (
    TRUE
);


-- ============================================================
-- 36. HOSPITAL READ POLICIES
-- ============================================================

DROP POLICY IF EXISTS hospitals_select_authenticated
ON hospitals;

CREATE POLICY hospitals_select_authenticated
ON hospitals
FOR SELECT
TO authenticated
USING (
    TRUE
);


DROP POLICY IF EXISTS hospital_beds_select_authenticated
ON hospital_beds;

CREATE POLICY hospital_beds_select_authenticated
ON hospital_beds
FOR SELECT
TO authenticated
USING (
    TRUE
);


DROP POLICY IF EXISTS hospital_doctors_select_authenticated
ON hospital_doctors;

CREATE POLICY hospital_doctors_select_authenticated
ON hospital_doctors
FOR SELECT
TO authenticated
USING (
    TRUE
);


DROP POLICY IF EXISTS hospital_resources_select_authenticated
ON hospital_resources;

CREATE POLICY hospital_resources_select_authenticated
ON hospital_resources
FOR SELECT
TO authenticated
USING (
    TRUE
);


-- ============================================================
-- 37. DISPATCH READ
-- ============================================================

DROP POLICY IF EXISTS dispatches_select_authenticated
ON dispatches;

CREATE POLICY dispatches_select_authenticated
ON dispatches
FOR SELECT
TO authenticated
USING (
    TRUE
);


-- ============================================================
-- 38. ROUTES READ
-- ============================================================

DROP POLICY IF EXISTS routes_select_authenticated
ON routes;

CREATE POLICY routes_select_authenticated
ON routes
FOR SELECT
TO authenticated
USING (
    TRUE
);


DROP POLICY IF EXISTS reroute_events_select_authenticated
ON route_reroute_events;

CREATE POLICY reroute_events_select_authenticated
ON route_reroute_events
FOR SELECT
TO authenticated
USING (
    TRUE
);


-- ============================================================
-- 39. TRAFFIC READ
-- ============================================================

DROP POLICY IF EXISTS traffic_events_select_authenticated
ON traffic_events;

CREATE POLICY traffic_events_select_authenticated
ON traffic_events
FOR SELECT
TO authenticated
USING (
    TRUE
);


-- ============================================================
-- 40. HOSPITAL SELECTION READ
-- ============================================================

DROP POLICY IF EXISTS hospital_selections_select_authenticated
ON hospital_selections;

CREATE POLICY hospital_selections_select_authenticated
ON hospital_selections
FOR SELECT
TO authenticated
USING (
    TRUE
);


-- ============================================================
-- 41. HOSPITAL ARRIVALS READ
-- ============================================================

DROP POLICY IF EXISTS hospital_arrivals_select_authenticated
ON hospital_arrivals;

CREATE POLICY hospital_arrivals_select_authenticated
ON hospital_arrivals
FOR SELECT
TO authenticated
USING (
    TRUE
);


-- ============================================================
-- 42. NOTIFICATIONS
-- ============================================================

DROP POLICY IF EXISTS notifications_select_own
ON notifications;

CREATE POLICY notifications_select_own
ON notifications
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);


DROP POLICY IF EXISTS notifications_update_own
ON notifications;

CREATE POLICY notifications_update_own
ON notifications
FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid()
)
WITH CHECK (
    user_id = auth.uid()
);


-- ============================================================
-- 43. PROVIDER HEALTH
-- ============================================================

DROP POLICY IF EXISTS provider_health_select_authenticated
ON provider_health;

CREATE POLICY provider_health_select_authenticated
ON provider_health
FOR SELECT
TO authenticated
USING (
    TRUE
);


-- ============================================================
-- 44. REALTIME
--
-- These are the tables where your frontend can receive
-- live updates.
-- ============================================================

DO $$
BEGIN

    BEGIN
        ALTER PUBLICATION supabase_realtime
        ADD TABLE incidents;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;


    BEGIN
        ALTER PUBLICATION supabase_realtime
        ADD TABLE ambulances;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;


    BEGIN
        ALTER PUBLICATION supabase_realtime
        ADD TABLE ambulance_location_history;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;


    BEGIN
        ALTER PUBLICATION supabase_realtime
        ADD TABLE dispatches;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;


    BEGIN
        ALTER PUBLICATION supabase_realtime
        ADD TABLE routes;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;


    BEGIN
        ALTER PUBLICATION supabase_realtime
        ADD TABLE route_reroute_events;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;


    BEGIN
        ALTER PUBLICATION supabase_realtime
        ADD TABLE traffic_events;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;


    BEGIN
        ALTER PUBLICATION supabase_realtime
        ADD TABLE hospitals;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;


    BEGIN
        ALTER PUBLICATION supabase_realtime
        ADD TABLE hospital_beds;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;


    BEGIN
        ALTER PUBLICATION supabase_realtime
        ADD TABLE hospital_doctors;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;


    BEGIN
        ALTER PUBLICATION supabase_realtime
        ADD TABLE notifications;
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;

END $$;


-- ============================================================
-- 45. USEFUL VIEWS
-- ============================================================


-- ------------------------------------------------------------
-- ACTIVE INCIDENTS
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW active_incidents AS
SELECT
    i.id,
    i.incident_number,
    i.emergency_type,
    i.title,
    i.description,
    i.status,
    i.verification_status,
    i.verification_score,
    i.severity,
    i.latitude,
    i.longitude,
    i.address,
    i.city,
    i.reported_at,
    i.verified_at
FROM incidents i
WHERE i.status NOT IN (
    'resolved',
    'cancelled',
    'false_report',
    'expired'
);


-- ------------------------------------------------------------
-- LIVE AMBULANCES
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW live_ambulances AS
SELECT
    a.id,
    a.ambulance_number,
    a.status,
    a.ambulance_type,
    a.current_latitude,
    a.current_longitude,
    a.current_speed_kmh,
    a.current_heading,
    a.last_gps_update,
    a.current_incident_id
FROM ambulances a
WHERE a.status <> 'offline';


-- ------------------------------------------------------------
-- HOSPITAL CAPACITY
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW hospital_capacity AS
SELECT
    h.id,
    h.name,
    h.city,
    h.status,
    h.emergency_department,
    h.trauma_center,
    h.available_beds,
    h.total_beds,
    h.available_icu_beds,
    h.total_icu_beds,
    h.available_doctors,
    h.total_doctors,
    h.last_capacity_update
FROM hospitals h;


-- ============================================================
-- DONE
-- ============================================================