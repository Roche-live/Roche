export default function Contact() {
  const handleSubmit = (event) => {
    event.preventDefault();
    alert("Connect this form to Formspree, Netlify Forms, or your email service.");
  };

  return (
    <section id="contact" className="section-wrap">
      <div className="section-card utility-card contact-card">
        <div className="section-title gray">Contact Me</div>
        <div className="section-body">
          <form className="contact-form" onSubmit={handleSubmit}>
            <input type="text" placeholder="Your name" />
            <input type="email" placeholder="Your email" />
            <input className="full-width" type="text" placeholder="Subject" />
            <textarea className="full-width" rows={6} placeholder="Your message" />
            <button type="submit" className="retro-button">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  );
}
