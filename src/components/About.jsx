export default function About({ text, artistName, status }) {
  return (
    <section id="about" className="section-wrap">
      <div className="about-row">
        <div className="box photo-box about-photo-box">
          <div className="photo-placeholder">Artist Photo</div>
          <p className="sidebar-name">{artistName}</p>
          <p className="sidebar-status">{status}</p>
        </div>

        <div className="section-card intro-card">
          <div className="section-title purple">Welcome</div>
          <div className="section-body intro-body">
            <p className="intro-kicker">Architect notes</p>
            <p className="intro-text">
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
      </div>
    </section>
  );
}
