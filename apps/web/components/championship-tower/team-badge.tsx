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
  const crestPath =
    state.crestUrl === '/crests/liv.svg' || state.crestUrl.endsWith('/crests/liv.svg')
      ? '/crests/liv.svg'
      : state.crestUrl;
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

      <RoundedBox args={[1.08, 0.34, 0.54]} radius={0.08} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color="#7e90b4" metalness={0.56} roughness={0.24} emissive="#111833" emissiveIntensity={0.16} />
      </RoundedBox>

      <RoundedBox args={[1.24, 0.42, 0.68]} radius={0.1} smoothness={2}>
        <meshBasicMaterial color={glow} transparent opacity={glowOpacity} toneMapped={false} />
      </RoundedBox>

      <Billboard position={[0, 0.42, 0]}>
        <mesh position={[0, -0.008, -0.003]}>
          <planeGeometry args={[0.64, 0.64]} />
          <meshBasicMaterial color="#0f1122" transparent opacity={0.75} toneMapped={false} />
        </mesh>
        <mesh>
          <planeGeometry args={[0.56, 0.56]} />
          <meshBasicMaterial map={crest} transparent toneMapped={false} />
        </mesh>
      </Billboard>

      <mesh position={[0, -0.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.24, 0.58, 24]} />
        <meshStandardMaterial
          color={glow}
          emissive={glow}
          emissiveIntensity={selected ? 0.95 : hovered ? 0.8 : 0.65}
          transparent
          opacity={selected ? 0.54 : 0.38}
        />
      </mesh>

      <pointLight
        position={[0, 0.14, 0]}
        color={glow}
        intensity={selected ? 0.82 : hovered ? 0.56 : 0.32}
        distance={3.2}
        decay={2}
      />

      {showLabel && (
        <Billboard position={[0, 0.95, 0]}>
          <RoundedBox args={[1.28, 0.28, 0.04]} radius={0.07} smoothness={2}>
            <meshStandardMaterial color="#2b0040" emissive="#2d7dff" emissiveIntensity={0.18} />
          </RoundedBox>
          <Text fontSize={0.11} color="#ffffff" anchorX="center" anchorY="middle" position={[0, 0, 0.03]}>
            {`${state.shortName}  #${state.rank}`}
          </Text>
        </Billboard>
      )}
    </group>
  );
}
