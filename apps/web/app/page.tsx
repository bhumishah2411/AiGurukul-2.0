export default function HomePage() {
  const personas = [
    {
      name: 'Krishna',
      domain: 'Bhagavad Gita & Dharma',
      color: '#7B68EE',
      desc: 'Transcendental guidance, selfless action (Karma Yoga), and emotional equilibrium.',
    },
    {
      name: 'Chanakya',
      domain: 'Arthashastra & Neeti',
      color: '#C46B3A',
      desc: 'Strategic intellect, governance, ethical pragmatism, and astute leadership.',
    },
    {
      name: 'Vaidya',
      domain: 'Ayurveda & Holistic Health',
      color: '#3A9B8C',
      desc: 'Prakriti analysis, doshic balance, seasonal wellness, and restorative living.',
    },
  ];

  return (
    <div className="temple-container" style={{ padding: '4rem 1.5rem' }}>
      <section style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <span className="badge">Ancient Wisdom for Modern Life</span>
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '3rem',
            marginBottom: '1rem',
            letterSpacing: '0.02em',
          }}
          className="gold-gradient-text"
        >
          Timeless Guidance for Modern Seekers
        </h1>
        <p
          style={{
            maxWidth: '680px',
            margin: '0 auto 2rem',
            color: 'var(--text-dust)',
            fontSize: '1.15rem',
          }}
        >
          Explore foundational Indian philosophy, consult legendary wisdom personas, assess your
          dosha constitution, and engage with source-grounded Vedic intelligence.
        </p>
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '4rem',
        }}
      >
        {personas.map((p) => (
          <div key={p.name} className="temple-card" style={{ borderTop: `3px solid ${p.color}` }}>
            <span
              style={{
                color: p.color,
                fontSize: '0.85rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {p.domain}
            </span>
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.5rem',
                margin: '0.5rem 0',
                color: 'var(--text-vellum)',
              }}
            >
              {p.name}
            </h3>
            <p style={{ color: 'var(--text-dust)', fontSize: '0.95rem' }}>{p.desc}</p>
          </div>
        ))}
      </div>

      <div
        className="temple-card"
        style={{
          background: 'var(--surface-wood)',
          textAlign: 'center',
          padding: '2.5rem',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.75rem',
            marginBottom: '0.75rem',
          }}
          className="gold-gradient-text"
        >
          Phase 1 Foundation Active
        </h2>
        <p style={{ color: 'var(--text-dust)', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
          Monorepo architecture, Express API with structured logging &amp; error taxonomy, BullMQ
          worker daemon, and Mongoose connection layers are fully initialized.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span className="badge">Express API Ready</span>
          <span className="badge">BullMQ Worker Ready</span>
          <span className="badge">MongoDB DAL Ready</span>
        </div>
      </div>
    </div>
  );
}
