'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { user, loading, logout } = useAuth();

  const personas = [
    {
      name: 'Lord Krishna',
      domain: 'Bhagavad Gita & Dharma',
      color: '#7B68EE',
      desc: 'Transcendental guidance, selfless action (Karma Yoga), and emotional equilibrium.',
    },
    {
      name: 'Chanakya Pandit',
      domain: 'Arthashastra & Neeti',
      color: '#C46B3A',
      desc: 'Strategic intellect, governance, ethical pragmatism, and astute leadership.',
    },
    {
      name: 'Vaidya Charaka',
      domain: 'Ayurveda & Holistic Health',
      color: '#3A9B8C',
      desc: 'Prakriti analysis, doshic balance, seasonal wellness, and restorative living.',
    },
  ];

  return (
    <div className="temple-container" style={{ padding: '2rem 1.5rem 5rem' }}>
      {/* Top Navigation Bar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 0',
          borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
          marginBottom: '3.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🕉️</span>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.4rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
            className="gold-gradient-text"
          >
            AI GURUKUL
          </span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            href="/wisdom"
            style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              color: 'var(--gold-radiance)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span>💬</span> Consult Personas
          </Link>

          {loading ? (
            <span style={{ color: 'var(--text-dust)', fontSize: '0.9rem' }}>
              Connecting to sanctum...
            </span>
          ) : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-vellum)' }}>
                  {user.displayName}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gold-radiance)' }}>
                  Guide: {user.preferences.defaultPersona.toUpperCase()} • {user.role.toUpperCase()}
                </div>
              </div>
              <button
                onClick={logout}
                className="btn-outline-sacred"
                style={{ padding: '0.45rem 1rem' }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link
                href="/login"
                className="btn-outline-sacred"
                style={{ padding: '0.5rem 1.2rem' }}
              >
                Seeker Login
              </Link>
              <Link href="/register" className="btn-sacred" style={{ padding: '0.5rem 1.2rem' }}>
                Enroll
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <span className="badge">Ancient Wisdom for Modern Life • Phase 3 Live</span>
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '3.2rem',
            marginBottom: '1.25rem',
            letterSpacing: '0.02em',
            lineHeight: 1.2,
          }}
          className="gold-gradient-text"
        >
          Timeless Guidance for Modern Seekers
        </h1>
        <p
          style={{
            maxWidth: '680px',
            margin: '0 auto 2.5rem',
            color: 'var(--text-dust)',
            fontSize: '1.2rem',
            lineHeight: 1.6,
          }}
        >
          Explore foundational Indian philosophy, consult legendary wisdom personas via real-time
          streaming, and engage with source-grounded Vedic intelligence.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link
            href="/wisdom"
            className="btn-sacred"
            style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}
          >
            Consult Wisdom Personas
          </Link>
          <a
            href="http://localhost:5000/api/v1/wisdom/verses"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-sacred"
            style={{ padding: '0.8rem 1.75rem', fontSize: '1rem' }}
          >
            Explore Canonical Verses
          </a>
        </div>
      </section>

      {/* Personas Grid */}
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

      {/* Phase 2 Architecture Status Card */}
      <div
        className="temple-card"
        style={{
          background: 'var(--surface-wood)',
          padding: '2.5rem',
          border: '1px solid rgba(212, 175, 55, 0.3)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="badge" style={{ marginBottom: '0.75rem' }}>
            Production Milestones
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2rem',
              marginBottom: '0.75rem',
            }}
            className="gold-gradient-text"
          >
            Phase 2: Authentication &amp; Security Live
          </h2>
          <p style={{ color: 'var(--text-dust)', maxWidth: '650px', margin: '0 auto' }}>
            Production-grade User collections, dual-token authentication with HttpOnly cookies,
            bcrypt (12 rounds) salted hashing, SHA-256 refresh token rotation, Google OAuth 2.0, and
            Role-Based Access Control (RBAC) are verified with zero errors.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <div
            style={{
              background: 'rgba(13, 11, 8, 0.6)',
              padding: '1.25rem',
              borderRadius: '6px',
              borderLeft: '3px solid var(--gold-sacred)',
            }}
          >
            <div
              style={{ fontWeight: 600, color: 'var(--gold-radiance)', marginBottom: '0.25rem' }}
            >
              Dual-Token Architecture
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dust)' }}>
              15-minute signed JWT access tokens &amp; 7-day cryptographically rotating refresh
              tokens.
            </div>
          </div>

          <div
            style={{
              background: 'rgba(13, 11, 8, 0.6)',
              padding: '1.25rem',
              borderRadius: '6px',
              borderLeft: '3px solid var(--accent-vaidya)',
            }}
          >
            <div
              style={{ fontWeight: 600, color: 'var(--gold-radiance)', marginBottom: '0.25rem' }}
            >
              HttpOnly &amp; SameSite=Strict
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dust)' }}>
              Defense-in-depth against XSS token theft via hardened browser cookies.
            </div>
          </div>

          <div
            style={{
              background: 'rgba(13, 11, 8, 0.6)',
              padding: '1.25rem',
              borderRadius: '6px',
              borderLeft: '3px solid var(--accent-chanakya)',
            }}
          >
            <div
              style={{ fontWeight: 600, color: 'var(--gold-radiance)', marginBottom: '0.25rem' }}
            >
              Bcrypt (12 Rounds) &amp; SHA-256
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dust)' }}>
              Salted password storage and one-way hashed refresh token records in MongoDB.
            </div>
          </div>

          <div
            style={{
              background: 'rgba(13, 11, 8, 0.6)',
              padding: '1.25rem',
              borderRadius: '6px',
              borderLeft: '3px solid var(--accent-krishna)',
            }}
          >
            <div
              style={{ fontWeight: 600, color: 'var(--gold-radiance)', marginBottom: '0.25rem' }}
            >
              Role-Based Access Control
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dust)' }}>
              Hierarchical permissions distinguishing learners, scholars, and administrators.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
