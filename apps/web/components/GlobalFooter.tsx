import React from 'react';
import Link from 'next/link';

export function GlobalFooter() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(212, 175, 55, 0.2)',
        background: 'linear-gradient(180deg, #120F0B 0%, #0D0B08 100%)',
        padding: '3.5rem 1.5rem 2.5rem',
        marginTop: 'auto',
      }}
    >
      <div className="temple-container" style={{ maxWidth: '1240px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Column 1: Brand & Sacred Inscription */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <span style={{ fontSize: '1.75rem' }}>🪷</span>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                }}
                className="gold-gradient-text"
              >
                AI GURUKUL 2.0
              </span>
            </div>
            <p
              style={{
                color: 'var(--text-dust)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                marginBottom: '1.25rem',
              }}
            >
              A production-grade Vedic intelligence platform applying authentic classical Indian
              knowledge, Ayurvedic diagnostics, and semantic graph ontologies to modern life.
            </p>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '0.82rem',
                color: 'var(--gold-radiance)',
                fontStyle: 'italic',
                opacity: 0.85,
              }}
            >
              &ldquo;सत्यं वद, धर्मं चर, स्वाध्यायान्मा प्रमदः&rdquo;
            </div>
          </div>

          {/* Column 2: Vedic Shastric Engines */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1rem',
                color: 'var(--text-vellum)',
                letterSpacing: '0.05em',
                marginBottom: '1rem',
                borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
                paddingBottom: '0.5rem',
              }}
            >
              Shastric Engines
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              <li>
                <Link
                  href="/wisdom"
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-dust)',
                    transition: 'color 0.2s',
                  }}
                >
                  💬 Wisdom Dialogue (SSE Stream)
                </Link>
              </li>
              <li>
                <Link
                  href="/ayurveda"
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-dust)',
                    transition: 'color 0.2s',
                  }}
                >
                  🌿 Ayurveda &amp; Dosha Matrix
                </Link>
              </li>
              <li>
                <Link
                  href="/graph"
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-dust)',
                    transition: 'color 0.2s',
                  }}
                >
                  🕸️ Vedic Knowledge Graph (BFS)
                </Link>
              </li>
              <li>
                <Link
                  href="/documents"
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-dust)',
                    transition: 'color 0.2s',
                  }}
                >
                  📜 Sacred Ingestion &amp; RAG
                </Link>
              </li>
              <li>
                <Link
                  href="/quizzes"
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-dust)',
                    transition: 'color 0.2s',
                  }}
                >
                  🎯 Vedic Quizzes &amp; Dynamic Assessments
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Canonical Traditions */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1rem',
                color: 'var(--text-vellum)',
                letterSpacing: '0.05em',
                marginBottom: '1rem',
                borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
                paddingBottom: '0.5rem',
              }}
            >
              Classical Darshanas
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              <li style={{ fontSize: '0.88rem', color: 'var(--text-dust)' }}>
                ✨ <strong>Vedanta:</strong> Advaita, Vishishtadvaita &amp; Upanishads
              </li>
              <li style={{ fontSize: '0.88rem', color: 'var(--text-dust)' }}>
                🌿 <strong>Ayurveda:</strong> Charaka Samhita &amp; Ashtanga Hridayam
              </li>
              <li style={{ fontSize: '0.88rem', color: 'var(--text-dust)' }}>
                🧘 <strong>Yoga:</strong> Patanjali Ashtanga Yoga Sutras
              </li>
              <li style={{ fontSize: '0.88rem', color: 'var(--text-dust)' }}>
                ⚖️ <strong>Arthashastra &amp; Niti:</strong> Chanakya Statecraft &amp; Ethics
              </li>
              <li style={{ fontSize: '0.88rem', color: 'var(--text-dust)' }}>
                🔍 <strong>Nyaya-Vaisheshika:</strong> Epistemology &amp; Atomic Ontology
              </li>
            </ul>
          </div>

          {/* Column 4: Sanctum Gateway */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1rem',
                color: 'var(--text-vellum)',
                letterSpacing: '0.05em',
                marginBottom: '1rem',
                borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
                paddingBottom: '0.5rem',
              }}
            >
              Sanctum Gateway
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                href="/login"
                className="btn-outline-sacred"
                style={{ textAlign: 'center', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Seeker Sign In
              </Link>
              <Link
                href="/register"
                className="btn-sacred"
                style={{ textAlign: 'center', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                New Seeker Enrollment
              </Link>
              <a
                href="http://localhost:5000/api/v1/wisdom/verses"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--gold-radiance)',
                  textAlign: 'center',
                  marginTop: '0.25rem',
                  textDecoration: 'underline',
                }}
              >
                Canonical Verse API Endpoint →
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Shanti Mantra */}
        <div
          style={{
            borderTop: '1px solid rgba(212, 175, 55, 0.12)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '0.9rem',
              color: 'var(--gold-radiance)',
              letterSpacing: '0.05em',
            }}
          >
            ॐ असतो मा सद्गमय । तमसो मा ज्योतिर्गमय । मृत्योर्माऽमृतं गमय ॥ ॐ शान्तिः शान्तिः शान्तिः
            ॥
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dust)' }}>
            © {new Date().getFullYear()} AI Gurukul 2.0. Vedic Intelligence &amp; Autonomous
            Guidance Sanctum. Production Ready.
          </div>
        </div>
      </div>
    </footer>
  );
}
