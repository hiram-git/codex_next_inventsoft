// In-memory data store for the admin portal
// In production, replace with a real database

export interface User {
  id: string;
  nombre: string;
  email: string;
  password: string;
  rol: string;
  activo: boolean;
}

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  rfc: string;
  createdAt: string;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  activo: boolean;
}

export interface ItemFactura {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Factura {
  id: string;
  numero: string;
  clienteId: string;
  clienteNombre: string;
  items: ItemFactura[];
  subtotal: number;
  iva: number;
  total: number;
  estado: 'pendiente' | 'pagada' | 'cancelada';
  fecha: string;
}

export interface Empresa {
  nombre: string;
  rfc: string;
  direccion: string;
  telefono: string;
  email: string;
  logo: string;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[];
}

export interface Permiso {
  id: string;
  clave: string;
  nombre: string;
  modulo: string;
}

// --- Initial data ---

const permisos: Permiso[] = [
  { id: '1', clave: 'clientes.ver', nombre: 'Ver clientes', modulo: 'Clientes' },
  { id: '2', clave: 'clientes.crear', nombre: 'Crear clientes', modulo: 'Clientes' },
  { id: '3', clave: 'clientes.editar', nombre: 'Editar clientes', modulo: 'Clientes' },
  { id: '4', clave: 'clientes.eliminar', nombre: 'Eliminar clientes', modulo: 'Clientes' },
  { id: '5', clave: 'productos.ver', nombre: 'Ver productos', modulo: 'Productos' },
  { id: '6', clave: 'productos.crear', nombre: 'Crear productos', modulo: 'Productos' },
  { id: '7', clave: 'productos.editar', nombre: 'Editar productos', modulo: 'Productos' },
  { id: '8', clave: 'productos.eliminar', nombre: 'Eliminar productos', modulo: 'Productos' },
  { id: '9', clave: 'facturas.ver', nombre: 'Ver facturas', modulo: 'Facturas' },
  { id: '10', clave: 'facturas.crear', nombre: 'Crear facturas', modulo: 'Facturas' },
  { id: '11', clave: 'facturas.editar', nombre: 'Editar facturas', modulo: 'Facturas' },
  { id: '12', clave: 'configuracion.ver', nombre: 'Ver configuración', modulo: 'Configuración' },
  { id: '13', clave: 'configuracion.editar', nombre: 'Editar configuración', modulo: 'Configuración' },
  { id: '14', clave: 'usuarios.ver', nombre: 'Ver usuarios', modulo: 'Usuarios' },
  { id: '15', clave: 'usuarios.crear', nombre: 'Crear usuarios', modulo: 'Usuarios' },
  { id: '16', clave: 'usuarios.editar', nombre: 'Editar usuarios', modulo: 'Usuarios' },
  { id: '17', clave: 'usuarios.eliminar', nombre: 'Eliminar usuarios', modulo: 'Usuarios' },
];

const roles: Rol[] = [
  {
    id: '1',
    nombre: 'Administrador',
    descripcion: 'Acceso completo al sistema',
    permisos: permisos.map(p => p.clave),
  },
  {
    id: '2',
    nombre: 'Vendedor',
    descripcion: 'Gestión de clientes y facturas',
    permisos: ['clientes.ver', 'clientes.crear', 'clientes.editar', 'productos.ver', 'facturas.ver', 'facturas.crear', 'facturas.editar'],
  },
  {
    id: '3',
    nombre: 'Almacén',
    descripcion: 'Gestión de productos e inventario',
    permisos: ['productos.ver', 'productos.crear', 'productos.editar'],
  },
];

const usuarios: User[] = [
  {
    id: '1',
    nombre: 'Admin',
    email: 'admin@portal.com',
    password: 'admin123',
    rol: 'Administrador',
    activo: true,
  },
  {
    id: '2',
    nombre: 'Carlos Vendedor',
    email: 'carlos@portal.com',
    password: '123456',
    rol: 'Vendedor',
    activo: true,
  },
];

const clientes: Cliente[] = [
  { id: '1', nombre: 'Empresa ABC S.A.', email: 'contacto@abc.com', telefono: '555-0101', direccion: 'Av. Reforma 100, CDMX', rfc: 'ABC010101AAA', createdAt: '2025-01-15' },
  { id: '2', nombre: 'Distribuidora XYZ', email: 'ventas@xyz.com', telefono: '555-0202', direccion: 'Calle 5 de Mayo 200, Puebla', rfc: 'XYZ020202BBB', createdAt: '2025-02-10' },
  { id: '3', nombre: 'Comercial del Norte', email: 'info@cdnorte.com', telefono: '555-0303', direccion: 'Blvd. Independencia 300, Monterrey', rfc: 'CDN030303CCC', createdAt: '2025-03-05' },
];

const productos: Producto[] = [
  { id: '1', nombre: 'Laptop Pro 15"', descripcion: 'Laptop profesional 16GB RAM, 512GB SSD', precio: 24999.99, stock: 15, categoria: 'Electrónica', activo: true },
  { id: '2', nombre: 'Monitor 27" 4K', descripcion: 'Monitor UHD IPS 27 pulgadas', precio: 8999.99, stock: 30, categoria: 'Electrónica', activo: true },
  { id: '3', nombre: 'Teclado Mecánico', descripcion: 'Teclado mecánico RGB switches blue', precio: 1999.99, stock: 50, categoria: 'Periféricos', activo: true },
  { id: '4', nombre: 'Mouse Ergonómico', descripcion: 'Mouse vertical inalámbrico', precio: 899.99, stock: 40, categoria: 'Periféricos', activo: true },
  { id: '5', nombre: 'Silla Ejecutiva', descripcion: 'Silla ergonómica con soporte lumbar', precio: 5999.99, stock: 10, categoria: 'Mobiliario', activo: true },
];

const facturas: Factura[] = [
  {
    id: '1',
    numero: 'FAC-001',
    clienteId: '1',
    clienteNombre: 'Empresa ABC S.A.',
    items: [
      { productoId: '1', productoNombre: 'Laptop Pro 15"', cantidad: 2, precioUnitario: 24999.99, subtotal: 49999.98 },
      { productoId: '2', productoNombre: 'Monitor 27" 4K', cantidad: 2, precioUnitario: 8999.99, subtotal: 17999.98 },
    ],
    subtotal: 67999.96,
    iva: 10879.99,
    total: 78879.95,
    estado: 'pagada',
    fecha: '2025-06-15',
  },
  {
    id: '2',
    numero: 'FAC-002',
    clienteId: '2',
    clienteNombre: 'Distribuidora XYZ',
    items: [
      { productoId: '3', productoNombre: 'Teclado Mecánico', cantidad: 10, precioUnitario: 1999.99, subtotal: 19999.90 },
      { productoId: '4', productoNombre: 'Mouse Ergonómico', cantidad: 10, precioUnitario: 899.99, subtotal: 8999.90 },
    ],
    subtotal: 28999.80,
    iva: 4639.97,
    total: 33639.77,
    estado: 'pendiente',
    fecha: '2025-07-20',
  },
];

const empresa: Empresa = {
  nombre: 'Mi Empresa S.A. de C.V.',
  rfc: 'MEM010101AAA',
  direccion: 'Av. Principal 500, Col. Centro, CDMX',
  telefono: '555-1234',
  email: 'contacto@miempresa.com',
  logo: '',
};

// --- Store singleton ---
class Store {
  usuarios = usuarios;
  clientes = clientes;
  productos = productos;
  facturas = facturas;
  empresa = empresa;
  roles = roles;
  permisos = permisos;
  private nextId = 100;

