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
import type { AxiosRequestConfig } from 'axios';
import type { ApiResponse } from './types';
import { ApiError } from './types';

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

// ============================================================
// Typed API helpers — wrap ApiResponse<T> and handle errors
// ============================================================

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 0;
    const data = error.response?.data as Record<string, unknown> | undefined;
    const message = (data?.message as string) || error.message;
    const errors = data?.errors as Record<string, string[]> | undefined;
    return new ApiError(message, status, errors);
  }
  if (error instanceof Error) {
    return new ApiError(error.message, 0);
  }
  return new ApiError('Unknown error', 0);
}

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const { data } = await apiClient.get<ApiResponse<T>>(url, config);
    if (!data.success) {
      throw new ApiError(data.message, 422, data.errors);
    }
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const { data } = await apiClient.post<ApiResponse<T>>(url, body, config);
    if (!data.success) {
      throw new ApiError(data.message, 422, data.errors);
    }
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const { data } = await apiClient.put<ApiResponse<T>>(url, body, config);
    if (!data.success) {
      throw new ApiError(data.message, 422, data.errors);
    }
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function apiDelete<T = void>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    const { data } = await apiClient.delete<ApiResponse<T>>(url, config);
    if (!data.success) {
      throw new ApiError(data.message, 422, data.errors);
    }
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export function extractApiData<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new ApiError(response.message, 422, response.errors);
  }
  return response.data;
}
