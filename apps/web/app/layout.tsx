import type { Metadata } from 'next';
import { Cinzel, Plus_Jakarta_Sans } from 'next/font/google';
import '../styles/globals.css';
import { GlobalNavbar } from '../components/GlobalNavbar';
import { GlobalFooter } from '../components/GlobalFooter';

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
  title: 'AI Gurukul 2.0 – Ancient Wisdom for Modern Life',
  description:
    'Production-grade Vedic intelligence platform: AI Guidance, Ayurveda Diagnostics, Vedic Knowledge Graph, Sacred RAG, and Interactive Quizzes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${plusJakartaSans.variable}`}>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <GlobalNavbar />
        <main style={{ flex: 1 }}>{children}</main>
        <GlobalFooter />
      </body>
    </html>
  );
}
