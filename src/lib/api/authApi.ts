import api from '@/lib/axios';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  nickname: string;
  profileImage: string | null;
}

export async function googleLogin(idToken: string): Promise<TokenResponse> {
  const res = await api.post('/auth/google/login', { idToken });
  return res.data.data;
}

export async function refreshTokenApi(refreshToken: string): Promise<TokenResponse> {
  const res = await api.post('/auth/refresh', { refreshToken }, { skipErrorToast: true });
  return res.data.data;
}

export async function logoutApi(refreshToken: string): Promise<void> {
  await api.post('/auth/logout', { refreshToken }, { skipErrorToast: true });
}
