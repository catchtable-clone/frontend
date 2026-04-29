import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  userId: number | null;
  accessToken: string | null;
  setUserId: (id: number | null) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // TODO: 인증 구현 후 null로 변경. 백엔드 시드 user1@test.com (USER) 임시 사용
      userId: 2,
      accessToken: null,
      setUserId: (id) => set({ userId: id }),
      setAccessToken: (token) => set({ accessToken: token }),
      logout: () => set({ userId: null, accessToken: null }),
    }),
    {
      name: 'auth-storage',
      // userId는 persist 제외 (임시값이 localStorage에 영구 저장되는 사고 방지)
      partialize: (state) => ({ accessToken: state.accessToken }),
    },
  ),
);
