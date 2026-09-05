# LigaFutbol — Frontend

Frontend en React + TypeScript (Vite) para administrar países, ligas, ciudades y equipos, consumiendo la API en `src/backend`.

## Stack

- React + TypeScript, Vite.
- React Router (routing).
- Mantine (componentes UI, theming).
- TanStack Query (estado de datos del servidor).
- Cliente HTTP propio sobre `fetch` (`src/api/httpClient.ts`) que normaliza los formatos de error de la API y adjunta el JWT.

## Puesta en marcha

```bash
cd src/frontend
npm install
npm run dev
```

Por defecto apunta a `http://localhost:5080` (ver `.env.development`, variable `VITE_API_BASE_URL`) — requiere el backend corriendo en dev.

## Estructura

```
src/
├── api/       # cliente HTTP, manejo de errores, storage del token
├── pages/     # pantallas
└── theme/     # theme de Mantine (paleta, tipografía)
```
