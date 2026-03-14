import type { Season, Snapshot, Team } from './types';

type DemoClub = {
  id: number;
  name: string;
  shortName: string;
  crestCode: string;
  targetPoints: number;
  targetGd: number;
  targetGoals: number;
  bias: number;
};

const DEMO_CLUBS: DemoClub[] = [
  { id: 1, name: 'Liverpool', shortName: 'LIV', crestCode: 'liv', targetPoints: 89, targetGd: 52, targetGoals: 86, bias: 1.06 },
  { id: 2, name: 'Arsenal', shortName: 'ARS', crestCode: 'ars', targetPoints: 86, targetGd: 48, targetGoals: 82, bias: 1.02 },
  { id: 3, name: 'Manchester City', shortName: 'MCI', crestCode: 'mci', targetPoints: 84, targetGd: 44, targetGoals: 84, bias: 1.0 },
  { id: 4, name: 'Aston Villa', shortName: 'AVL', crestCode: 'avl', targetPoints: 72, targetGd: 20, targetGoals: 71, bias: 0.89 },
  { id: 5, name: 'Tottenham Hotspur', shortName: 'TOT', crestCode: 'tot', targetPoints: 68, targetGd: 16, targetGoals: 70, bias: 0.86 },
  { id: 6, name: 'Chelsea', shortName: 'CHE', crestCode: 'che', targetPoints: 66, targetGd: 15, targetGoals: 73, bias: 0.85 },
  { id: 7, name: 'Newcastle United', shortName: 'NEW', crestCode: 'new', targetPoints: 61, targetGd: 14, targetGoals: 76, bias: 0.8 },
  { id: 8, name: 'Manchester United', shortName: 'MUN', crestCode: 'mun', targetPoints: 59, targetGd: 4, targetGoals: 65, bias: 0.76 },
  { id: 9, name: 'Brighton & Hove Albion', shortName: 'BHA', crestCode: 'bha', targetPoints: 56, targetGd: 2, targetGoals: 63, bias: 0.73 },
  { id: 10, name: 'West Ham United', shortName: 'WHU', crestCode: 'whu', targetPoints: 53, targetGd: -4, targetGoals: 58, bias: 0.69 },
  { id: 11, name: 'Brentford', shortName: 'BRE', crestCode: 'bre', targetPoints: 51, targetGd: -3, targetGoals: 57, bias: 0.66 },
  { id: 12, name: 'Bournemouth', shortName: 'BOU', crestCode: 'bou', targetPoints: 50, targetGd: -5, targetGoals: 56, bias: 0.63 },
  { id: 13, name: 'Fulham', shortName: 'FUL', crestCode: 'ful', targetPoints: 47, targetGd: -9, targetGoals: 53, bias: 0.58 },
  { id: 14, name: 'Crystal Palace', shortName: 'CRY', crestCode: 'cry', targetPoints: 45, targetGd: -11, targetGoals: 50, bias: 0.56 },
  { id: 15, name: 'Everton', shortName: 'EVE', crestCode: 'eve', targetPoints: 43, targetGd: -13, targetGoals: 46, bias: 0.52 },
  { id: 16, name: 'Wolverhampton Wanderers', shortName: 'WOL', crestCode: 'wol', targetPoints: 41, targetGd: -15, targetGoals: 45, bias: 0.5 },
  { id: 17, name: 'Nottingham Forest', shortName: 'NFO', crestCode: 'nfo', targetPoints: 39, targetGd: -17, targetGoals: 43, bias: 0.47 },
  { id: 18, name: 'Leicester City', shortName: 'LEI', crestCode: 'lei', targetPoints: 35, targetGd: -23, targetGoals: 41, bias: 0.42 },
  { id: 19, name: 'Ipswich Town', shortName: 'IPS', crestCode: 'ips', targetPoints: 29, targetGd: -29, targetGoals: 36, bias: 0.34 },
  { id: 20, name: 'Southampton', shortName: 'SOU', crestCode: 'sou', targetPoints: 24, targetGd: -38, targetGoals: 33, bias: 0.28 },
];

export const demoSeason: Season = {
  id: 1,
  name: 'PL 2024/25 Demo',
  startDate: '2024-08-16',
  endDate: '2025-05-25',
};

export const demoTeams: Team[] = DEMO_CLUBS.map((club) => ({
  id: club.id,
  name: club.name,
  shortName: club.shortName,
  crestUrl: `/crests/${club.crestCode}.svg`,
}));

function wave(seed: number, week: number, amp: number) {
  return Math.sin(seed * 0.73 + week * 0.41) * amp + Math.cos(seed * 0.33 + week * 0.19) * amp * 0.45;
}

function formForWeek(club: DemoClub, week: number) {
  let out = '';
  for (let i = 0; i < 5; i += 1) {
    const sample = wave(club.id + i * 0.5, week - i, 0.85) + (club.bias - 0.6) * 1.9;
    if (sample > 0.55) out += 'W';
    else if (sample > -0.05) out += 'D';
    else out += 'L';
  }
  return out;
}

function weeklyShape(club: DemoClub, week: number) {
  const progress = week / 38;
  const surge = wave(club.id, week, 0.8);
  const momentum = wave(club.id * 1.7, week, 0.45);
  const points = Math.max(0, club.targetPoints * progress + surge * 2.1 + momentum);
  const gd = club.targetGd * progress + surge * 1.7;
  const gf = Math.max(0, club.targetGoals * progress + Math.max(0, surge) * 2.6 + 3);
  return { points, gd, gf };
}

export const demoSnapshots: Snapshot[] = Array.from({ length: 38 }, (_, index) => {
  const week = index + 1;
  const rows = DEMO_CLUBS.map((club) => {
    const team = demoTeams.find((entry) => entry.id === club.id)!;
    const stats = weeklyShape(club, week);
    return {
      club,
      team,
      points: stats.points,
      gd: stats.gd,
      gf: stats.gf,
      form5: formForWeek(club, week),
    };
  }).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });

  return rows.map((row, order) => {
    const played = Math.min(38, week);
    const pointsRounded = Math.round(row.points);
    const wins = Math.max(0, Math.min(played, Math.round(pointsRounded / 2.45)));
    const draws = Math.max(0, Math.min(played - wins, Math.round((played - wins) * 0.25)));
    const losses = Math.max(0, played - wins - draws);
    const gf = Math.max(0, Math.round(row.gf));
    const gd = Math.round(row.gd);
    const ga = Math.max(0, gf - gd);

    return {
      id: week * 100 + row.club.id,
      seasonId: demoSeason.id,
      matchweek: week,
      teamId: row.club.id,
      points: pointsRounded,
      played,
      wins,
      draws,
      losses,
      gf,
      ga,
      gd,
      position: order + 1,
      form5: row.form5,
      team: row.team,
    } satisfies Snapshot;
  });
}).flat();
