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
  almacenId: integer('almacen_id'),
  almacenNombre: varchar('almacen_nombre', { length: 200 }).default(''),
  items: jsonb('items').$type<{
    tipo: 'producto' | 'servicio';
    productoId: string;
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[]>().default([]),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  iva: numeric('iva', { precision: 12, scale: 2 }).notNull(),
  total: numeric('total', { precision: 12, scale: 2 }).notNull(),
  estado: varchar('estado', { length: 20 }).notNull().default('pendiente'), // pendiente | parcial | pagada | cancelada | vencida
  fecha: date('fecha').defaultNow().notNull(),
  fechaVencimiento: date('fecha_vencimiento'),
});

// --- Cobros (pagos aplicados a facturas) ---
export const cobros = pgTable('cobros', {
  id: serial('id').primaryKey(),
  numero: varchar('numero', { length: 20 }).notNull().unique(),
  facturaId: integer('factura_id').notNull(),
  facturaNumero: varchar('factura_numero', { length: 20 }).notNull(),
  clienteId: integer('cliente_id').notNull(),
  clienteNombre: varchar('cliente_nombre', { length: 300 }).notNull(),
  monto: numeric('monto', { precision: 12, scale: 2 }).notNull(),
  fecha: date('fecha').defaultNow().notNull(),
  metodoPago: varchar('metodo_pago', { length: 50 }).notNull().default('efectivo'), // efectivo | transferencia | cheque | tarjeta
  referencia: varchar('referencia', { length: 100 }).default(''), // Nro cheque, Nro transferencia
  notas: text('notas').default(''),
  estado: varchar('estado', { length: 20 }).notNull().default('aplicado'), // aplicado | anulado
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

// --- Almacenes ---
export const almacenes = pgTable('almacenes', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 200 }).notNull(),
  descripcion: text('descripcion').default(''),
  ubicacion: varchar('ubicacion', { length: 300 }).default(''),
  activo: boolean('activo').default(true).notNull(),
});

// --- Inventario (stock por almacén × producto) ---
export const inventario = pgTable('inventario', {
  id: serial('id').primaryKey(),
  almacenId: integer('almacen_id').notNull(),
  almacenNombre: varchar('almacen_nombre', { length: 200 }).notNull(),
  productoId: integer('producto_id').notNull(),
  productoNombre: varchar('producto_nombre', { length: 300 }).notNull(),
  stock: integer('stock').default(0).notNull(),
  stockReservado: integer('stock_reservado').default(0).notNull(),
});

// --- Kardex (movimientos de inventario) ---
export const kardex = pgTable('kardex', {
  id: serial('id').primaryKey(),
  almacenId: integer('almacen_id').notNull(),
  almacenNombre: varchar('almacen_nombre', { length: 200 }).notNull(),
  productoId: integer('producto_id').notNull(),
  productoNombre: varchar('producto_nombre', { length: 300 }).notNull(),
  tipo: varchar('tipo', { length: 20 }).notNull(), // 'entrada' | 'salida' | 'reserva' | 'liberacion'
  cantidad: integer('cantidad').notNull(),
  stockAnterior: integer('stock_anterior').notNull(),
  stockNuevo: integer('stock_nuevo').notNull(),
  referencia: varchar('referencia', { length: 20 }).notNull(), // 'compra' | 'factura' | 'pedido' | 'ajuste'
  referenciaId: integer('referencia_id'),
  referenciaNumero: varchar('referencia_numero', { length: 30 }).default(''),
  notas: text('notas').default(''),
  fecha: date('fecha').defaultNow().notNull(),
});

// --- Compras (ingresos de mercancía) ---
export const compras = pgTable('compras', {
  id: serial('id').primaryKey(),
  numero: varchar('numero', { length: 20 }).notNull().unique(),
  proveedorNombre: varchar('proveedor_nombre', { length: 300 }).notNull(),
  almacenId: integer('almacen_id').notNull(),
  almacenNombre: varchar('almacen_nombre', { length: 200 }).notNull(),
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
  estado: varchar('estado', { length: 20 }).notNull().default('borrador'),
  fecha: date('fecha').defaultNow().notNull(),
});

// --- Pedidos (reservas de inventario) ---
export const pedidos = pgTable('pedidos', {
  id: serial('id').primaryKey(),
  numero: varchar('numero', { length: 20 }).notNull().unique(),
  clienteId: integer('cliente_id').notNull(),
  clienteNombre: varchar('cliente_nombre', { length: 300 }).notNull(),
  almacenId: integer('almacen_id').notNull(),
  almacenNombre: varchar('almacen_nombre', { length: 200 }).notNull(),
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
  estado: varchar('estado', { length: 20 }).notNull().default('borrador'),
  notas: text('notas').default(''),
  fecha: date('fecha').defaultNow().notNull(),
});

// --- Servicios (no mueven inventario) ---
export const servicios = pgTable('servicios', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 300 }).notNull(),
  descripcion: text('descripcion').default(''),
  precio: numeric('precio', { precision: 12, scale: 2 }).notNull(),
  categoria: varchar('categoria', { length: 100 }).default(''),
  activo: boolean('activo').default(true).notNull(),
});

// --- Notas de Crédito (anulación de facturas) ---
export const notasCredito = pgTable('notas_credito', {
  id: serial('id').primaryKey(),
  numero: varchar('numero', { length: 20 }).notNull().unique(),
  facturaId: integer('factura_id').notNull(),
  facturaNumero: varchar('factura_numero', { length: 20 }).notNull(),
  clienteId: integer('cliente_id').notNull(),
  clienteNombre: varchar('cliente_nombre', { length: 300 }).notNull(),
  almacenId: integer('almacen_id'),
  almacenNombre: varchar('almacen_nombre', { length: 200 }).default(''),
  items: jsonb('items').$type<{
    tipo: 'producto' | 'servicio';
    productoId: string;
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[]>().default([]),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  iva: numeric('iva', { precision: 12, scale: 2 }).notNull(),
  total: numeric('total', { precision: 12, scale: 2 }).notNull(),
  motivo: text('motivo').notNull().default(''),
  fecha: date('fecha').defaultNow().notNull(),
});
