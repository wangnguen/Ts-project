# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm run dev              # Start with hot-reload (nodemon)
pnpm run type-check       # Type-check without emitting

# Build & Production
pnpm run build            # Compile TS → dist/ (rimraf + tsc + tsc-alias)
pnpm run start            # Run compiled output

# Code Quality
pnpm run lint             # ESLint check
pnpm run lint:fix         # ESLint auto-fix
pnpm run prettier         # Prettier check
pnpm run prettier:fix     # Prettier auto-fix

# Database Migrations
pnpm run migration:generate   # Generate migration from entity changes
pnpm run migration:run        # Execute pending migrations
pnpm run migration:revert     # Rollback last migration
```

Pre-commit hooks (Husky + lint-staged) enforce lint, type-check, and conventional commits automatically.

## Architecture

### Layered pattern

```
Routes → Controllers → Services → Repositories → Database
```

Each feature lives under `src/modules/<feature>/` and contains its own route, controller, service, repository, and Zod DTO files. New modules are registered in `src/modules/index.ts`.

### Key directories

- `src/app.ts` — Express setup (middleware stack, route mounting)
- `src/index.ts` — Entry point; initializes DB, starts server, handles graceful shutdown
- `src/common/` — Shared config, custom error classes, global middlewares, response helpers, shared types
- `src/databases/` — TypeORM `DataSource` config, entity definitions, migration files
- `src/modules/` — Feature modules (`health`, `users`, `auth`)
- `src/types/` — TypeScript ambient type augmentations (e.g., Express `Response` extension)

### Validation & types

Zod schemas in each module's DTO file serve as the single source of truth for both runtime validation and inferred TypeScript types (`z.infer<typeof Schema>`). Validation middleware runs at the route level before controllers are reached.

### Response format

All responses go through response helper methods attached to `Express.Response` (see `src/types/`):

```json
// Success
{ "statusCode": 200, "message": "...", "data": {}, "path": "...", "timestamp": "..." }

// Error
{ "statusCode": 4xx, "message": "...", "path": "...", "timestamp": "...", "errors": [] }
```

### Error handling

Custom error classes extend `AppError` (`src/common/errors/`). A global error middleware converts all thrown errors into the standard error response shape.

### Database

PostgreSQL via TypeORM. Entities use the soft-delete pattern (`deletedAt` column). A separate `RefreshToken` entity supports the JWT refresh token flow. The DataSource is a singleton initialized at startup; a separate CLI-oriented data source config exists for migration commands.

## Environment variables

All env vars are validated with Zod at startup (`src/common/config/`). Required vars:

| Variable                 | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `PORT`                   | Server port (default `8080`)                    |
| `NODE_ENV`               | `development` \| `production` \| `test`         |
| `CLIENT_URL`             | CORS origin                                     |
| `DATABASE_URL`           | PostgreSQL connection string                    |
| `JWT_SECRET`             | JWT signing key (min 32 chars)                  |
| `JWT_ACCESS_EXPIRES_IN`  | Access token TTL in seconds                     |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL in seconds                    |
| `GOOGLE_CLIENT_ID`       | Google OAuth2 client ID                         |
| `GOOGLE_CLIENT_SECRET`   | Google OAuth2 client secret                     |
| `GOOGLE_CALLBACK_URL`    | OAuth2 redirect URI (must match Google Console) |

## Auth module (`src/modules/auth/`)

### Endpoints

| Method | Path                           | Auth required | Description                           |
| ------ | ------------------------------ | ------------- | ------------------------------------- |
| `POST` | `/api/v1/auth/register`        | —             | Register with email + password        |
| `POST` | `/api/v1/auth/login`           | —             | Login, returns access + refresh token |
| `POST` | `/api/v1/auth/refresh`         | —             | Rotate refresh token                  |
| `POST` | `/api/v1/auth/logout`          | —             | Revoke refresh token                  |
| `GET`  | `/api/v1/auth/me`              | Bearer token  | Get current user                      |
| `GET`  | `/api/v1/auth/google`          | —             | Redirect to Google consent screen     |
| `GET`  | `/api/v1/auth/google/callback` | —             | OAuth2 callback → returns tokens      |

### Token flow

- **Access token**: short-lived JWT (default 15 min), sent as `Authorization: Bearer <token>`
- **Refresh token**: long-lived JWT (default 7 days), stored in `refresh_tokens` table; rotated on every `/refresh` call (old token deleted, new one issued)
- `AuthRepository.deleteAllRefreshTokensForUser(userId)` available for force-logout-all-devices

### Google OAuth2

Implemented as a plain Authorization Code flow in `auth.oauth.ts` — no Passport, no extra dependencies. Uses native Node `fetch`. The `googleCallback` middleware exchanges the code, fetches the Google userinfo, and attaches `req.googleProfile` for the controller.

### Protected routes

Import `authenticate` from `@common/middlewares` and add as route middleware. It reads `Authorization: Bearer <token>`, verifies the JWT, and populates `req.user = { id, email, role }`.

### User entity changes for OAuth

`username` and `password` are now nullable to support OAuth-only accounts. Migration `1774990000000-AddOAuthFieldsToUser.ts` adds `google_id` (unique) and `avatar_url` columns.

## Code style

Enforced by Prettier + ESLint:

- No semicolons, single quotes, 2-space indent, 120-char print width, no trailing commas
- ESLint warns on `any` usage and unused variables (prefix with `_` to suppress)
- LF line endings, UTF-8, trailing newline (EditorConfig)
- Commit messages must follow Conventional Commits (enforced by commitlint)
