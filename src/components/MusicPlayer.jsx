import React from "react";
import Visualizer from "./Visualizer";
import Playlist from "./Playlist";

const VOLUME_PRESETS = [0.05, 0.25, 0.5, 0.75, 1];
const VOLUME_ARIA_LABELS = ["5%", "25%", "50%", "75%", "100%"];

function formatTime(time) {
  if (!Number.isFinite(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function MusicPlayer({ tracks, donationMessage }) {
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

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = currentTrack.downloadSrc;
    link.download = currentTrack.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      alert(`Support prompt goes here. ${donationMessage}`);
    }, 500);
  };

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

  return (
    <section id="music" className="section-wrap">
      <div className="section-card music-card">
        <div className="section-title gold">Audio Deck</div>

        <div className="section-body music-layout">
          <div className="music-main music-main-panel">
            <div className="now-playing-box">
              <div className="player-status-strip">
                <span className="music-kicker">Now playing</span>
                <span className="music-kicker">Channel A</span>
              </div>
              <h3 className="music-title">{currentTrack.title}</h3>
              <p className="meta-line music-meta">{currentTrack.artist}</p>
              <span className="now-playing-volume">{Math.round(volume * 100)}%</span>
            </div>

            <Visualizer audioRef={audioRef} />

            <div className="custom-player">
              <audio
                ref={audioRef}
                src={currentTrack.audioSrc}
                crossOrigin="anonymous"
                className="hidden-audio"
              />

              <div className="player-controls-group">
                <div className="player-top-row">
                  <button className="player-main-button" onClick={togglePlay}>
                    {isPlaying ? "Pause" : "Play"}
                  </button>

                  <div className="player-mini-controls">
                    <button className="player-small-button" onClick={handlePrev}>
                      Prev
                    </button>
                    <button className="player-small-button" onClick={handleNext}>
                      Next
                    </button>
                    <button
                      className="player-small-button"
                      onClick={handleDownload}
                    >
                      Download
                    </button>
                  </div>
                </div>

                <div className="top-volume-block">
                  <div className="top-volume-label">VOL.</div>
                  <div
                    ref={volumeScaleRef}
                    className="volume-scale"
                    role="radiogroup"
                    aria-label="Volume"
                    onPointerDown={handleVolumeScalePointerDown}
                  >
                    <div
                      className="volume-knob"
                      aria-hidden="true"
                      onPointerDown={handleVolumeKnobPointerDown}
                      style={{
                        bottom: `${displayedVolumeRatio * 100}%`,
                      }}
                    ></div>
                    <div className="volume-scale-line" aria-hidden="true"></div>
                    {VOLUME_PRESETS.map((_, index) => (
                      <button
                        key={VOLUME_ARIA_LABELS[index]}
                        type="button"
                        className={`volume-step${index === volumeIndex ? " is-active" : ""}`}
                        onClick={() => handleVolumeSelect(index)}
                        role="radio"
                        aria-checked={index === volumeIndex}
                        aria-label={`Set volume to ${VOLUME_ARIA_LABELS[index]}`}
                        style={{
                          bottom: `${(index / (VOLUME_PRESETS.length - 1)) * 100}%`,
                        }}
                      >
                        <span className="volume-step-tick" aria-hidden="true"></span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="player-divider"></div>

                <div className="player-lower-row">
                  <div className="player-progress-block compact-progress-block">
                    <div className="player-time-row">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      step="0.1"
                      value={currentTime}
                      onChange={handleSeek}
                      className="player-progress"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="music-side-panel support-bay">
            <p className="mini-title">Support module</p>

            <div className="support-readout">
              <p className="body-copy">
                If you download the track, you’ll get a small support pop-up
                after the download starts.
              </p>

              <p className="support-line">{donationMessage}</p>
            </div>

            <Playlist
              tracks={tracks}
              currentIndex={currentIndex}
              onSelect={handleSelectTrack}
            />
          </aside>
        </div>
      </div>
    </section>
  );
}
