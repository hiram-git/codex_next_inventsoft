import { defineMiddleware } from 'astro:middleware';
import { getSession } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Public routes
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    return next();
  }

  // Check session for all other routes
  const session = getSession(context.cookies);
  if (!session) {
    return context.redirect('/login');
  }

  context.locals.user = session;
  return next();
});
