# PL 2024/25 3D Season Lab

Now focused on a single feature: EPL 2024/25 living table animation.

## Stack

- Frontend: Next.js 14 + TypeScript + Three.js via `@react-three/fiber` + `drei`
- Backend: Node.js + TypeScript + Fastify + Zod
- Database: PostgreSQL 15
- ORM: Prisma
- DevOps: Docker Compose (`web`, `api`, `postgres`)

## Monorepo layout

- `apps/web` Next.js app (`/` living table)
- `apps/api` Fastify API
- `prisma` schema + migration

## One-command run

```bash
docker compose up --build
```

Services:
- Web: http://localhost:3000
- API: http://localhost:4000
- Postgres: localhost:5432

On startup, API runs migration + Pulselive-backed seed for EPL 2024/25.

## Environment variables

- API: `DATABASE_URL`, `PORT`
- Web: `NEXT_PUBLIC_API_BASE`

See:
- `apps/api/.env.example`
- `apps/web/.env.example`
