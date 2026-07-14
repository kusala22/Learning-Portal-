import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook implementing screenshot/recording deterrent mechanisms.
 * Note: Browsers cannot completely prevent screenshots or screen recording.
 * These are deterrent mechanisms to discourage unauthorized capture.
 */
const useVideoProtection = ({ playerRef, setIsBlurred }) => {
  const detectionIntervalRef = useRef(null);

  // Blur video when tab loses focus
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'hidden') {
      setIsBlurred(true);
      // Pause video
      if (playerRef.current) {
        playerRef.current.getInternalPlayer()?.pause?.();
      }
    } else {
      setIsBlurred(false);
    }
  }, [playerRef, setIsBlurred]);

  // Blur when window loses focus
  const handleWindowBlur = useCallback(() => {
    setIsBlurred(true);
  }, [setIsBlurred]);

  const handleWindowFocus = useCallback(() => {
    setIsBlurred(false);
  }, [setIsBlurred]);

  // Detect devtools (basic heuristic)
  const detectDevTools = useCallback(() => {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;
    if (widthDiff || heightDiff) {
      setIsBlurred(true);
    }
  }, [setIsBlurred]);

  // Disable right-click on video
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    return false;
  }, []);

  // Prevent keyboard shortcuts for copying/screenshotting
  const handleKeyDown = useCallback((e) => {
    // Block PrintScreen
    if (e.key === 'PrintScreen') {
      e.preventDefault();
      setIsBlurred(true);
      setTimeout(() => setIsBlurred(false), 1000);
    }
    // Block Ctrl+Shift+I (devtools), Ctrl+U (source), Ctrl+S (save)
    if (e.ctrlKey && ['u', 's', 'p'].includes(e.key.toLowerCase())) {
      e.preventDefault();
    }
    // Block F12
    if (e.key === 'F12') {
      e.preventDefault();
    }
  }, [setIsBlurred]);

  // Attempt to detect screen sharing (best effort)
  const detectScreenShare = useCallback(async () => {
    // This is a best-effort detection - not 100% reliable
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        // Check for virtual display devices that might indicate screen capture
        const hasVirtualDisplay = devices.some(
          (d) => d.label.toLowerCase().includes('virtual') || d.label.toLowerCase().includes('obs')
        );
        if (hasVirtualDisplay) {
          setIsBlurred(true);
        }
      }
    } catch {
      // Ignore errors - permission may be denied
    }
  }, [setIsBlurred]);

  useEffect(() => {
    // Register event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Periodically check for devtools
    detectionIntervalRef.current = setInterval(detectDevTools, 1000);

    // Initial screen share check
    detectScreenShare();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    };
  }, [handleVisibilityChange, handleWindowBlur, handleWindowFocus, handleContextMenu, handleKeyDown, detectDevTools, detectScreenShare]);
};

export default useVideoProtection;
