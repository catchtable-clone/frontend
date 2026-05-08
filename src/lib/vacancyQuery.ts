import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { createVacancy, getMyVacancies, cancelVacancy } from './vacancyApi';

const myVacanciesKey = (userId: number | null) => ['myVacancies', userId];

export const useCreateVacancyMutation = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.userId);

  return useMutation({
    mutationFn: (remainId: number) => createVacancy(remainId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myVacanciesKey(userId) });
    },
  });
};

export const useMyVacanciesQuery = () => {
  const userId = useAuthStore((s) => s.userId);

  return useQuery({
    queryKey: myVacanciesKey(userId),
    queryFn: getMyVacancies,
    enabled: !!userId,
  });
};

export const useCancelVacancyMutation = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.userId);

  return useMutation({
    mutationFn: (vacancyId: number) => cancelVacancy(vacancyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myVacanciesKey(userId) });
    },
  });
};
