'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const HEARTS = ['💗', '💕', '💞', '✨', '💗', '🫶', '💕', '✨'];

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: form.get('username'),
        password: form.get('password'),
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || 'Login failed.');
      setLoading(false);
      return;
    }

    router.replace('/');
    router.refresh();
  }

  return (
    <main className="love-login-page">
      <div className="login-glow login-glow-one" aria-hidden="true" />
      <div className="login-glow login-glow-two" aria-hidden="true" />

      <div className="floating-love" aria-hidden="true">
        {HEARTS.map((heart, index) => (
          <span key={`${heart}-${index}`} style={{ '--i': index }}>{heart}</span>
        ))}
      </div>

      <section className="love-login-card">
        <div className="login-lock-wrap" aria-hidden="true">
          <div className="login-lock">💗</div>
          <span className="lock-ring lock-ring-one" />
          <span className="lock-ring lock-ring-two" />
        </div>

        <span className="login-eyebrow">OZIOMA × JOY</span>
        <h1>Our Private <span>Little World</span></h1>
        <p className="login-subtitle">A tiny corner of the internet made for only two people. 💞</p>

        <div className="login-divider"><span>❤️</span></div>

        {error ? <div className="error login-error">{error}</div> : null}

        <form className="love-login-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Who are you? 💗</label>
          <div className="login-field">
            <span aria-hidden="true">👤</span>
            <input id="username" name="username" autoComplete="username" placeholder="Ozioma or Joy" required />
          </div>

          <label htmlFor="password">Our secret key 🔐</label>
          <div className="login-field">
            <span aria-hidden="true">🔒</span>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
            />
            <button
              className="password-toggle"
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👀'}
            </button>
          </div>

          <button className="enter-love-button" type="submit" disabled={loading}>
            <span>{loading ? 'Opening our world…' : 'Enter our world'}</span>
            <span aria-hidden="true">❤️</span>
          </button>
        </form>

        <p className="login-whisper">If you know the password, you already belong here. 🥹💗</p>
      </section>
    </main>
  );
}
