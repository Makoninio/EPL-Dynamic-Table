import { prisma } from '../lib/prisma.js';

const PULSE_BASE = 'https://footballapi.pulselive.com/football';
const COMPETITION_ID = 1;
const TARGET_SEASON_LABEL = '2024/25';

type PulsePageInfo = {
  page?: number;
  numPages?: number;
  pageSize?: number;
  numEntries?: number;
};

type PulseCompSeason = {
  id?: number;
  label?: string;
};

type PulseFixtureTeam = {
  score?: number;
  team?: {
    id?: number;
    name?: string;
    shortName?: string;
    club?: {
      id?: number;
      abbr?: string;
      name?: string;
    };
  };
};

type PulseFixture = {
  id?: number;
  status?: string;
  gameweek?: { gameweek?: number } | number;
  kickoff?: { millis?: number };
  provisionalKickoff?: { millis?: number };
  teams?: PulseFixtureTeam[];
};

type PulsePagedResponse<T> = {
  content?: T[];
  pageInfo?: PulsePageInfo;
};

type NormalizedFixture = {
  fixtureId: number;
  matchweek: number;
  kickoffUtc: Date;
  home: { pulseTeamId: number; name: string; shortName: string; score: number };
  away: { pulseTeamId: number; name: string; shortName: string; score: number };
};

type TeamStats = {
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  gd: number;
  results: Array<'W' | 'D' | 'L'>;
};

const CREST_BY_SHORT: Record<string, string> = {
  ARS: '/crests/ars.svg',
  AVL: '/crests/avl.svg',
  BOU: '/crests/bou.svg',
  BRE: '/crests/bre.svg',
  BHA: '/crests/bha.svg',
  CHE: '/crests/che.svg',
  CRY: '/crests/cry.svg',
  EVE: '/crests/eve.svg',
  FUL: '/crests/ful.svg',
  IPS: '/crests/ips.svg',
  LEI: '/crests/lei.svg',
  LIV: '/crests/liv.jpg',
  MCI: '/crests/mci.svg',
  MUN: '/crests/mun.svg',
  NEW: '/crests/new.svg',
  NFO: '/crests/nfo.svg',
  SOU: '/crests/sou.svg',
  TOT: '/crests/tot.svg',
  WHU: '/crests/whu.svg',
  WOL: '/crests/wol.svg',
};

const CREST_BY_NAME: Record<string, string> = {
  arsenal: '/crests/ars.svg',
  'aston villa': '/crests/avl.svg',
  bournemouth: '/crests/bou.svg',
  brentford: '/crests/bre.svg',
  brighton: '/crests/bha.svg',
  chelsea: '/crests/che.svg',
  'crystal palace': '/crests/cry.svg',
  everton: '/crests/eve.svg',
  fulham: '/crests/ful.svg',
  ipswich: '/crests/ips.svg',
  leicester: '/crests/lei.svg',
  liverpool: '/crests/liv.jpg',
  'man city': '/crests/mci.svg',
  'manchester city': '/crests/mci.svg',
  'man utd': '/crests/mun.svg',
  'manchester united': '/crests/mun.svg',
  newcastle: '/crests/new.svg',
  'nottingham forest': '/crests/nfo.svg',
  southampton: '/crests/sou.svg',
  tottenham: '/crests/tot.svg',
  'tottenham hotspur': '/crests/tot.svg',
  'west ham': '/crests/whu.svg',
  'west ham united': '/crests/whu.svg',
  wolves: '/crests/wol.svg',
  'wolverhampton wanderers': '/crests/wol.svg',
};

function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

function crestFromTeam(name: string, shortName: string) {
  const byShort = CREST_BY_SHORT[shortName.toUpperCase()];
  if (byShort) return byShort;

  const normalized = normalizeName(name);
  for (const [key, crest] of Object.entries(CREST_BY_NAME)) {
    if (normalized.includes(key)) return crest;
  }

  return '/crests/generic.svg';
}

async function fetchPulseJson<T>(path: string, params: Record<string, string | number>) {
  const url = new URL(`${PULSE_BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json, text/plain, */*',
      Origin: 'https://www.premierleague.com',
      Referer: 'https://www.premierleague.com/',
      'User-Agent': 'PL-Season-Lab/1.0',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pulselive request failed (${res.status}) ${url.pathname}: ${body.slice(0, 250)}`);
  }

  return (await res.json()) as T;
}

