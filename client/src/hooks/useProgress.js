import { useState, useEffect, useRef, useCallback } from 'react';
import { progressService } from '../services/progressService';

/**
 * Hook to manage video watch progress with periodic auto-save
 */
const useProgress = (videoId) => {
  const [progress, setProgress] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const saveTimerRef = useRef(null);
  const lastSavedTimeRef = useRef(0);

  // Fetch existing progress
  useEffect(() => {
    if (!videoId) return;
    const fetchProgress = async () => {
      try {
        const { data } = await progressService.getProgress(videoId);
        setProgress(data.progress);
      } catch {
        setProgress(null);
      } finally {
        setLoadingProgress(false);
      }
    };
    fetchProgress();
  }, [videoId]);

  // Save progress (debounced)
  const saveProgress = useCallback(
    async (currentTime, totalDuration) => {
      if (!videoId || Math.abs(currentTime - lastSavedTimeRef.current) < 5) return;
      lastSavedTimeRef.current = currentTime;

      const percentage = totalDuration > 0 ? Math.round((currentTime / totalDuration) * 100) : 0;

      try {
        const { data } = await progressService.saveProgress({
          videoId,
          lastWatchedTime: currentTime,
          progressPercentage: percentage,
          totalDuration,
        });
        setProgress(data.progress);
      } catch {
        // Fail silently for progress saves
      }
    },
    [videoId]
  );

  // Auto-save progress every 10 seconds
  const startAutoSave = useCallback(
    (getCurrentTime, getTotalDuration) => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
      saveTimerRef.current = setInterval(() => {
        const currentTime = getCurrentTime();
        const totalDuration = getTotalDuration();
        if (currentTime > 0) saveProgress(currentTime, totalDuration);
      }, 10000);
    },
    [saveProgress]
  );

  const stopAutoSave = useCallback(() => {
    if (saveTimerRef.current) clearInterval(saveTimerRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
    };
  }, []);

  return { progress, loadingProgress, saveProgress, startAutoSave, stopAutoSave };
};

export default useProgress;
