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
  userId: number | null;        // 로그인 시 알아야 X-User-Id 헤더에 사용
  accessToken: string | null;
  user: AuthUser | null;        // /users/me에서 받은 정보
  setAuth: (token: string, userId: number) => void;
  setUser: (user: AuthUser) => void;
  setAccessToken: (token: string | null) => void;  // 호환용 (기존 코드 사용)
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      accessToken: null,
      user: null,
      setAuth: (token, userId) => set({ accessToken: token, userId }),
      setUser: (user) => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }),
      logout: () => set({ accessToken: null, userId: null, user: null }),
    }),
    {
      name: 'auth-storage',
      // userId까지 persist — 새로고침해도 로그인 상태(특히 admin) 유지
      // (기본값을 null로 두므로 명시적 setAuth 호출 없이는 임의 user로 자동 식별되지 않음)
      partialize: (state) => ({
        accessToken: state.accessToken,
        userId: state.userId,
      }),
    },
  ),
);
