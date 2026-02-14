import { pgTable, serial, varchar, text, boolean, numeric, integer, date, jsonb } from 'drizzle-orm/pg-core';

// --- Permisos ---
export const permisos = pgTable('permisos', {
  id: serial('id').primaryKey(),
  clave: varchar('clave', { length: 100 }).notNull().unique(),
  nombre: varchar('nombre', { length: 200 }).notNull(),
  modulo: varchar('modulo', { length: 100 }).notNull(),
});

// --- Roles ---
export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 100 }).notNull().unique(),
  descripcion: text('descripcion').default(''),
  permisos: jsonb('permisos').$type<string[]>().default([]),
});

// --- Usuarios ---
export const usuarios = pgTable('usuarios', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 200 }).notNull(),
  email: varchar('email', { length: 200 }).notNull().unique(),
  password: varchar('password', { length: 200 }).notNull(),
  rol: varchar('rol', { length: 100 }).notNull(),
  activo: boolean('activo').default(true).notNull(),
});

// --- Clientes ---
export const clientes = pgTable('clientes', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 300 }).notNull(),
  email: varchar('email', { length: 200 }).notNull(),
  telefono: varchar('telefono', { length: 50 }).default(''),
  direccion: text('direccion').default(''),
  rfc: varchar('rfc', { length: 20 }).default(''),
  createdAt: date('created_at').defaultNow().notNull(),
});

// --- Productos ---
export const productos = pgTable('productos', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 300 }).notNull(),
  descripcion: text('descripcion').default(''),
  precio: numeric('precio', { precision: 12, scale: 2 }).notNull(),
  stock: integer('stock').default(0).notNull(),
  categoria: varchar('categoria', { length: 100 }).default(''),
  activo: boolean('activo').default(true).notNull(),
});

// --- Facturas ---
export const facturas = pgTable('facturas', {
  id: serial('id').primaryKey(),
  numero: varchar('numero', { length: 20 }).notNull().unique(),
  clienteId: integer('cliente_id').notNull(),
  clienteNombre: varchar('cliente_nombre', { length: 300 }).notNull(),
  items: jsonb('items').$type<{
    productoId: string;
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[]>().default([]),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  iva: numeric('iva', { precision: 12, scale: 2 }).notNull(),
  total: numeric('total', { precision: 12, scale: 2 }).notNull(),
  estado: varchar('estado', { length: 20 }).notNull().default('pendiente'),
  fecha: date('fecha').defaultNow().notNull(),
});

// --- Empresa (config singleton, 1 row) ---
export const empresa = pgTable('empresa', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 300 }).notNull(),
  rfc: varchar('rfc', { length: 20 }).default(''),
  direccion: text('direccion').default(''),
  telefono: varchar('telefono', { length: 50 }).default(''),
  email: varchar('email', { length: 200 }).default(''),
  logo: text('logo').default(''),
});
