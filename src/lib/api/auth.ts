/**
 * Auth Service — Laravel Sanctum API
 *
 * Provides authentication functions that communicate with the
 * Laravel Sanctum backend instead of NextAuth/Prisma.
 *
 * This is a NON-BREAKING addition. Existing NextAuth flow is unchanged.
 *
 * Usage:
 *   import { authService } from '@/lib/api/auth';
 *   const { token, user } = await authService.login(email, password);
 *
 * @see docs/admin-api-migration-plan.md
 */

import apiClient from './client';
import type { AuthUser, LoginResponse } from './types';

export const authService = {
  /**
   * Login with email and password.
   * Calls POST /api/v1/auth/login on the Laravel backend.
   *
   * @param email - User email
   * @param password - User password
   * @returns LoginResponse with token and user data
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
      device_name:
        typeof navigator !== 'undefined'
          ? navigator.userAgent.slice(0, 120)
          : 'Unknown',
    });
    return data;
  },

  /**
   * Logout the current user.
   * Calls POST /api/v1/auth/logout and clears localStorage.
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
  },

  /**
   * Get the currently authenticated user.
   * Calls GET /api/v1/me
   *
   * @returns AuthUser object
   */
  async getMe(): Promise<AuthUser> {
    const { data } = await apiClient.get<{ data: AuthUser }>('/me');
    return data.data;
  },

  /**
   * Store auth data in localStorage.
   * Call this after successful login.
   */
  storeAuth(token: string, user: AuthUser): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
  },

  /**
   * Clear auth data from localStorage.
   */
  clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  },

  /**
   * Check if user is authenticated (has token).
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Get stored user data from localStorage.
   */
  getStoredUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('auth_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored) as AuthUser;
    } catch {
      return null;
    }
  },
};
