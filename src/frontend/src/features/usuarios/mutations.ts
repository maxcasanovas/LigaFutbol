import { useMutation } from '@tanstack/react-query';
import { api } from '../../api/httpClient';
import type { AuthResponseDto, CrearUsuarioDto } from '../../api/types';

export function useCreateUsuario() {
  return useMutation({
    mutationFn: (values: CrearUsuarioDto) => api.post<AuthResponseDto>('/api/auth/usuarios', values),
  });
}
