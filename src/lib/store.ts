import { db } from '../db';
import { eq, sql } from 'drizzle-orm';
import * as schema from '../db/schema';

// Re-export types inferred from schema
export type User = typeof schema.usuarios.$inferSelect;
export type Cliente = typeof schema.clientes.$inferSelect;
export type Producto = typeof schema.productos.$inferSelect;
export type Factura = typeof schema.facturas.$inferSelect;
export type Empresa = typeof schema.empresa.$inferSelect;
export type Rol = typeof schema.roles.$inferSelect;
export type Permiso = typeof schema.permisos.$inferSelect;

// Helper: numeric columns come back as strings from pg, convert to number
function num(v: string | number | null): number {
  return Number(v ?? 0);
}

// --- Utility to normalize a factura row so numeric fields are numbers ---
function normalizeFactura(row: Factura) {
  return {
    ...row,
    id: String(row.id),
    clienteId: String(row.clienteId),
    subtotal: num(row.subtotal),
    iva: num(row.iva),
    total: num(row.total),
    items: (row.items ?? []).map(i => ({
      ...i,
      precioUnitario: num(i.precioUnitario),
      subtotal: num(i.subtotal),
    })),
  };
}

function normalizeProducto(row: Producto) {
  return {
    ...row,
    id: String(row.id),
    precio: num(row.precio),
  };
}

function normalizeId<T extends { id: number }>(row: T) {
  return { ...row, id: String(row.id) };
}

