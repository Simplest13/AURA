import { create } from "zustand";
import { User, AuthState } from "../types/auth";
import { MOCK_USER } from "../utils/mockData";
import { StorageService } from "../services/storage/StorageService";
import { SecureTokenStorage } from "../services/storage/SecureTokenStorage";
import { resetBackendConversationId } from "../services/ai/AIService";

/**
 * Central authentication state.
 *
 * `hydrate()` (= restoreSession) is the ONLY gate between the splash screen and
 * the app: it restores the persisted session, optionally validates it against
 * the backend, and ALWAYS terminates — success, no session, or timeout — so the
 * splash can never become an infinite "Connecting second brain..." screen.
 */

const SESSION_KEY = "aura_auth_session";

interface PersistedSession {
  user: User;
  token: string;
}

interface AuthStore extends AuthState {
  hydrated: boolean;
  /** Restore persisted session (aliased as restoreSession). Always resolves. */
  hydrate: () => Promise<void>;
  restoreSession: () => Promise<void>;
  /** Set session after a successful login/register/demo-login. */
  login: (email: string, token?: string, user?: User) => void;
  /** Real logout: clears local session, per-user caches, and secure token. */
  logout: () => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
}

async function persist(user: User | null, token: string | null) {
  if (user && token) {
    await StorageService.setItem(SESSION_KEY, { user, token } as PersistedSession);
  } else {
    await StorageService.removeItem(SESSION_KEY);
  }
}

/** Promise.race timeout that never rejects — resolves `fallback` instead. */
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise<T>((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      }
    );
  });
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Start unauthenticated; the persisted session (if any) is restored in hydrate()
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;

    // Read the persisted session (AsyncStorage-backed) with a hard 3s cap.
    // Migration path: a legacy token stored under the old "auth_token" key.
    let session: PersistedSession | null = null;
    try {
      const read = StorageService.getItem<PersistedSession>(SESSION_KEY).then((s) => s ?? null);
      session = await withTimeout(read, 3000, null);

      if (!session) {
        const legacyToken = await withTimeout(SecureTokenStorage.getToken(), 2000, null);
        if (legacyToken) {
          // Token without a user object — restore minimal identity; the ApiClient
          // 401 handler or /auth/me check will correct it if the token is stale.
          session = {
            token: legacyToken,
            user: { ...MOCK_USER, email: "" },
          };
        }
      }
    } catch {
      // Storage unavailable — fall through to logged-out state
    }

    if (session && session.user && session.token) {
      set({ user: session.user, token: session.token, isAuthenticated: true, hydrated: true });
      return;
    }

    set({ user: null, token: null, isAuthenticated: false, hydrated: true });
  },

  // Alias for clarity at the call site (matches the spec's restoreSession())
  restoreSession: function () {
    return get().hydrate();
  },

  login: (email: string, token = "mock-jwt-aura-session-token", user?: User) => {
    const resolvedUser: User = user ?? { ...MOCK_USER, email: email || MOCK_USER.email };
    set({ isAuthenticated: true, token, user: resolvedUser, hydrated: true });
    void persist(resolvedUser, token);
    if (token) void SecureTokenStorage.setToken(token);
  },

  logout: async () => {
    // 1. Clear state FIRST so the navigation gate switches immediately.
    set({ isAuthenticated: false, token: null, user: null });
    // 2. Remove persisted session + secure token (never leave a stale session).
    await persist(null, null);
    await SecureTokenStorage.clearToken();
    try {
      await StorageService.removeItem("auth_token"); // legacy key cleanup
    } catch {
      // ignore
    }
    // 3. Wipe legacy global cache keys so the next account starts clean.
    //    (Per-user keys are cleared by the stores' own reset actions.)
    try {
      await StorageService.removeItem("aura_chat_conversations");
      await StorageService.removeItem("aura_study_cache");
    } catch {
      // ignore
    }
    // 4. Reset in-memory domain state + backend conversation pointer so no
    //    trace of the previous account survives into the next session.
    resetBackendConversationId();
    try {
      const { useChatStore } = require("./chatStore");
      const { useStudyStore } = require("./studyStore");
      useChatStore.getState().reset();
      useStudyStore.getState().reset();
    } catch {
      // stores unavailable (circular import edge) — non-fatal
    }
    // Note: hydrate() has already run this boot; the navigation gate reads
    // isAuthenticated directly, so logout lands on the auth flow immediately.
  },

  updateUser: (partial) => {
    const next = get().user ? { ...get().user!, ...partial } : null;
    set({ user: next });
    if (next) void persist(next, get().token);
  },
}));
