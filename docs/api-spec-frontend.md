# LigaFutbol — Especificación de la API para el Frontend

Documento técnico de referencia sobre el backend de LigaFutbol (`src/backend/LigaFutbol.Api`), pensado para usarse como contexto/spec al iniciar el desarrollo del frontend. Todo lo descrito acá fue verificado contra el backend corriendo en desarrollo (no es solo lectura de código).

## 1. Resumen

- API REST en **.NET 10**, base URL de desarrollo: `http://localhost:5080` (HTTPS en `https://localhost:7248`).
- Documentación interactiva (Scalar): `http://localhost:5080/scalar/v1` — tiene botón **Authorize** para pegar el JWT una vez y probar todos los endpoints protegidos.
- Todas las respuestas son JSON, propiedades en **camelCase** (`urlBandera`, `ciudadId`, `fechaCreacion`, etc.), aunque las clases C# del backend usen PascalCase.
- Todas las rutas están en minúsculas: `/api/paises`, `/api/ciudades`, `/api/ligas`, `/api/equipos`, `/api/auth/...`.
- Fechas en formato ISO 8601 UTC (ej. `"2026-09-05T03:57:43.8063826Z"`).

## 2. Modelo de dominio

```
Country (Pais)  1 ──N  League (Liga)
      │                     │
      │ 1                   │ 1
      N                     N
   City (Ciudad) ──────  Team (Equipo)
```

- Un **País** tiene muchas **Ligas** y muchas **Ciudades**.
- Una **Liga** tiene muchos **Equipos**. Una **Ciudad** tiene muchos **Equipos**.
- Un **Equipo** pertenece a una Ciudad y a una Liga. **Regla de negocio:** la Ciudad y la Liga de un Equipo deben pertenecer al mismo País.
- Todas las relaciones son `ON DELETE RESTRICT`: no se puede borrar un País/Ciudad/Liga que todavía tenga hijos (ver sección 6, "Limitaciones conocidas" — esto no siempre da un error prolijo hoy).

## 3. Autenticación

JWT Bearer. El token se obtiene con `/api/auth/login` y se manda en cada request protegido como:

```
Authorization: Bearer <token>
```

- Expira en 60 minutos (configurable, `Jwt:ExpirationMinutes`).
- El claim de rol viaja en el JWT; no hace falta pedir el rol al usuario en el frontend, se puede decodificar del token o pedir a `/api/auth/me`.

### Roles

`Admin`, `Editor`, `Lector` (enum `RolUsuario`, viaja como string).

| Policy | Roles | Aplica a |
|---|---|---|
| `Lectura` | Admin, Editor, Lector | GET de Países, Ciudades, Ligas, Equipos |
| `Escritura` | Admin, Editor | POST/PUT/DELETE de Países, Ciudades, Ligas, Equipos |
| `GestionUsuarios` | Admin | `POST /api/auth/usuarios` |

**No hay endpoints de datos públicos** — hasta un simple listado de países requiere estar logueado. El frontend necesita login antes de mostrar cualquier pantalla de datos.

### Bootstrap para desarrollo

Al arrancar el backend por primera vez (tabla `Usuarios` vacía) se crea automáticamente un Admin con las credenciales de `appsettings.json` (`Seed:AdminEmail`/`Seed:AdminPassword`, por defecto `admin@ligafutbol.com` / `Admin123!`). Usalo para el primer login y para crear el resto de los usuarios de prueba.

## 4. Formato de errores — 3 formatos distintos según el caso

Esto es importante para el manejo de errores del frontend: **no todos los 4xx tienen el mismo body.**

### a) Reglas de negocio (validadas en el Service antes de tocar la DB)

`400 Bad Request` con un body simple y consistente:

```json
{ "message": "El nombre de la liga es obligatorio." }
```

Este es el formato que usan las reglas de negocio reales (ver sección 6). El frontend puede mostrar `response.data.message` directamente al usuario.

### b) Login fallido

`401 Unauthorized` con el mismo formato `{ message }`, pero **sin body en el resto de los 401** (ver punto d). Es el único 401 con contenido:

```json
{ "message": "Credenciales inválidas." }
```

### c) Falta un campo obligatorio en el JSON (bind automático de ASP.NET Core)

