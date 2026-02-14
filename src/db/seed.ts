import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { permisos, roles, usuarios, clientes, productos, facturas, empresa } from './schema';

const connectionString = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/admin_portal';
const client = postgres(connectionString);
const db = drizzle(client);

async function seed() {
  console.log('Seeding database...');

  // Clean tables (order matters for references)
  await db.delete(facturas);
  await db.delete(productos);
  await db.delete(clientes);
  await db.delete(usuarios);
  await db.delete(roles);
  await db.delete(permisos);
  await db.delete(empresa);

  // --- Permisos ---
  const permisosData = [
    { clave: 'clientes.ver', nombre: 'Ver clientes', modulo: 'Clientes' },
    { clave: 'clientes.crear', nombre: 'Crear clientes', modulo: 'Clientes' },
    { clave: 'clientes.editar', nombre: 'Editar clientes', modulo: 'Clientes' },
    { clave: 'clientes.eliminar', nombre: 'Eliminar clientes', modulo: 'Clientes' },
    { clave: 'productos.ver', nombre: 'Ver productos', modulo: 'Productos' },
    { clave: 'productos.crear', nombre: 'Crear productos', modulo: 'Productos' },
    { clave: 'productos.editar', nombre: 'Editar productos', modulo: 'Productos' },
    { clave: 'productos.eliminar', nombre: 'Eliminar productos', modulo: 'Productos' },
    { clave: 'facturas.ver', nombre: 'Ver facturas', modulo: 'Facturas' },
    { clave: 'facturas.crear', nombre: 'Crear facturas', modulo: 'Facturas' },
    { clave: 'facturas.editar', nombre: 'Editar facturas', modulo: 'Facturas' },
    { clave: 'configuracion.ver', nombre: 'Ver configuración', modulo: 'Configuración' },
    { clave: 'configuracion.editar', nombre: 'Editar configuración', modulo: 'Configuración' },
    { clave: 'usuarios.ver', nombre: 'Ver usuarios', modulo: 'Usuarios' },
    { clave: 'usuarios.crear', nombre: 'Crear usuarios', modulo: 'Usuarios' },
    { clave: 'usuarios.editar', nombre: 'Editar usuarios', modulo: 'Usuarios' },
    { clave: 'usuarios.eliminar', nombre: 'Eliminar usuarios', modulo: 'Usuarios' },
  ];
  await db.insert(permisos).values(permisosData);
  console.log(`  ✓ ${permisosData.length} permisos`);

  const allPermisoClaves = permisosData.map(p => p.clave);

  // --- Roles ---
  const rolesData = [
    {
      nombre: 'Administrador',
      descripcion: 'Acceso completo al sistema',
      permisos: allPermisoClaves,
    },
    {
      nombre: 'Vendedor',
      descripcion: 'Gestión de clientes y facturas',
      permisos: ['clientes.ver', 'clientes.crear', 'clientes.editar', 'productos.ver', 'facturas.ver', 'facturas.crear', 'facturas.editar'],
    },
    {
      nombre: 'Almacén',
      descripcion: 'Gestión de productos e inventario',
      permisos: ['productos.ver', 'productos.crear', 'productos.editar'],
    },
  ];
  await db.insert(roles).values(rolesData);
  console.log(`  ✓ ${rolesData.length} roles`);

  // --- Usuarios ---
  const usuariosData = [
    { nombre: 'Admin', email: 'admin@portal.com', password: 'admin123', rol: 'Administrador', activo: true },
    { nombre: 'Carlos Vendedor', email: 'carlos@portal.com', password: '123456', rol: 'Vendedor', activo: true },
  ];
  await db.insert(usuarios).values(usuariosData);
  console.log(`  ✓ ${usuariosData.length} usuarios`);

  // --- Clientes ---
  const clientesData = [
    { nombre: 'Empresa ABC S.A.', email: 'contacto@abc.com', telefono: '555-0101', direccion: 'Av. Reforma 100, CDMX', rfc: 'ABC010101AAA', createdAt: '2025-01-15' },
    { nombre: 'Distribuidora XYZ', email: 'ventas@xyz.com', telefono: '555-0202', direccion: 'Calle 5 de Mayo 200, Puebla', rfc: 'XYZ020202BBB', createdAt: '2025-02-10' },
    { nombre: 'Comercial del Norte', email: 'info@cdnorte.com', telefono: '555-0303', direccion: 'Blvd. Independencia 300, Monterrey', rfc: 'CDN030303CCC', createdAt: '2025-03-05' },
  ];
  const insertedClientes = await db.insert(clientes).values(clientesData).returning();
  console.log(`  ✓ ${clientesData.length} clientes`);

  // --- Productos ---
  const productosData = [
    { nombre: 'Laptop Pro 15"', descripcion: 'Laptop profesional 16GB RAM, 512GB SSD', precio: '24999.99', stock: 15, categoria: 'Electrónica', activo: true },
    { nombre: 'Monitor 27" 4K', descripcion: 'Monitor UHD IPS 27 pulgadas', precio: '8999.99', stock: 30, categoria: 'Electrónica', activo: true },
    { nombre: 'Teclado Mecánico', descripcion: 'Teclado mecánico RGB switches blue', precio: '1999.99', stock: 50, categoria: 'Periféricos', activo: true },
    { nombre: 'Mouse Ergonómico', descripcion: 'Mouse vertical inalámbrico', precio: '899.99', stock: 40, categoria: 'Periféricos', activo: true },
    { nombre: 'Silla Ejecutiva', descripcion: 'Silla ergonómica con soporte lumbar', precio: '5999.99', stock: 10, categoria: 'Mobiliario', activo: true },
  ];
  const insertedProductos = await db.insert(productos).values(productosData).returning();
  console.log(`  ✓ ${productosData.length} productos`);

  // --- Facturas ---
  const c1 = insertedClientes[0];
  const c2 = insertedClientes[1];
  const p1 = insertedProductos[0];
  const p2 = insertedProductos[1];
  const p3 = insertedProductos[2];
  const p4 = insertedProductos[3];

  const facturasData = [
    {
      numero: 'FAC-001',
      clienteId: c1.id,
      clienteNombre: c1.nombre,
      items: [
        { productoId: String(p1.id), productoNombre: p1.nombre, cantidad: 2, precioUnitario: 24999.99, subtotal: 49999.98 },
        { productoId: String(p2.id), productoNombre: p2.nombre, cantidad: 2, precioUnitario: 8999.99, subtotal: 17999.98 },
      ],
      subtotal: '67999.96',
      iva: '10879.99',
      total: '78879.95',
      estado: 'pagada',
      fecha: '2025-06-15',
    },
    {
      numero: 'FAC-002',
      clienteId: c2.id,
      clienteNombre: c2.nombre,
      items: [
        { productoId: String(p3.id), productoNombre: p3.nombre, cantidad: 10, precioUnitario: 1999.99, subtotal: 19999.90 },
        { productoId: String(p4.id), productoNombre: p4.nombre, cantidad: 10, precioUnitario: 899.99, subtotal: 8999.90 },
      ],
      subtotal: '28999.80',
      iva: '4639.97',
      total: '33639.77',
      estado: 'pendiente',
      fecha: '2025-07-20',
    },
  ];
  await db.insert(facturas).values(facturasData);
  console.log(`  ✓ ${facturasData.length} facturas`);

  // --- Empresa ---
  await db.insert(empresa).values({
    nombre: 'Mi Empresa S.A. de C.V.',
    rfc: 'MEM010101AAA',
    direccion: 'Av. Principal 500, Col. Centro, CDMX',
    telefono: '555-1234',
    email: 'contacto@miempresa.com',
    logo: '',
  });
  console.log('  ✓ 1 empresa');

  console.log('\nSeed completed!');
  await client.end();
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
