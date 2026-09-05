import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/httpClient';
import { queryKeys } from '../../api/queries';
import type { PaisDto } from '../../api/types';

export interface PaisFormValues {
  nombre: string;
  urlBandera: string;
}

export function useCreatePais() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: PaisFormValues) => api.post<PaisDto>('/api/paises', values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.paises }),
  });
}

export function useUpdatePais() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: PaisFormValues }) =>
      api.put<void>(`/api/paises/${id}`, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.paises }),
  });
}

export function useDeletePais() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/api/paises/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.paises }),
  });
}
