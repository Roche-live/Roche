export default function Sidebar({ artistName, status, donationMessage }) {
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
          <div className="box-title green">Support</div>
          <div className="box-body compact-body">
            <p className="mini-title">Support module</p>

            <div className="support-readout">
              <p className="body-copy">
                If you download the track, you’ll get a small support pop-up
                after the download starts.
              </p>

              <p className="support-line">{donationMessage}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
