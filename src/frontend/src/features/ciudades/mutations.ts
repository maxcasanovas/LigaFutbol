import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/httpClient';
import { queryKeys } from '../../api/queries';
import type { CiudadDto } from '../../api/types';

export interface CiudadPayload {
  nombre: string;
  paisId: number;
}

export function useCreateCiudad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: CiudadPayload) => api.post<CiudadDto>('/api/ciudades', values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.ciudades }),
  });
}

export function useUpdateCiudad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: CiudadPayload }) =>
      api.put<void>(`/api/ciudades/${id}`, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.ciudades }),
  });
}

export function useDeleteCiudad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/api/ciudades/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.ciudades }),
  });
}