async function findCompSeasonIdByLabel(label: string) {
  const data = await fetchPulseJson<PulsePagedResponse<PulseCompSeason>>(
    `/competitions/${COMPETITION_ID}/compseasons`,
    { page: 0, pageSize: 100 },
  );

  const season = (data.content ?? []).find((s) => s.label === label);
  if (!season?.id) {
    throw new Error(`Could not find compSeasonId for label ${label}`);
  }

  return season.id;
}

function normalizeFixture(raw: unknown): NormalizedFixture | null {
  const base = (raw as { fixture?: PulseFixture }).fixture ?? (raw as PulseFixture);
  if (!base?.id || !base.teams || base.teams.length < 2) return null;

  const gameweekValue = typeof base.gameweek === 'number' ? base.gameweek : base.gameweek?.gameweek;
  if (!gameweekValue || gameweekValue < 1) return null;

  const kickoffMillis = base.kickoff?.millis ?? base.provisionalKickoff?.millis;
  if (!kickoffMillis) return null;

  const homeRaw = base.teams[0];
  const awayRaw = base.teams[1];

  const homePulseTeamId = homeRaw.team?.club?.id ?? homeRaw.team?.id;
  const awayPulseTeamId = awayRaw.team?.club?.id ?? awayRaw.team?.id;
  if (!homePulseTeamId || !awayPulseTeamId) return null;

  const homeName = homeRaw.team?.club?.name ?? homeRaw.team?.name ?? 'Home';
  const awayName = awayRaw.team?.club?.name ?? awayRaw.team?.name ?? 'Away';
  const homeShort = homeRaw.team?.club?.abbr ?? homeRaw.team?.shortName ?? homeName.slice(0, 3).toUpperCase();
  const awayShort = awayRaw.team?.club?.abbr ?? awayRaw.team?.shortName ?? awayName.slice(0, 3).toUpperCase();

  return {
    fixtureId: base.id,
    matchweek: gameweekValue,
    kickoffUtc: new Date(kickoffMillis),
    home: {
      pulseTeamId: homePulseTeamId,
      name: homeName,
      shortName: homeShort,
      score: homeRaw.score ?? 0,
    },
    away: {
      pulseTeamId: awayPulseTeamId,
      name: awayName,
      shortName: awayShort,
      score: awayRaw.score ?? 0,
    },
  };
}

async function fetchAllCompletedFixtures(compSeasonId: number) {
  const fixtures: NormalizedFixture[] = [];
  const seen = new Set<number>();

  let page = 0;
  let oneBasedPageFallbackUsed = false;

  while (true) {
    const payload = await fetchPulseJson<PulsePagedResponse<unknown>>('/fixtures', {
      comps: COMPETITION_ID,
      compSeasons: compSeasonId,
      page,
      pageSize: 100,
      sort: 'asc',
      statuses: 'C',
    });

    const content = payload.content ?? [];

    if (content.length === 0 && page === 0 && !oneBasedPageFallbackUsed) {
      oneBasedPageFallbackUsed = true;
      page = 1;
      continue;
    }

    for (const raw of content) {
      const fixture = normalizeFixture(raw);
      if (!fixture || seen.has(fixture.fixtureId)) continue;
      seen.add(fixture.fixtureId);
      fixtures.push(fixture);
    }

    const numPages = payload.pageInfo?.numPages;
    if (typeof numPages === 'number' && numPages > 0) {
      if (page >= numPages - 1) break;
      page += 1;
      continue;
    }

    if (content.length < 100) break;
    page += 1;
  }

  fixtures.sort((a, b) => {
    const t = a.kickoffUtc.getTime() - b.kickoffUtc.getTime();
    return t !== 0 ? t : a.fixtureId - b.fixtureId;
  });

  return fixtures;
}

function createEmptyStats(): TeamStats {
  return {
    points: 0,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    results: [],
  };
}

