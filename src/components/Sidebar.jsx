export default function Sidebar({ artistName, status }) {
  const sidebarSocials = [
    { label: "Instagram", href: "https://example.com/instagram", src: "/social-instagram.svg" },
    { label: "YouTube", href: "https://example.com/youtube", src: "/social-youtube.svg" },
    { label: "Bandcamp", href: "https://example.com/bandcamp", src: "/social-bandcamp.svg" },
    { label: "TikTok", href: "https://example.com/tiktok", src: "/social-tiktok.svg" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-shell">
        <p className="sidebar-panel-label">Side module</p>

        <div className="box photo-box">
          <div className="photo-placeholder">Artist Photo</div>
          <p className="sidebar-name">{artistName}</p>
          <p className="sidebar-status">{status}</p>
        </div>

        <div className="box compact-box">
          <div className="box-title red">Connect</div>
          <div className="box-body compact-body social-sidebar-grid">
            {sidebarSocials.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="social-sidebar-link"
                aria-label={item.label}
                title={item.label}
              >
                <img src={item.src} alt={item.label} className="social-sidebar-image" />
              </a>
            ))}
          </div>
        </div>

        <div className="box compact-box">
          <div className="box-title green">Quick Links</div>
          <div className="box-body compact-body links-list">
            <a href="#music">Listen now</a>
            <a href="#about">Read more</a>
            <a href="#socials">Find me online</a>
            <a href="#contact">Send a message</a>
          </div>
        </div>
      </div>
    </aside>
  );
}
