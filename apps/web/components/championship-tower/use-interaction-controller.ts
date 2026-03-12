import { useEffect, useState } from 'react';

type UseInteractionControllerArgs = {
  setPlaying: (value: boolean | ((prev: boolean) => boolean)) => void;
  stepWeek: (delta: number) => void;
};

export function useInteractionController({ setPlaying, stepWeek }: UseInteractionControllerArgs) {
  const [hoverTeamId, setHoverTeamId] = useState<number | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [followLeader, setFollowLeader] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [towerYOffset, setTowerYOffset] = useState(0);
  const [showBroadcastHud, setShowBroadcastHud] = useState(true);

  function nudgeTowerYOffset(delta: number) {
    setTowerYOffset((prev) => Math.max(-10, Math.min(10, prev + delta)));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault();
        setPlaying((p) => !p);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepWeek(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepWeek(1);
      }
      if (e.key.toLowerCase() === 'f') {
        setFollowLeader((v) => !v);
      }
      if (e.key.toLowerCase() === 'r') {
        setSelectedTeamId(null);
        setFollowLeader(false);
        setTowerYOffset(0);
        setResetToken((n) => n + 1);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        nudgeTowerYOffset(0.8);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        nudgeTowerYOffset(-0.8);
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPlaying, stepWeek]);

  return {
    hoverTeamId,
    setHoverTeamId,
    selectedTeamId,
    setSelectedTeamId,
    followLeader,
    setFollowLeader,
    resetToken,
    setResetToken,
    isUserInteracting,
    setIsUserInteracting,
    towerYOffset,
    setTowerYOffset,
    nudgeTowerYOffset,
    showBroadcastHud,
    setShowBroadcastHud,
  };
}
