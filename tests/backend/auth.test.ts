// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Backend Auth & Role Unit Tests
// ============================================================

import { describe, expect, it } from 'vitest';
import { authService } from '../../backend/src/modules/auth/auth.service.js';
import {
  loginSchema,
  registerSchema,
} from '../../backend/src/modules/auth/auth.validator.js';

describe('Authentication & Role System Tests', () => {
  describe('Auth Validator Schemas', () => {
    it('validates a correct user registration input', () => {
      const valid = {
        fullName: 'Test Officer',
        email: 'officer@emergency.gov.in',
        phone: '+919876543210',
        password: 'Password123',
        role: 'dispatcher',
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects an invalid email format', () => {
      const invalid = {
        fullName: 'Test User',
        email: 'not-an-email',
        password: 'Password123',
        role: 'citizen',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects passwords without an uppercase letter or digit', () => {
      const invalid = {
        fullName: 'Test User',
        email: 'valid@emergency.gov.in',
        password: 'weakpassword',
        role: 'citizen',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('validates login schema', () => {
      const result = loginSchema.safeParse({
        email: 'valid@emergency.gov.in',
        password: 'Password123',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Auth Service Operations', () => {
    it('authenticates seed dispatcher credentials', async () => {
      const session = await authService.login({
        email: 'dispatcher@emergency.gov.in',
        password: 'Emergency@123',
      });

      expect(session).toBeDefined();
      expect(session.user.role).toBe('dispatcher');
      expect(session.token).toBeDefined();
      expect(session.token.length).toBeGreaterThan(20);
    });

    it('registers a new citizen user profile and returns a JWT token', async () => {
      const uniqueEmail = `citizen_${Date.now()}@emergency.gov.in`;
      const session = await authService.register({
        fullName: 'Aarav Patel',
        email: uniqueEmail,
        phone: '+919988776655',
        password: 'SecurePassword1',
        role: 'citizen',
      });

      expect(session.user.email).toBe(uniqueEmail);
      expect(session.user.role).toBe('citizen');
      expect(session.token).toBeDefined();
    });

    it('rejects invalid passwords on existing accounts', async () => {
      await expect(
        authService.login({
          email: 'dispatcher@emergency.gov.in',
          password: 'WrongPassword!',
        })
      ).rejects.toThrow();
    });
  });
});
