# SaaS Portal — Next.js Full-Stack Serverless

Portal empresarial moderno con Next.js 16, TypeScript, Tailwind CSS 4, PostgreSQL 18 (Prisma 7) y animaciones GSAP.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript |
| Estilos | Tailwind CSS 4 |
| Animaciones | GSAP 3 |
| Auth | NextAuth.js v5 (JWT) |
| ORM | Prisma 7 + @prisma/adapter-pg |
| BD | PostgreSQL 18 |
| IA | OpenAI API (GPT-4o-mini) |

## Setup Rápido (Laragon 8.5)

### 1. Crear la base de datos
```sql
CREATE DATABASE saas_portal;
```

### 2. Configurar .env.local
```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/saas_portal"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="secreto-aleatorio-de-32-chars-minimo"
OPENAI_API_KEY="sk-..."
```

### 3. Instalar, migrar y sembrar
```bash
npm install
npm run db:push
npm run db:seed
```

### 4. Iniciar
```bash
npm run dev
```

**Login inicial:** `admin@saasportal.com` / `Admin123!`

## Módulos incluidos

- Login animado con GSAP
- Dashboard con KPIs
- CRUD Clientes
- CRUD Productos + IA (descripción automática)
- Facturas completas (borrador → enviada → pagada) + IA (notas)
- Configuración: Empresa, Roles/Permisos, Usuarios

## Scripts

```bash
npm run db:push      # Sincronizar esquema sin migración
npm run db:migrate   # Crear y aplicar migración
npm run db:seed      # Poblar datos de prueba
npm run db:studio    # GUI para la DB
```
