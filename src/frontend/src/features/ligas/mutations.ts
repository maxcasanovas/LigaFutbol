import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/httpClient';
import { queryKeys } from '../../api/queries';
import type { LigaDto } from '../../api/types';

export interface LigaPayload {
  nombre: string;
  paisId: number;
}

export function useCreateLiga() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: LigaPayload) => api.post<LigaDto>('/api/ligas', values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.ligas }),
  });
}

export function useUpdateLiga() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: LigaPayload }) => api.put<void>(`/api/ligas/${id}`, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.ligas }),
  });
}

export function useDeleteLiga() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/api/ligas/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.ligas }),
  });
}
