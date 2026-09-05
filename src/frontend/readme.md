# LigaFutbol — Frontend

Frontend en React + TypeScript (Vite) para administrar países, ligas, ciudades y equipos, consumiendo la API REST de `src/backend`. Login con JWT, RBAC de 3 roles reflejado en la UI, y CRUD completo de las 4 entidades del dominio.

## Stack

| Tecnología | Uso |
|---|---|
| **React 19 + TypeScript**, Vite | Base de la app |
| **React Router** | Routing y rutas protegidas |
| **Mantine** (`core`, `form`, `notifications`, `hooks`) | Componentes UI, formularios, notificaciones, theming |
| **TanStack Query** | Cache y estado de las requests a la API (listas, loading, invalidación tras mutaciones) |
| Cliente HTTP propio sobre `fetch` (`src/api/httpClient.ts`) | Adjunta el JWT y normaliza los 4 formatos de error de la API |

## Requisitos previos

- Node.js 18+ y npm.
- El backend (`src/backend/LigaFutbol.Api`) corriendo en `http://localhost:5080` — ver `src/backend/readme.md`. Sin login no se puede ver ninguna pantalla de datos.

## Configuración

`.env.development` define la URL base de la API:

```
VITE_API_BASE_URL=http://localhost:5080
```

## Puesta en marcha

```bash
cd src/frontend
npm install
npm run dev      # http://localhost:5173
```

Otros scripts:

```bash
npm run build     # type-check (tsc) + build de produccion
npm run preview   # sirve el build de produccion localmente
npm run lint      # oxlint
```

### Primer login

El backend crea automáticamente un usuario Admin al arrancar por primera vez (`admin@ligafutbol.com` / `Admin123!` por defecto — ver `src/backend/readme.md`, sección de seed). Usalo para el primer login; desde la pantalla de **Usuarios** podés crear cuentas Editor/Lector adicionales.

## Estructura

```
src/
├── api/
│   ├── httpClient.ts      # wrapper sobre fetch: adjunta el JWT, normaliza errores
│   ├── errors.ts          # clase ApiError (kind: business/validation/unauthorized/forbidden/notFound/unknown)
│   ├── formErrors.ts      # mapea fieldErrors (ValidationProblemDetails) a errores de @mantine/form
│   ├── tokenStorage.ts    # get/set/clear del JWT en localStorage
│   ├── queries.ts         # hooks de lectura (usePaises, useCiudades, useLigas, useEquipos)
│   ├── types.ts           # DTOs de la API (PaisDto, CiudadDto, LigaDto, EquipoDto, Auth*)
│   └── config.ts          # API_BASE_URL
├── auth/
│   ├── authContext.instance.ts  # instancia del Context (sin componentes, para Fast Refresh)
│   ├── AuthContext.tsx          # AuthProvider: sesión persistida en localStorage
│   ├── useAuth.ts                # hook useAuth()
│   └── ProtectedRoute.tsx        # redirige a /login si no hay sesión; a "/" si falta el rol requerido
├── layout/
│   └── AppLayout.tsx      # AppShell: sidebar + header, nav gateado por rol
├── features/
│   ├── paises/    ciudades/    ligas/    equipos/    usuarios/
│   │   └── mutations.ts (+ *FormModal.tsx para las 4 entidades con CRUD)
├── pages/         # una pantalla por ruta (Login, Dashboard, *Page por entidad)
├── theme/
│   └── theme.ts   # theme de Mantine: paleta "El Registro", tipografía, radios
├── App.tsx        # definición de rutas
└── main.tsx       # providers (QueryClient, MantineProvider, BrowserRouter, AuthProvider)
```

## Autenticación y roles

JWT Bearer, igual que documenta `docs/api-spec-frontend.md`. El login (`POST /api/auth/login`) ya devuelve `email`+`rol`, así que no hace falta un llamado aparte a `/api/auth/me`; la sesión se persiste en `localStorage` con chequeo de expiración (`expiraEn`) para sobrevivir un reload.

Roles: `Admin`, `Editor`, `Lector`.

- **Rutas protegidas**: `ProtectedRoute` redirige a `/login` si no hay sesión. Además acepta un prop `roles` opcional (usado en `/usuarios`) que redirige a `/` si el usuario autenticado no tiene el rol requerido — la protección es a nivel de ruta, no solo ocultando el link del nav.
- **UI por rol**: con `Lector`, los botones de alta/edición/borrado de las 4 entidades no se muestran (el backend los rechazaría con 403 igual, pero no tiene sentido mostrarlos). El ítem "Usuarios" del nav solo aparece para `Admin`.

## Diseño — "El Registro"

Paleta y tipografía pensadas para una herramienta de registro/administración federativa, evitando clichés de SaaS genérico o de estadio (ver `src/theme/theme.ts`):

- **Navy** `#16233F` (marca, botones primarios) · **Ámbar** `#C48A1E` (acentos puntuales) · **Rojo tarjeta** `#B3261E` (acciones destructivas).
- **Space Grotesk** (títulos, cifras) + **Source Sans 3** (UI/formularios), cargadas desde Google Fonts en `index.html`.
- Radio de borde chico y consistente (4px). Tablas densas en vez de grids de cards para los listados CRUD. Único elemento con protagonismo visual: el panel de stats del Dashboard.

## Pantallas

| Ruta | Quién la ve | Qué hace |
|---|---|---|
| `/login` | Público | Login. Si ya hay sesión, redirige a `/`. |
| `/` | Autenticado | Dashboard: stats (países/ligas/equipos/ciudades) + listado de ligas activas con la bandera real de cada país. |
| `/paises` | Autenticado | CRUD de Países (nombre, bandera). |
| `/ciudades` | Autenticado | CRUD de Ciudades (nombre + select de País). |
| `/ligas` | Autenticado | CRUD de Ligas (nombre + select de País). |
| `/equipos` | Autenticado | CRUD de Equipos (nombre, escudo, selects de Ciudad y Liga — cada opción muestra el país entre paréntesis para evitar el error de "distinto país"). |
| `/usuarios` | Solo Admin | Alta de usuarios con cualquier rol. No hay listado (la API no expone un `GET` de usuarios). |

En las 4 pantallas CRUD, `Lector` ve la tabla pero sin botón de alta ni columnas de acciones.

## Manejo de errores

`httpClient.ts` normaliza toda respuesta no exitosa en una `ApiError` con un `kind`:

- `business` — regla de negocio (400 `{ message }`) → se muestra tal cual en un `Alert` dentro del form/modal.
- `validation` — falta un campo en el JSON (400 `ValidationProblemDetails`) → `formErrors.ts` mapea `fieldErrors` (PascalCase del backend) a los campos del formulario (camelCase).
- `unauthorized` / `forbidden` — 401/403 → mensaje genérico.
- `notFound` — 404.

Las mutaciones de alta/edición muestran el error inline en el modal; los borrados usan `@mantine/notifications` (más apropiado para una acción disparada desde una fila de tabla, sin un formulario abierto).

## Limitaciones conocidas

- **Sin tests automatizados en el repo**: cada feature se verificó de punta a punta contra el backend real con scripts de Playwright ad-hoc durante el desarrollo, pero no quedó una suite de tests versionada. Si se necesita cobertura permanente, es un trabajo pendiente.
- **Sin paginación**: las tablas traen todos los registros de una sola vez (razonable mientras el volumen de datos sea chico).
- **Gestión de usuarios limitada**: solo alta, porque la API no expone un endpoint para listar/editar/borrar usuarios.
- El bundle de producción supera los 500kB (advertencia de Vite en el build); no se aplicó code-splitting todavía.