Si el JSON **no incluye una propiedad requerida** (ej. mandás `{"nombre":"X"}` a `POST /api/paises` sin `urlBandera`), ASP.NET Core devuelve automáticamente su propio formato de `ValidationProblemDetails`, **distinto** al de arriba:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": { "UrlBandera": ["The UrlBandera field is required."] },
  "traceId": "..."
}
```

⚠️ Ojo: esto solo pasa si la propiedad **falta del JSON**. Si la mandás como string vacío (`"urlBandera": ""`), en `Pais`/`Ciudad` **no hay ninguna validación** y el registro se crea igual (ver sección 6). En `Liga`/`Equipo`/`Usuario` sí hay chequeo explícito de vacío/blanco y ahí cae en el formato (a).

### d) 401 / 403 / 404 "puros" (sin violar una regla de negocio)

- **401** sin token, con token inválido o expirado → body **vacío**.
- **403** con token válido pero rol insuficiente → body **vacío**.
- **404** por id inexistente (`GET/PUT/DELETE /api/recurso/{id}`) → **no** es vacío: ASP.NET Core lo convierte automáticamente a `ProblemDetails`:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.5",
  "title": "Not Found",
  "status": 404,
  "traceId": "..."
}
```

**Resumen práctico para el cliente HTTP del frontend:** ante un 400, intentar leer `body.message` primero; si no existe, es un `ValidationProblemDetails` y conviene leer `body.errors` (diccionario de campo → lista de mensajes). Ante 401/403 sin body, mostrar un mensaje genérico ("sesión expirada" / "no tenés permiso"). Ante 404, alcanza con el status code.

## 5. Referencia de endpoints

Todas las rutas llevan prefijo `/api`. `Auth` = policy requerida (`-` = público).

### Auth (`/api/auth`)

| Método | Ruta | Auth | Body request | Body response (200) |
|---|---|---|---|---|
| POST | `/register` | público | `{ email, password, rol }` — **`rol` debe ser `"Lector"`**, cualquier otro valor → 400 | `{ token, expiraEn, email, rol }` |
| POST | `/usuarios` | `GestionUsuarios` (Admin) | `{ email, password, rol }` — `rol` puede ser cualquiera de los 3 | `{ token, expiraEn, email, rol }` |
| POST | `/login` | público | `{ email, password }` | `{ token, expiraEn, email, rol }` (401 si falla) |
| GET | `/me` | autenticado (cualquier rol) | — | `{ email, rol }` |

### Países (`/api/paises`)

| Método | Ruta | Auth | Body request | Body response |
|---|---|---|---|---|
| GET | `/` | Lectura | — | `PaisDto[]` |
| GET | `/{id}` | Lectura | — | `PaisDto` (404 si no existe) |
| GET | `/nombre/{nombre}` | Lectura | — | `PaisDto` (404 si no existe) |
| POST | `/` | Escritura | `{ nombre, urlBandera }` | `PaisDto` (201 + header `Location`) |
| PUT | `/{id}` | Escritura | `{ nombre, urlBandera }` | 204 (404 si no existe) |
| DELETE | `/{id}` | Escritura | — | 204 (404 si no existe) |

`PaisDto`: `{ id, nombre, urlBandera, ciudades: [{ id, nombre }] }`

### Ciudades (`/api/ciudades`)

| Método | Ruta | Auth | Body request | Body response |
|---|---|---|---|---|
| GET | `/` | Lectura | — | `CiudadDto[]` |
| GET | `/{id}` | Lectura | — | `CiudadDto` (404 si no existe) |
| POST | `/` | Escritura | `{ nombre, paisId }` | `CiudadDto` (201 + `Location`) |
| PUT | `/{id}` | Escritura | `{ nombre, paisId }` | 204 (404 si no existe) |
| DELETE | `/{id}` | Escritura | — | 204 (404 si no existe) |

`CiudadDto`: `{ id, nombre, paisId, pais: string, equipos: [{ id, nombre, urlEscudo }] }`

### Ligas (`/api/ligas`)

