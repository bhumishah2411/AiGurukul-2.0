'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

export function GlobalNavbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/wisdom', label: 'Wisdom Dialogue', icon: '💬', color: '#c4b5fd' },
    { href: '/ayurveda', label: 'Ayurveda & Dosha', icon: '🌿', color: '#5eead4' },
    { href: '/graph', label: 'Knowledge Graph', icon: '🕸️', color: '#fde047' },
    { href: '/documents', label: 'Ingestion & RAG', icon: '📜', color: '#a78bfa' },
    { href: '/quizzes', label: 'Vedic Quizzes', icon: '🎯', color: '#fdba74' },
  ];

  return (
    <header
      style={{
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        background: 'rgba(13, 11, 8, 0.88)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
      }}
    >
      <div
        className="temple-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4.25rem',
          maxWidth: '1360px',
        }}
      >
        {/* Brand Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            textDecoration: 'none',
          }}
        >
          <span
            style={{
              fontSize: '1.75rem',
              filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.4))',
            }}
          >
            🪷
          </span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.35rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                lineHeight: 1.1,
              }}
              className="gold-gradient-text"
            >
              AI GURUKUL
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                letterSpacing: '0.12em',
                color: 'var(--text-dust)',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              Vedic Intelligence 2.0
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--gold-radiance)' : 'var(--text-vellum)',
                  background: isActive ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid transparent',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '1rem' }}>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side User / Auth Profile Widget */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {loading ? (
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-dust)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span style={{ animation: 'spin 1s infinite linear' }}>☸</span>
              <span>Sanctum...</span>
            </div>
          ) : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    color: 'var(--text-vellum)',
                    maxWidth: '140px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user.displayName}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--gold-radiance)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {user.role} • {user.preferences.defaultPersona}
                </span>
              </div>
              <button
                onClick={logout}
                className="btn-outline-sacred"
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link
                href="/login"
                className="btn-outline-sacred"
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                }}
              >
                Seeker Login
              </Link>
              <Link
                href="/register"
                className="btn-sacred"
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                }}
              >
                Enroll
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            style={{
              background: 'transparent',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: 'var(--gold-radiance)',
              padding: '0.4rem 0.6rem',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'none',
            }}
            className="mobile-menu-toggle"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation if opened */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid rgba(212, 175, 55, 0.15)',
            background: 'var(--surface-stone)',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.65rem 0.75rem',
                borderRadius: '6px',
                color: pathname === link.href ? 'var(--gold-radiance)' : 'var(--text-vellum)',
                background: pathname === link.href ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                textDecoration: 'none',
                fontSize: '0.95rem',
              }}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
