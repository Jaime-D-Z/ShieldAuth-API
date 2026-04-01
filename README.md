# ShieldAuth API

API de autenticacion enterprise construida con Node.js, TypeScript, Express, Prisma, PostgreSQL y Redis.

## Caracteristicas

- Arquitectura por capas: Route -> Middleware -> Controller -> Service -> Repository
- Login, Register, Refresh y Logout
- JWT Access Token + Refresh Token rotado
- Refresh token guardado en Redis como hash + jti
- Revocacion de sesiones en Redis
- Rate limiting por IP
- Validaciones con Zod
- Manejo centralizado de errores con AppError
- Audit log de eventos de autenticacion en PostgreSQL

## Stack

- Node.js 20+
- TypeScript
- Express 5
- Prisma ORM
- PostgreSQL
- Redis

## Variables de entorno

Usa como referencia el archivo .env.example.

Variables obligatorias:

- NODE_ENV
- PORT
- DATABASE_URL
- REDIS_URL
- JWT_SECRET
- JWT_REFRESH_SECRET
- CLIENT_URL

## Ejecucion local

1. Instalar dependencias:

```bash
npm install
```

2. Configurar .env (puedes copiar de .env.example)

3. Levantar PostgreSQL y Redis

4. Generar cliente Prisma:

```bash
npm run prisma:generate
```

5. Sincronizar esquema (si no usas migraciones todavia):

```bash
npx prisma db push
```

6. Iniciar API en desarrollo:

```bash
npm run dev
```

La API queda disponible en:

- http://localhost:3000/api/v1/auth

## Endpoints de autenticacion

### POST /api/v1/auth/register

Body JSON:

```json
{
  "email": "nuevo.usuario@example.com",
  "password": "ClaveSegura123!",
  "name": "Nuevo Usuario"
}
```

Reglas de validacion:

- email valido
- password con minimo 8 caracteres, mayuscula, minuscula, numero y simbolo
- name obligatorio

### POST /api/v1/auth/login

Body JSON:

```json
{
  "email": "nuevo.usuario@example.com",
  "password": "ClaveSegura123!"
}
```

Respuesta:

- accessToken en body
- refresh_token en cookie httpOnly

### POST /api/v1/auth/refresh

- Sin body
- Requiere cookie refresh_token
- Devuelve nuevo accessToken y rota refresh token

### POST /api/v1/auth/logout

Headers:

```text
Authorization: Bearer <accessToken>
```

- Borra cookie refresh_token
- Revoca sesion en Redis

## Produccion con Docker Compose

Archivo incluido:

- docker-compose.prod.yml

Incluye 3 servicios:

- postgres
- redis
- api

### Levantar entorno

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Ver logs de la API

```bash
docker compose -f docker-compose.prod.yml logs -f api
```

### Detener entorno

```bash
docker compose -f docker-compose.prod.yml down
```

## CI/CD con GitHub Actions

Se incluye el workflow:

- .github/workflows/ci-cd.yml

Este pipeline hace lo siguiente:

1. En Pull Request a main:
- npm ci
- prisma generate
- build TypeScript

2. En push a main o tags v*:
- ejecuta CI
- construye imagen Docker
- publica en GHCR

Imagen publicada en:

- ghcr.io/<owner>/<repo>:latest (si es branch principal)
- ghcr.io/<owner>/<repo>:<sha>
- ghcr.io/<owner>/<repo>:<tag> (si es release/tag)

### Requisitos para publicar imagen

1. El repositorio debe estar en GitHub.
2. GitHub Packages habilitado (GHCR).
3. Permisos del workflow: packages:write (ya definidos en el yaml).

### Como usar la imagen en un servidor

```bash
docker pull ghcr.io/<owner>/<repo>:latest
docker run -d \
  --name shieldauth-api \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e DATABASE_URL='postgresql://user:pass@host:5432/db?schema=public' \
  -e REDIS_URL='redis://host:6379' \
  -e JWT_SECRET='super_long_access_secret' \
  -e JWT_REFRESH_SECRET='super_long_refresh_secret' \
  -e CLIENT_URL='https://tu-frontend.com' \
  ghcr.io/<owner>/<repo>:latest
```

## Seguridad recomendada para produccion

- Cambiar JWT_SECRET y JWT_REFRESH_SECRET por valores largos y aleatorios
- No exponer puertos de PostgreSQL/Redis si no es necesario
- Ajustar CLIENT_URL al dominio real del frontend
- Usar HTTPS para secure cookies
- Implementar migraciones Prisma versionadas (prisma migrate) en lugar de db push

## Estructura resumida

```text
src/
  app.ts
  server.ts
  config/
  middleware/
  modules/
    auth/
    users/
  shared/
prisma/
  schema.prisma
```

## Licencia

MIT
