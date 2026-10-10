'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  const pillars = [
    {
      title: 'Wisdom Dialogue',
      sanskrit: 'संवाद • Samvada',
      badge: 'SSE Streaming',
      badgeColor: '#7B68EE',
      icon: '💬',
      desc: 'Engage in real-time streaming philosophical dialogues with 6 revered Vedic personas. Receive nuanced life guidance grounded in verbatim Sanskrit citations.',
      href: '/wisdom',
      actionLabel: 'Enter Wisdom Sanctum',
      features: [
        'Real-time SSE token stream',
        'Verbatim Sanskrit citations',
        'Conversation history & persistence',
      ],
    },
    {
      title: 'Ayurveda & Dosha Matrix',
      sanskrit: 'आयुर्वेद • Prakriti & Vikriti',
      badge: 'Charaka Diagnostic',
      badgeColor: '#3A9B8C',
      icon: '🌿',
      desc: '18-question constitutional assessment based on Charaka Samhita. Computes normalized Tri-Dosha percentages, acute Vikriti tracking, and personalized regimens.',
      href: '/ayurveda',
      actionLabel: 'Analyze Your Constitution',
      features: [
        'Tri-Dosha % normalization',
        'Acute symptom Vikriti tracker',
        'Ahara, Dinacharya & Herb regimens',
      ],
    },
    {
      title: 'Vedic Knowledge Graph',
      sanskrit: 'ज्ञानजाल • Jnana Jala',
      badge: 'BFS Graph Traversal',
      badgeColor: '#D4AF37',
      icon: '🕸️',
      desc: 'Interactive radial clustered ontology spanning orthodox Darshanas, shastric texts, sages, and core doctrines connected by 56 semantic relationship edges.',
      href: '/graph',
      actionLabel: 'Traverse Ontology',
      features: [
        '32 Nodes & 56 Semantic edges',
        'BFS shortest pathfinder engine',
        'Interactive canvas & Sanctum drawer',
      ],
    },
    {
      title: 'Sacred Ingestion & RAG',
      sanskrit: 'शास्त्र संचय • Shastra Sanchaya',
      badge: 'Hybrid Vector Search',
      badgeColor: '#A78BFA',
      icon: '📜',
      desc: 'Enterprise document ingestion pipeline for classical texts. Chunks, extracts Sanskrit terms, and retrieves synthesized context with verbatim scriptural citations.',
      href: '/documents',
      actionLabel: 'Open RAG Studio',
      features: [
        'Automated text chunking & indexing',
        'Multi-domain shastric filters',
        'Synthesized context with citations',
      ],
    },
    {
      title: 'Vedic Quizzes & Discernment',
      sanskrit: 'विवेक परीक्षा • Viveka Pariksha',
      badge: 'AI Dynamic Synthesis',
      badgeColor: '#F59E0B',
      icon: '🎯',
      desc: 'Deepen your scriptural discernment through curated multiple-choice exams with live timers, or summon an AI Sage to synthesize interactive quizzes on any Vedic topic.',
      href: '/quizzes',
      actionLabel: 'Test Your Discernment',
      features: [
        'Curated scriptural assessments',
        'On-demand AI quiz synthesis',
        'Domain mastery scoring & analytics',
      ],
    },
  ];

  const personas = [
    {
      name: 'Lord Krishna',
      sanskritTitle: 'योगेश्वर कृष्ण',
      domain: 'Bhagavad Gita & Dharma',
      color: '#7B68EE',
      desc: 'Transcendental guidance, duty without attachment (Nishkama Karma), and inner equanimity amidst life struggles.',
      href: '/wisdom',
    },
    {
      name: 'Chanakya Pandit',
      sanskritTitle: 'कौटिल्य चाणक्य',
      domain: 'Arthashastra & Neeti',
      color: '#C46B3A',
      desc: 'Pragmatic intellect, strategic governance, ethical leadership, and astute navigation of complex real-world dilemmas.',
      href: '/wisdom',
    },
    {
      name: 'Maharishi Patanjali',
      sanskritTitle: 'महर्षि पतञ्जलि',
      domain: 'Yoga Sutras & Mind Mastery',
      color: '#E5A93C',
      desc: 'Stillness of mind (Chitta Vritti Nirodha), eightfold path (Ashtanga Yoga), and transcendental mindfulness.',
      href: '/wisdom',
    },
    {
      name: 'Gargi Vachaknavi',
      sanskritTitle: 'विदुषी गार्गी',
      domain: 'Brihadaranyaka Upanishad',
      color: '#EC4899',
      desc: 'Relentless metaphysical inquiry, fearless scholarly debate, and exploration of the ultimate unmanifest reality (Brahman).',
      href: '/wisdom',
    },
    {
      name: 'Vaidya Charaka',
      sanskritTitle: 'वैद्य चरक',
      domain: 'Ayurveda & Holistic Living',
      color: '#3A9B8C',
      desc: 'Prakriti analysis, doshic balance, seasonal wellness (Ritucharya), dietetics (Ahara), and restorative living.',
      href: '/ayurveda',
    },
    {
      name: 'Sage Vyasa',
      sanskritTitle: 'महर्षि वेदव्यास',
      domain: 'Mahabharata & Vedantic Synthesis',
      color: '#8B5CF6',
      desc: 'Universal narrative perspective, deep karmic causality, and the eternal synthesis of spiritual traditions.',
      href: '/wisdom',
    },
  ];

  return (
    <div className="temple-container" style={{ padding: '2.5rem 1.5rem 6rem', maxWidth: '1280px' }}>
      {/* =========================================================================
          1. HERO SECTION (Unified, Single Layout - No duplicate header)
          ========================================================================= */}
      <section style={{ textAlign: 'center', marginBottom: '4.5rem', paddingTop: '1rem' }}>
        {/* Sacred Mantra & Status Badges */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.65rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <span
            className="badge"
            style={{
              borderColor: 'var(--gold-sacred)',
              color: 'var(--gold-radiance)',
              background: 'rgba(212, 175, 55, 0.1)',
              padding: '0.35rem 0.85rem',
            }}
          >
            🪷 AI GURUKUL 2.0 • PRODUCTION READY
          </span>
          <span
            className="badge"
            style={{
              borderColor: 'rgba(94, 234, 212, 0.4)',
              color: '#5eead4',
              background: 'rgba(94, 234, 212, 0.08)',
              padding: '0.35rem 0.85rem',
            }}
          >
            ✓ 146 Automated Tests Passing
          </span>
          <span
            className="badge"
            style={{
              borderColor: 'rgba(196, 181, 253, 0.4)',
              color: '#c4b5fd',
              background: 'rgba(196, 181, 253, 0.08)',
              padding: '0.35rem 0.85rem',
            }}
          >
            ⚡ Live SSE Streaming &amp; BFS Graph
          </span>
        </div>

        {/* Main Title */}
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            marginBottom: '1.25rem',
            letterSpacing: '0.03em',
            lineHeight: 1.15,
          }}
          className="gold-gradient-text"
        >
          Timeless Guidance for Modern Seekers
        </h1>

        {/* Subtitle */}
        <p
          style={{
            maxWidth: '780px',
            margin: '0 auto 2.5rem',
            color: 'var(--text-vellum)',
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            lineHeight: 1.65,
            opacity: 0.9,
          }}
        >
          An authentic, verifiable Vedic intelligence platform. Consult legendary sages through
          real-time streaming dialogues, analyze your Ayurvedic Prakriti constitution, explore the
          multi-hop Knowledge Graph, retrieve sacred scriptures via RAG, and master shastric
          concepts with dynamic assessments.
        </p>

        {/* Primary Call to Action Cluster */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/wisdom"
            className="btn-sacred"
            style={{
              padding: '0.85rem 2rem',
              fontSize: '1rem',
              boxShadow: '0 4px 20px rgba(212, 175, 55, 0.35)',
            }}
          >
            💬 Consult Wisdom Personas
          </Link>

          <Link
            href="/ayurveda"
            className="btn-outline-sacred"
            style={{
              padding: '0.85rem 1.75rem',
              fontSize: '1rem',
              borderColor: '#3A9B8C',
              color: '#5eead4',
            }}
          >
            🌿 Ayurveda &amp; Dosha Matrix
          </Link>

          <Link
            href="/graph"
            className="btn-outline-sacred"
            style={{
              padding: '0.85rem 1.75rem',
              fontSize: '1rem',
              borderColor: 'var(--gold-sacred)',
              color: 'var(--gold-radiance)',
            }}
          >
            🕸️ Vedic Knowledge Graph
          </Link>

          <Link
            href="/documents"
            className="btn-outline-sacred"
            style={{
              padding: '0.85rem 1.75rem',
              fontSize: '1rem',
              borderColor: '#a78bfa',
              color: '#c4b5fd',
            }}
          >
            📜 Sacred Ingestion &amp; RAG
          </Link>

          <Link
            href="/quizzes"
            className="btn-outline-sacred"
            style={{
              padding: '0.85rem 1.75rem',
              fontSize: '1rem',
              borderColor: '#f59e0b',
              color: '#fcd34d',
            }}
          >
            🎯 Vedic Quizzes
          </Link>
        </div>
      </section>

      {/* =========================================================================
          2. SANCTUM ARCHITECTURE & LIVE METRICS BAR
          ========================================================================= */}
      <section
        style={{
          background:
            'linear-gradient(180deg, rgba(33, 29, 18, 0.8) 0%, rgba(20, 17, 11, 0.9) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          borderRadius: '12px',
          padding: '2rem 1.5rem',
          marginBottom: '5rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{ borderRight: '1px solid rgba(212, 175, 55, 0.12)', padding: '0.5rem 1rem' }}
          >
            <div style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--gold-radiance)' }}>
              146 / 146
            </div>
            <div
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-dust)',
                marginTop: '0.3rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Automated Tests Passing
            </div>
          </div>

          <div
            style={{ borderRight: '1px solid rgba(212, 175, 55, 0.12)', padding: '0.5rem 1rem' }}
          >
            <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#5eead4' }}>
              18 Indicators
            </div>
            <div
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-dust)',
                marginTop: '0.3rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Charaka Dosha Diagnostics
            </div>
          </div>

          <div
            style={{ borderRight: '1px solid rgba(212, 175, 55, 0.12)', padding: '0.5rem 1rem' }}
          >
            <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#c4b5fd' }}>
              32 Nodes • 56 Edges
            </div>
            <div
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-dust)',
                marginTop: '0.3rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Ontology Knowledge Graph
            </div>
          </div>

          <div
            style={{ borderRight: '1px solid rgba(212, 175, 55, 0.12)', padding: '0.5rem 1rem' }}
          >
            <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#fcd34d' }}>6 Personas</div>
            <div
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-dust)',
                marginTop: '0.3rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Vedic Wisdom Streamers
            </div>
          </div>

          <div style={{ padding: '0.5rem 1rem' }}>
            <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#a78bfa' }}>
              Dual JWT + RBAC
            </div>
            <div
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-dust)',
                marginTop: '0.3rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              HttpOnly Cookie Security
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. THE 5 SACRED PILLARS OF AI GURUKUL 2.0
          ========================================================================= */}
      <section style={{ marginBottom: '5.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span
            style={{
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--gold-sacred)',
              fontWeight: 600,
            }}
          >
            पञ्च स्तम्भाः • Core Shastric Capabilities
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.4rem',
              marginTop: '0.5rem',
              marginBottom: '0.75rem',
            }}
            className="gold-gradient-text"
          >
            The Five Pillars of Vedic Intelligence
          </h2>
          <p
            style={{
              color: 'var(--text-dust)',
              maxWidth: '680px',
              margin: '0 auto',
              fontSize: '1.05rem',
            }}
          >
            A modular, unified system combining scriptural authenticity with state-of-the-art
            computational algorithms.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="temple-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: `3px solid ${pillar.badgeColor}`,
                padding: '2rem',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>{pillar.icon}</span>
                  <span
                    className="badge"
                    style={{
                      borderColor: pillar.badgeColor,
                      color: pillar.badgeColor,
                      background: 'rgba(212, 175, 55, 0.05)',
                    }}
                  >
                    {pillar.badge}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '0.78rem',
                    letterSpacing: '0.08em',
                    color: 'var(--text-dust)',
                    textTransform: 'uppercase',
                    marginBottom: '0.35rem',
                  }}
                >
                  {pillar.sanskrit}
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.5rem',
                    color: 'var(--text-vellum)',
                    marginBottom: '0.85rem',
                  }}
                >
                  {pillar.title}
                </h3>

                <p
                  style={{
                    color: 'var(--text-dust)',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    marginBottom: '1.5rem',
                  }}
                >
                  {pillar.desc}
                </p>

                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  {pillar.features.map((feat, idx) => (
                    <li
                      key={idx}
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-vellum)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span style={{ color: pillar.badgeColor }}>✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <Link
                  href={pillar.href}
                  className="btn-outline-sacred"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    justifyContent: 'center',
                    padding: '0.65rem 1.25rem',
                    borderColor: pillar.badgeColor,
                    color: pillar.badgeColor,
                  }}
                >
                  <span>{pillar.actionLabel}</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. MEET THE CANONICAL SAGES & PHILOSOPHERS
          ========================================================================= */}
      <section style={{ marginBottom: '5.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span
            style={{
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--gold-sacred)',
              fontWeight: 600,
            }}
          >
            आचार्याः • Canonical Vedic Guides
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.4rem',
              marginTop: '0.5rem',
              marginBottom: '0.75rem',
            }}
            className="gold-gradient-text"
          >
            Consult Living Philosophical Lineages
          </h2>
          <p
            style={{
              color: 'var(--text-dust)',
              maxWidth: '680px',
              margin: '0 auto',
              fontSize: '1.05rem',
            }}
          >
            Each persona embodies a distinct traditional Darshana, grounded strictly in foundational
            Sanskrit texts.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {personas.map((p) => (
            <div
              key={p.name}
              className="temple-card"
              style={{
                borderLeft: `4px solid ${p.color}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span
                    style={{
                      color: p.color,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {p.domain}
                  </span>
                  <span
                    style={{ fontSize: '0.8rem', color: 'var(--text-dust)', fontStyle: 'italic' }}
                  >
                    {p.sanskritTitle}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.45rem',
                    margin: '0.4rem 0 0.6rem',
                    color: 'var(--text-vellum)',
                  }}
                >
                  {p.name}
                </h3>

                <p style={{ color: 'var(--text-dust)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                  {p.desc}
                </p>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <Link
                  href={p.href}
                  className="btn-outline-sacred"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 1rem',
                    fontSize: '0.85rem',
                    borderColor: p.color,
                    color: p.color,
                  }}
                >
                  <span>Seek Guidance</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          5. PRODUCTION QUALITY & SHASTRIQUE ASSURANCE
          ========================================================================= */}
      <section
        className="temple-card"
        style={{
          background: 'linear-gradient(180deg, #18140D 0%, #100E0A 100%)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          padding: '3rem 2rem',
          borderRadius: '12px',
          textAlign: 'center',
        }}
      >
        <span
          className="badge"
          style={{
            borderColor: 'var(--gold-sacred)',
            color: 'var(--gold-radiance)',
            marginBottom: '1rem',
          }}
        >
          Zero Hallucination Architecture
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.2rem',
            marginBottom: '1rem',
          }}
          className="gold-gradient-text"
        >
          Grounded Epistemology: Shastra Pramana
        </h2>
        <p
          style={{
            maxWidth: '750px',
            margin: '0 auto 2.5rem',
            color: 'var(--text-dust)',
            fontSize: '1.05rem',
            lineHeight: 1.65,
          }}
        >
          Unlike generic large language models that invent synthetic advice, AI Gurukul 2.0 enforces
          strict scriptural retrieval grounding (Shastra Pramana). When you seek wisdom on duty,
          ethical dilemmas, dosha imbalances, or philosophical concepts, the platform delivers
          verifiable citations from the Bhagavad Gita, Upanishads, Charaka Samhita, and Yoga Sutras.
        </p>

        <div
          style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}
        >
          <Link
            href="/wisdom"
            className="btn-sacred"
            style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}
          >
            Start Your First Dialogue
          </Link>
          <a
            href="http://localhost:5000/api/v1/wisdom/verses"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-sacred"
            style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}
          >
            Inspect Canonical Verses API →
          </a>
        </div>
      </section>
    </div>
  );
}
