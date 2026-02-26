import { env } from './env';
import type { Season, Snapshot, Team } from './types';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Request failed: ${path}`);
  return (await res.json()) as T;
}

export async function fetchSeasons() {
  return getJson<Season[]>('/api/seasons');
}

export async function fetchTeams(seasonId: number) {
  return getJson<{ seasonId: number; teams: Team[] }>(`/api/teams?seasonId=${seasonId}`);
}

export async function fetchSnapshots(seasonId: number) {
  return getJson<{ seasonId: number; snapshots: Snapshot[]; matchweeks: number[] }>(
    `/api/standings/snapshots?seasonId=${seasonId}`,
  );
}
