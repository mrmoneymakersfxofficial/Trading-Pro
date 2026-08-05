// Seed script: crea admin user + demo licenses
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Crear admin
  const adminPw = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@tradingpro.com" },
    update: {},
    create: {
      email: "admin@tradingpro.com",
      name: "Admin Trading Pro",
      password: adminPw,
      role: "admin",
    },
  });
  console.log("✅ Admin creado:", admin.email);

  // Crear usuario demo
  const userPw = await bcrypt.hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@tradingpro.com" },
    update: {},
    create: {
      email: "demo@tradingpro.com",
      name: "Trader Demo",
      password: userPw,
      role: "user",
      brokerId: "12345678",
    },
  });
  console.log("✅ User demo creado:", user.email);

  // Crear licencias demo
  const demoKeys = [
    { key: "TP-ABCD-1234-EFGH-5678", level: "standard", durationMonths: 1 },
    { key: "TP-PRO9-9999-LEVL-PRO1", level: "pro", durationMonths: 3 },
    { key: "TP-FREE-TEST-KEY1-NOW1", level: "standard", durationMonths: 6 },
    { key: "TP-PREM-IUM-12MO-NTHS", level: "pro", durationMonths: 12 },
  ];

  for (const dk of demoKeys) {
    const existing = await prisma.license.findUnique({ where: { key: dk.key } });
    if (!existing) {
      await prisma.license.create({
        data: {
          key: dk.key,
          level: dk.level,
          durationMonths: dk.durationMonths,
          status: "available",
        },
      });
      console.log("✅ Licencia creada:", dk.key);
    }
  }

  // Asignar una licencia al usuario demo
  const lic1 = await prisma.license.findUnique({
    where: { key: "TP-ABCD-1234-EFGH-5678" },
  });
  if (lic1) {
    const existingUL = await prisma.userLicense.findFirst({
      where: { userId: user.id, licenseId: lic1.id },
    });
    if (!existingUL) {
      const now = new Date();
      await prisma.userLicense.create({
        data: {
          userId: user.id,
          licenseId: lic1.id,
          status: "active",
          activatedAt: now,
          expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      await prisma.license.update({
        where: { id: lic1.id },
        data: { status: "assigned", assignedToEmail: user.email },
      });
      console.log("✅ Licencia asignada a demo user");
    }
  }

  console.log("🎉 Seed completado!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
