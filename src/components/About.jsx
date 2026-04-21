export default function About({ text }) {
  return (
    <section id="about" className="section-wrap">
      <div className="section-card intro-card">
        <div className="section-title purple">Welcome</div>
        <div className="section-body intro-body">
          <p className="intro-kicker">Artist notes</p>
          <p className="intro-text">{text}</p>
        </div>
      </div>
    </section>
  );
}
