import { useState, useRef, useCallback, useEffect } from 'react';

const useBinauralBeat = () => {
  const audioContext = useRef(null);
  const masterGain = useRef(null);
  const leftChannel = useRef(null);
  const rightChannel = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const animationFrameId = useRef(null);
  const sessionStartTime = useRef(null);
  const segmentsRef = useRef([]);
  const timeAtPause = useRef(0);
  const audioScheduled = useRef(false);

  const cleanup = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (audioContext.current && audioContext.current.state !== 'closed') {
      audioContext.current.close().catch(e => console.error("Error closing AudioContext:", e));
    }
    audioContext.current = null;
    audioScheduled.current = false;
    setIsPlaying(false);
    setCurrentTime(0);
    setTotalDuration(0);
    timeAtPause.current = 0;
    sessionStartTime.current = null;
  }, []);

  const createAudioContext = useCallback(() => {
    if (!audioContext.current || audioContext.current.state === 'closed') {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      masterGain.current = audioContext.current.createGain();
      masterGain.current.connect(audioContext.current.destination);
    }
  }, []);
  
  const scheduleSegments = useCallback((segments) => {
    if (!audioContext.current || audioScheduled.current) return;

    leftChannel.current = audioContext.current.createOscillator();
    rightChannel.current = audioContext.current.createOscillator();
    leftChannel.current.type = 'sine';
    rightChannel.current.type = 'sine';
    leftChannel.current.connect(masterGain.current);
    rightChannel.current.connect(masterGain.current);

    let startTime = audioContext.current.currentTime;
    const baseFreq = 147;

    segments.forEach(segment => {
      const duration = segment.duration;
      const startBeat = segment.text.includes("Theta") ? 6 : segment.text.includes("Alfa") ? 10 : 15;
      
      leftChannel.current.frequency.setValueAtTime(baseFreq - startBeat / 2, startTime);
      rightChannel.current.frequency.setValueAtTime(baseFreq + startBeat / 2, startTime);
      
      startTime += duration;
    });

    leftChannel.current.start(audioContext.current.currentTime);
    rightChannel.current.start(audioContext.current.currentTime);
    audioScheduled.current = true;
  }, []);

  const pause = useCallback(() => {
    if (!audioContext.current || !isPlaying) return;
    audioContext.current.suspend().then(() => {
      timeAtPause.current = currentTime;
      setIsPlaying(false);
      if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
      }
    });
  }, [currentTime, isPlaying]);

  const stop = useCallback(() => {
    if (!audioContext.current) return;
    setIsPlaying(false);
    cleanup();
  }, [cleanup]);

  const updateFrequencies = useCallback(() => {
    if (!isPlaying || !audioContext.current || sessionStartTime.current === null) {
      return;
    }

    const elapsed = timeAtPause.current + (audioContext.current.currentTime - sessionStartTime.current);
    setCurrentTime(elapsed);

    if (elapsed >= totalDuration) {
      return;
    }

    animationFrameId.current = requestAnimationFrame(updateFrequencies);
  }, [isPlaying, totalDuration]);

  const play = useCallback((segments, durationInSeconds) => {
    if (isPlaying) return;
    
    createAudioContext();
    
    audioContext.current.resume().then(() => {
        if (segments && segmentsRef.current !== segments) {
            segmentsRef.current = segments;
            setTotalDuration(durationInSeconds);
            setCurrentTime(0);
            timeAtPause.current = 0;
            audioScheduled.current = false;
        }
        
        scheduleSegments(segmentsRef.current);
        sessionStartTime.current = audioContext.current.currentTime - timeAtPause.current;
        setIsPlaying(true);
    });
  }, [createAudioContext, isPlaying, scheduleSegments]);

  useEffect(() => {
    if (isPlaying) {
      animationFrameId.current = requestAnimationFrame(updateFrequencies);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [isPlaying, updateFrequencies]);

  const setVolume = useCallback((volume) => {
    if (masterGain.current && audioContext.current) {
      masterGain.current.gain.setValueAtTime(volume, audioContext.current.currentTime);
    }
  }, []);

  return { play, pause, stop, isPlaying, setVolume, currentTime, totalDuration, cleanup };
};

export default useBinauralBeat;