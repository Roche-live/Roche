export default function Header({ artistName, tagline, logoSrc, logoAlt }) {
  return (
    <header>
      <div className="top-bar">
        <div className="header-brand">
          <div>
            <h1 className="site-title">{artistName} Official Page</h1>
            <p className="site-tagline">{tagline}</p>
            <p className="site-subline">A warm retro home for music, updates, and direct connection.</p>
          </div>

          <div className="logo-slot">
            {logoSrc ? (
              <img src={logoSrc} alt={logoAlt || `${artistName} logo`} className="logo-image" />
            ) : (
              <span>Your Logo</span>
            )}
          </div>
        </div>

        <div className="update-box">
          last updated
          <br />
          march 1999 style
        </div>
      </div>

      <nav className="nav-bar">
        <a href="#about">About</a>
        <a href="#music">Music</a>
        <a href="#socials">Socials</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
}
