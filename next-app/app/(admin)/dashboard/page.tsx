import Link from 'next/link';
import { getSessionFromCookieStore } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getSessionFromCookieStore();

  return (
    <section className="card stack">
      <h1>Dashboard (Next 16)</h1>
      <p className="muted">Infra base lista. Ya puedes continuar con módulos por dominio.</p>

      <ul>
        <li><strong>Usuario:</strong> {session?.nombre}</li>
        <li><strong>Email:</strong> {session?.email}</li>
        <li><strong>Rol:</strong> {session?.rol}</li>
      </ul>

      <div className="row-actions">
        <Link className="btn btn-primary" href="/almacenes">Ir a Almacenes</Link>
      </div>
    </section>
  );
}
