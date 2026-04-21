export default function Socials({ socials }) {
  return (
    <section id="socials" className="section-wrap">
      <div className="section-card utility-card socials-card">
        <div className="section-title teal">Socials</div>
        <div className="section-body socials-grid">
          {socials.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="social-card"
            >
              <div className="social-label">{item.label}</div>
              <div className="social-link">{item.href}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
