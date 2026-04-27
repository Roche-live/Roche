import Visualizer from "./Visualizer";
import Playlist from "./Playlist";
import { VOLUME_ARIA_LABELS, VOLUME_PRESETS } from "../hooks/useAudioDeck";

function formatTime(time) {
  if (!Number.isFinite(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function MusicPlayer({ tracks, donationMessage, audioDeck }) {
  const {
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
  } = audioDeck;

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

  return (
    <section id="music" className="section-wrap">
      <div className="section-card music-card">
        <div className="section-title gold">Audio Deck</div>

        <div className="section-body music-layout">
          <div className="music-visualizer-panel">
            <Visualizer audioRef={audioRef} />
          </div>

          <div className="now-playing-box">
            <div className="player-status-strip">
              <span className="music-kicker">Now playing</span>
              <span className="music-kicker">Channel A</span>
            </div>
            <div className="now-playing-track-stack">
              <div className="now-playing-row">
                <h3 className="music-title">{currentTrack.title}</h3>
                <div className="song-image-window">
                  <img
                    src={currentTrack.image || "/images/default-song-image.jpg"}
                    alt={`${currentTrack.title} visual`}
                    className="song-image"
                  />
                </div>
              </div>
              <p className="meta-line music-meta">{currentTrack.artist}</p>
            </div>
          </div>

          <aside className="music-side-panel support-bay">
            <Playlist
              tracks={tracks}
              currentIndex={currentIndex}
              onSelect={handleSelectTrack}
            />
          </aside>

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
      </div>
    </section>
  );
}
