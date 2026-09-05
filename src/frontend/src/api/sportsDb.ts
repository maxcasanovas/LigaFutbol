// Cliente aparte del de la API propia (src/api/httpClient.ts): sin JWT, sin el
// wrapper de errores de LigaFutbol. Un error de red o un 429 de TheSportsDB nunca
// debe bloquear el guardado del Equipo, asi que cualquier falla se traga y devuelve
// una lista vacia en vez de propagar una excepcion.

export interface SportsDbTeam {
  idTeam: string;
  strTeam: string;
  // El campo real de la API es "strBadge" (la documentacion historica de TheSportsDB
  // menciona "strTeamBadge", pero la respuesta en vivo no lo incluye).
  strBadge: string | null;
  strCountry: string | null;
  strLeague: string | null;
}

interface SearchTeamsResponse {
  teams: SportsDbTeam[] | null;
}

const SEARCH_TEAMS_URL = 'https://www.thesportsdb.com/api/v1/json/3/searchteams.php';

export async function searchTeamsByName(nombre: string): Promise<SportsDbTeam[]> {
  const query = nombre.trim();
  if (query.length === 0) return [];

  try {
    const response = await fetch(`${SEARCH_TEAMS_URL}?t=${encodeURIComponent(query)}`);
    if (!response.ok) return [];

    const data = (await response.json()) as SearchTeamsResponse;
    return data.teams ?? [];
  } catch {
    return [];
  }
}
