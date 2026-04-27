export default function Sidebar({ audioDeck }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-shell">
        <p className="sidebar-panel-label">Side module</p>

        <div id="about" className="box compact-box sidebar-welcome-box">
          <div className="box-title purple">Welcome</div>
          <div className="box-body compact-body sidebar-intro-body">
            <p className="intro-kicker">Architect notes</p>
            <p className="intro-text sidebar-intro-text architect-text">
              It started with the music.
              <br />
              After that, everything began to connect.
              <br />
              Not by design at first—but it held.
              <br />
              Now it’s being built that way.
              <br />
              Nothing stands alone.
              <br />
              The surface is only part of it.
            </p>
          </div>
        </div>

        <div className="box compact-box sidebar-connect-box">
          <div className="box-title red">Connect</div>
          <div className="box-body compact-body sidebar-connect-grid">
            <a href="#" className="sidebar-connect-link">Instagram</a>
            <a href="#" className="sidebar-connect-link">TikTok</a>
            <a href="#" className="sidebar-connect-link">X</a>
            <a href="#" className="sidebar-connect-link">Facebook</a>
          </div>
        </div>

        <div className="box compact-box sidebar-listen-box">
          <div className="box-title red">Listen</div>
          <div className="box-body compact-body sidebar-link-grid">
            <a href="#" className="sidebar-link-button">Spotify</a>
            <a href="#" className="sidebar-link-button">Apple Music</a>
            <a href="#" className="sidebar-link-button">YouTube</a>
            <a href="#" className="sidebar-link-button">Web3</a>
          </div>
        </div>

        <div className="box compact-box sidebar-music-control-box">
          <div className="box-title green">MUSIC CONTROL</div>
          <div className="box-body compact-body sidebar-music-controls">
            <button
              type="button"
              className="sidebar-music-button"
              onClick={audioDeck.handlePrev}
            >
              Back
            </button>
            <button
              type="button"
              className="sidebar-music-button"
              onClick={audioDeck.togglePlay}
              aria-label={audioDeck.isPlaying ? "Pause current track" : "Play current track"}
            >
              {audioDeck.isPlaying ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              className="sidebar-music-button"
              onClick={audioDeck.handleNext}
            >
              Next
            </button>
          </div>
        </div>

        <div className="box compact-box system-notes">
          <div className="box-title gray system-notes-title">SYSTEM NOTES</div>
          <div className="box-body compact-body system-notes-content">
            Patch Update 1.5.26
          </div>
        </div>

      </div>
    </aside>
  );
}
