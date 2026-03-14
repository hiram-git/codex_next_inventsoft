# Plan de transición: Astro → Next.js 16 (manteniendo PostgreSQL + Drizzle ORM + Tailwind)

## 1) Estado actual del proyecto (baseline)

### Stack detectado
- Framework principal: **Astro 5** con salida server-side (`output: 'server'`) y adaptador Node standalone.
- Base de datos: **PostgreSQL**.
- ORM: **Drizzle ORM** + `drizzle-kit`.
- Estilos: **Tailwind CSS v4** junto con CSS global propio.
- Autenticación: sesión por cookie HTTP-only (`session_user_id`) con validación en middleware.

### Superficie funcional identificada
- ~60 páginas bajo `src/pages` (módulos de ventas, compras, inventario, reportes, configuración, etc.).
- 11 endpoints API bajo `src/pages/api` (PDFs, tickets, auth y comandas).
- 1 layout principal (`AdminLayout.astro`).
- Dominio de negocio amplio (catálogos, ventas, cuentas por cobrar, inventario, impresiones térmicas/PDF).

### Implicación
No es una migración “lift-and-shift” pequeña; conviene **estrategia por fases** con compatibilidad funcional y medición de rendimiento desde el inicio.

---

## 2) Objetivo de arquitectura en Next.js 16

Mantener exactamente estos pilares:
- **PostgreSQL** (sin cambiar motor).
- **Drizzle ORM** (misma capa de acceso a datos y esquema).
- **Tailwind** (misma estrategia de diseño, migrando clases/hojas globales).

Cambiar únicamente:
- De **Astro** a **Next.js 16** (App Router + Route Handlers).
- En paralelo, dejar documentado el camino para equipos que hoy estén en **Next 15 → Next 16**.

---

## 3) Estrategia recomendada de migración

## Fase 0 — Preparación (1–2 días)
1. Congelar baseline funcional de Astro:
   - flujos críticos (login, dashboard, CRUDs principales, facturación, impresión PDF/ticket).
2. Definir KPI de comparación:
   - build time, tiempo de arranque, TTFB P50/P95, LCP, consumo de memoria, req/s en endpoints clave.
3. Levantar entorno de benchmark local homogéneo (misma DB y dataset seed).

**Entregable:** checklist funcional + script de benchmark + reporte baseline Astro.

## Fase 1 — Bootstrap de Next.js 16 (1–2 días)
1. Crear app Next 16 en carpeta paralela (ej. `next-app/`) para evitar romper producción Astro.
2. Configurar:
   - TypeScript estricto.
   - Tailwind v4.
   - alias de paths compatibles con el monorepo/proyecto actual.
3. Reutilizar capa de datos:
   - mover/copiar `src/db/*` y `drizzle.config.ts` con mínimos cambios de rutas.
   - conservar scripts `db:generate`, `db:migrate`, `db:seed`.

**Entregable:** Next 16 arrancando + conexión DB validada + seed funcionando.

## Fase 2 — Infra transversal (2–3 días)
1. **Auth y sesión**:
   - migrar `lib/auth.ts` a utilidades server-only en Next.
   - reemplazar middleware Astro por `middleware.ts` de Next.
2. **Layout y shell de administración**:
   - pasar `AdminLayout.astro` a `app/(admin)/layout.tsx`.
3. **Estilos globales**:
   - portar `src/styles/global.css` a `app/globals.css` preservando tokens.

**Entregable:** login + guard de rutas + layout principal operativos en Next.

## Fase 3 — Migración por dominios (iterativa, 2–4 semanas)
Orden sugerido por impacto/riesgo:
1. Catálogos simples (clientes, vendedores, almacenes).
2. Inventario y productos/servicios.
3. Ventas (cotizaciones, pedidos, facturas, cobros).
4. Reportes + impresión PDF/ticket.

Por cada dominio:
- Página Astro (`*.astro`) → página App Router (`app/**/page.tsx`).
- Endpoints `src/pages/api/**` → `app/api/**/route.ts`.
- Mantener contratos de payload para no romper front/servicios.

