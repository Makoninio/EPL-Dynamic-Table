# API (`apps/api`)

Fastify + Prisma + PostgreSQL.

## Environment

```bash
DATABASE_URL=postgresql://pllab:pllab@localhost:5432/pllab?schema=public
PORT=4000
```

## Run locally (without Docker)

```bash
npm install
npm --workspace apps/api run prisma:generate
npm --workspace apps/api run prisma:migrate
npm --workspace apps/api run prisma:seed
npm --workspace apps/api run dev
```

## Pulselive-backed seed (EPL 2024/25)

The seed script:
1. Calls `GET /football/competitions/1/compseasons` and finds label `2024/25`
2. Resolves `compSeasonId` (expected: `719`)
3. Calls `GET /football/fixtures` for that season with `statuses=C`
4. Derives teams from fixture payload
5. Computes standings snapshots for each matchweek (1..38)

## REST endpoints

- `GET /api/seasons`
- `GET /api/teams?seasonId=`
- `GET /api/standings/snapshots?seasonId=`
- `GET /api/matches?seasonId=&matchweek=`
- `GET /api/matches/:matchId`

## Example curl

```bash
curl 'http://localhost:4000/api/seasons'
curl 'http://localhost:4000/api/teams?seasonId=1'
curl 'http://localhost:4000/api/standings/snapshots?seasonId=1'
curl 'http://localhost:4000/api/matches?seasonId=1&matchweek=38'
curl 'http://localhost:4000/api/matches/1'
```