  genId(): string {
    return String(++this.nextId);
  }

  // --- Users ---
  getUsuarios() { return this.usuarios; }
  getUsuario(id: string) { return this.usuarios.find(u => u.id === id); }
  getUsuarioByEmail(email: string) { return this.usuarios.find(u => u.email === email); }
  createUsuario(data: Omit<User, 'id'>) {
    const user: User = { ...data, id: this.genId() };
    this.usuarios.push(user);
    return user;
  }
  updateUsuario(id: string, data: Partial<User>) {
    const idx = this.usuarios.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.usuarios[idx] = { ...this.usuarios[idx], ...data };
    return this.usuarios[idx];
  }
  deleteUsuario(id: string) {
    const idx = this.usuarios.findIndex(u => u.id === id);
    if (idx === -1) return false;
    this.usuarios.splice(idx, 1);
    return true;
  }

  // --- Clientes ---
  getClientes() { return this.clientes; }
  getCliente(id: string) { return this.clientes.find(c => c.id === id); }
  createCliente(data: Omit<Cliente, 'id' | 'createdAt'>) {
    const cliente: Cliente = { ...data, id: this.genId(), createdAt: new Date().toISOString().split('T')[0] };
    this.clientes.push(cliente);
    return cliente;
  }
  updateCliente(id: string, data: Partial<Cliente>) {
    const idx = this.clientes.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.clientes[idx] = { ...this.clientes[idx], ...data };
    return this.clientes[idx];
  }
  deleteCliente(id: string) {
    const idx = this.clientes.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.clientes.splice(idx, 1);
    return true;
  }