**Entregable:** dominios migrados con paridad funcional comprobada.

## Fase 4 — Endurecimiento y optimización (3–5 días)
1. Añadir tests de humo por flujo (Playwright o equivalente).
2. Ajustar caching/revalidate donde aplique.
3. Verificar runtime Node en endpoints con librerías nativas (PDF/impresoras).

**Entregable:** reporte de estabilidad + tuning inicial de performance.

## Fase 5 — Comparativa formal Astro vs Next 16 (2 días)
1. Ejecutar batería idéntica sobre ambos proyectos.
2. Publicar tabla de resultados con P50/P95/P99.
3. Recomendación final basada en datos (no percepción).

**Entregable:** informe comparativo para decisión técnica.

---

## 4) Mapeo técnico Astro → Next.js 16

- `src/pages/*.astro` → `app/**/page.tsx`
- `src/layouts/*.astro` → `app/**/layout.tsx`
- `src/pages/api/**/*.ts` → `app/api/**/route.ts`
- `src/middleware.ts` (Astro) → `middleware.ts` (Next)
- `src/styles/global.css` → `app/globals.css`
- `src/lib/*` y `src/db/*` → `src/lib/*` y `src/db/*` (reutilizable casi 1:1)

---

## 5) Plan específico Next 15 → Next 16 (verificación solicitada)

Si el proyecto de comparación ya existe en Next 15, validar este checklist:

1. **Dependencias núcleo**
   - `next@16`, `react@19`, `react-dom@19` (alineadas con peer deps oficiales).
2. **Cambios breaking**
   - revisar `middleware`, `route handlers`, `headers/cookies`, cache y revalidate.
3. **Config**
   - validar `next.config.*` y flags obsoletos.
4. **Build y lint**
   - ejecutar `next build` sin warnings críticos.
5. **Runtime**
   - confirmar Node runtime en rutas que usen `pdfkit` o impresora térmica.
6. **Regresión funcional**
   - repetir smoke tests de login, CRUD y documentos PDF/ticket.

Resultado esperado: evidencia clara de que el salto 15→16 no introduce regresiones en módulos críticos.

---

## 6) Riesgos principales y mitigación

1. **Regresiones en impresión (PDF/ticket)**
   - Mitigar fijando runtime Node y tests de snapshot de salidas.
2. **Diferencias de ciclo SSR/streaming**
   - Mitigar con pruebas de hidratación y validación de data fetching server-only.
3. **Complejidad de dominio (muchas pantallas)**
   - Mitigar migrando por verticales y no por “tipo de archivo”.
4. **Sesiones/cookies**
   - Mitigar con pruebas E2E de expiración, logout y rutas protegidas.

---

## 7) Métricas para comparar rendimiento entre ambos proyectos

Medir al menos:
- **Build:** tiempo total y tamaño de salida.
- **Arranque:** cold start en entorno Node.
- **Servidor:** TTFB P50/P95 en rutas clave (`/dashboard`, `/facturas`, `/api/pdf/*`).
- **Frontend:** LCP, CLS, TBT en dashboard y listados pesados.
- **Recursos:** memoria RSS y CPU bajo carga.
- **Throughput:** req/s sostenidos con latencia objetivo.

Herramientas sugeridas:
- `autocannon` (HTTP load),
- Lighthouse CI (frontend),
- métricas de proceso Node (RSS/CPU),
- scripts reproducibles versionados en repo.

---

## 8) Criterio de salida (Definition of Done)

La transición se considera exitosa cuando:
1. Next 16 tiene **paridad funcional** con Astro en flujos críticos.
2. PostgreSQL + Drizzle + Tailwind se mantienen sin cambios de arquitectura.
3. Existe informe reproducible Astro vs Next 16 con métricas objetivas.
4. El camino Next 15→16 queda validado con checklist y evidencia de build + smoke tests.

