'use client';

import { useMemo, useState } from 'react';
import { fetchSeasons, fetchSnapshots, fetchTeams } from '../lib/api';
import { demoSeason, demoSnapshots, demoTeams } from '../lib/demo-data';
import type { Snapshot, Team } from '../lib/types';
import { ChampionshipTowerScene } from './championship-tower/scene-setup';
import { TOWER_CONFIG, rankToHeight } from './championship-tower/config';
import { useAnimationController } from './championship-tower/use-animation-controller';
import { useInteractionController } from './championship-tower/use-interaction-controller';
import { useEffect } from 'react';

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeOutBack(t: number, s = 1.15) {
  const x = t - 1;
  return 1 + x * x * ((s + 1) * x + s);
}

function weekSnapshot(teamId: number, week: number, byTeam: Map<number, Map<number, Snapshot>>) {
  const teamMap = byTeam.get(teamId);
  if (!teamMap) return null;
  if (teamMap.has(week)) return teamMap.get(week)!;
  for (let w = week; w >= 1; w -= 1) {
    if (teamMap.has(w)) return teamMap.get(w)!;
  }
  return [...teamMap.values()][0] ?? null;
}

function orbitSlot(index: number, count: number) {
  if (count <= 1) return 0;
  return (index / count) * Math.PI * 2;
}

function normalizeCrestPath(path: string) {
  if (path.startsWith('/crests/')) {
    return path.replace(/\.(jpg|jpeg|png)$/i, '.svg');
  }
  return path;
}

