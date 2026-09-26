import { create } from "zustand";
import { User, AuthState } from "../types/auth";
import { MOCK_USER } from "../utils/mockData";

interface AuthStore extends AuthState {
  login: (email: string, token?: string, user?: User) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: MOCK_USER,
  token: "mock-jwt-aura-session-token",
  isAuthenticated: true,
  isLoading: false,

  login: (email: string, token = "mock-jwt-aura-session-token", user = MOCK_USER) => {
    set({
      isAuthenticated: true,
      token,
      user: { ...user, email: email || user.email },
    });
  },

  logout: () => {
    set({
      isAuthenticated: false,
      token: null,
      user: null,
    });
  },

  updateUser: (partial) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    }));
  },
}));
