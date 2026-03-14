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

### ✅ Avance nuevo (continuación del plan)
- Se migró el shell administrativo principal a `next-app/app/(admin)/layout.tsx`.
- Se migró un **módulo piloto completo** (`Almacenes`) a Next:
  - página `next-app/app/(admin)/almacenes/page.tsx`
  - API REST `next-app/app/api/almacenes/route.ts`
  - API por recurso `next-app/app/api/almacenes/[id]/route.ts`
- Se actualizó `next-app/app/globals.css` para soportar layout admin y formularios/tablas del módulo piloto.

## Fases del plan (actualizado)
- **Fase 0 (preparación):** En progreso.
- **Fase 1 (bootstrap Next 16):** **Completada** en alcance técnico mínimo.
- **Fase 2 (infra transversal):** **Completada en su base** (auth + middleware + layout admin).
- **Fase 3 (migración por dominios):** En progreso (1 dominio piloto listo: Almacenes).

## Siguiente bloque recomendado
1. Migrar segundo módulo simple (`vendedores`) para consolidar patrón.
2. Extraer utilidades compartidas (validaciones, errores API, DTOs).
3. Definir smoke tests E2E mínimos:
   - login,
   - listado almacenes,
   - crear/editar/eliminar almacén.
4. Iniciar medición comparativa inicial Astro vs Next (TTFB y build time base).

## Nota para comparativa Astro vs Next
- Esta iteración deja listo un flujo real para medir:
  - login,
  - dashboard,
  - CRUD de almacenes.
