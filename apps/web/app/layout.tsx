import type { Metadata } from 'next';
import { Cinzel, Plus_Jakarta_Sans } from 'next/font/google';
import '../styles/globals.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-serif',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'AI Gurukul – Ancient Wisdom for Modern Life',
  description:
    'AI-powered guidance and learning platform applying classical Indian wisdom to modern-life situations.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${plusJakartaSans.variable}`}>
      <body>
        <header
          style={{
            borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
            background: 'rgba(13, 11, 8, 0.85)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          <div
            className="temple-container"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '4rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🪷</span>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                }}
                className="gold-gradient-text"
              >
                AI GURUKUL
              </span>
            </div>
            <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <span className="badge">Phase 1 Foundation</span>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
