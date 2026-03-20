# C6macEye — Project Guidelines

## Overview
UAV/Drone Fleet & Airspace Management SaaS Platform.
FAA-approved airspace management connecting local drone rules to national air traffic management.

## Tech Stack
- **API**: Node.js + Hono (TypeScript), Vitest
- **Web**: React 19 + Vite + TailwindCSS v4
- **Database**: PostgreSQL 16 + PostGIS + TimescaleDB
- **Auth**: Custom JWT (jose) + Supabase Auth
- **Cache**: Redis/Upstash
- **Maps**: Mapbox GL JS
- **Monorepo**: npm workspaces + Turborepo

## Project Structure
```
src/
  api/          — Hono API server (port 3001)
  web/          — React frontend (port 5173)
  shared/       — Shared types, constants, validators
  infrastructure/ — Docker, Pulumi IaC, K8s configs
database/
  migrations/   — SQL migration files
```

## Commands
- `npm run dev` — Start all services (turbo)
- `npm run build` — Build all packages
- `docker compose up -d` — Start Postgres, Redis, MinIO, etc.
- `npm run db:migrate` — Run database migrations

## Key Patterns
- All database queries use tenant isolation via RLS (`queryWithTenant`)
- All API routes use JWT auth middleware + permission checks
- Audit logging on all write operations (immutable audit_logs table)
- Zero Trust: every request authenticated, authorized, and logged

## FAA Compliance
- B4UFLY airspace check integration
- LAANC authorization (near-real-time + further coordination)
- Remote ID tracking (14 CFR Part 89)
- UAS Facility Maps (56-day chart cycle sync from FAA UDDS)
- Part 107 certification tracking

## Personas
1. Individual Pilot — B4UFLY, LAANC, flight logging
2. Enterprise UAS Manager — Fleet, users, compliance, reporting
3. Airspace/Local Agency — Rules, geofences, incidents
4. Developer — APIs, webhooks, SDK, sandbox
