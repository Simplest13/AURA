/**
 * Authentication & User Session Types
 */

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  avatarUrl?: string;
  preferredTone?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
