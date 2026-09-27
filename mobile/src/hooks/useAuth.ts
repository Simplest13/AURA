/**
 * useAuth Hook
 * Thin wrapper over the auth store + backend auth API.
 * No fake local fallback accounts — errors from the backend are surfaced honestly.
 */

import { useAuthStore } from "../stores/authStore";
import { SecureTokenStorage } from "../services/storage/SecureTokenStorage";
import { ApiClient } from "../services/api/ApiClient";
import { User } from "../types/auth";

interface AuthResponse {
  token: string;
  user: User;
}

export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, login, logout, updateUser } = useAuthStore();

  const handleLogin = async (email: string, password: string): Promise<void> => {
    // Throws with the backend's message on failure (invalid credentials, network down, …)
    const res = await ApiClient.post<AuthResponse>("/api/auth/login", { email, password });
    if (!res?.token || !res?.user) {
      throw new Error("Login failed: malformed response from server");
    }
    await SecureTokenStorage.setToken(res.token);
    login(res.user.email ?? email, res.token, res.user);
  };

  const handleRegister = async (name: string, email: string, password: string): Promise<void> => {
    // Duplicate email / validation errors come back as proper error messages
    const res = await ApiClient.post<AuthResponse>("/api/auth/register", { name, email, password });
    if (!res?.token || !res?.user) {
      throw new Error("Registration failed: malformed response from server");
    }
    await SecureTokenStorage.setToken(res.token);
    login(res.user.email ?? email, res.token, res.user); // automatic sign-in after registration
  };

  const handleLogout = async (): Promise<void> => {
    // Best-effort server notification (stateless JWT — the real work is client-side)
    try {
      if (useAuthStore.getState().token) {
        await ApiClient.post("/api/auth/logout");
      }
    } catch {
      // Server unreachable — local session is cleared regardless
    }
    await logout();
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateUser,
  };
};
