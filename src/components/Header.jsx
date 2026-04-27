export default function Header({ artistName, tagline }) {
  return (
    <header className="site-header">
      <div className="top-bar">
        <div className="header-rail">
          <div className="header-rail-box">
            <span className="header-rail-label">Input</span>
            <strong className="header-rail-value">A01</strong>
          </div>

          <div className="header-rail-box">
            <span className="header-rail-label">Mode</span>
            <strong className="header-rail-value">Live</strong>
          </div>

          <div className="header-rail-box header-rail-box-wide">
            <span className="header-rail-label">Signal</span>
            <span className="header-rail-text">Portable sound unit</span>
          </div>
        </div>

        <div className="header-brand">
          <div className="header-copy">
            <p className="display-caption">Portable sound unit</p>
            <div className="title-block">
              <h1 className="site-title">{artistName}</h1>
            </div>
            {tagline ? <p className="site-subline">{tagline}</p> : null}
          </div>

          <div className="logo-slot">
            <span>Display Module</span>
          </div>

          <div className="update-box">
            <span className="update-label">system update</span>
            <strong>patch 5.1.2026</strong>
          </div>
        </div>
      </div>

      <nav className="nav-bar">
        <div className="nav-panel-label">
          <span className="nav-panel-title">Site Index</span>
          <span className="nav-panel-subtitle">control strip</span>
        </div>

        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#music">Music</a>
          <a href="#socials">Socials</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>
    </header>
  );
}
