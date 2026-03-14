import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionFromCookieStore } from '@/lib/auth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/almacenes', label: 'Almacenes' },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSessionFromCookieStore();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <h2>Admin Portal</h2>
        <p className="muted small">Next.js 16</p>

        <nav>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <form action="/api/auth/logout" method="post">
          <button className="btn" type="submit">
            Cerrar sesión
          </button>
        </form>
      </aside>

      <main className="admin-content">{children}</main>
    </div>
  );
}
