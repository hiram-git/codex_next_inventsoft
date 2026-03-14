'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get('email') || ''),
      password: String(formData.get('password') || ''),
    };

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!response.ok) {
      setError('Credenciales inválidas');
      return;
    }

    const from = params.get('from') || '/dashboard';
    router.push(from);
    router.refresh();
  }

  return (
    <main className="auth-shell">
      <form className="card auth-card" onSubmit={onSubmit}>
        <h1>Ingresar</h1>
        <p className="muted">Next.js 16 bootstrap</p>

        <label htmlFor="email">Correo</label>
        <input id="email" name="email" type="email" required />

        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" required />

        {error ? <p className="error">{error}</p> : null}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Validando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
