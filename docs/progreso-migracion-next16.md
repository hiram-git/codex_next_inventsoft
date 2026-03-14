# Progreso de migración a Next.js 16

## Estado actual

### ✅ Completado en esta iteración
- Se creó un **bootstrap paralelo** en `next-app/` para ejecutar la migración sin afectar la app Astro actual.
- Se configuró **Next.js 16 + React 19 + Tailwind v4 + TypeScript estricto**.
- Se reutilizó la capa de datos actual para PostgreSQL/Drizzle copiando:
  - `src/db/schema.ts`
  - `src/db/index.ts`
  - `src/db/seed.ts`
- Se implementó base de autenticación y sesión:
  - `app/api/auth/login/route.ts`
  - `app/api/auth/logout/route.ts`
  - `src/lib/auth.ts`
  - `middleware.ts`
- Se crearon rutas iniciales para validar infraestructura:
  - `/login`
  - `/dashboard`

## Fases del plan (actualizado)
- **Fase 0 (preparación):** En progreso.
- **Fase 1 (bootstrap Next 16):** **Completada** en alcance técnico mínimo.
- **Fase 2 (infra transversal):** En progreso (auth + middleware listos; falta layout admin completo y migración de estilos globales completos).
- **Fase 3+ (migración por dominios):** Pendiente.

## Siguiente bloque recomendado
1. Migrar `AdminLayout.astro` a `next-app/app/(admin)/layout.tsx`.
2. Migrar módulo de baja complejidad para validar patrón end-to-end (recomendado: `almacenes` o `vendedores`).
3. Portar un endpoint API representativo de lectura/escritura a `app/api/**/route.ts`.
4. Agregar smoke tests básicos (login + listado módulo piloto).

## Nota para comparativa Astro vs Next
- Esta iteración deja listo el entorno para empezar a medir:
  - build time,
  - arranque,
  - TTFB en rutas base (`/login`, `/dashboard`).
