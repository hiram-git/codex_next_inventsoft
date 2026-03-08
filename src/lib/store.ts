import { db } from '../db';
import { eq, sql, and, desc } from 'drizzle-orm';
import * as schema from '../db/schema';

// Re-export types inferred from schema
export type User = typeof schema.usuarios.$inferSelect;
export type Cliente = typeof schema.clientes.$inferSelect;
export type Producto = typeof schema.productos.$inferSelect;
export type Factura = typeof schema.facturas.$inferSelect;
export type Empresa = typeof schema.empresa.$inferSelect;
export type Rol = typeof schema.roles.$inferSelect;
export type Permiso = typeof schema.permisos.$inferSelect;
export type Almacen = typeof schema.almacenes.$inferSelect;
export type InventarioRow = typeof schema.inventario.$inferSelect;
export type KardexRow = typeof schema.kardex.$inferSelect;
export type Compra = typeof schema.compras.$inferSelect;
export type Pedido = typeof schema.pedidos.$inferSelect;
export type Servicio = typeof schema.servicios.$inferSelect;
export type NotaCredito = typeof schema.notasCredito.$inferSelect;
export type Cobro = typeof schema.cobros.$inferSelect;

// Helper: numeric columns come back as strings from pg, convert to number
function num(v: string | number | null): number {
  return Number(v ?? 0);
}

