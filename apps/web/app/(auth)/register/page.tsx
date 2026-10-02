'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { WisdomPersona } from '@ai-gurukul/types';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [preferredPersona, setPreferredPersona] = useState<WisdomPersona>('krishna');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await register({
      email,
      password,
      displayName,
      preferredPersona,
    });
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 1000);
    }
  };

  return (
    <div className="temple-container" style={{ padding: '4rem 1.5rem', maxWidth: '520px' }}>
      <div className="temple-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <span className="badge">Sacred Enrollment</span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2rem',
            marginBottom: '0.5rem',
          }}
          className="gold-gradient-text"
        >
          Begin Your Quest
        </h1>
        <p style={{ color: 'var(--text-dust)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Create your account and select your initial wisdom guide for personalized study.
        </p>

        {error && (
          <div
            style={{
              padding: '0.85rem',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              textAlign: 'left',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: '0.85rem',
              borderRadius: '6px',
              background: 'rgba(58, 155, 140, 0.15)',
              border: '1px solid var(--accent-vaidya)',
              color: 'var(--gold-radiance)',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}
          >
            ✨ Enrollment complete. Preparing your sanctum...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              Full Name / Seeker Identity
            </label>
            <input
              id="register-name"
              type="text"
              required
              minLength={2}
              maxLength={50}
              className="input-sacred"
              placeholder="e.g. Arjuna Pandava"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              Email Address
            </label>
            <input
              id="register-email"
              type="email"
              required
              className="input-sacred"
              placeholder="arjuna@vedic.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">
              Password (Min 8 characters)
            </label>
            <input
              id="register-password"
              type="password"
              required
              minLength={8}
              className="input-sacred"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-persona">
              Chosen Wisdom Guide (Persona)
            </label>
            <select
              id="register-persona"
              className="input-sacred"
              value={preferredPersona}
              onChange={(e) => setPreferredPersona(e.target.value as WisdomPersona)}
              style={{ cursor: 'pointer' }}
            >
              <option value="krishna" style={{ background: '#211D12', color: '#EDE8D5' }}>
                Lord Krishna – Bhagavad Gita &amp; Dharma
              </option>
              <option value="chanakya" style={{ background: '#211D12', color: '#EDE8D5' }}>
                Chanakya – Strategic Intellect &amp; Neeti
              </option>
              <option value="vaidya" style={{ background: '#211D12', color: '#EDE8D5' }}>
                Vaidya – Ayurveda &amp; Holistic Balance
              </option>
              <option value="vyasa" style={{ background: '#211D12', color: '#EDE8D5' }}>
                Sage Vyasa – Epic Narratives &amp; Mahabharata
              </option>
              <option value="patanjali" style={{ background: '#211D12', color: '#EDE8D5' }}>
                Patanjali – Yoga Sutras &amp; Mental Mastery
              </option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-sacred"
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
          >
            {loading ? 'Creating Account...' : 'Enroll in AI Gurukul'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-dust)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ fontWeight: 600 }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
