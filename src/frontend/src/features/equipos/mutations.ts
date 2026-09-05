import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/httpClient';
import { queryKeys } from '../../api/queries';
import type { EquipoDto } from '../../api/types';

export interface EquipoPayload {
  nombre: string;
  urlEscudo: string;
  ciudadId: number;
  ligaId: number;
}

export function useCreateEquipo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: EquipoPayload) => api.post<EquipoDto>('/api/equipos', values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.equipos }),
  });
}

export function useUpdateEquipo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: EquipoPayload }) =>
      api.put<void>(`/api/equipos/${id}`, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.equipos }),
  });
}

export function useDeleteEquipo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/api/equipos/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.equipos }),
  });
}
