# LigaFutbol.Api — Backend

API REST para la administración de ligas de fútbol. Modelo de dominio:

```
Country (Pais)  1 ── N  League (Liga)  1 ── N  Team (Equipo)  N ── 1  City (Ciudad)
```

Un País tiene varias Ligas, una Liga tiene varios Equipos, y cada Equipo pertenece a una Ciudad. La Ciudad y la Liga de un Equipo deben pertenecer al mismo País (validado en la capa de servicio).

## Stack tecnológico

- **.NET 10** (ASP.NET Core Web API)
- **Entity Framework Core** con migraciones Code-First
- **PostgreSQL** (Npgsql) como motor de base de datos
- **Scalar** para documentación interactiva de la API (reemplaza a Swagger UI)
- **JWT Bearer** para autenticación + **RBAC** (roles y políticas) para autorización
- Patrón **Repository** para el acceso a datos, validaciones de negocio en la capa de **Service**

## Paquetes NuGet

Todos declarados en `LigaFutbol.Api.csproj`:

| Paquete | Uso |
|---|---|
| `Microsoft.AspNetCore.OpenApi` | Genera el documento OpenAPI (`/openapi/v1.json`) que consume Scalar |
| `Microsoft.OpenApi` | Modelo OpenAPI subyacente (dependencia del anterior) |
| `Scalar.AspNetCore` | UI de documentación interactiva de la API |
| `Npgsql.EntityFrameworkCore.PostgreSQL` | Proveedor de EF Core para PostgreSQL |
| `Microsoft.EntityFrameworkCore.Design` | Herramientas de diseño de EF Core (necesario para generar/aplicar migraciones) |
| `Microsoft.AspNetCore.Authentication.JwtBearer` | Middleware de autenticación JWT Bearer |

No hay que instalarlos manualmente: `dotnet restore` (o el primer `dotnet build`) los descarga solos a partir del `.csproj`.

## Requisitos previos

1. **.NET SDK 10** instalado (`dotnet --version` debe reportar `10.x`).
2. **PostgreSQL** corriendo (local, Docker o remoto) con una base de datos vacía creada para el proyecto.
3. La herramienta global **`dotnet-ef`**, necesaria para generar y aplicar migraciones:

   ```bash
   dotnet tool install --global dotnet-ef
   # si ya la tenés instalada y querés actualizarla:
   dotnet tool update --global dotnet-ef
   ```

## Configuración

La configuración vive en `LigaFutbol.Api/appsettings.json` (valores de desarrollo incluidos directamente en el repo; **no representan una configuración de producción**, cambiar `Jwt:Key` y las credenciales de la base antes de desplegar en cualquier ambiente real).

```jsonc
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=ligafutbol;Username=us_futbol;Password=admin123"
  },
  "Jwt": {
    "Key": "...",              // clave simétrica para firmar los JWT (HS256)
    "Issuer": "LigaFutbol.Api",
    "Audience": "LigaFutbol.Api",
    "ExpirationMinutes": "60"
  },
  "Seed": {
    "AdminEmail": "admin@ligafutbol.com",   // usuario Admin que se crea al arrancar si Usuarios está vacía
    "AdminPassword": "Admin123!"
  }
}
```

Ajustá `ConnectionStrings:DefaultConnection` con los datos de tu instancia de PostgreSQL antes de correr las migraciones.

## Puesta en marcha (paso a paso)

Desde `src/backend/LigaFutbol.Api`:

```bash
# 1. Restaurar dependencias
dotnet restore

# 2. Compilar (opcional, dotnet run también compila)
dotnet build

# 3. Aplicar las migraciones contra la base configurada en appsettings.json
dotnet ef database update

# 4. Levantar la API
dotnet run
```

La app queda disponible en:

- HTTP: `http://localhost:5080`
- HTTPS: `https://localhost:7248`
- Documentación interactiva (Scalar): `http://localhost:5080/scalar/v1`
- Documento OpenAPI crudo: `http://localhost:5080/openapi/v1.json`

Alternativa para desarrollo con recarga automática ante cambios de código:

```bash
dotnet watch run
```

## Migraciones de EF Core

Migraciones existentes, en orden:

1. `InitialCreate`
2. `AddPaisCiudadYRelacionEquipo`
3. `AddUrlBanderaYUrlEscudo`
4. `AddLigaEntity`
5. `AddUsuarioEntity`

Comandos útiles (ejecutar dentro de `src/backend/LigaFutbol.Api`):

```bash
# Aplicar todas las migraciones pendientes
dotnet ef database update

# Crear una migración nueva después de modificar una entidad o el DbContext
dotnet ef migrations add NombreDeLaMigracion

# Revertir la base a una migración anterior (ejemplo)
dotnet ef database update NombreDeLaMigracionAnterior

# Quitar la última migración generada (si todavía no se aplicó a ninguna base compartida)
dotnet ef migrations remove
```

> No modifiques ni elimines una migración que ya fue mergeada a `develop`/`main` — generá una migración nueva en su lugar.

## Autenticación y RBAC

Roles disponibles (`RolUsuario`): **Admin**, **Editor**, **Lector**.

