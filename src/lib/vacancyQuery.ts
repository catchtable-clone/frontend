import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createVacancy, getMyVacancies, cancelVacancy } from './vacancyApi';

export const useCreateVacancyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, remainId }: { userId: number; remainId: number }) =>
      createVacancy(userId, remainId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myVacancies', variables.userId] });
    },
  });
};

export const useMyVacanciesQuery = (userId: number) => {
  return useQuery({
    queryKey: ['myVacancies', userId],
    queryFn: () => getMyVacancies(userId),
    enabled: !!userId,
  });
};

export const useCancelVacancyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vacancyId, userId }: { vacancyId: number; userId: number }) => cancelVacancy(vacancyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myVacancies', variables.userId] });
    },
  });
};