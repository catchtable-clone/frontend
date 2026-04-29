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
  accessToken: string | null;
  userId: number | null;        // 로그인 시 알아야 X-User-Id 헤더에 사용
  user: AuthUser | null;        // /users/me에서 받은 정보
  setAuth: (token: string, userId: number) => void;
  setUser: (user: AuthUser) => void;
  setAccessToken: (token: string | null) => void;  // 호환용 (기존 코드 사용)
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      userId: null,
      user: null,
      setAuth: (token, userId) => set({ accessToken: token, userId }),
      setUser: (user) => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }),
      logout: () => set({ accessToken: null, userId: null, user: null }),
    }),
    {
      name: 'auth-storage',
    },
  ),
);
