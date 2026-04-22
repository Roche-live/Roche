export default function Contact() {
  return (
    <section id="contact" className="section-wrap">
      <div className="section-card utility-card contact-card">
        <div className="section-title gray">Contact Me</div>
        <div className="section-body">
          <form
            className="contact-form"
            action="https://formspree.io/f/your-form-id"
            method="POST"
          >
            <input type="text" name="name" placeholder="Your name" />
            <input type="email" name="email" placeholder="Your email" />
            <input type="hidden" name="_replyto" value="" />
            <input className="full-width" type="text" placeholder="Subject" />
            <textarea
              className="full-width"
              name="message"
              rows={6}
              placeholder="Your message"
            />
            <button type="submit" className="retro-button">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  );
}
