'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login({ email, password });
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 1000);
    }
  };

  return (
    <div className="temple-container" style={{ padding: '5rem 1.5rem', maxWidth: '480px' }}>
      <div className="temple-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <span className="badge">Sanctum Access</span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2rem',
            marginBottom: '0.5rem',
          }}
          className="gold-gradient-text"
        >
          Seeker Login
        </h1>
        <p style={{ color: 'var(--text-dust)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Enter your sacred credentials to access your personalized wisdom study.
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
            ✨ Authentication successful. Entering AI Gurukul...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              className="input-sacred"
              placeholder="seeker@vedic.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              className="input-sacred"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-sacred"
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
          >
            {loading ? 'Authenticating...' : 'Enter the Gurukul'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-dust)' }}>
          New to AI Gurukul?{' '}
          <Link href="/register" style={{ fontWeight: 600 }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
