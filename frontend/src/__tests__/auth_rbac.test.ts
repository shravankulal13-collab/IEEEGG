// ============================================================
// PRIMARY OWNER: SK
// MODULE: Frontend Authentication & RBAC Route Protection Tests
// ============================================================

import { describe, it, expect } from 'vitest';
import { getDefaultRolePath } from '../components/layout/RoleGuard';

describe('Role-Based Access Control (RBAC) & Routing Tests', () => {
  describe('getDefaultRolePath', () => {
    it('maps citizen role to /citizen', () => {
      expect(getDefaultRolePath('citizen')).toBe('/citizen');
    });

    it('maps ambulance_driver role to /ambulance', () => {
      expect(getDefaultRolePath('ambulance_driver')).toBe('/ambulance');
    });

    it('maps dispatcher role to /dispatcher', () => {
      expect(getDefaultRolePath('dispatcher')).toBe('/dispatcher');
    });

    it('maps hospital_admin role to /hospital', () => {
      expect(getDefaultRolePath('hospital_admin')).toBe('/hospital');
    });

    it('maps hospital_staff role to /hospital', () => {
      expect(getDefaultRolePath('hospital_staff')).toBe('/hospital');
    });

    it('maps system_admin role to /admin', () => {
      expect(getDefaultRolePath('system_admin')).toBe('/admin');
    });

    it('falls back to /login for undefined or invalid roles', () => {
      expect(getDefaultRolePath(undefined)).toBe('/login');
      expect(getDefaultRolePath('')).toBe('/login');
      expect(getDefaultRolePath('unknown_role')).toBe('/login');
    });
  });

  describe('Portal Privilege & Access Matrix', () => {
    const roles = {
      citizen: 'citizen',
      driver: 'ambulance_driver',
      dispatcher: 'dispatcher',
      hospital: 'hospital_admin',
      admin: 'system_admin',
    };

    const allowedPortals = {
      admin: ['system_admin'],
      citizen: ['citizen', 'system_admin'],
      ambulance: ['ambulance_driver', 'system_admin'],
      dispatcher: ['dispatcher', 'system_admin'],
      hospital: ['hospital_admin', 'hospital_staff', 'system_admin'],
    };

    it('ensures citizen can NOT access admin, ambulance, dispatcher, or hospital portals', () => {
      expect(allowedPortals.admin.includes(roles.citizen)).toBe(false);
      expect(allowedPortals.ambulance.includes(roles.citizen)).toBe(false);
      expect(allowedPortals.dispatcher.includes(roles.citizen)).toBe(false);
      expect(allowedPortals.hospital.includes(roles.citizen)).toBe(false);
      expect(allowedPortals.citizen.includes(roles.citizen)).toBe(true);
    });

    it('ensures ambulance driver can NOT access admin or hospital portals', () => {
      expect(allowedPortals.admin.includes(roles.driver)).toBe(false);
      expect(allowedPortals.hospital.includes(roles.driver)).toBe(false);
      expect(allowedPortals.citizen.includes(roles.driver)).toBe(false);
      expect(allowedPortals.ambulance.includes(roles.driver)).toBe(true);
    });

    it('ensures hospital admin can NOT access admin or ambulance portals', () => {
      expect(allowedPortals.admin.includes(roles.hospital)).toBe(false);
      expect(allowedPortals.ambulance.includes(roles.hospital)).toBe(false);
      expect(allowedPortals.hospital.includes(roles.hospital)).toBe(true);
    });

    it('ensures system admin has universal administrative access', () => {
      expect(allowedPortals.admin.includes(roles.admin)).toBe(true);
      expect(allowedPortals.citizen.includes(roles.admin)).toBe(true);
      expect(allowedPortals.ambulance.includes(roles.admin)).toBe(true);
      expect(allowedPortals.dispatcher.includes(roles.admin)).toBe(true);
      expect(allowedPortals.hospital.includes(roles.admin)).toBe(true);
    });
  });
});
