import api from '@/lib/axios';
import { unwrap } from '@/lib/apiUtils';

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

export const createVacancy = async (remainId: number): Promise<number> => {
  const response = await api.post('/vacancy', { remainId });
  return unwrap<{ vacancyId: number }>(response, { vacancyId: 0 }).vacancyId;
};

export const getMyVacancies = async (): Promise<VacancyResponse[]> => {
  const response = await api.get('/vacancy/me');
  return unwrap<VacancyResponse[]>(response, []);
};

export const cancelVacancy = async (vacancyId: number): Promise<void> => {
  // 명세에 따라 vacancyId를 Path Variable로 전달
  await api.delete(`/vacancy/${vacancyId}`);
};
