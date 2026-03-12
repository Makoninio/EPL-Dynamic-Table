import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import * as THREE from 'three';
import { TOWER_CONFIG } from './config';
import { ChampionshipCameraRig } from './camera-rig';
import { TowerAndRanks } from './tower-ranks';
import { TeamBadgeModule } from './team-badge';

type BadgeState = {
  teamId: number;
  teamName: string;
  shortName: string;
  crestUrl: string;
  rank: number;
  points: number;
  pointsDelta: number;
  form5: string;
  x: number;
  y: number;
  z: number;
  heading: number;
  burst: number;
  trail: [number, number, number][];
  trajectory: [number, number, number][];
};

export function ChampionshipTowerScene({
  teams,
  followLeader,
  selectedTeamId,
  hoverTeamId,
  resetToken,
  orbitEnabled,
  verticalOffset,
  onCanvasPointerDown,
  onCanvasPointerUp,
  onHover,
  onUnhover,
  onSelect,
}: {
  teams: BadgeState[];
  followLeader: boolean;
  selectedTeamId: number | null;
  hoverTeamId: number | null;
  resetToken: number;
  orbitEnabled: boolean;
  verticalOffset: number;
  onCanvasPointerDown: () => void;
  onCanvasPointerUp: () => void;
  onHover: (teamId: number) => void;
  onUnhover: (teamId: number) => void;
  onSelect: (teamId: number) => void;
}) {
  return (
    <Canvas
      shadows
      camera={{ position: [16.4, 8.2, 12], fov: 43 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      onPointerDown={onCanvasPointerDown}
      onPointerUp={onCanvasPointerUp}
      onCreated={({ scene, gl }) => {
        scene.fog = new THREE.Fog('#1e1235', 24, 62);
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMappingExposure = 1.78;
      }}
    >
      <color attach="background" args={['#13001f']} />

      <hemisphereLight args={['#dbeafe', '#1b0930', 0.62]} />
      <ambientLight intensity={0.36} color="#d7ccff" />
      <directionalLight
        position={[15, 20, 10]}
        intensity={2.3}
        color="#eff6ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00022}
        shadow-normalBias={0.018}
      />
      <directionalLight position={[-16, 8, -14]} intensity={1.2} color="#7dd3fc" />
      <pointLight position={[-14, 6, -8]} intensity={0.52} color="#00d4ff" />
      <pointLight position={[0, 5, 0]} intensity={0.4} color="#2d7dff" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -TOWER_CONFIG.towerHeight * 0.5 - 0.22, 0]} receiveShadow>
        <planeGeometry args={[70, 56]} />
        <meshStandardMaterial color="#170429" roughness={0.95} metalness={0.05} />
      </mesh>

      <TowerAndRanks />

      <Suspense fallback={null}>
        {teams.map((state) => {
          const selected = selectedTeamId === state.teamId;
          const hovered = hoverTeamId === state.teamId;
          const showLabel =
            state.rank <= 6 ||
            state.rank >= 18 ||
            selected ||
            hovered;

          return (
            <TeamBadgeModule
              key={state.teamId}
              state={{
                teamId: state.teamId,
                shortName: state.shortName,
                crestUrl: state.crestUrl,
                rank: state.rank,
                points: state.points,
                pointsDelta: state.pointsDelta,
                x: state.x,
                y: state.y,
                z: state.z,
                heading: state.heading,
                burst: state.burst,
                trail: state.trail,
              }}
              selected={selected}
              hovered={hovered}
              showLabel={showLabel}
              onHover={() => onHover(state.teamId)}
              onUnhover={() => onUnhover(state.teamId)}
              onSelect={() => onSelect(state.teamId)}
            />
          );
        })}
      </Suspense>

      <ChampionshipCameraRig
        teams={teams.map((t) => ({
          teamId: t.teamId,
          rank: t.rank,
          x: t.x,
          y: t.y,
          z: t.z,
          heading: t.heading,
          overtakeBurst: t.burst,
        }))}
        followLeader={followLeader}
        selectedTeamId={selectedTeamId}
        resetToken={resetToken}
        orbitEnabled={orbitEnabled}
        verticalOffset={verticalOffset}
      />
    </Canvas>
  );
}
