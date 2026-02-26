export type Season = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
};

export type Team = {
  id: number;
  name: string;
  shortName: string;
  crestUrl: string;
};

export type Snapshot = {
  id: number;
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
  team: Team;
};
