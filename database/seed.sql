-- ============================================================
-- PRIMARY OWNER: SK
-- ROLE: Core Platform + Backend Integration Lead
-- MODULE: Database Seed Data
-- NOTE: Shared dependency -- changes require team coordination.
-- ============================================================

-- Reference system users with hashed password ('Emergency@123')
-- Generated using bcryptjs (cost factor 10)
-- Password hash: $2a$10$iXb2y0UfGzW5PjQx6sV2h.uC3w1aP3k7uH5e4eY9iZ1jO7hK4k5lO
-- This is strictly for initial test and authorization validation.

INSERT INTO profiles (id, full_name, phone, email, password_hash, role, is_active)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Admin Officer', '+919876543210', 'admin@emergency.gov.in', '$2a$10$wEkgz6bC8vVn1L9uJbW.zOD1CgqfUu6xVqI4O/Q11Kx9k71Z6f/a2', 'system_admin', true),
    ('a0000000-0000-0000-0000-000000000002', 'Chief Dispatcher', '+919876543211', 'dispatcher@emergency.gov.in', '$2a$10$wEkgz6bC8vVn1L9uJbW.zOD1CgqfUu6xVqI4O/Q11Kx9k71Z6f/a2', 'dispatcher', true),
    ('a0000000-0000-0000-0000-000000000003', 'Ambulance Operator', '+919876543212', 'ambulance@emergency.gov.in', '$2a$10$wEkgz6bC8vVn1L9uJbW.zOD1CgqfUu6xVqI4O/Q11Kx9k71Z6f/a2', 'ambulance_driver', true),
    ('a0000000-0000-0000-0000-000000000004', 'Hospital Administrator', '+919876543213', 'hospital@emergency.gov.in', '$2a$10$wEkgz6bC8vVn1L9uJbW.zOD1CgqfUu6xVqI4O/Q11Kx9k71Z6f/a2', 'hospital_admin', true),
    ('a0000000-0000-0000-0000-000000000005', 'Citizen Reporter', '+919876543214', 'citizen@emergency.gov.in', '$2a$10$wEkgz6bC8vVn1L9uJbW.zOD1CgqfUu6xVqI4O/Q11Kx9k71Z6f/a2', 'citizen', true)
ON CONFLICT (id) DO NOTHING;