export default function LivingTableLab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [seasonLabel, setSeasonLabel] = useState('PL 2024/25');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [search, setSearch] = useState('');
  const [showPoints, setShowPoints] = useState(true);
  const [showGd, setShowGd] = useState(true);
  const [showForm, setShowForm] = useState(true);

  const totalWeeks = useMemo(() => {
    const maxWeek = snapshots.reduce((max, s) => Math.max(max, s.matchweek), 0);
    return Math.max(38, maxWeek);
  }, [snapshots]);

  const animation = useAnimationController({ totalWeeks });
  const interaction = useInteractionController({
    setPlaying: animation.setPlaying,
    stepWeek: animation.stepWeek,
  });

  useEffect(() => {
    async function load() {
      try {
        const seasons = await fetchSeasons();
        if (!seasons.length) {
          setSeasonLabel(demoSeason.name);
          setTeams(demoTeams);
          setSnapshots(demoSnapshots);
          setIsDemoMode(true);
          setLoading(false);
          return;
        }

        const season =
          seasons.find((s) => s.name.includes('2024/25')) ??
          seasons.find((s) => s.name === 'PL 2024/25') ??
          seasons[0];

        setSeasonLabel(season.name);

        const [teamRes, snapshotRes] = await Promise.all([
          fetchTeams(season.id),
          fetchSnapshots(season.id),
        ]);

        setTeams(teamRes.teams);
        setSnapshots(snapshotRes.snapshots);
        setIsDemoMode(false);
      } catch (e) {
        setSeasonLabel(demoSeason.name);
        setTeams(demoTeams);
        setSnapshots(demoSnapshots);
        setIsDemoMode(true);
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const byTeam = useMemo(() => {
    const map = new Map<number, Map<number, Snapshot>>();
    for (const s of snapshots) {
      if (!map.has(s.teamId)) map.set(s.teamId, new Map());
      map.get(s.teamId)!.set(s.matchweek, s);
    }
    return map;
  }, [snapshots]);

  const slotByTeamId = useMemo(() => {
    const sorted = [...teams].sort((a, b) => a.shortName.localeCompare(b.shortName));
    const map = new Map<number, number>();
    sorted.forEach((team, idx) => map.set(team.id, idx));
    return map;
  }, [teams]);

  const badgeStates = useMemo(() => {
    if (!teams.length) return [];

    const weekA = Math.floor(animation.weekFloat);
    const weekB = Math.min(totalWeeks, weekA + 1);
    const localT = animation.weekFloat - weekA;

    return teams.map((team) => {
      const sa = weekSnapshot(team.id, weekA, byTeam);
      const sb = weekSnapshot(team.id, weekB, byTeam) ?? sa;

      const emptySnapshot: Snapshot = {
        id: -1,
        seasonId: 0,
        matchweek: weekA,
        teamId: team.id,
        points: 0,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        position: 20,
        form5: '-',
        team,
      };

      const currentA = sa ?? emptySnapshot;
      const currentB = sb ?? currentA;

      const yA = rankToHeight(currentA.position);
      const yB = rankToHeight(currentB.position);
      const pointsDelta = currentB.points - currentA.points;
      const rankImprovement = currentA.position - currentB.position;

      const speedBoost = Math.min(1, Math.abs(pointsDelta) * TOWER_CONFIG.animation.momentumFactor);
      const fastT = Math.min(1, localT * (1 + speedBoost));
      const eased = easeOutBack(fastT, 1.15);

      const y = lerp(yA, yB, eased);
      const settle = Math.sin(eased * Math.PI) * (1 - eased) * TOWER_CONFIG.animation.overshoot;

      const slot = slotByTeamId.get(team.id) ?? 0;
      const angle = orbitSlot(slot, teams.length);
      const x = Math.cos(angle) * TOWER_CONFIG.radiusFromTower;
      const z = Math.sin(angle) * TOWER_CONFIG.radiusFromTower;
      const heading = Math.atan2(-x, -z);

      const burst = rankImprovement > 0 ? Math.sin(Math.PI * fastT) : 0;

      const trail: [number, number, number][] = [
        [x, yA, z],
        [x, y + settle, z],
      ];

      const trajectory: [number, number, number][] = [];
      for (let week = 1; week <= totalWeeks; week += 1) {
        const sw = weekSnapshot(team.id, week, byTeam) ?? currentA;
        trajectory.push([x, rankToHeight(sw.position), z]);
      }

      return {
        teamId: team.id,
        teamName: team.name,
        shortName: team.shortName,
        crestUrl: team.crestUrl,
        rank: currentA.position,
        points: currentA.points,
        pointsDelta,
        form5: currentA.form5,
        x,
        y: y + settle + (currentA.position - 1) * 0.002,
        z,
        heading,
        burst,
        trail,
        trajectory,
      };
    });
  }, [teams, byTeam, slotByTeamId, animation.weekFloat, totalWeeks]);

  const filteredTeams = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return badgeStates;
    return badgeStates.filter(
      (t) => t.teamName.toLowerCase().includes(q) || t.shortName.toLowerCase().includes(q),
    );
  }, [badgeStates, search]);

  const activeTeam =
    badgeStates.find((s) => s.teamId === interaction.selectedTeamId) ??
    badgeStates.find((s) => s.teamId === interaction.hoverTeamId) ??
    null;

  if (loading) return <div className="panel">Loading championship tower...</div>;
  if (!badgeStates.length) return <div className="panel text-red-400">{error ?? 'No standings snapshots found.'}</div>;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <section
        className="race-canvas-shell panel relative h-[78vh] min-h-[620px] overflow-hidden"
        onWheel={(e) => {
          e.preventDefault();
          interaction.nudgeTowerYOffset(e.deltaY > 0 ? -0.35 : 0.35);
        }}
      >
        <ChampionshipTowerScene
          teams={badgeStates}
          followLeader={interaction.followLeader}
          selectedTeamId={interaction.selectedTeamId}
          hoverTeamId={interaction.hoverTeamId}
          resetToken={interaction.resetToken}
          orbitEnabled={!interaction.isUserInteracting}
          verticalOffset={interaction.towerYOffset}
          onCanvasPointerDown={() => interaction.setIsUserInteracting(true)}
          onCanvasPointerUp={() => interaction.setIsUserInteracting(false)}
          onHover={(teamId) => interaction.setHoverTeamId(teamId)}
          onUnhover={(teamId) => interaction.setHoverTeamId((prev) => (prev === teamId ? null : prev))}
          onSelect={(teamId) => interaction.setSelectedTeamId(teamId)}
        />

        {interaction.showBroadcastHud ? (
          <div className="pointer-events-none absolute left-4 top-4 w-[380px] rounded-xl border border-[var(--pl-border)] bg-[rgba(43,0,64,0.55)] p-4 text-xs backdrop-blur">
            <div className="pl-header-strip mb-2 h-2 w-full rounded-full" />
            <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--pl-cyan-500)]">Premier League Broadcast Lab</div>
            <div className="mt-1 flex items-center gap-2">
              <div className="text-lg font-semibold text-[var(--pl-text)]">Championship Tower ({seasonLabel})</div>
              <span className="rounded-full border border-white/25 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white">Living Table</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[var(--pl-muted)]">
              <span>Matchweek {Math.max(1, Math.floor(animation.weekFloat))}</span>
              <span>{Math.round(animation.progress * 100)}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded bg-white/20">
              <div
                className="h-full bg-gradient-to-r from-[var(--pl-cyan-500)] to-[var(--pl-blue-500)] transition-all"
                style={{ width: `${Math.max(0, Math.min(100, animation.progress * 100))}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            className="absolute left-4 top-4 rounded-md border border-white/30 bg-[rgba(43,0,64,0.62)] px-3 py-1 text-xs text-white"
            onClick={() => interaction.setShowBroadcastHud(true)}
          >
            Show Broadcast Lab
          </button>
        )}

        {activeTeam && (
          <div className="absolute right-4 top-4 w-64 rounded-xl border border-[var(--pl-border)] bg-[rgba(43,0,64,0.62)] p-3 text-sm backdrop-blur">
            <div className="font-semibold text-[var(--pl-text)]">{activeTeam.teamName}</div>
            <div className="text-xs text-[var(--pl-muted)]">Rank #{activeTeam.rank}</div>
            {showPoints && <div className="mt-1">Points: {activeTeam.points}</div>}
            {showGd && <div>Points Delta: {activeTeam.pointsDelta >= 0 ? '+' : ''}{activeTeam.pointsDelta}</div>}
            {showForm && <div>Form: {activeTeam.form5}</div>}
          </div>
        )}
      </section>

      <aside className="space-y-3">
        {isDemoMode && (
          <div className="panel border-[var(--pl-border)] bg-[rgba(43,0,64,0.55)] text-sm text-[var(--pl-muted)]">
            Demo data mode. API snapshots were unavailable, so the tower is using an offline season simulation.
          </div>
        )}

        <div className="panel space-y-3 border-[var(--pl-border)] bg-[rgba(43,0,64,0.55)]">
          {error && <div className="text-xs text-[#ffd4e8]">Last API error: {error}</div>}

          <div className="flex items-center gap-2">
            <button
              className="rounded-md bg-gradient-to-r from-[var(--pl-cyan-500)] to-[var(--pl-blue-500)] px-3 py-1 text-white shadow-[0_0_14px_rgba(0,212,255,0.45)]"
              onClick={() => animation.setPlaying((v) => !v)}
            >
              {animation.playing ? 'Pause' : 'Play'}
            </button>
            <button
              className="rounded-md border border-white/35 bg-transparent px-3 py-1 text-white"
              onClick={() => {
                animation.resetTimeline();
                interaction.setSelectedTeamId(null);
                interaction.setFollowLeader(false);
                interaction.setTowerYOffset(0);
                interaction.setResetToken((n) => n + 1);
              }}
            >
              Reset Camera
            </button>
          </div>

          <label className="block text-xs uppercase tracking-wide text-[var(--pl-muted)]">
            Season Speed ({animation.durationSec}s)
            <input
              className="pl-slider mt-1 h-1.5 w-full appearance-none rounded"
              type="range"
              min={5}
              max={60}
              value={animation.durationSec}
              onChange={(e) => animation.setDurationSec(Number(e.target.value))}
            />
          </label>

          <label className="block text-xs uppercase tracking-wide text-[var(--pl-muted)]">
            Scrub Matchweek ({animation.weekFloat.toFixed(1)})
            <input
              className="pl-slider mt-1 h-1.5 w-full appearance-none rounded"
              type="range"
              min={1}
              max={totalWeeks}
              step={0.1}
              value={animation.weekFloat}
              onChange={(e) => {
                animation.setPlaying(false);
                animation.setWeekFloat(Number(e.target.value));
              }}
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-[var(--pl-muted)]">
            <input type="checkbox" checked={interaction.followLeader} onChange={(e) => interaction.setFollowLeader(e.target.checked)} />
            Follow rank #1 focus
          </label>

          <div className="flex items-center gap-2">
            <button
              className="rounded-md border border-white/35 bg-transparent px-3 py-1 text-white"
              onClick={() => interaction.nudgeTowerYOffset(0.8)}
            >
              Move Up
            </button>
            <button
              className="rounded-md border border-white/35 bg-transparent px-3 py-1 text-white"
              onClick={() => interaction.nudgeTowerYOffset(-0.8)}
            >
              Move Down
            </button>
            <button
              className="rounded-md border border-white/35 bg-transparent px-3 py-1 text-white"
              onClick={() => interaction.setShowBroadcastHud((v) => !v)}
            >
              {interaction.showBroadcastHud ? 'Hide Lab Card' : 'Show Lab Card'}
            </button>
          </div>

          <div className="text-xs text-[var(--pl-muted)]">
            Keys: `Space` play/pause, `←/→` week step, `↑/↓` move tower view, `F` follow leader, `R` reset camera
          </div>

          <div className="grid gap-1 text-xs text-[var(--pl-muted)]">
            <label>
              <input type="checkbox" checked={showPoints} onChange={(e) => setShowPoints(e.target.checked)} /> Show points
            </label>
            <label>
              <input type="checkbox" checked={showGd} onChange={(e) => setShowGd(e.target.checked)} /> Show points delta
            </label>
            <label>
              <input type="checkbox" checked={showForm} onChange={(e) => setShowForm(e.target.checked)} /> Show form
            </label>
          </div>
        </div>

        <div className="panel space-y-2 border-[var(--pl-border)] bg-[rgba(43,0,64,0.55)]">
          <div className="text-xs uppercase tracking-wide text-[var(--pl-cyan-500)]">Legend</div>
          <div className="text-sm text-[var(--pl-muted)]">Top 4: Green highlight</div>
          <div className="text-sm text-[var(--pl-muted)]">Relegation (18-20): Red highlight</div>
        </div>

        <div className="panel space-y-2 border-[var(--pl-border)] bg-[rgba(43,0,64,0.55)]">
          <input
            className="w-full rounded border border-white/25 bg-white/10 px-2 py-1 text-sm text-white"
            placeholder="Search team"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-72 space-y-1 overflow-auto text-sm">
            {filteredTeams.map((state) => (
              <button
                key={state.teamId}
                className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-white hover:bg-white/10"
                onMouseEnter={() => interaction.setHoverTeamId(state.teamId)}
                onMouseLeave={() => interaction.setHoverTeamId((prev) => (prev === state.teamId ? null : prev))}
                onClick={() => interaction.setSelectedTeamId(state.teamId)}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 ring-1 ring-white/10">
                  <img
                    src={normalizeCrestPath(state.crestUrl)}
                    alt={`${state.teamName} crest`}
                    className="h-6 w-6 object-contain"
                  />
                </span>
                <span>{state.shortName}</span>
                <span className="ml-auto text-xs text-[var(--pl-muted)]">#{state.rank}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
