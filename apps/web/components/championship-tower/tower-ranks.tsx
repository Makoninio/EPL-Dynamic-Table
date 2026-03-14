import { Line } from '@react-three/drei';
import { useMemo } from 'react';
import { TOWER_CONFIG, rankToHeight, zoneColor } from './config';

function ringPoints(y: number, radius: number, segments = 96) {
  const points: [number, number, number][] = [];
  for (let i = 0; i <= segments; i += 1) {
    const t = (i / segments) * Math.PI * 2;
    points.push([Math.cos(t) * radius, y, Math.sin(t) * radius]);
  }
  return points;
}

function rankBandColor(rank: number) {
  return zoneColor(rank);
}

export function TowerAndRanks() {
  const rankRings = useMemo(() => {
    const rings: Array<{ rank: number; points: [number, number, number][]; color: string }> = [];
    for (let rank = 1; rank <= TOWER_CONFIG.rankCount; rank += 1) {
      rings.push({
        rank,
        points: ringPoints(rankToHeight(rank), TOWER_CONFIG.radiusFromTower - 1.15),
        color: rankBandColor(rank),
      });
    }
    return rings;
  }, []);

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[TOWER_CONFIG.towerRadius, TOWER_CONFIG.towerRadius, TOWER_CONFIG.towerHeight, 48]} />
        <meshStandardMaterial color="#2f2050" roughness={0.6} metalness={0.28} emissive="#160a2d" emissiveIntensity={0.45} />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[TOWER_CONFIG.towerRadius + 0.04, TOWER_CONFIG.towerRadius + 0.04, TOWER_CONFIG.towerHeight + 0.2, 48]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.11} toneMapped={false} />
      </mesh>

      {[-1.2, 0, 1.2].map((angle) => (
        <mesh key={angle} position={[Math.cos(angle) * (TOWER_CONFIG.towerRadius + 0.06), 0, Math.sin(angle) * (TOWER_CONFIG.towerRadius + 0.06)]} rotation={[0, angle, 0]}>
          <boxGeometry args={[0.08, TOWER_CONFIG.towerHeight, 0.2]} />
          <meshBasicMaterial color="#2d7dff" transparent opacity={0.5} toneMapped={false} />
        </mesh>
      ))}

      {rankRings.map((ring) => (
        <group key={ring.rank}>
          <Line
            points={ring.points}
            color={ring.color}
            lineWidth={ring.rank <= 4 || ring.rank >= 18 ? 2.2 : 1.2}
            transparent
            opacity={ring.rank <= 4 || ring.rank >= 18 ? 0.95 : 0.45}
          />
          <mesh position={[0, rankToHeight(ring.rank), 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[TOWER_CONFIG.towerRadius + 0.2, TOWER_CONFIG.radiusFromTower - 1.05, 80]} />
            <meshBasicMaterial color={ring.color} transparent opacity={ring.rank <= 4 || ring.rank >= 18 ? 0.07 : 0.035} toneMapped={false} />
          </mesh>
        </group>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -TOWER_CONFIG.towerHeight * 0.5 - 0.2, 0]} receiveShadow>
        <circleGeometry args={[16, 64]} />
        <meshStandardMaterial color="#140824" roughness={0.9} metalness={0.08} />
      </mesh>
    </group>
  );
}
