import { useQuery } from '@tanstack/react-query';
import { api } from './httpClient';
import type { CiudadDto, EquipoDto, LigaDto, PaisDto } from './types';

export const queryKeys = {
  paises: ['paises'] as const,
  ciudades: ['ciudades'] as const,
  ligas: ['ligas'] as const,
  equipos: ['equipos'] as const,
};

export function usePaises() {
  return useQuery({
    queryKey: queryKeys.paises,
    queryFn: () => api.get<PaisDto[]>('/api/paises'),
  });
}

export function useCiudades() {
  return useQuery({
    queryKey: queryKeys.ciudades,
    queryFn: () => api.get<CiudadDto[]>('/api/ciudades'),
  });
}

export function useLigas() {
  return useQuery({
    queryKey: queryKeys.ligas,
    queryFn: () => api.get<LigaDto[]>('/api/ligas'),
  });
}

export function useEquipos() {
  return useQuery({
    queryKey: queryKeys.equipos,
    queryFn: () => api.get<EquipoDto[]>('/api/equipos'),
  });
}