export const store = {
  // --- Usuarios ---
  async getUsuarios() {
    const rows = await db.select().from(schema.usuarios);
    return rows.map(normalizeId);
  },

  async getUsuario(id: string) {
    const rows = await db.select().from(schema.usuarios).where(eq(schema.usuarios.id, Number(id)));
    return rows[0] ? normalizeId(rows[0]) : undefined;
  },

  async getUsuarioByEmail(email: string) {
    const rows = await db.select().from(schema.usuarios).where(eq(schema.usuarios.email, email));
    return rows[0] ? normalizeId(rows[0]) : undefined;
  },

  async createUsuario(data: { nombre: string; email: string; password: string; rol: string; activo: boolean }) {
    const rows = await db.insert(schema.usuarios).values(data).returning();
    return normalizeId(rows[0]);
  },

  async updateUsuario(id: string, data: Record<string, unknown>) {
    const rows = await db.update(schema.usuarios).set(data).where(eq(schema.usuarios.id, Number(id))).returning();
    return rows[0] ? normalizeId(rows[0]) : null;
  },

  async deleteUsuario(id: string) {
    const rows = await db.delete(schema.usuarios).where(eq(schema.usuarios.id, Number(id))).returning();
    return rows.length > 0;
  },

  // --- Clientes ---
  async getClientes() {
    const rows = await db.select().from(schema.clientes);
    return rows.map(normalizeId);
  },

  async getCliente(id: string) {
    const rows = await db.select().from(schema.clientes).where(eq(schema.clientes.id, Number(id)));
    return rows[0] ? normalizeId(rows[0]) : undefined;
  },

  async createCliente(data: { nombre: string; email: string; telefono: string; direccion: string; rfc: string }) {
    const rows = await db.insert(schema.clientes).values(data).returning();
    return normalizeId(rows[0]);
  },

  async updateCliente(id: string, data: Record<string, unknown>) {
    const rows = await db.update(schema.clientes).set(data).where(eq(schema.clientes.id, Number(id))).returning();
    return rows[0] ? normalizeId(rows[0]) : null;
  },

  async deleteCliente(id: string) {
    const rows = await db.delete(schema.clientes).where(eq(schema.clientes.id, Number(id))).returning();
    return rows.length > 0;
  },

  // --- Productos ---
  async getProductos() {
    const rows = await db.select().from(schema.productos);
    return rows.map(normalizeProducto);
  },

  async getProducto(id: string) {
    const rows = await db.select().from(schema.productos).where(eq(schema.productos.id, Number(id)));
    return rows[0] ? normalizeProducto(rows[0]) : undefined;
  },

  async createProducto(data: { nombre: string; descripcion: string; precio: number; stock: number; categoria: string; activo: boolean }) {
    const rows = await db.insert(schema.productos).values({ ...data, precio: String(data.precio) }).returning();
    return normalizeProducto(rows[0]);
  },

  async updateProducto(id: string, data: Record<string, unknown>) {
    const values = { ...data };
    if (typeof values.precio === 'number') values.precio = String(values.precio);
    const rows = await db.update(schema.productos).set(values).where(eq(schema.productos.id, Number(id))).returning();
    return rows[0] ? normalizeProducto(rows[0]) : null;
  },

  async deleteProducto(id: string) {
    const rows = await db.delete(schema.productos).where(eq(schema.productos.id, Number(id))).returning();
    return rows.length > 0;
  },

  // --- Facturas ---
  async getFacturas() {
    const rows = await db.select().from(schema.facturas);
    return rows.map(normalizeFactura);
  },

  async getFactura(id: string) {
    const rows = await db.select().from(schema.facturas).where(eq(schema.facturas.id, Number(id)));
    return rows[0] ? normalizeFactura(rows[0]) : undefined;
  },

  async createFactura(data: {
    clienteId: string;
    clienteNombre: string;
    items: { productoId: string; productoNombre: string; cantidad: number; precioUnitario: number; subtotal: number }[];
    subtotal: number;
    iva: number;
    total: number;
    estado: string;
    fecha: string;
  }) {
    // Generate next numero
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(schema.facturas);
    const count = Number(countResult[0].count);
    const numero = `FAC-${String(count + 1).padStart(3, '0')}`;

    const rows = await db.insert(schema.facturas).values({
      numero,
      clienteId: Number(data.clienteId),
      clienteNombre: data.clienteNombre,
      items: data.items,
      subtotal: String(data.subtotal),
      iva: String(data.iva),
      total: String(data.total),
      estado: data.estado,
      fecha: data.fecha,
    }).returning();
    return normalizeFactura(rows[0]);
  },

  async updateFactura(id: string, data: Record<string, unknown>) {
    const values = { ...data };
    if (typeof values.subtotal === 'number') values.subtotal = String(values.subtotal);
    if (typeof values.iva === 'number') values.iva = String(values.iva);
    if (typeof values.total === 'number') values.total = String(values.total);
    const rows = await db.update(schema.facturas).set(values).where(eq(schema.facturas.id, Number(id))).returning();
    return rows[0] ? normalizeFactura(rows[0]) : null;
  },

  // --- Empresa ---
  async getEmpresa() {
    const rows = await db.select().from(schema.empresa);
    return rows[0] ?? null;
  },

  async updateEmpresa(data: Record<string, unknown>) {
    const rows = await db.select().from(schema.empresa);
    if (rows.length === 0) {
      const inserted = await db.insert(schema.empresa).values(data as typeof schema.empresa.$inferInsert).returning();
      return inserted[0];
    }
    const updated = await db.update(schema.empresa).set(data).where(eq(schema.empresa.id, rows[0].id)).returning();
    return updated[0];
  },

  // --- Roles ---
  async getRoles() {
    const rows = await db.select().from(schema.roles);
    return rows.map(r => ({ ...normalizeId(r), permisos: (r.permisos ?? []) as string[] }));
  },

  async getRol(id: string) {
    const rows = await db.select().from(schema.roles).where(eq(schema.roles.id, Number(id)));
    if (!rows[0]) return undefined;
    return { ...normalizeId(rows[0]), permisos: (rows[0].permisos ?? []) as string[] };
  },

  async createRol(data: { nombre: string; descripcion: string; permisos: string[] }) {
    const rows = await db.insert(schema.roles).values(data).returning();
    return { ...normalizeId(rows[0]), permisos: (rows[0].permisos ?? []) as string[] };
  },

  async updateRol(id: string, data: Record<string, unknown>) {
    const rows = await db.update(schema.roles).set(data).where(eq(schema.roles.id, Number(id))).returning();
    if (!rows[0]) return null;
    return { ...normalizeId(rows[0]), permisos: (rows[0].permisos ?? []) as string[] };
  },

  async deleteRol(id: string) {
    const rows = await db.delete(schema.roles).where(eq(schema.roles.id, Number(id))).returning();
    return rows.length > 0;
  },

  // --- Permisos ---
  async getPermisos() {
    const rows = await db.select().from(schema.permisos);
    return rows.map(normalizeId);
  },

  async getPermiso(id: string) {
    const rows = await db.select().from(schema.permisos).where(eq(schema.permisos.id, Number(id)));
    return rows[0] ? normalizeId(rows[0]) : undefined;
  },

  async createPermiso(data: { clave: string; nombre: string; modulo: string }) {
    const rows = await db.insert(schema.permisos).values(data).returning();
    return normalizeId(rows[0]);
  },

  async updatePermiso(id: string, data: Record<string, unknown>) {
    const rows = await db.update(schema.permisos).set(data).where(eq(schema.permisos.id, Number(id))).returning();
    return rows[0] ? normalizeId(rows[0]) : null;
  },

  async deletePermiso(id: string) {
    const rows = await db.delete(schema.permisos).where(eq(schema.permisos.id, Number(id))).returning();
    return rows.length > 0;
  },
};
