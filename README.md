# EPL Dynamic Table

Interactive Premier League standings visualization built as a full-stack TypeScript application. The project turns season table movement into a 3D "championship tower" experience, combining a real API, PostgreSQL-backed historical snapshots, and a React Three Fiber frontend.

## Live

- Deployed site: https://epl-dynamic-table-web.vercel.app/
- API base: https://epl-dynamic-table.onrender.com

## What It Does

- Visualizes Premier League standings as animated 3D team markers orbiting a central tower
- Replays matchweek-by-matchweek table movement using precomputed standings snapshots
- Highlights Champions League and relegation zones directly in the scene and supporting UI
- Supports team search, hover/select interactions, camera controls, and seasonal playback controls
- Falls back to deterministic demo data when the API is unavailable, keeping the experience usable

## Technical Highlights

- Built a monorepo application with separate `apps/web` and `apps/api` workspaces
- Implemented a Next.js 14 frontend with TypeScript, React, and Three.js through `@react-three/fiber` and `@react-three/drei`
- Designed a Fastify REST API with Zod-validated request parsing and Prisma ORM integration
- Modeled relational season, match, team, and standings snapshot data in PostgreSQL
- Created a seed pipeline that ingests completed EPL fixtures, derives table state by matchweek, and stores queryable standings history
- Normalized club crest assets and integrated them across both 3D scene rendering and supporting UI components
- Deployed the frontend and backend separately with production environment configuration for cross-service communication

## Architecture

- `apps/web`
  - Next.js App Router frontend
  - React client components for playback controls and live table interactions
  - React Three Fiber scene composition for the championship tower, orbiting team badges, and animated rank rings

- `apps/api`
  - Fastify server exposing season, team, match, and standings snapshot endpoints
  - Prisma client for PostgreSQL access
  - Seed script that computes standings tables from fixture results

- `prisma`
  - Shared schema and migrations for `Season`, `Team`, `Match`, and `StandingsSnapshot`

## Stack

- Frontend: Next.js 14, React 18, TypeScript
- 3D / Visualization: Three.js, `@react-three/fiber`, `@react-three/drei`
- Backend: Fastify, Zod, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Deployment: Vercel (web), Render (API), Neon (database)

## API Surface

The backend exposes endpoints for:

- `GET /health`
- `GET /api/seasons`
- `GET /api/teams?seasonId=`
- `GET /api/standings/snapshots?seasonId=`
- `GET /api/matches?seasonId=&matchweek=`
- `GET /api/matches/:matchId`

These endpoints drive the frontend playback system by returning season metadata, team identity data, and precomputed standings snapshots for each matchweek.

## Local Development

Install dependencies:

```bash
npm install
```

Run the API:

```bash
npm --workspace apps/api run dev
```

Run the web app:

```bash
npm --workspace apps/web run dev
```

Default local URLs:

- Web: `http://localhost:3000`
- API: `http://localhost:4000`

## Environment Variables

- API: `DATABASE_URL`, `PORT`
- Web: `NEXT_PUBLIC_API_BASE`

See:

- `apps/api/.env.example`
- `apps/web/.env.local`

## Notes

This project demonstrates:

- frontend engineering for interactive data experiences
- 3D UI implementation in the browser
- API and database design for time-series sports data
- end-to-end TypeScript architecture across client, server, and ORM layers
- production deployment across multiple cloud services
