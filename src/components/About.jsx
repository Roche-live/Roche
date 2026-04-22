export default function About({ text }) {
  return (
    <section id="about" className="section-wrap">
      <div className="section-card intro-card">
        <div className="section-title purple">Welcome</div>
        <div className="section-body intro-body">
          <p className="intro-kicker">Architect notes</p>
          <p className="intro-text">
            It started with the music.
            <br />
            <br />
            After that, everything began to connect.
            <br />
            Not by design at first—but it held.
            <br />
            <br />
            Now it’s being built that way.
            <br />
            Nothing stands alone.
            <br />
            <br />
            The surface is only part of it.
          </p>
        </div>
      </div>
    </section>
  );
}
