/**
 * AURA Centralized API Client
 * Coordinates HTTP requests to the AURA backend with timeout, error handling, and authentication.
 */

import { API_BASE_URL } from "../../config/env";
import { StorageService } from "../storage/StorageService";
import { ApiError } from "../../types/api";

export class ApiClient {
  private static baseUrl = API_BASE_URL;
  private static defaultTimeoutMs = 12000;

  private static async getAuthHeader(): Promise<Record<string, string>> {
    const token = await StorageService.getItem<string>("auth_token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
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
          "Content-Type": "application/json",
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

        const apiError: ApiError = {
          message: errorMessage,
          status: response.status,
        };
        throw apiError;
      }

      // Check if response has body
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
        body: body ? JSON.stringify(body) : undefined,
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
}

