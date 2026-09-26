/**
 * AURA Mobile API Types
 */

export interface ApiResponse<T = any> {
  status: string;
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface AuthTokens {
  token: string;
  refreshToken?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