| Policy | Roles permitidos | Aplica a |
|---|---|---|
| `Lectura` | Admin, Editor, Lector | GET de Países, Ciudades, Ligas, Equipos |
| `Escritura` | Admin, Editor | POST/PUT/DELETE de Países, Ciudades, Ligas, Equipos |
| `GestionUsuarios` | Admin | `POST /api/auth/usuarios` |

Todos los endpoints de datos requieren un JWT válido (header `Authorization: Bearer <token>`); no hay endpoints públicos de lectura.

### Probar endpoints protegidos en Scalar

El documento OpenAPI declara el security scheme `Bearer`, así que Scalar (`http://localhost:5080/scalar/v1`) muestra un botón **Authorize** (o el ícono de candado en cada endpoint protegido): pegá ahí el token devuelto por `/api/auth/login` (sin el prefijo `Bearer `, Scalar lo agrega solo) y se aplica automáticamente a todos los requests de prueba, sin tener que repetir el header a mano en cada endpoint. Los endpoints públicos (`register`, `login`) no piden token.

### Endpoints de autenticación

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | Público | Autoregistro. Solo permite crear usuarios con rol `Lector`; pedir otro rol devuelve 400. |
| POST | `/api/auth/usuarios` | Solo Admin | Crea un usuario con cualquier rol (Admin, Editor o Lector). |
| POST | `/api/auth/login` | Público | Devuelve el JWT si las credenciales son válidas (401 genérico si no). |
| GET | `/api/auth/me` | Autenticado | Devuelve el email y rol del usuario del token, para validar que el JWT funciona. |

## Flujo de seed de datos

No hay un seeder de datos de dominio (países/ligas/equipos) todavía: se cargan a través de la propia API, respetando el orden de dependencias. Sí existe un seed automático del primer usuario Admin (ver más abajo), necesario porque el autoregistro público no puede crear cuentas con rol Admin/Editor.

### 1. Primer Admin (automático)

Al arrancar la app (`dotnet run`), si la tabla `Usuarios` está completamente vacía, se crea automáticamente un usuario Admin con las credenciales de la sección `Seed` de `appsettings.json` (`admin@ligafutbol.com` / `Admin123!` por defecto). Es idempotente: si ya existe al menos un usuario, no hace nada. Cambiá `Seed:AdminEmail`/`Seed:AdminPassword` antes del primer arranque si no querés usar las credenciales por defecto.

```bash
curl -X POST http://localhost:5080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ligafutbol.com","password":"Admin123!"}'
```

Guardá el `token` de la respuesta: se usa como `Authorization: Bearer <token>` en todos los pasos siguientes.

### 2. Alta de más usuarios (opcional)

```bash
# Un Lector se puede autoregistrar sin token:
curl -X POST http://localhost:5080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"lector@ligafutbol.com","password":"123456","rol":"Lector"}'

# Solo el Admin puede crear Editor o Admin:
curl -X POST http://localhost:5080/api/auth/usuarios \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"email":"editor@ligafutbol.com","password":"123456","rol":"Editor"}'
```

### 3. Datos de dominio (respetar el orden por las FK)

Con un token de Admin o Editor (rol con permiso de `Escritura`):

```bash
# 1) Pais
curl -X POST http://localhost:5080/api/paises \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nombre":"Argentina","urlBandera":"https://flagcdn.com/ar.svg"}'
# -> guardar el "id" devuelto como PAIS_ID

# 2) Ciudad (depende de PAIS_ID)
curl -X POST http://localhost:5080/api/ciudades \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"nombre\":\"Buenos Aires\",\"paisId\":$PAIS_ID}"
# -> guardar CIUDAD_ID

# 3) Liga (depende de PAIS_ID)
curl -X POST http://localhost:5080/api/ligas \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"nombre\":\"Liga Profesional\",\"paisId\":$PAIS_ID}"
# -> guardar LIGA_ID

# 4) Equipo (depende de CIUDAD_ID y LIGA_ID; ambos deben ser del mismo Pais)
curl -X POST http://localhost:5080/api/equipos \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"nombre\":\"Boca Juniors\",\"urlEscudo\":\"https://x.com/boca.png\",\"ciudadId\":$CIUDAD_ID,\"ligaId\":$LIGA_ID}"
```

Cada paso valida sus reglas de negocio antes de tocar la base y devuelve 400 con un mensaje claro si algo falla (nombre vacío, FK inexistente, Ciudad/Liga de países distintos, etc.).

## Estructura del proyecto

```
LigaFutbol.Api/
├── Controllers/       # Endpoints (Auth, Paises, Ciudades, Ligas, Equipos)
├── Services/          # Reglas de negocio (valida antes de llegar al repositorio)
├── Repositories/      # Acceso a datos vía EF Core (patrón Repository)
├── Models/
│   ├── Entities/      # Entidades de EF Core (Pais, Ciudad, Liga, Equipo, Usuario)
│   └── DTOs/          # Contratos de entrada/salida de la API
├── Security/          # JWT (generación), hashing de passwords, policies de autorización
├── Exceptions/        # BusinessRuleException (errores de negocio -> 400)
├── Data/              # LigaFutbolDbContext
├── Migrations/        # Migraciones de EF Core
└── Extensions/        # Convenciones de ASP.NET Core (rutas en snake_case)
```
