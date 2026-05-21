/**
 * API Client for Laravel Backend
 *
 * This module provides an Axios instance configured to communicate
 * with the SantriGresik SaaS Laravel backend.
 *
 * Usage:
 *   import apiClient from '@/lib/api/client';
 *   const { data } = await apiClient.get('/crm/leads');
 *
 * @see docs/admin-api-migration-plan.md
 */

import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Axios instance pre-configured for the Laravel Sanctum API.
 *
 * - Base URL from NEXT_PUBLIC_API_BASE_URL env
 * - Content-Type: application/json
 * - Auto-attaches Bearer token from localStorage
 * - Auto-redirects to /auth/login on 401
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Request interceptor
 * Attaches the Bearer token from localStorage if available.
 */
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor
 * - Extracts X-Request-ID header for debugging
 * - Handles 401 Unauthorized by clearing auth state and redirecting
 */
apiClient.interceptors.response.use(
  (response) => {
    // Attach request ID for debugging
    const requestId = response.headers['x-request-id'];
    if (requestId) {
      response.data._requestId = requestId;
    }
    return response;
  },
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
