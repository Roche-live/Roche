import React from "react";

export const VOLUME_PRESETS = [0.05, 0.25, 0.5, 0.75, 1];
export const VOLUME_ARIA_LABELS = ["5%", "25%", "50%", "75%", "100%"];

export function useAudioDeck(tracks) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volumeIndex, setVolumeIndex] = React.useState(3);
  const [dragVolumeRatio, setDragVolumeRatio] = React.useState(null);

  const audioRef = React.useRef(null);
  const volumeScaleRef = React.useRef(null);
  const activePointerIdRef = React.useRef(null);

  const currentTrack = tracks[currentIndex];
  const volume = VOLUME_PRESETS[volumeIndex];

  const handleSelectTrack = (index) => {
    setCurrentIndex(index);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? tracks.length - 1 : prev - 1));
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === tracks.length - 1 ? 0 : prev + 1));
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (event) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Number(event.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeSelect = (newVolumeIndex) => {
    const audio = audioRef.current;
    const newVolume = VOLUME_PRESETS[newVolumeIndex];

    setVolumeIndex(newVolumeIndex);

    if (audio) {
      audio.volume = newVolume;
    }
  };

  const getVolumeRatioFromClientY = React.useCallback((clientY) => {
    const scale = volumeScaleRef.current;
    if (!scale) return volumeIndex / (VOLUME_PRESETS.length - 1);

    const rect = scale.getBoundingClientRect();
    const clampedY = Math.min(Math.max(clientY, rect.top), rect.bottom);
    const offsetFromBottom = rect.bottom - clampedY;
    const rawRatio = offsetFromBottom / rect.height;

    return Math.min(1, Math.max(0, rawRatio));
  }, [volumeIndex]);

  const getNearestVolumeIndex = React.useCallback((ratio) => {
    const maxIndex = VOLUME_PRESETS.length - 1;
    return Math.round(Math.min(1, Math.max(0, ratio)) * maxIndex);
  }, []);

  const beginVolumeDrag = (clientY, pointerId) => {
    activePointerIdRef.current = pointerId;
    setDragVolumeRatio(getVolumeRatioFromClientY(clientY));
  };

  const handleVolumeKnobPointerDown = (event) => {
    event.preventDefault();
    beginVolumeDrag(event.clientY, event.pointerId);
  };

  const handleVolumeScalePointerDown = (event) => {
    if (event.target.closest(".volume-step")) return;

    event.preventDefault();
    const ratio = getVolumeRatioFromClientY(event.clientY);
    beginVolumeDrag(event.clientY, event.pointerId);
    handleVolumeSelect(getNearestVolumeIndex(ratio));
  };

  React.useEffect(() => {
    if (dragVolumeRatio === null) return undefined;

    const handlePointerMove = (event) => {
      if (event.pointerId !== activePointerIdRef.current) return;

      event.preventDefault();
      setDragVolumeRatio(getVolumeRatioFromClientY(event.clientY));
    };

    const finishDrag = (event) => {
      if (event.pointerId !== activePointerIdRef.current) return;

      const ratio = getVolumeRatioFromClientY(event.clientY);
      handleVolumeSelect(getNearestVolumeIndex(ratio));
      setDragVolumeRatio(null);
      activePointerIdRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    };
  }, [dragVolumeRatio, getNearestVolumeIndex, getVolumeRatioFromClientY]);

  const displayedVolumeRatio =
    dragVolumeRatio ?? volumeIndex / (VOLUME_PRESETS.length - 1);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.load();

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentIndex((prev) => (prev === tracks.length - 1 ? 0 : prev + 1));
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentIndex, tracks.length]);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  return {
    audioRef,
    volumeScaleRef,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volumeIndex,
    currentTrack,
    displayedVolumeRatio,
    handleSelectTrack,
    handlePrev,
    handleNext,
    togglePlay,
    handleSeek,
    handleVolumeSelect,
    handleVolumeKnobPointerDown,
    handleVolumeScalePointerDown,
  };
}