function normalizeFactura(row: Factura) {
  return {
    ...row,
    id: String(row.id),
    clienteId: String(row.clienteId),
    almacenId: row.almacenId ? String(row.almacenId) : null,
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

function normalizeServicio(row: Servicio) {
  return { ...row, id: String(row.id), precio: num(row.precio) };
}

function normalizeNotaCredito(row: NotaCredito) {
  return {
    ...row,
    id: String(row.id),
    facturaId: String(row.facturaId),
    clienteId: String(row.clienteId),
    almacenId: row.almacenId ? String(row.almacenId) : null,
    subtotal: num(row.subtotal),
    iva: num(row.iva),
    total: num(row.total),
    items: (row.items ?? []).map(i => ({
      ...i,
      tipo: i.tipo ?? 'producto' as const,
      precioUnitario: num(i.precioUnitario),
      subtotal: num(i.subtotal),
    })),
  };
}

function normalizeCobro(row: Cobro) {
  return { ...row, id: String(row.id), facturaId: String(row.facturaId), clienteId: String(row.clienteId), monto: num(row.monto) };
}

function normalizeCompra(row: Compra) {
  return {
    ...row,
    id: String(row.id),
    almacenId: String(row.almacenId),
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

function normalizePedido(row: Pedido) {
  return {
    ...row,
    id: String(row.id),
    clienteId: String(row.clienteId),
    almacenId: String(row.almacenId),
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
    almacenId?: string;
    almacenNombre?: string;
    items: { productoId: string; productoNombre: string; cantidad: number; precioUnitario: number; subtotal: number }[];
    subtotal: number;
    iva: number;
    total: number;
    estado: string;
    fecha: string;
    fechaVencimiento?: string;
  }) {
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(schema.facturas);
    const count = Number(countResult[0].count);
    const numero = `FAC-${String(count + 1).padStart(3, '0')}`;

    const rows = await db.insert(schema.facturas).values({
      numero,
      clienteId: Number(data.clienteId),
      clienteNombre: data.clienteNombre,
      almacenId: data.almacenId ? Number(data.almacenId) : null,
      almacenNombre: data.almacenNombre ?? '',
      items: data.items,
      subtotal: String(data.subtotal),
      iva: String(data.iva),
      total: String(data.total),
      estado: data.estado,
      fecha: data.fecha,
      fechaVencimiento: data.fechaVencimiento ?? null,
    }).returning();
    const factura = normalizeFactura(rows[0]);

    // If almacenId provided, create inventory exits only for tipo='producto' items
    if (data.almacenId && data.almacenNombre) {
      for (const item of data.items) {
        if ((item.tipo ?? 'producto') !== 'producto') continue;
        const existing = await this.getInventarioItem(data.almacenId, item.productoId);
        const stockAnterior = existing?.stock ?? 0;
        const stockNuevo = Math.max(0, stockAnterior - item.cantidad);
        await this._adjustStock(data.almacenId, data.almacenNombre, item.productoId, item.productoNombre, -item.cantidad, 0);
        await this._createMovimientoKardex({
          almacenId: data.almacenId,
          almacenNombre: data.almacenNombre,
          productoId: item.productoId,
          productoNombre: item.productoNombre,
          tipo: 'salida',
          cantidad: item.cantidad,
          stockAnterior,
          stockNuevo,
          referencia: 'factura',
          referenciaId: Number(factura.id),
          referenciaNumero: factura.numero,
          notas: `Salida por factura ${factura.numero}`,
          fecha: data.fecha,
        });
      }
    }

    return factura;
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

  // --- Almacenes ---
  async getAlmacenes() {
    const rows = await db.select().from(schema.almacenes);
    return rows.map(normalizeId);
  },

  async getAlmacen(id: string) {
    const rows = await db.select().from(schema.almacenes).where(eq(schema.almacenes.id, Number(id)));
    return rows[0] ? normalizeId(rows[0]) : undefined;
  },

  async createAlmacen(data: { nombre: string; descripcion: string; ubicacion: string; activo: boolean }) {
    const rows = await db.insert(schema.almacenes).values(data).returning();
    return normalizeId(rows[0]);
  },

  async updateAlmacen(id: string, data: Record<string, unknown>) {
    const rows = await db.update(schema.almacenes).set(data).where(eq(schema.almacenes.id, Number(id))).returning();
    return rows[0] ? normalizeId(rows[0]) : null;
  },

  async deleteAlmacen(id: string) {
    const rows = await db.delete(schema.almacenes).where(eq(schema.almacenes.id, Number(id))).returning();
    return rows.length > 0;
  },

  // --- Inventario ---
  async getInventario(almacenId?: string) {
    if (almacenId) {
      const rows = await db.select().from(schema.inventario).where(eq(schema.inventario.almacenId, Number(almacenId)));
      return rows.map(normalizeId);
    }
    const rows = await db.select().from(schema.inventario);
    return rows.map(normalizeId);
  },

  async getInventarioItem(almacenId: string, productoId: string) {
    const rows = await db.select().from(schema.inventario).where(
      and(
        eq(schema.inventario.almacenId, Number(almacenId)),
        eq(schema.inventario.productoId, Number(productoId))
      )
    );
    return rows[0] ? normalizeId(rows[0]) : undefined;
  },

  // Internal helper: adjust stock (+/- delta) and reserved (+/- deltaReservado)
  async _adjustStock(almacenId: string, almacenNombre: string, productoId: string, productoNombre: string, delta: number, deltaReservado: number) {
    const existing = await this.getInventarioItem(almacenId, productoId);
    if (existing) {
      const newStock = existing.stock + delta;
      const newReservado = Math.max(0, existing.stockReservado + deltaReservado);
      await db.update(schema.inventario)
        .set({ stock: newStock, stockReservado: newReservado })
        .where(eq(schema.inventario.id, Number(existing.id)));
      return { ...existing, stock: newStock, stockReservado: newReservado };
    } else {
      const rows = await db.insert(schema.inventario).values({
        almacenId: Number(almacenId),
        almacenNombre,
        productoId: Number(productoId),
        productoNombre,
        stock: Math.max(0, delta),
        stockReservado: Math.max(0, deltaReservado),
      }).returning();
      return normalizeId(rows[0]);
    }
  },

  // Internal helper: create a kardex movement
  async _createMovimientoKardex(data: {
    almacenId: string;
    almacenNombre: string;
    productoId: string;
    productoNombre: string;
    tipo: 'entrada' | 'salida' | 'reserva' | 'liberacion';
    cantidad: number;
    stockAnterior: number;
    stockNuevo: number;
    referencia: 'compra' | 'factura' | 'pedido' | 'ajuste';
    referenciaId?: number;
    referenciaNumero?: string;
    notas?: string;
    fecha: string;
  }) {
    const rows = await db.insert(schema.kardex).values({
      almacenId: Number(data.almacenId),
      almacenNombre: data.almacenNombre,
      productoId: Number(data.productoId),
      productoNombre: data.productoNombre,
      tipo: data.tipo,
      cantidad: data.cantidad,
      stockAnterior: data.stockAnterior,
      stockNuevo: data.stockNuevo,
      referencia: data.referencia,
      referenciaId: data.referenciaId,
      referenciaNumero: data.referenciaNumero ?? '',
      notas: data.notas ?? '',
      fecha: data.fecha,
    }).returning();
    return normalizeId(rows[0]);
  },

  // --- Kardex ---
  async getKardex(filters?: { almacenId?: string; productoId?: string }) {
    let rows;
    if (filters?.almacenId && filters?.productoId) {
      rows = await db.select().from(schema.kardex).where(
        and(
          eq(schema.kardex.almacenId, Number(filters.almacenId)),
          eq(schema.kardex.productoId, Number(filters.productoId))
        )
      ).orderBy(desc(schema.kardex.id));
    } else if (filters?.almacenId) {
      rows = await db.select().from(schema.kardex).where(
        eq(schema.kardex.almacenId, Number(filters.almacenId))
      ).orderBy(desc(schema.kardex.id));
    } else if (filters?.productoId) {
      rows = await db.select().from(schema.kardex).where(
        eq(schema.kardex.productoId, Number(filters.productoId))
      ).orderBy(desc(schema.kardex.id));
    } else {
      rows = await db.select().from(schema.kardex).orderBy(desc(schema.kardex.id));
    }
    return rows.map(normalizeId);
  },

  // --- Compras ---
  async getCompras() {
    const rows = await db.select().from(schema.compras).orderBy(desc(schema.compras.id));
    return rows.map(normalizeCompra);
  },

  async getCompra(id: string) {
    const rows = await db.select().from(schema.compras).where(eq(schema.compras.id, Number(id)));
    return rows[0] ? normalizeCompra(rows[0]) : undefined;
  },

  async createCompra(data: {
    proveedorNombre: string;
    almacenId: string;
    almacenNombre: string;
    items: { productoId: string; productoNombre: string; cantidad: number; precioUnitario: number; subtotal: number }[];
    subtotal: number;
    iva: number;
    total: number;
    fecha: string;
  }) {
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(schema.compras);
    const count = Number(countResult[0].count);
    const numero = `COM-${String(count + 1).padStart(3, '0')}`;

    const rows = await db.insert(schema.compras).values({
      numero,
      proveedorNombre: data.proveedorNombre,
      almacenId: Number(data.almacenId),
      almacenNombre: data.almacenNombre,
      items: data.items,
      subtotal: String(data.subtotal),
      iva: String(data.iva),
      total: String(data.total),
      estado: 'borrador',
      fecha: data.fecha,
    }).returning();
    return normalizeCompra(rows[0]);
  },

  async recibirCompra(id: string) {
    const compra = await this.getCompra(id);
    if (!compra || compra.estado !== 'borrador') return null;

    const fecha = new Date().toISOString().split('T')[0];

    for (const item of compra.items) {
      const existing = await this.getInventarioItem(compra.almacenId, item.productoId);
      const stockAnterior = existing?.stock ?? 0;
      const stockNuevo = stockAnterior + item.cantidad;

      await this._adjustStock(compra.almacenId, compra.almacenNombre, item.productoId, item.productoNombre, item.cantidad, 0);
      await this._createMovimientoKardex({
        almacenId: compra.almacenId,
        almacenNombre: compra.almacenNombre,
        productoId: item.productoId,
        productoNombre: item.productoNombre,
        tipo: 'entrada',
        cantidad: item.cantidad,
        stockAnterior,
        stockNuevo,
        referencia: 'compra',
        referenciaId: Number(compra.id),
        referenciaNumero: compra.numero,
        notas: `Recepción de compra ${compra.numero}`,
        fecha,
      });
    }

    const rows = await db.update(schema.compras).set({ estado: 'recibida' }).where(eq(schema.compras.id, Number(id))).returning();
    return rows[0] ? normalizeCompra(rows[0]) : null;
  },

  async cancelarCompra(id: string) {
    const rows = await db.update(schema.compras).set({ estado: 'cancelada' }).where(eq(schema.compras.id, Number(id))).returning();
    return rows[0] ? normalizeCompra(rows[0]) : null;
  },

  // --- Pedidos ---
  async getPedidos() {
    const rows = await db.select().from(schema.pedidos).orderBy(desc(schema.pedidos.id));
    return rows.map(normalizePedido);
  },

  async getPedido(id: string) {
    const rows = await db.select().from(schema.pedidos).where(eq(schema.pedidos.id, Number(id)));
    return rows[0] ? normalizePedido(rows[0]) : undefined;
  },

  async createPedido(data: {
    clienteId: string;
    clienteNombre: string;
    almacenId: string;
    almacenNombre: string;
    items: { productoId: string; productoNombre: string; cantidad: number; precioUnitario: number; subtotal: number }[];
    subtotal: number;
    iva: number;
    total: number;
    notas: string;
    fecha: string;
  }) {
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(schema.pedidos);
    const count = Number(countResult[0].count);
    const numero = `PED-${String(count + 1).padStart(3, '0')}`;

    const rows = await db.insert(schema.pedidos).values({
      numero,
      clienteId: Number(data.clienteId),
      clienteNombre: data.clienteNombre,
      almacenId: Number(data.almacenId),
      almacenNombre: data.almacenNombre,
      items: data.items,
      subtotal: String(data.subtotal),
      iva: String(data.iva),
      total: String(data.total),
      estado: 'borrador',
      notas: data.notas,
      fecha: data.fecha,
    }).returning();
    return normalizePedido(rows[0]);
  },

  async confirmarPedido(id: string) {
    const pedido = await this.getPedido(id);
    if (!pedido || pedido.estado !== 'borrador') {
      return { ok: false, error: 'El pedido no está en estado borrador.' };
    }

    const fecha = new Date().toISOString().split('T')[0];

    // Validate stock disponible for all items before making any changes
    for (const item of pedido.items) {
      const inv = await this.getInventarioItem(pedido.almacenId, item.productoId);
      const disponible = (inv?.stock ?? 0) - (inv?.stockReservado ?? 0);
      if (disponible < item.cantidad) {
        return { ok: false, error: `Stock insuficiente para "${item.productoNombre}". Disponible: ${disponible}, requerido: ${item.cantidad}.` };
      }
    }

    // Reserve inventory
    for (const item of pedido.items) {
      const inv = await this.getInventarioItem(pedido.almacenId, item.productoId);
      const stockDisponibleAnterior = (inv?.stock ?? 0) - (inv?.stockReservado ?? 0);
      const stockDisponibleNuevo = stockDisponibleAnterior - item.cantidad;

      await this._adjustStock(pedido.almacenId, pedido.almacenNombre, item.productoId, item.productoNombre, 0, item.cantidad);
      await this._createMovimientoKardex({
        almacenId: pedido.almacenId,
        almacenNombre: pedido.almacenNombre,
        productoId: item.productoId,
        productoNombre: item.productoNombre,
        tipo: 'reserva',
        cantidad: item.cantidad,
        stockAnterior: stockDisponibleAnterior,
        stockNuevo: stockDisponibleNuevo,
        referencia: 'pedido',
        referenciaId: Number(pedido.id),
        referenciaNumero: pedido.numero,
        notas: `Reserva por pedido ${pedido.numero}`,
        fecha,
      });
    }

    const rows = await db.update(schema.pedidos).set({ estado: 'confirmado' }).where(eq(schema.pedidos.id, Number(id))).returning();
    return { ok: true, pedido: rows[0] ? normalizePedido(rows[0]) : null };
  },

  async cancelarPedido(id: string) {
    const pedido = await this.getPedido(id);
    if (!pedido) return null;

    const fecha = new Date().toISOString().split('T')[0];

    // If confirmed, release reservations
    if (pedido.estado === 'confirmado') {
      for (const item of pedido.items) {
        const inv = await this.getInventarioItem(pedido.almacenId, item.productoId);
        const stockDisponibleAnterior = (inv?.stock ?? 0) - (inv?.stockReservado ?? 0);
        const stockDisponibleNuevo = stockDisponibleAnterior + item.cantidad;

        await this._adjustStock(pedido.almacenId, pedido.almacenNombre, item.productoId, item.productoNombre, 0, -item.cantidad);
        await this._createMovimientoKardex({
          almacenId: pedido.almacenId,
          almacenNombre: pedido.almacenNombre,
          productoId: item.productoId,
          productoNombre: item.productoNombre,
          tipo: 'liberacion',
          cantidad: item.cantidad,
          stockAnterior: stockDisponibleAnterior,
          stockNuevo: stockDisponibleNuevo,
          referencia: 'pedido',
          referenciaId: Number(pedido.id),
          referenciaNumero: pedido.numero,
          notas: `Liberación por cancelación de pedido ${pedido.numero}`,
          fecha,
        });
      }
    }

    const rows = await db.update(schema.pedidos).set({ estado: 'cancelado' }).where(eq(schema.pedidos.id, Number(id))).returning();
    return rows[0] ? normalizePedido(rows[0]) : null;
  },

  // --- Servicios ---
  async getServicios() {
    const rows = await db.select().from(schema.servicios);
    return rows.map(normalizeServicio);
  },

  async getServicio(id: string) {
    const rows = await db.select().from(schema.servicios).where(eq(schema.servicios.id, Number(id)));
    return rows[0] ? normalizeServicio(rows[0]) : undefined;
  },

  async createServicio(data: { nombre: string; descripcion: string; precio: number; categoria: string; activo: boolean }) {
    const rows = await db.insert(schema.servicios).values({ ...data, precio: String(data.precio) }).returning();
    return normalizeServicio(rows[0]);
  },

  async updateServicio(id: string, data: Record<string, unknown>) {
    const values = { ...data };
    if (typeof values.precio === 'number') values.precio = String(values.precio);
    const rows = await db.update(schema.servicios).set(values).where(eq(schema.servicios.id, Number(id))).returning();
    return rows[0] ? normalizeServicio(rows[0]) : null;
  },

  async deleteServicio(id: string) {
    const rows = await db.delete(schema.servicios).where(eq(schema.servicios.id, Number(id))).returning();
    return rows.length > 0;
  },

  // --- Notas de Crédito ---
  async getNotasCredito() {
    const rows = await db.select().from(schema.notasCredito).orderBy(desc(schema.notasCredito.id));
    return rows.map(normalizeNotaCredito);
  },

  async getNotaCredito(id: string) {
    const rows = await db.select().from(schema.notasCredito).where(eq(schema.notasCredito.id, Number(id)));
    return rows[0] ? normalizeNotaCredito(rows[0]) : undefined;
  },

  async getNotaCreditoByFactura(facturaId: string) {
    const rows = await db.select().from(schema.notasCredito).where(eq(schema.notasCredito.facturaId, Number(facturaId)));
    return rows[0] ? normalizeNotaCredito(rows[0]) : undefined;
  },

  async createNotaCredito(facturaId: string, motivo: string) {
    const factura = await this.getFactura(facturaId);
    if (!factura || factura.estado === 'cancelada') return null;

    const countResult = await db.select({ count: sql<number>`count(*)` }).from(schema.notasCredito);
    const count = Number(countResult[0].count);
    const numero = `NC-${String(count + 1).padStart(3, '0')}`;
    const fecha = new Date().toISOString().split('T')[0];

    const rows = await db.insert(schema.notasCredito).values({
      numero,
      facturaId: Number(facturaId),
      facturaNumero: factura.numero,
      clienteId: Number(factura.clienteId),
      clienteNombre: factura.clienteNombre,
      almacenId: factura.almacenId ? Number(factura.almacenId) : null,
      almacenNombre: factura.almacenNombre ?? '',
      items: factura.items as typeof schema.notasCredito.$inferInsert['items'],
      subtotal: String(factura.subtotal),
      iva: String(factura.iva),
      total: String(factura.total),
      motivo,
      fecha,
    }).returning();
    const nota = normalizeNotaCredito(rows[0]);

    // Cancel the factura
    await db.update(schema.facturas).set({ estado: 'cancelada' }).where(eq(schema.facturas.id, Number(facturaId)));

    // Return inventory for tipo='producto' items that had a warehouse
    if (factura.almacenId && factura.almacenNombre) {
      for (const item of factura.items) {
        if ((item.tipo ?? 'producto') !== 'producto') continue;
        const existing = await this.getInventarioItem(factura.almacenId, item.productoId);
        const stockAnterior = existing?.stock ?? 0;
        const stockNuevo = stockAnterior + item.cantidad;
        await this._adjustStock(factura.almacenId, factura.almacenNombre, item.productoId, item.productoNombre, item.cantidad, 0);
        await this._createMovimientoKardex({
          almacenId: factura.almacenId,
          almacenNombre: factura.almacenNombre,
          productoId: item.productoId,
          productoNombre: item.productoNombre,
          tipo: 'entrada',
          cantidad: item.cantidad,
          stockAnterior,
          stockNuevo,
          referencia: 'ajuste',
          referenciaId: Number(nota.id),
          referenciaNumero: nota.numero,
          notas: `Devolución por nota de crédito ${nota.numero}`,
          fecha,
        });
      }
    }

    return nota;
  },

  // --- Cobros ---
  async getCobros(facturaId?: string) {
    if (facturaId) {
      const rows = await db.select().from(schema.cobros)
        .where(eq(schema.cobros.facturaId, Number(facturaId)))
        .orderBy(desc(schema.cobros.id));
      return rows.map(normalizeCobro);
    }
    const rows = await db.select().from(schema.cobros).orderBy(desc(schema.cobros.id));
    return rows.map(normalizeCobro);
  },

  async getCobro(id: string) {
    const rows = await db.select().from(schema.cobros).where(eq(schema.cobros.id, Number(id)));
    return rows[0] ? normalizeCobro(rows[0]) : undefined;
  },

  async getCobrosCliente(clienteId: string) {
    const rows = await db.select().from(schema.cobros)
      .where(eq(schema.cobros.clienteId, Number(clienteId)))
      .orderBy(desc(schema.cobros.id));
    return rows.map(normalizeCobro);
  },

  // Computes total cobrado and saldo pendiente for a factura
  async getSaldoFactura(facturaId: string) {
    const factura = await this.getFactura(facturaId);
    if (!factura) return null;
    const cobrosRows = await db.select().from(schema.cobros).where(
      and(eq(schema.cobros.facturaId, Number(facturaId)), eq(schema.cobros.estado, 'aplicado'))
    );
    const cobrado = cobrosRows.reduce((sum, c) => sum + num(c.monto), 0);
    const saldo = Math.max(0, factura.total - cobrado);
    return { total: factura.total, cobrado, saldo };
  },

  // Internal: recalculate and update factura estado based on cobros
  async _recalcularEstadoFactura(facturaId: string) {
    const factura = await this.getFactura(facturaId);
    if (!factura || factura.estado === 'cancelada') return;
    const cobrosRows = await db.select().from(schema.cobros).where(
      and(eq(schema.cobros.facturaId, Number(facturaId)), eq(schema.cobros.estado, 'aplicado'))
    );
    const cobrado = cobrosRows.reduce((sum, c) => sum + num(c.monto), 0);
    const saldo = Math.max(0, factura.total - cobrado);
    const today = new Date().toISOString().split('T')[0];

    let nuevoEstado: string;
    if (saldo === 0) {
      nuevoEstado = 'pagada';
    } else if (cobrado > 0) {
      nuevoEstado = 'parcial';
    } else if (factura.fechaVencimiento && factura.fechaVencimiento < today) {
      nuevoEstado = 'vencida';
    } else {
      nuevoEstado = 'pendiente';
    }
    await db.update(schema.facturas).set({ estado: nuevoEstado }).where(eq(schema.facturas.id, Number(facturaId)));
  },

  async createCobro(data: {
    facturaId: string;
    monto: number;
    metodoPago: string;
    referencia?: string;
    notas?: string;
    fecha: string;
  }) {
    const factura = await this.getFactura(data.facturaId);
    if (!factura || factura.estado === 'cancelada' || factura.estado === 'pagada') {
      return { ok: false, error: 'La factura no admite cobros.' };
    }
    const saldoInfo = await this.getSaldoFactura(data.facturaId);
    if (!saldoInfo || data.monto <= 0 || data.monto > saldoInfo.saldo + 0.001) {
      return { ok: false, error: `Monto inválido. Saldo pendiente: ${saldoInfo?.saldo?.toFixed(2) ?? 0}` };
    }

    const countResult = await db.select({ count: sql<number>`count(*)` }).from(schema.cobros);
    const count = Number(countResult[0].count);
    const numero = `COB-${String(count + 1).padStart(3, '0')}`;

    const rows = await db.insert(schema.cobros).values({
      numero,
      facturaId: Number(data.facturaId),
      facturaNumero: factura.numero,
      clienteId: Number(factura.clienteId),
      clienteNombre: factura.clienteNombre,
      monto: String(data.monto),
      fecha: data.fecha,
      metodoPago: data.metodoPago,
      referencia: data.referencia ?? '',
      notas: data.notas ?? '',
      estado: 'aplicado',
    }).returning();

    await this._recalcularEstadoFactura(data.facturaId);
    return { ok: true, cobro: normalizeCobro(rows[0]) };
  },

  async anularCobro(id: string) {
    const cobro = await this.getCobro(id);
    if (!cobro || cobro.estado === 'anulado') return { ok: false, error: 'Cobro ya anulado.' };
    await db.update(schema.cobros).set({ estado: 'anulado' }).where(eq(schema.cobros.id, Number(id)));
    await this._recalcularEstadoFactura(cobro.facturaId);
    return { ok: true };
  },

  // --- Cuentas por Cobrar ---
  async getCuentasPorCobrar() {
    // All facturas not pagada/cancelada
    const todasFacturas = await db.select().from(schema.facturas);
    const pendientes = todasFacturas
      .map(normalizeFactura)
      .filter(f => f.estado !== 'pagada' && f.estado !== 'cancelada');

    const today = new Date().toISOString().split('T')[0];

    const result = await Promise.all(pendientes.map(async (f) => {
      const cobrosRows = await db.select().from(schema.cobros).where(
        and(eq(schema.cobros.facturaId, Number(f.id)), eq(schema.cobros.estado, 'aplicado'))
      );
      const cobrado = cobrosRows.reduce((sum, c) => sum + num(c.monto), 0);
      const saldo = Math.max(0, f.total - cobrado);

      let diasVencido = 0;
      if (f.fechaVencimiento && f.fechaVencimiento < today) {
        const ms = new Date(today).getTime() - new Date(f.fechaVencimiento).getTime();
        diasVencido = Math.floor(ms / 86400000);
      }

      return { ...f, cobrado, saldo, diasVencido };
    }));

    return result.sort((a, b) => b.diasVencido - a.diasVencido);
  },

  async despacharPedido(id: string) {
    const pedido = await this.getPedido(id);
    if (!pedido || pedido.estado !== 'confirmado') return null;

    const fecha = new Date().toISOString().split('T')[0];

    // Create actual stock exits (salidas) and release reservations
    for (const item of pedido.items) {
      const inv = await this.getInventarioItem(pedido.almacenId, item.productoId);
      const stockAnterior = inv?.stock ?? 0;
      const stockNuevo = Math.max(0, stockAnterior - item.cantidad);

      // Decrease stock and release reservation simultaneously
      await this._adjustStock(pedido.almacenId, pedido.almacenNombre, item.productoId, item.productoNombre, -item.cantidad, -item.cantidad);
      await this._createMovimientoKardex({
        almacenId: pedido.almacenId,
        almacenNombre: pedido.almacenNombre,
        productoId: item.productoId,
        productoNombre: item.productoNombre,
        tipo: 'salida',
        cantidad: item.cantidad,
        stockAnterior,
        stockNuevo,
        referencia: 'pedido',
        referenciaId: Number(pedido.id),
        referenciaNumero: pedido.numero,
        notas: `Despacho de pedido ${pedido.numero}`,
        fecha,
      });
    }

    const rows = await db.update(schema.pedidos).set({ estado: 'despachado' }).where(eq(schema.pedidos.id, Number(id))).returning();
    return rows[0] ? normalizePedido(rows[0]) : null;
  },
};
