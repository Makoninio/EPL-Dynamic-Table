import { Billboard, Line, RoundedBox, Text, useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { zoneColor, zoneGlowBase } from './config';

type BadgeState = {
  teamId: number;
  shortName: string;
  crestUrl: string;
  rank: number;
  points: number;
  pointsDelta: number;
  x: number;
  y: number;
  z: number;
  heading: number;
  burst: number;
  trail: [number, number, number][];
};

function normalizeCrestPath(path: string) {
  if (path.startsWith('/crests/')) {
    return path.replace(/\.(jpg|jpeg|png)$/i, '.svg');
  }
  return path;
}

export function TeamBadgeModule({
  state,
  selected,
  hovered,
  showLabel,
  onHover,
  onUnhover,
  onSelect,
}: {
  state: BadgeState;
  selected: boolean;
  hovered: boolean;
  showLabel: boolean;
  onHover: () => void;
  onUnhover: () => void;
  onSelect: () => void;
}) {
  const crestPath = normalizeCrestPath(state.crestUrl);
  const crest = useTexture(crestPath);
  const { gl } = useThree();

  useEffect(() => {
    crest.anisotropy = gl.capabilities.getMaxAnisotropy();
    crest.needsUpdate = true;
  }, [crest, gl]);

  const glow = zoneColor(state.rank);
  const glowBase = zoneGlowBase(state.rank);
  const glowOpacity = Math.min(0.98, glowBase + (selected ? 0.24 : hovered ? 0.14 : 0) + state.burst * 0.18);
  const scale = selected ? 1.12 : hovered ? 1.06 : 1;

  return (
    <group
      position={[state.x, state.y, state.z]}
      rotation={[0, state.heading, 0]}
      scale={scale}
      onPointerOver={onHover}
      onPointerOut={onUnhover}
      onClick={onSelect}
    >
      <Line points={state.trail} color="#9dd8ff" lineWidth={1.4} transparent opacity={0.42 + state.burst * 0.35} />

      <mesh position={[0, -0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.46, 32]} />
        <meshBasicMaterial color={glow} transparent opacity={0.3 + state.burst * 0.18} toneMapped={false} />
      </mesh>

      <Billboard position={[0, 0.34, 0]}>
        <mesh position={[0, 0, -0.01]}>
          <circleGeometry args={[0.38, 48]} />
          <meshBasicMaterial color={glow} transparent opacity={0.18 + glowOpacity * 0.22} toneMapped={false} />
        </mesh>
        <mesh>
          <planeGeometry args={[0.52, 0.52]} />
          <meshBasicMaterial map={crest} transparent toneMapped={false} />
        </mesh>
      </Billboard>

      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.12, 0.34, 24]} />
        <meshStandardMaterial
          color={glow}
          emissive={glow}
          emissiveIntensity={selected ? 1 : hovered ? 0.82 : 0.58}
          transparent
          opacity={selected ? 0.48 : 0.3}
        />
      </mesh>

      <pointLight
        position={[0, 0.2, 0]}
        color={glow}
        intensity={selected ? 0.74 : hovered ? 0.48 : 0.24}
        distance={2.4}
        decay={2}
      />

      {showLabel && (
        <Billboard position={[0, 0.82, 0]}>
          <RoundedBox args={[1.04, 0.22, 0.03]} radius={0.06} smoothness={2}>
            <meshStandardMaterial color="#2136b9" emissive="#2d7dff" emissiveIntensity={0.1} />
          </RoundedBox>
          <Text fontSize={0.095} color="#ffffff" anchorX="center" anchorY="middle" position={[0, 0, 0.025]}>
            {`${state.shortName}  #${state.rank}`}
          </Text>
        </Billboard>
      )}
    </group>
  );
}
