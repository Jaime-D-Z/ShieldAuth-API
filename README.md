# ShieldAuth API

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

## 1. Descripcion Del Proyecto

ShieldAuth API es una API REST de autenticacion de nivel enterprise enfocada en seguridad, trazabilidad y escalabilidad.

Esta API implementa autenticacion moderna con Access Token + Refresh Token rotado, revocacion de sesiones en Redis y auditoria de eventos criticos en PostgreSQL.

Tipo de proyecto: API REST (backend)

Publico objetivo:

- Equipos backend que necesitan un modulo de autenticacion robusto para aplicaciones web y moviles.
- Proyectos SaaS o sistemas internos que requieren control de sesiones y auditabilidad.

Estado actual del proyecto: En desarrollo avanzado (listo para entorno de pruebas y pre-produccion).

## 2. Caracteristicas Principales

- Registro de usuarios con validacion estricta y hash de password con bcrypt (salt rounds: 12).
- Login seguro con emision de Access Token y Refresh Token en cookie HttpOnly.
- Renovacion de sesion mediante endpoint de refresh con rotacion de refresh token.
- Logout con revocacion de sesion en Redis.
- Rate limiting por IP en endpoints sensibles (register/login).
- Validaciones de entrada con Zod.
- Manejo centralizado de errores con AppError + middleware global.
- Audit Log en PostgreSQL para eventos de autenticacion.

## 3. Tecnologias Utilizadas

- Node.js 20+
- TypeScript (modo estricto)
- Express 5
- Prisma ORM
- PostgreSQL
- Redis (ioredis)
- JWT (jsonwebtoken)
- Zod
- Docker y Docker Compose
- GitHub Actions (CI/CD)

## 4. Arquitectura Y Estructura Del Proyecto

Arquitectura de capas aplicada:

Route -> Middleware -> Controller -> Service -> Repository -> Prisma

Estructura actual:

```text
.
├─ .github/
│  └─ workflows/
│     └─ ci-cd.yml
├─ prisma/
│  └─ schema.prisma
├─ src/
│  ├─ app.ts
│  ├─ server.ts
│  ├─ config/
│  │  ├─ database.ts
│  │  ├─ env.ts
│  │  └─ redis.ts
│  ├─ middleware/
│  │  ├─ authenticate.ts
│  │  ├─ authorize.ts
│  │  ├─ errorHandler.ts
│  │  └─ rateLimit.ts
│  ├─ modules/
│  │  ├─ auth/
│  │  │  ├─ audit.repository.ts
│  │  │  ├─ audit.service.ts
│  │  │  ├─ auth.controller.ts
│  │  │  ├─ auth.routes.ts
│  │  │  ├─ auth.schema.ts
│  │  │  ├─ auth.service.ts
│  │  │  └─ token.service.ts
│  │  └─ users/
│  │     ├─ user.controller.ts
│  │     ├─ user.entity.ts
│  │     ├─ user.repository.ts
│  │     └─ user.service.ts
│  └─ shared/
│     ├─ errors/
│     │  └─ AppError.ts
│     ├─ types/
│     │  └─ express.d.ts
│     └─ utils/
├─ .env.example
├─ Dockerfile
├─ docker-compose.prod.yml
├─ package.json
└─ tsconfig.json
```

## 5. Instalacion Paso A Paso

### Requisitos

- Node.js 20+
- PostgreSQL disponible
- Redis disponible

### Setup local

1. Clonar repositorio

```bash
git clone https://github.com/Jaime-D-Z/ShieldAuth-API
cd AUTH
```

2. Instalar dependencias

```bash
npm install
```

3. Configurar variables de entorno

```bash
cp .env.example .env
```

En Windows (PowerShell), si no tienes cp:

```powershell
Copy-Item .env.example .env
```

4. Generar Prisma Client

```bash
npm run prisma:generate
```

5. Sincronizar esquema con la base de datos

```bash
npx prisma db push
```

6. Ejecutar en modo desarrollo

```bash
npm run dev
```

Base URL:

- http://localhost:3000/api/v1/auth

## 6. Configuracion De Variables De Entorno

Ejemplo de archivo .env:

```dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/auth_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=replace_with_a_very_long_secure_access_secret
JWT_REFRESH_SECRET=replace_with_a_very_long_secure_refresh_secret
CLIENT_URL=http://localhost:3000
```

Descripcion de variables:

- NODE_ENV: entorno de ejecucion (development, test, production)
- PORT: puerto de la API
- DATABASE_URL: conexion PostgreSQL para Prisma
- REDIS_URL: conexion Redis para sesiones/rate-limit
- JWT_SECRET: secreto para firmar Access Token
- JWT_REFRESH_SECRET: secreto para firmar Refresh Token
- CLIENT_URL: origen permitido en CORS

## 7. Uso Del Sistema (API)

### Endpoint: Register

POST /api/v1/auth/register

Body:

```json
{
  "email": "nuevo.usuario@example.com",
  "password": "ClaveSegura123!",
  "name": "Nuevo Usuario"
}
```

Respuesta esperada (201):

```json
{
  "user": {
    "id": "6d0f0c2a-95d8-4f94-8d86-3432e2df6f3f",
    "email": "nuevo.usuario@example.com",
    "name": "Nuevo Usuario",
    "role": "USER",
    "createdAt": "2026-04-01T12:00:00.000Z",
    "updatedAt": "2026-04-01T12:00:00.000Z"
  }
}
```

### Endpoint: Login

POST /api/v1/auth/login

Body:

```json
{
  "email": "nuevo.usuario@example.com",
  "password": "ClaveSegura123!"
}
```

Respuesta esperada (200):

```json
{
  "accessToken": "<jwt_access_token>"
}
```

Adicional:

- Se envia cookie HttpOnly llamada refresh_token.

### Endpoint: Refresh

POST /api/v1/auth/refresh

- Sin body.
- Requiere cookie refresh_token.
- Devuelve nuevo accessToken y rota refresh token.

### Endpoint: Logout

POST /api/v1/auth/logout

Header requerido:

```text
Authorization: Bearer <accessToken>
```

Comportamiento:

- Revoca refresh token en Redis.
- Limpia cookie refresh_token.
- Responde 204.

## 8. Estructura De La Base De Datos

Tablas principales (Prisma):

### User

- id (UUID, PK)
- email (unique)
- name (nullable)
- password (hash)
- role (enum: USER, ADMIN, MANAGER)
- createdAt
- updatedAt

### AuditLog

- id (UUID, PK)
- action (ej: LOGIN_SUCCESS, USER_REGISTERED)
- ip
- userId (FK opcional a User)
- createdAt

Relacion:

- Un usuario puede tener muchos logs de auditoria.

## 9. Buenas Practicas Y Decisiones Tecnicas

- Separo responsabilidades por capas para mantener mantenibilidad y testabilidad.
- Uso Zod para validar input en bordes (controller).
- Uso AppError para errores de negocio y middleware global para serializacion uniforme.
- Guardo hash del refresh token en Redis para evitar almacenar token plano.
- Roto refresh token en cada refresh para reducir riesgo de replay.
- Aplico rate limiting en endpoints de alto riesgo (register/login).

Supuestos razonables aplicados:

- El frontend usa cookie HttpOnly para refresh y Bearer token para endpoints protegidos.
- Para entornos enterprise se recomienda migrar de prisma db push a prisma migrate en CI/CD.

## 10. Roadmap

- [ ] Recuperacion de password por email.
- [ ] Verificacion de email en registro.
- [ ] MFA (TOTP o WebAuthn).
- [ ] Lista de revocacion de Access Tokens para casos criticos.
- [ ] Tests automatizados (unit, integration, e2e).
- [ ] Observabilidad (OpenTelemetry + trazas distribuidas).

## 11. Contribucion

1. Haz fork del repositorio.
2. Crea una rama de feature: feature/mi-mejora.
3. Realiza cambios con commits claros.
4. Abre un Pull Request hacia main.

Recomendaciones:

- Ejecutar npm run build antes de enviar PR.
- Mantener compatibilidad con TypeScript estricto.
- Documentar cambios de contrato API en este README.

## 12. Licencia

MIT

## 13. Despliegue Rapido Con Docker Compose (Produccion)

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f api
```

Incluye:

- api
- postgres
- redis
