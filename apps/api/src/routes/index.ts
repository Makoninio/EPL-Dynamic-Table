import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const seasonQuery = z.object({ seasonId: z.coerce.number().int().positive() });

export async function registerRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({ ok: true }));

  app.get('/api/seasons', async () => prisma.season.findMany({ orderBy: { startDate: 'asc' } }));

  app.get('/api/teams', async (request, reply) => {
    const parsed = seasonQuery.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const teams = await prisma.team.findMany({
      where: {
        OR: [
          { homeMatches: { some: { seasonId: parsed.data.seasonId } } },
          { awayMatches: { some: { seasonId: parsed.data.seasonId } } },
        ],
      },
      orderBy: { name: 'asc' },
    });

    return { seasonId: parsed.data.seasonId, teams };
  });

  app.get('/api/standings/snapshots', async (request, reply) => {
    const parsed = seasonQuery.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const rows = await prisma.standingsSnapshot.findMany({
      where: { seasonId: parsed.data.seasonId },
      include: { team: true },
      orderBy: [{ matchweek: 'asc' }, { position: 'asc' }],
    });

    return {
      seasonId: parsed.data.seasonId,
      snapshots: rows,
      matchweeks: [...new Set(rows.map((r) => r.matchweek))],
    };
  });

  app.get('/api/matches', async (request, reply) => {
    const schema = z.object({
      seasonId: z.coerce.number().int().positive(),
      matchweek: z.coerce.number().int().positive().optional(),
    });
    const parsed = schema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const matches = await prisma.match.findMany({
      where: {
        seasonId: parsed.data.seasonId,
        ...(parsed.data.matchweek ? { matchweek: parsed.data.matchweek } : {}),
      },
      include: { homeTeam: true, awayTeam: true },
      orderBy: [{ matchweek: 'asc' }, { kickoffUtc: 'asc' }],
    });

    return { seasonId: parsed.data.seasonId, matches };
  });

  app.get('/api/matches/:matchId', async (request, reply) => {
    const paramsSchema = z.object({ matchId: z.coerce.number().int().positive() });
    const parsed = paramsSchema.safeParse(request.params);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    const match = await prisma.match.findUnique({
      where: { id: parsed.data.matchId },
      include: { homeTeam: true, awayTeam: true, season: true },
    });

    if (!match) {
      return reply.code(404).send({ error: 'Match not found' });
    }

    return match;
  });
}
