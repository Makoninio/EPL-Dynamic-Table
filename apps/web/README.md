# Web (`apps/web`)

Next.js 14 App Router + TypeScript + react-three-fiber.

## Environment

```bash
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

## Run locally (without Docker)

```bash
npm install
npm --workspace apps/web run dev
```

## Page

- `/` EPL 2024/25 living table animation

## Notes

- The page fetches all standings snapshots in one request and runs animation client-side.
- Playback defaults to 20 seconds for full-season progression.
