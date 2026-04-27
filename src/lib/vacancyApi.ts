import api from '@/lib/axios';

export interface VacancyResponse {
  vacancyId: number;
  remainId: number;
  storeId?: number;
  storeName: string;
  storeCategory?: string;
  remainDate: string;
  remainTime: string;
  createdAt: string;
}

export const createVacancy = async (userId: number, remainId: number): Promise<number> => {
  const response = await api.post('/vacancy', { userId, remainId });
  return response.data.data?.vacancyId;
};

export const getMyVacancies = async (userId: number): Promise<VacancyResponse[]> => {
  const response = await api.get('/vacancy/me', { params: { userId } });
  const rawData = response.data.data || response.data.result || response.data || [];
  return rawData as VacancyResponse[];
};

export const cancelVacancy = async (vacancyId: number): Promise<void> => {
  // 명세에 따라 vacancyId를 Path Variable로 전달
  await api.delete(`/vacancy/${vacancyId}`);
};