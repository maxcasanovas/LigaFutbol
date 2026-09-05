// Cliente aparte del propio (src/api/httpClient.ts): sin JWT. flagcdn no expone
// un endpoint de búsqueda por nombre, así que se trae el listado completo de
// países una sola vez (se cachea vía react-query) y el filtro por nombre se hace
// localmente. Un error de red nunca debe bloquear el guardado del País: cualquier
// falla se traga y devuelve una lista vacía.

export interface FlagCdnCountry {
  // ISO 3166-1 alpha-2 en minúscula (ej "ar"), es el nombre de archivo en flagcdn.
  code: string;
  nombre: string;
}

const CODES_URL = 'https://flagcdn.com/es/codes.json';

export async function fetchFlagCdnCountries(): Promise<FlagCdnCountry[]> {
  try {
    const response = await fetch(CODES_URL);
    if (!response.ok) return [];

    const data = (await response.json()) as Record<string, string>;
    return Object.entries(data).map(([code, nombre]) => ({ code, nombre }));
  } catch {
    return [];
  }
}

export function flagCdnUrl(code: string): string {
  return `https://flagcdn.com/${code}.svg`;
}
