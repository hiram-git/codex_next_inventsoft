import type { NextRequest } from 'next/server';
import { cookies as nextCookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { usuarios } from '@/db/schema';

export const SESSION_COOKIE = 'session_user_id';

export type SessionUser = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
};

function normalizeUser(user: typeof usuarios.$inferSelect): SessionUser {
  return {
    id: String(user.id),
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
  };
}

export async function validateCredentials(email: string, password: string): Promise<SessionUser | null> {
  const rows = await db.select().from(usuarios).where(eq(usuarios.email, email));
  const user = rows[0];
  if (!user || !user.activo) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return normalizeUser(user);
}

export async function getSessionFromRequest(request: NextRequest): Promise<SessionUser | null> {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const rows = await db.select().from(usuarios).where(eq(usuarios.id, Number(sessionId)));
  const user = rows[0];
  if (!user || !user.activo) return null;

  return normalizeUser(user);
}

export async function getSessionFromCookieStore(): Promise<SessionUser | null> {
  const cookieStore = await nextCookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const rows = await db.select().from(usuarios).where(eq(usuarios.id, Number(sessionId)));
  const user = rows[0];
  if (!user || !user.activo) return null;

  return normalizeUser(user);
}