| Método | Ruta | Auth | Body request | Body response |
|---|---|---|---|---|
| GET | `/` | Lectura | — | `LigaDto[]` |
| GET | `/{id}` | Lectura | — | `LigaDto` (404 si no existe) |
| POST | `/` | Escritura | `{ nombre, paisId }` | `LigaDto` (201 + `Location`) |
| PUT | `/{id}` | Escritura | `{ nombre, paisId }` | 204 (404 si no existe) |
| DELETE | `/{id}` | Escritura | — | 204 (404 si no existe, 400 si tiene equipos asociados) |

`LigaDto`: `{ id, nombre, paisId, pais: string, equipos: [{ id, nombre, urlEscudo }], fechaCreacion }`

### Equipos (`/api/equipos`)

| Método | Ruta | Auth | Body request | Body response |
|---|---|---|---|---|
| GET | `/` | Lectura | — | `EquipoDto[]` |
| GET | `/{id}` | Lectura | — | `EquipoDto` (404 si no existe) |
| POST | `/` | Escritura | `{ nombre, urlEscudo, ciudadId, ligaId }` | `EquipoDto` (201 + `Location`) |
| PUT | `/{id}` | Escritura | `{ nombre, urlEscudo, ciudadId, ligaId }` | 204 (404 si no existe) |
| DELETE | `/{id}` | Escritura | — | 204 (404 si no existe) |

`EquipoDto`: `{ id, nombre, urlEscudo, ciudadId, ciudad: string, ligaId, liga: string, fechaCreacion }`

## 6. Reglas de negocio y limitaciones conocidas

### Con validación explícita (400 con `{ message }` claro)

- **Usuario** (`register`/`usuarios`): password ≥ 6 caracteres; `rol` debe ser uno de los 3 valores válidos; email no duplicado; `register` público solo puede crear `Lector`.
- **Liga**: `nombre` no vacío/blanco; `paisId` debe existir; no se puede borrar si tiene equipos asociados.
- **Equipo**: `nombre` no vacío/blanco; `ciudadId` debe existir; `ligaId` debe existir; la ciudad y la liga deben ser del mismo país.

### ⚠️ Sin validación (gaps conocidos del backend actual)

- **País**: `nombre`/`urlBandera` **no se validan** — se puede crear un País con ambos campos en string vacío (`""`). No hay chequeo de duplicados.
- **Ciudad**: `nombre` no se valida (puede quedar vacío). **`paisId` inexistente no da un 400** — el `INSERT` falla contra la foreign key y el backend devuelve un **500 Internal Server Error** con el stack trace completo (porque corre en modo Development). Mismo problema para `PUT`.
- **Borrar un País o Liga que todavía tiene Ciudades/Equipos**: al no estar validado explícitamente para País, también cae en **500** (violación de FK), no en un 400 prolijo. (Liga sí lo maneja bien con un 400 propio.)

**Recomendación para el frontend:** hasta que esto se corrija en el backend, conviene que el frontend valide client-side que `nombre` no esté vacío y que `paisId` corresponda siempre a un País existente (ej. seleccionándolo de un `<select>` poblado con `GET /api/paises`, nunca un input libre de ID), para evitar pegarle a estos casos. Si de todos modos llega un 500, mostrar un mensaje genérico de error, no intentar parsear `message`.

## 7. CORS — bloqueante para el frontend

El backend **no tiene configurado CORS** (`Program.cs` no llama a `AddCors`/`UseCors`). Si el frontend corre en un origen distinto (ej. `http://localhost:5173` con Vite, o `http://localhost:3000`), el navegador va a bloquear las requests por política de mismo origen. **Hace falta agregar una policy de CORS en el backend** (habilitando el/los orígenes del frontend) antes de poder integrar — avisar para hacerlo en un PR aparte si no está resuelto todavía.

## 8. Flujo típico de uso (ejemplo de integración)

```
1. POST /api/auth/login          → guardar token (localStorage/memoria) + rol
2. GET  /api/paises               → poblar selects de País
3. GET  /api/ciudades             → poblar selects de Ciudad (o filtrar por paisId en el cliente)
4. GET  /api/ligas                → poblar selects de Liga
5. GET  /api/equipos              → listado principal
6. POST /api/equipos              → alta, requiere rol Editor o Admin
```

Si el rol del usuario logueado es `Lector`, el frontend debería ocultar/deshabilitar los botones de alta/edición/borrado (el backend los va a rechazar con 403 igual, pero es mejor UX no mostrarlos).