  // --- Productos ---
  getProductos() { return this.productos; }
  getProducto(id: string) { return this.productos.find(p => p.id === id); }
  createProducto(data: Omit<Producto, 'id'>) {
    const producto: Producto = { ...data, id: this.genId() };
    this.productos.push(producto);
    return producto;
  }
  updateProducto(id: string, data: Partial<Producto>) {
    const idx = this.productos.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.productos[idx] = { ...this.productos[idx], ...data };
    return this.productos[idx];
  }
  deleteProducto(id: string) {
    const idx = this.productos.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.productos.splice(idx, 1);
    return true;
  }

  // --- Facturas ---
  getFacturas() { return this.facturas; }
  getFactura(id: string) { return this.facturas.find(f => f.id === id); }
  createFactura(data: Omit<Factura, 'id' | 'numero'>) {
    const num = this.facturas.length + 1;
    const factura: Factura = { ...data, id: this.genId(), numero: `FAC-${String(num).padStart(3, '0')}` };
    this.facturas.push(factura);
    return factura;
  }
  updateFactura(id: string, data: Partial<Factura>) {
    const idx = this.facturas.findIndex(f => f.id === id);
    if (idx === -1) return null;
    this.facturas[idx] = { ...this.facturas[idx], ...data };
    return this.facturas[idx];
  }

  // --- Empresa ---
  getEmpresa() { return this.empresa; }
  updateEmpresa(data: Partial<Empresa>) {
    this.empresa = { ...this.empresa, ...data };
    return this.empresa;
  }

  // --- Roles ---
  getRoles() { return this.roles; }
  getRol(id: string) { return this.roles.find(r => r.id === id); }
  createRol(data: Omit<Rol, 'id'>) {
    const rol: Rol = { ...data, id: this.genId() };
    this.roles.push(rol);
    return rol;
  }
  updateRol(id: string, data: Partial<Rol>) {
    const idx = this.roles.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.roles[idx] = { ...this.roles[idx], ...data };
    return this.roles[idx];
  }
  deleteRol(id: string) {
    const idx = this.roles.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.roles.splice(idx, 1);
    return true;
  }

  // --- Permisos ---
  getPermisos() { return this.permisos; }
  getPermiso(id: string) { return this.permisos.find(p => p.id === id); }
  createPermiso(data: Omit<Permiso, 'id'>) {
    const permiso: Permiso = { ...data, id: this.genId() };
    this.permisos.push(permiso);
    return permiso;
  }
  updatePermiso(id: string, data: Partial<Permiso>) {
    const idx = this.permisos.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.permisos[idx] = { ...this.permisos[idx], ...data };
    return this.permisos[idx];
  }
  deletePermiso(id: string) {
    const idx = this.permisos.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.permisos.splice(idx, 1);
    return true;
  }
}

// Global singleton
const globalStore = globalThis as unknown as { __store: Store };
if (!globalStore.__store) {
  globalStore.__store = new Store();
}
export const store = globalStore.__store;
