import { redirect } from 'next/navigation';
import { getSessionFromCookieStore } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getSessionFromCookieStore();

  if (!session) {
    redirect('/login');
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Dashboard (Next 16)</h1>
        <p className="muted">Fase 1/2 de migración completada: app base + auth + middleware.</p>
        <ul>
          <li><strong>Usuario:</strong> {session.nombre}</li>
          <li><strong>Email:</strong> {session.email}</li>
          <li><strong>Rol:</strong> {session.rol}</li>
        </ul>

        <form action="/api/auth/logout" method="post">
          <button className="btn" type="submit">Cerrar sesión</button>
        </form>
      </section>
    </main>
  );
}
