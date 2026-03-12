export default function HomePage() {
  return (
    <div className="home-city-shell">
      <section className="home-hero-top">
        <div className="home-hero-inner">
          <p className="home-hero-kicker">Premier League Data Experience</p>
          <h1 className="home-hero-title">
            Premier League
            <span>City</span>
          </h1>
          <p className="home-hero-subtitle">
            Explore a cinematic low-poly football metropolis where each club becomes a living tower of season data.
          </p>
          <a href="#city" className="home-hero-cta">
            Enter Visualization
          </a>
        </div>
      </section>

      <section className="city-transition" aria-hidden="true">
        <div className="city-transition-line" />
        <div className="city-transition-glow" />
      </section>

      <section id="city" className="city-page">
        <iframe
          src="/premier-league-city/index.html"
          title="Premier League City"
          className="city-frame"
          loading="eager"
        />
      </section>
    </div>
  );
}
