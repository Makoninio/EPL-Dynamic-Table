import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { TOWER_CONFIG } from './config';

type CameraTarget = {
  teamId: number;
  rank: number;
  x: number;
  y: number;
  z: number;
  heading: number;
  overtakeBurst: number;
};

export function ChampionshipCameraRig({
  teams,
  followLeader,
  selectedTeamId,
  resetToken,
  orbitEnabled,
  verticalOffset,
}: {
  teams: CameraTarget[];
  followLeader: boolean;
  selectedTeamId: number | null;
  resetToken: number;
  orbitEnabled: boolean;
  verticalOffset: number;
}) {
  const { camera } = useThree();
  const orbitRef = useRef(0);
  const lookAtRef = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    orbitRef.current = 0;
  }, [resetToken]);

  useFrame((_, dt) => {
    if (orbitEnabled) {
      orbitRef.current += dt * TOWER_CONFIG.camera.orbitSpeed;
    }

    const leader = [...teams].sort((a, b) => a.rank - b.rank)[0] ?? null;
    const selected = teams.find((t) => t.teamId === selectedTeamId) ?? null;
    const focus = selected ?? (followLeader ? leader : null);

    const targetLook = new THREE.Vector3();
    const targetCam = new THREE.Vector3();

    if (focus) {
      targetLook.set(focus.x, focus.y + verticalOffset, focus.z);
      const nudge = focus.overtakeBurst * 0.6;
      targetCam.set(
        focus.x + Math.sin(focus.heading + Math.PI) * (TOWER_CONFIG.camera.selectionDistance + nudge),
        focus.y + TOWER_CONFIG.camera.selectionHeight + verticalOffset,
        focus.z + Math.cos(focus.heading + Math.PI) * (TOWER_CONFIG.camera.selectionDistance + nudge),
      );

      if (followLeader && !selected) {
        targetCam.y = Math.max(targetCam.y, focus.y + TOWER_CONFIG.camera.followTopHeightOffset);
      }
    } else {
      targetLook.set(0, verticalOffset, 0);
      targetCam.set(
        Math.cos(orbitRef.current) * (TOWER_CONFIG.camera.baseDistance + TOWER_CONFIG.camera.orbitAmplitudeX),
        TOWER_CONFIG.camera.baseHeight + Math.sin(orbitRef.current * 0.6) * 0.4 + verticalOffset,
        Math.sin(orbitRef.current) * (TOWER_CONFIG.camera.baseDistance - TOWER_CONFIG.camera.orbitAmplitudeZ),
      );
    }

    camera.position.lerp(targetCam, 0.06);
    lookAtRef.current.lerp(targetLook, 0.09);
    camera.lookAt(lookAtRef.current);
  });

  return null;
}
