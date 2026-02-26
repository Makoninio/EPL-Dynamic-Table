import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

let app: Awaited<ReturnType<typeof buildApp>>;

beforeAll(async () => {
  app = await buildApp();
});

afterAll(async () => {
  await app.close();
});

describe('GET /api/teams', () => {
  it('returns 400 when seasonId is invalid', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/teams?seasonId=bad',
    });

    expect(res.statusCode).toBe(400);
  });
});
