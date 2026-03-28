/**
 * Centralized API client for admin-santrigresik-crm.
 *
 * All requests to binkhozin/santrigresik-saas go through this module.
 * Do NOT call the SaaS backend directly with fetch() from components —
 * always use the helpers exported from here so that auth headers,
 * base URL, and error handling are applied consistently.
 *
 * Base URL is read from NEXT_PUBLIC_SAAS_API_URL (required).
 */

/** Shape of a failed API response */
export interface ApiError {
  status: number;
  message: string;
}

/** Result type: either data or an error */
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

/**
 * Build the base URL for the SaaS backend.
 * Throws at call-time if the env var is not set, so misconfiguration
 * is caught early rather than producing confusing network errors.
 */
function getSaasBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SAAS_API_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SAAS_API_URL is not set. " +
        "Add it to .env.local before making API calls."
    );
  }
  return url.replace(/\/$/, ""); // strip trailing slash
}

/**
 * Core fetch wrapper.
 *
 * @param path     - API path, e.g. "/admin/clients" (must start with /)
 * @param options  - Standard RequestInit options
 * @param token    - Optional Bearer token from the NextAuth session.
 *                   Pass `session?.user?.backendToken` once the backend
 *                   auth integration is in place.
 */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<ApiResult<T>> {
  const baseUrl = getSaasBaseUrl();
  const url = `${baseUrl}${path}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (networkError) {
    return {
      ok: false,
      error: {
        status: 0,
        message:
          networkError instanceof Error
            ? networkError.message
            : "Network error",
      },
    };
  }

  // Session expired or token rejected — callers should trigger signOut()
  if (response.status === 401) {
    return {
      ok: false,
      error: { status: 401, message: "Unauthorized — session may have expired" },
    };
  }

  if (response.status === 403) {
    return {
      ok: false,
      error: { status: 403, message: "Forbidden — insufficient permissions" },
    };
  }

  if (!response.ok) {
    let message = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // ignore JSON parse errors on error responses
    }
    return { ok: false, error: { status: response.status, message } };
  }

  // 204 No Content
  if (response.status === 204) {
    return { ok: true, data: undefined as T };
  }

  try {
    const data: T = await response.json();
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      error: { status: response.status, message: "Failed to parse response body" },
    };
  }
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/** GET request to the SaaS backend */
export function apiGet<T>(path: string, token?: string): Promise<ApiResult<T>> {
  return apiFetch<T>(path, { method: "GET" }, token);
}

/** POST request to the SaaS backend */
export function apiPost<T>(
  path: string,
  body: unknown,
  token?: string
): Promise<ApiResult<T>> {
  return apiFetch<T>(
    path,
    { method: "POST", body: JSON.stringify(body) },
    token
  );
}

/** PUT request to the SaaS backend */
export function apiPut<T>(
  path: string,
  body: unknown,
  token?: string
): Promise<ApiResult<T>> {
  return apiFetch<T>(
    path,
    { method: "PUT", body: JSON.stringify(body) },
    token
  );
}

/** PATCH request to the SaaS backend */
export function apiPatch<T>(
  path: string,
  body: unknown,
  token?: string
): Promise<ApiResult<T>> {
  return apiFetch<T>(
    path,
    { method: "PATCH", body: JSON.stringify(body) },
    token
  );
}

/** DELETE request to the SaaS backend */
export function apiDelete<T>(
  path: string,
  token?: string
): Promise<ApiResult<T>> {
  return apiFetch<T>(path, { method: "DELETE" }, token);
}
