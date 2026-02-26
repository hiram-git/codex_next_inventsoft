import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const MODULES = ["customers", "products", "invoices", "settings", "users"];
const ACTIONS = ["create", "read", "update", "delete"];

async function main() {
  console.log("🌱 Seeding database...");

  // Permissions
  const permissionData = MODULES.flatMap((module) =>
    ACTIONS.map((action) => ({
      module,
      action,
      description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${module}`,
    }))
  );

  await db.permission.createMany({ data: permissionData, skipDuplicates: true });
  const allPerms = await db.permission.findMany();
  console.log(`✅ ${allPerms.length} permissions created`);

  // Roles
  let adminRole = await db.role.findUnique({ where: { name: "Administrador" } });
  if (!adminRole) {
    adminRole = await db.role.create({
      data: {
        name: "Administrador",
        description: "Acceso total al sistema",
        permissions: {
          create: allPerms.map((p) => ({ permissionId: p.id })),
        },
      },
    });
  }

  let viewerRole = await db.role.findUnique({ where: { name: "Visor" } });
  if (!viewerRole) {
    const readPerms = allPerms.filter((p) => p.action === "read");
    viewerRole = await db.role.create({
      data: {
        name: "Visor",
        description: "Solo lectura",
        permissions: {
          create: readPerms.map((p) => ({ permissionId: p.id })),
        },
      },
    });
  }
  console.log("✅ Roles created");

  // Admin user
  const existing = await db.user.findUnique({ where: { email: "admin@saasportal.com" } });
  if (!existing) {
    await db.user.create({
      data: {
        name: "Administrador",
        email: "admin@saasportal.com",
        password: await bcrypt.hash("Admin123!", 12),
        roleId: adminRole.id,
      },
    });
    console.log("✅ Admin user created: admin@saasportal.com / Admin123!");
  }

  // Company
  const company = await db.company.findFirst();
  if (!company) {
    await db.company.create({
      data: {
        name: "Mi Empresa S.A. de C.V.",
        taxId: "MEM000101AAA",
        email: "contacto@miempresa.com",
        phone: "+52 55 1234 5678",
        city: "Ciudad de México",
        country: "México",
        website: "https://miempresa.com",
      },
    });
    console.log("✅ Company created");
  }

  // Sample customers
  const customerCount = await db.customer.count();
  if (customerCount === 0) {
    await db.customer.createMany({
      data: [
        { name: "Tech Solutions SA", email: "ventas@techsol.com", phone: "555-0001", city: "CDMX", country: "México" },
        { name: "Grupo Empresarial Norte", email: "compras@gen.mx", phone: "555-0002", city: "Monterrey", country: "México" },
        { name: "Distribuidora del Sur", email: "pedidos@dissur.com", phone: "555-0003", city: "Guadalajara", country: "México" },
      ],
    });
    console.log("✅ Sample customers created");
  }

  // Sample products
  const productCount = await db.product.count();
  if (productCount === 0) {
    await db.product.createMany({
      data: [
        { sku: "SOFT-001", name: "Licencia Software Pro", price: 4999.00, stock: 100, unit: "unit" },
        { sku: "CONS-001", name: "Consultoría IT (hora)", price: 1500.00, stock: 500, unit: "hour" },
        { sku: "SOPORTE-001", name: "Soporte Técnico Mensual", price: 2500.00, stock: 50, unit: "unit" },
        { sku: "CLOUD-001", name: "Servidor Cloud 1TB", price: 899.00, stock: 200, unit: "unit" },
      ],
    });
    console.log("✅ Sample products created");
  }

  console.log("\n🎉 Seed completed successfully!");
  console.log("   Login: admin@saasportal.com");
  console.log("   Password: Admin123!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
