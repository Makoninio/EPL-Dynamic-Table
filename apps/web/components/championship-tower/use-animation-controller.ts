import { useEffect, useMemo, useRef, useState } from 'react';
import { TOWER_CONFIG } from './config';

type UseAnimationControllerArgs = {
  totalWeeks: number;
};

export function useAnimationController({ totalWeeks }: UseAnimationControllerArgs) {
  const [playing, setPlaying] = useState(true);
  const [durationSec, setDurationSec] = useState(TOWER_CONFIG.animation.durationSec);
  const [weekFloat, setWeekFloat] = useState(1);

  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  const progress = useMemo(() => {
    if (totalWeeks <= 1) return 0;
    return (weekFloat - 1) / (totalWeeks - 1);
  }, [weekFloat, totalWeeks]);

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

  function stepWeek(delta: number) {
    setPlaying(false);
    setWeekFloat((prev) => Math.min(totalWeeks, Math.max(1, prev + delta)));
  }

  function resetTimeline() {
    setPlaying(false);
    setWeekFloat(1);
  }

  return {
    playing,
    setPlaying,
    durationSec,
    setDurationSec,
    weekFloat,
    setWeekFloat,
    progress,
    stepWeek,
    resetTimeline,
  };
}
