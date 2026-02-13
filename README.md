# Secure Task Management System

A role-based task management system built in an NX monorepo with a NestJS backend and Angular frontend.

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm

### Install and run

```bash
# Clone and install
npm install

# Copy environment and configure (optional; defaults work for dev)
cp .env.example .env

# Create data directory for SQLite (optional; created on first run)
mkdir -p data

# Start the API (creates DB and seeds on first run)
npm run start:api

# In another terminal: start the dashboard
npm run start:dashboard
```

- **API**: http://localhost:3000 (prefix: `/api`)
- **Dashboard**: http://localhost:4200

### .env configuration

| Variable       | Description                    | Default              |
|----------------|--------------------------------|----------------------|
| `JWT_SECRET`   | Secret for signing JWTs        | (dev default in code)|
| `JWT_EXPIRATION` | Token lifetime (e.g. `1h`)  | `1h`                 |
| `DB_PATH`      | SQLite database path           | `data/tasks.sqlite`  |
| `PORT`         | API server port                | `3000`               |

### Seed data

On first start, the API seeds one organization, one user, and three tasks:

- **Email**: `owner@example.com`
- **Password**: `admin123`
- **Role**: Owner

## Architecture Overview

### NX monorepo layout

```
apps/
  api/          → NestJS backend (TypeORM, JWT, RBAC)
  dashboard/    → Angular frontend (TailwindCSS, routing)
libs/
  data/         → Shared TypeScript interfaces and DTOs
  auth/         → RBAC permission constants and helpers (hasPermission, roles)
```

- **Shared libs**: `@app/data` and `@app/auth` provide a single source of truth for types, DTOs, and permission logic used by both API and dashboard.
- **API** implements guards and decorators that rely on `@app/auth` for role/permission checks.

### Data flow

- Frontend stores JWT in `localStorage` and sends it via `Authorization: Bearer <token>` on every request.
- API validates JWT with Passport, attaches user (id, organizationId, role) to the request, and uses guards to enforce permissions and org scoping.

## Data Model

### Schema

- **User**: id, email, passwordHash, organizationId, role (Owner | Admin | Viewer), createdAt
- **Organization**: id, name, parentId (nullable for root; 2-level hierarchy)
- **Task**: id, title, description, status, category, orderIndex, organizationId, createdById, createdAt, updatedAt
- **AuditLog**: id, userId, organizationId, action, resource, resourceId, details, timestamp

### ERD (conceptual)

- Organization → Users (one-to-many)
- Organization → Tasks (one-to-many)
- User → Tasks as creator (one-to-many)
- Organization.parentId → Organization (self-reference for 2-level hierarchy)

## Access Control Implementation

### Roles and permissions

| Role   | task:create | task:read | task:update | task:delete | audit:read |
|--------|-------------|-----------|-------------|-------------|------------|
| Owner  | ✓           | ✓         | ✓           | ✓           | ✓          |
| Admin  | ✓           | ✓         | ✓           | ✓           | ✓          |
| Viewer |             | ✓         |             |             |            |

- **Scoping**: All task access is scoped by `user.organizationId`; users only see and modify tasks in their organization.
- **Implementation**: `libs/auth` exposes `hasPermission(role, permission)` and permission constants. The API uses:
  - `JwtAuthGuard`: validates JWT and attaches user to request (with `@Public()` for login).
  - `RolesGuard`: checks `user.role` against `@Roles()`.
  - `PermissionsGuard`: checks `user.role` against `@RequirePermission()` via `hasPermission`.
- **JWT payload**: sub (userId), email, organizationId, role — used by guards and services for scoping.

## API Documentation

Base URL: `http://localhost:3000/api` (with global prefix `api`).

### Endpoints

| Method | Path           | Description           | Access              |
|--------|----------------|-----------------------|---------------------|
| POST   | /auth/login    | Login                 | Public              |
| GET    | /tasks         | List tasks            | JWT + task:read     |
| POST   | /tasks         | Create task           | JWT + task:create   |
| GET    | /tasks/:id     | Get task              | JWT + task:read     |
| PUT    | /tasks/:id     | Update task           | JWT + task:update   |
| DELETE | /tasks/:id     | Delete task           | JWT + task:delete   |
| GET    | /audit-log     | List audit entries    | JWT + Owner/Admin   |

### Sample requests and responses

**POST /api/auth/login**

```json
Request:  { "email": "owner@example.com", "password": "admin123" }
Response: { "access_token": "<jwt>", "user": { "id": "...", "email": "owner@example.com", "organizationId": "...", "role": "Owner" } }
```

**GET /api/tasks** (with header `Authorization: Bearer <token>`)

```json
Response: [
  { "id": "...", "title": "Welcome task", "description": "Get started", "status": "Todo", "category": "Work", "orderIndex": 0, "organizationId": "...", "createdById": "...", "createdAt": "...", "updatedAt": "..." }
]
```

**POST /api/tasks** (with header `Authorization: Bearer <token>`)

```json
Request:  { "title": "New task", "description": "Optional", "status": "Todo", "category": "Work" }
Response: { "id": "...", "title": "New task", ... }
```

## Testing

- **Backend**: `nx test auth` (unit tests for RBAC helpers). E2E: `nx e2e api-e2e` (requires API running with seed; tests login and tasks).
- **Frontend**: `nx test dashboard` (Angular unit tests).

## Future Considerations

- **Advanced role delegation**: Custom roles or per-resource overrides.
- **Production security**: JWT refresh tokens, httpOnly cookies, CSRF protection, rate limiting.
- **RBAC caching**: Cache permission checks per request or short TTL to reduce DB/CPU.
- **Scaling**: Indexes on (organizationId, role), consider read replicas for task list.

## Tradeoffs and unfinished areas

- **SQLite**: Used for zero-setup dev; production should use PostgreSQL (or similar) with migrations.
- **Token storage**: JWT in `localStorage` is simple but vulnerable to XSS; production should consider refresh tokens and httpOnly cookies.
- **Audit**: Stored in DB and logged to console; production may want centralized logging and retention policies.
- **2-level org**: Only root and direct children; no recursive “all descendants” visibility.
