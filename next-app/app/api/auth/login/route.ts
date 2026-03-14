import { NextResponse } from 'next/server';
import { validateCredentials, SESSION_COOKIE } from '@/lib/auth';

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
  }

  const user = await validateCredentials(email, password);
  if (!user) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, user });
  response.cookies.set(SESSION_COOKIE, user.id, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
  });

  return response;
}
