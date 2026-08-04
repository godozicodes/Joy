'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <main className="login-wrap">
      <section className="card login-card">
        <div style={{ fontSize: '3rem', textAlign: 'center' }}>🔐💗</div>
        <h1 style={{ fontSize: 'clamp(2.4rem,8vw,4rem)', textAlign: 'center' }}>Our Private Place</h1>
        <p className="lead" style={{ textAlign: 'center' }}>Only Ozioma and Joy can enter.</p>

        {error ? <div className="error">{error}</div> : null}

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input id="username" name="username" autoComplete="username" required />

          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />

          <button type="submit" style={{ width: '100%', marginTop: 20 }} disabled={loading}>
            {loading ? 'Opening…' : 'Enter our world ❤️'}
          </button>
        </form>
      </section>
    </main>
  );
}