async function main() {
  const compSeasonId = await findCompSeasonIdByLabel(TARGET_SEASON_LABEL);
  const fixtures = await fetchAllCompletedFixtures(compSeasonId);

  if (!fixtures.length) {
    throw new Error('No completed fixtures were fetched for EPL 2024/25.');
  }

  const byPulseTeam = new Map<number, { name: string; shortName: string; crestUrl: string }>();
  for (const fixture of fixtures) {
    byPulseTeam.set(fixture.home.pulseTeamId, {
      name: fixture.home.name,
      shortName: fixture.home.shortName,
      crestUrl: crestFromTeam(fixture.home.name, fixture.home.shortName),
    });
    byPulseTeam.set(fixture.away.pulseTeamId, {
      name: fixture.away.name,
      shortName: fixture.away.shortName,
      crestUrl: crestFromTeam(fixture.away.name, fixture.away.shortName),
    });
  }

  const teamSource = [...byPulseTeam.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name));
  const matchweeks = [...new Set(fixtures.map((f) => f.matchweek))].sort((a, b) => a - b);

  if (teamSource.length !== 20) {
    throw new Error(`Expected 20 teams for EPL 2024/25, got ${teamSource.length}.`);
  }

  await prisma.standingsSnapshot.deleteMany();
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.season.deleteMany();

  const season = await prisma.season.create({
    data: {
      name: 'PL 2024/25',
      startDate: fixtures[0].kickoffUtc,
      endDate: fixtures[fixtures.length - 1].kickoffUtc,
    },
  });

  await prisma.team.createMany({
    data: teamSource.map(([, team]) => team),
  });

  const dbTeams = await prisma.team.findMany({ orderBy: { name: 'asc' } });
  const internalByPulseTeamId = new Map<number, number>();
  for (let i = 0; i < teamSource.length; i += 1) {
    internalByPulseTeamId.set(teamSource[i][0], dbTeams[i].id);
  }

  await prisma.match.createMany({
    data: fixtures.map((fixture) => ({
      seasonId: season.id,
      matchweek: fixture.matchweek,
      kickoffUtc: fixture.kickoffUtc,
      homeTeamId: internalByPulseTeamId.get(fixture.home.pulseTeamId)!,
      awayTeamId: internalByPulseTeamId.get(fixture.away.pulseTeamId)!,
      homeGoals: fixture.home.score,
      awayGoals: fixture.away.score,
    })),
  });

  const stats = new Map<number, TeamStats>();
  for (const team of dbTeams) {
    stats.set(team.id, createEmptyStats());
  }

  const snapshotsData: Array<{
    seasonId: number;
    matchweek: number;
    teamId: number;
    points: number;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    gf: number;
    ga: number;
    gd: number;
    position: number;
    form5: string;
  }> = [];

  for (const week of matchweeks) {
    const weekFixtures = fixtures.filter((f) => f.matchweek === week);
    for (const fixture of weekFixtures) {
      const homeId = internalByPulseTeamId.get(fixture.home.pulseTeamId)!;
      const awayId = internalByPulseTeamId.get(fixture.away.pulseTeamId)!;
      const home = stats.get(homeId)!;
      const away = stats.get(awayId)!;

      home.played += 1;
      away.played += 1;
      home.gf += fixture.home.score;
      home.ga += fixture.away.score;
      away.gf += fixture.away.score;
      away.ga += fixture.home.score;
      home.gd = home.gf - home.ga;
      away.gd = away.gf - away.ga;

      if (fixture.home.score > fixture.away.score) {
        home.points += 3;
        home.wins += 1;
        away.losses += 1;
        home.results.push('W');
        away.results.push('L');
      } else if (fixture.home.score < fixture.away.score) {
        away.points += 3;
        away.wins += 1;
        home.losses += 1;
        home.results.push('L');
        away.results.push('W');
      } else {
        home.points += 1;
        away.points += 1;
        home.draws += 1;
        away.draws += 1;
        home.results.push('D');
        away.results.push('D');
      }
    }

    const ranking = dbTeams
      .map((team) => ({ team, stat: stats.get(team.id)! }))
      .sort((a, b) => {
        if (b.stat.points !== a.stat.points) return b.stat.points - a.stat.points;
        if (b.stat.gd !== a.stat.gd) return b.stat.gd - a.stat.gd;
        if (b.stat.gf !== a.stat.gf) return b.stat.gf - a.stat.gf;
        return a.team.name.localeCompare(b.team.name);
      });

    ranking.forEach(({ team, stat }, index) => {
      snapshotsData.push({
        seasonId: season.id,
        matchweek: week,
        teamId: team.id,
        points: stat.points,
        played: stat.played,
        wins: stat.wins,
        draws: stat.draws,
        losses: stat.losses,
        gf: stat.gf,
        ga: stat.ga,
        gd: stat.gd,
        position: index + 1,
        form5: stat.results.slice(-5).join('') || '-',
      });
    });
  }

  await prisma.standingsSnapshot.createMany({ data: snapshotsData });

  console.log(
    `Pulselive seed complete. compSeasonId=${compSeasonId} season=${season.id} teams=${dbTeams.length} fixtures=${fixtures.length} matchweeks=${matchweeks.length}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
