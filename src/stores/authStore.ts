import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  userId: number;
  email: string;
  nickname: string;
  profileImage?: string;
  role: 'USER' | 'ADMIN';
}

interface AuthState {
  userId: number | null;
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setAuth: (accessToken: string, refreshToken: string, userId: number, nickname?: string, profileImage?: string | null) => void;
  setUser: (user: AuthUser) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: (accessToken, refreshToken, userId, nickname, profileImage) =>
        set({
          accessToken,
          refreshToken,
          userId,
          user: nickname
            ? { userId, email: '', nickname, profileImage: profileImage ?? undefined, role: 'USER' }
            : null,
        }),
      setUser: (user) => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }),
      logout: () => set({ accessToken: null, refreshToken: null, userId: null, user: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userId: state.userId,
      }),
    },
  ),
);
