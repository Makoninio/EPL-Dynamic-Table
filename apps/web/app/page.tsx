import LivingTableLab from '../components/living-table-lab';

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

      <section id="city" className="city-page city-page-live">
        <div className="city-live-shell">
          <div className="city-live-header">
            <p className="city-live-kicker">Interactive Visualization</p>
            <h2>Championship Tower</h2>
            <p>
              Explore a live 3D table where each club orbits a central tower and its altitude tracks league position over the season.
            </p>
          </div>

          <LivingTableLab />
        </div>
      </section>
    </div>
  );
}
