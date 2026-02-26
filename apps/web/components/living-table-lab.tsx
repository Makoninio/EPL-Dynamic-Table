'use client';

import { Canvas } from '@react-three/fiber';
import { Line, OrbitControls, useTexture } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { fetchSeasons, fetchSnapshots, fetchTeams } from '../lib/api';
import type { Snapshot, Team } from '../lib/types';

const DEFAULT_SEASON_WEEKS = 38;
const LANE_COUNT = 20;
const TRACK_A_INNER = 7.2;
const TRACK_B_INNER = 3.8;
const LANE_GAP = 0.52;

type TeamState = {
  team: Team;
  x: number;
  y: number;
  z: number;
  heading: number;
  snapshot: Snapshot;
  trajectory: [number, number, number][];
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function weekSnapshot(teamId: number, week: number, byTeam: Map<number, Map<number, Snapshot>>) {
  const tMap = byTeam.get(teamId);
  if (!tMap) return null;
  if (tMap.has(week)) return tMap.get(week)!;
  for (let w = week; w >= 1; w -= 1) {
    if (tMap.has(w)) return tMap.get(w)!;
  }
  const first = [...tMap.values()][0];
  return first ?? null;
}

function clampLane(position: number) {
  return Math.min(LANE_COUNT - 1, Math.max(0, position - 1));
}

function trackPoint(progress: number, laneFloat: number) {
  const p = ((progress % 1) + 1) % 1;
  const theta = p * Math.PI * 2 + Math.PI / 2;
  const lane = Math.min(LANE_COUNT - 1, Math.max(0, laneFloat));
  const a = TRACK_A_INNER + lane * LANE_GAP;
  const b = TRACK_B_INNER + lane * LANE_GAP;

  const x = a * Math.cos(theta);
  const z = b * Math.sin(theta);

  const tx = -a * Math.sin(theta);
  const tz = b * Math.cos(theta);
  const heading = Math.atan2(tx, tz);

  return { x, z, heading };
}

function colorFromIndex(index: number) {
  return `hsl(${(index * 37) % 360} 80% 58%)`;
}

function TrackLanes() {
  const laneLoops = useMemo(() => {
    const loops: [number, number, number][][] = [];
    for (let lane = 0; lane < LANE_COUNT; lane += 1) {
      const points: [number, number, number][] = [];
      for (let i = 0; i <= 120; i += 1) {
        const p = i / 120;
        const point = trackPoint(p, lane);
        points.push([point.x, 0.01, point.z]);
      }
      loops.push(points);
    }
    return loops;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[44, 32]} />
        <meshStandardMaterial color="#0b1220" />
      </mesh>
      {laneLoops.map((points, idx) => (
        <Line
          key={idx}
          points={points}
          color={idx === 0 ? '#f8fafc' : '#334155'}
          lineWidth={idx === 0 ? 1.8 : 1}
          transparent
          opacity={idx < 2 ? 0.9 : 0.5}
        />
      ))}
    </group>
  );
}

function TeamCar({
  state,
  color,
  highlighted,
  onHover,
  onUnhover,
}: {
  state: TeamState;
  color: string;
  highlighted: boolean;
  onHover: () => void;
  onUnhover: () => void;
}) {
  const crest = useTexture(state.team.crestUrl);

  return (
    <group position={[state.x, state.y, state.z]} rotation={[0, state.heading, 0]}>
      <mesh onPointerOver={onHover} onPointerOut={onUnhover}>
        <boxGeometry args={[0.95, 0.23, 0.5]} />
        <meshStandardMaterial
          color={color}
          emissive={highlighted ? '#ffffff' : '#000000'}
          emissiveIntensity={highlighted ? 0.25 : 0}
        />
      </mesh>

      <mesh position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.36, 0.36]} />
        <meshBasicMaterial map={crest} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function LivingTableLab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [seasonLabel, setSeasonLabel] = useState('PL 2024/25');

  const [playing, setPlaying] = useState(true);
  const [durationSec, setDurationSec] = useState(20);
  const [weekFloat, setWeekFloat] = useState(1);
  const [hoverTeamId, setHoverTeamId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [showPoints, setShowPoints] = useState(true);
  const [showGd, setShowGd] = useState(true);
  const [showForm, setShowForm] = useState(true);

  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  const totalWeeks = useMemo(() => {
    const maxWeek = snapshots.reduce((max, s) => Math.max(max, s.matchweek), 0);
    return Math.max(DEFAULT_SEASON_WEEKS, maxWeek);
  }, [snapshots]);

  useEffect(() => {
    async function load() {
      try {
        const seasons = await fetchSeasons();
        if (!seasons.length) {
          setError('No seasons available.');
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
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (!playing) return;

    function frame(ts: number) {
      if (!lastRef.current) lastRef.current = ts;
      const dt = (ts - lastRef.current) / 1000;
      lastRef.current = ts;

      setWeekFloat((prev) => {
        const advance = (totalWeeks - 1) * (dt / durationSec);
        const next = prev + advance;
        return next > totalWeeks ? 1 : next;
      });

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [playing, durationSec, totalWeeks]);

  const byTeam = useMemo(() => {
    const map = new Map<number, Map<number, Snapshot>>();
    for (const s of snapshots) {
      if (!map.has(s.teamId)) map.set(s.teamId, new Map());
      map.get(s.teamId)!.set(s.matchweek, s);
    }
    return map;
  }, [snapshots]);

  const teamStates = useMemo<TeamState[]>(() => {
    if (!teams.length) return [];

    const weekA = Math.floor(weekFloat);
    const weekB = Math.min(totalWeeks, weekA + 1);
    const weekT = weekFloat - weekA;
    const progress = totalWeeks <= 1 ? 0 : (weekFloat - 1) / (totalWeeks - 1);

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

      const laneA = clampLane(currentA.position);
      const laneB = clampLane(currentB.position);
      const laneFloat = lerp(laneA, laneB, weekT);

      const currentPoint = trackPoint(progress, laneFloat);

      const trajectory: [number, number, number][] = [];
      for (let week = 1; week <= totalWeeks; week += 1) {
        const sw = weekSnapshot(team.id, week, byTeam) ?? currentA;
        const lane = clampLane(sw.position);
        const p = totalWeeks <= 1 ? 0 : (week - 1) / (totalWeeks - 1);
        const pos = trackPoint(p, lane);
        trajectory.push([pos.x, 0.03, pos.z]);
      }

      return {
        team,
        x: currentPoint.x,
        y: 0.16,
        z: currentPoint.z,
        heading: currentPoint.heading,
        snapshot: currentA,
        trajectory,
      };
    });
  }, [teams, byTeam, weekFloat, totalWeeks]);

  const filteredTeams = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return teamStates;
    return teamStates.filter(
      (t) => t.team.name.toLowerCase().includes(q) || t.team.shortName.toLowerCase().includes(q),
    );
  }, [teamStates, search]);

  const hoverTeam = teamStates.find((s) => s.team.id === hoverTeamId) ?? null;
  const colorByTeamId = useMemo(
    () => new Map(teamStates.map((t, idx) => [t.team.id, colorFromIndex(idx)])),
    [teamStates],
  );

  if (loading) return <div className="panel">Loading race-track standings...</div>;
  if (error) return <div className="panel text-red-400">{error}</div>;
  if (!teamStates.length) return <div className="panel">No standings snapshots found.</div>;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_290px]">
      <section className="panel relative h-[72vh] min-h-[560px]">
        <Canvas camera={{ position: [0, 22, 22], fov: 44 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 16, 9]} intensity={1.15} />

          <TrackLanes />

          <Suspense fallback={null}>
            {teamStates.map((state) => {
              const highlighted = hoverTeamId === state.team.id;
              const color = colorByTeamId.get(state.team.id) ?? '#94a3b8';

              return (
                <group key={state.team.id}>
                  <TeamCar
                    state={state}
                    color={color}
                    highlighted={highlighted}
                    onHover={() => setHoverTeamId(state.team.id)}
                    onUnhover={() => setHoverTeamId((prev) => (prev === state.team.id ? null : prev))}
                  />

                  <Line
                    points={state.trajectory}
                    color={highlighted ? '#f8fafc' : '#64748b'}
                    lineWidth={highlighted ? 2.8 : 1}
                    transparent
                    opacity={highlighted ? 1 : 0.25}
                  />
                </group>
              );
            })}
          </Suspense>

          <OrbitControls enablePan={false} maxDistance={48} minDistance={16} />
        </Canvas>

        <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-xs">
          <div>EPL race-track table ({seasonLabel})</div>
          <div>20 lanes: lane 1 is rank #1, lane 20 is rank #20</div>
          <div>Current week: {weekFloat.toFixed(2)}</div>
        </div>

        {hoverTeam && (
          <div className="absolute right-4 top-4 w-56 rounded-lg border border-white/20 bg-slate-900/90 p-3 text-sm">
            <div className="font-semibold">{hoverTeam.team.name}</div>
            <div className="text-xs text-slate-300">MW {Math.floor(weekFloat)}</div>
            <div>Lane: {hoverTeam.snapshot.position}</div>
            {showPoints && <div>Points: {hoverTeam.snapshot.points}</div>}
            {showGd && <div>GD: {hoverTeam.snapshot.gd}</div>}
            {showForm && <div>Form: {hoverTeam.snapshot.form5}</div>}
          </div>
        )}
      </section>

      <aside className="space-y-3">
        <div className="panel space-y-2">
          <div className="control-row">
            <button className="rounded bg-emerald-600 px-3 py-1" onClick={() => setPlaying(true)}>
              Play
            </button>
            <button className="rounded bg-slate-700 px-3 py-1" onClick={() => setPlaying(false)}>
              Pause
            </button>
            <button
              className="rounded bg-slate-700 px-3 py-1"
              onClick={() => {
                setWeekFloat(1);
                setPlaying(false);
              }}
            >
              Restart
            </button>
          </div>

          <label className="block text-xs text-slate-300">
            Speed ({durationSec}s)
            <input
              className="w-full"
              type="range"
              min={5}
              max={60}
              value={durationSec}
              onChange={(e) => setDurationSec(Number(e.target.value))}
            />
          </label>

          <label className="block text-xs text-slate-300">
            Scrub to matchweek ({weekFloat.toFixed(1)})
            <input
              className="w-full"
              type="range"
              min={1}
              max={totalWeeks}
              step={0.1}
              value={weekFloat}
              onChange={(e) => {
                setPlaying(false);
                setWeekFloat(Number(e.target.value));
              }}
            />
          </label>

          <div className="grid grid-cols-1 gap-1 text-xs text-slate-300">
            <label>
              <input type="checkbox" checked={showPoints} onChange={(e) => setShowPoints(e.target.checked)} />
              {' '}Show points
            </label>
            <label>
              <input type="checkbox" checked={showGd} onChange={(e) => setShowGd(e.target.checked)} />
              {' '}Show goal difference
            </label>
            <label>
              <input type="checkbox" checked={showForm} onChange={(e) => setShowForm(e.target.checked)} />
              {' '}Show form (last 5)
            </label>
          </div>
        </div>

        <div className="panel space-y-2">
          <input
            className="w-full rounded border border-white/10 bg-slate-800 px-2 py-1 text-sm"
            placeholder="Search team"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-72 space-y-1 overflow-auto text-sm">
            {filteredTeams.map((state) => (
              <button
                key={state.team.id}
                className="flex w-full items-center gap-2 rounded px-2 py-1 text-left hover:bg-white/10"
                onMouseEnter={() => setHoverTeamId(state.team.id)}
                onMouseLeave={() => setHoverTeamId((prev) => (prev === state.team.id ? null : prev))}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: colorByTeamId.get(state.team.id) ?? '#94a3b8' }}
                />
                <span>{state.team.shortName}</span>
                <span className="ml-auto text-xs text-slate-400">P{state.snapshot.position}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
