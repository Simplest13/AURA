/**
 * AURA Centralized API Client
 * Coordinates HTTP requests to the AURA backend with timeout, error handling, and authentication.
 * Automatically injects the persisted JWT into every request.
 */

import { API_BASE_URL } from "../../config/env";
import { useAuthStore } from "../../stores/authStore";
import { StorageService } from "../storage/StorageService";
import { ApiError } from "../../types/api";

export class ApiClient {
  private static baseUrl = API_BASE_URL;
  private static defaultTimeoutMs = 30000;

  private static async getAuthHeader(): Promise<Record<string, string>> {
    // Prefer the live zustand session; fall back to the legacy storage key.
    const { token } = useAuthStore.getState();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    const stored = await StorageService.getItem<string>("auth_token");
    if (stored) {
      return { Authorization: `Bearer ${stored}` };
    }
    return {};
  }

  private static async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMs = this.defaultTimeoutMs
  ): Promise<T> {
    const url = endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint}`;
    const authHeaders = await this.getAuthHeader();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...(options.body && !(options.body instanceof FormData)
            ? { "Content-Type": "application/json" }
            : {}),
          ...authHeaders,
          ...options.headers,
        },
      });

      clearTimeout(timer);

      if (!response.ok) {
        let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData && (errData.error || errData.message)) {
            errorMessage = errData.error || errData.message;
          }
        } catch {
          // Non-JSON response
        }

        // Invalid/expired session → clear auth state so the app lands on Login
        // instead of looping on 401s with a dead token.
        if (response.status === 401 && !endpoint.includes("/api/auth/")) {
          void useAuthStore.getState().logout();
        }

        const apiError: ApiError = {
          message: errorMessage,
          status: response.status,
        };
        throw apiError;
      }

      if (response.status === 204) {
        return undefined as unknown as T;
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return (await response.json()) as T;
      }

      return (await response.text()) as unknown as T;
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === "AbortError") {
        throw {
          message: "Request timed out. Please check your connection to the AURA backend.",
          code: "TIMEOUT",
        } as ApiError;
      }
      // HTTP errors (already a proper ApiError with a real status) pass through
      // unchanged — only genuine network failures get the NETWORK_ERROR code.
      if (err && typeof err.status === "number") {
        throw err;
      }
      throw {
        message: err.message || "Network request failed",
        status: err.status,
        code: err.code || "NETWORK_ERROR",
      } as ApiError;
    }
  }

  public static async get<T = any>(endpoint: string, timeoutMs?: number): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" }, timeoutMs);
  }

  public static async post<T = any>(endpoint: string, body?: any, timeoutMs?: number): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "POST",
        body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      },
      timeoutMs
    );
  }

  public static async put<T = any>(endpoint: string, body?: any, timeoutMs?: number): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "PUT",
        body: body ? JSON.stringify(body) : undefined,
      },
      timeoutMs
    );
  }

  public static async delete<T = any>(endpoint: string, timeoutMs?: number): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" }, timeoutMs);
  }

  /** Ensure a valid session token exists, performing a silent demo login if needed. */
  public static async ensureSession(): Promise<string> {
    const auth = useAuthStore.getState();
    if (auth.token) return auth.token;
    const res = await this.post<{ token: string; user?: any }>("/api/chat/demo-login");
    auth.login(res.user?.email ?? "shivam@alignsoul.co", res.token, res.user);
    return res.token;
  }

  /**
   * Validate a restored session against the backend (/api/auth/me).
   * - Valid   → refresh the cached user object (name/createdAt may have changed)
   * - 401     → logout (session cleared, navigation gate returns to Login)
   * - Offline → keep the session (fail open); data calls surface their own errors
   */
  public static async validateSession(): Promise<boolean> {
    const auth = useAuthStore.getState();
    if (!auth.token) return false;
    try {
      const res = await this.get<{ user?: any }>("/api/auth/me", 8000);
      if (res?.user) {
        auth.login(res.user.email ?? auth.user?.email ?? "", auth.token, res.user);
      }
      return true;
    } catch (err: any) {
      if (err?.status === 401) {
        await useAuthStore.getState().logout();
        return false;
      }
      return true; // network unreachable — keep local session
    }
  }
}
