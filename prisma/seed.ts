import bcrypt from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@ecotrack.local";
  const password = await bcrypt.hash("Admin12345", 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "EcoTrack Admin",
      role: UserRole.ADMIN,
      isActive: true
    },
    create: {
      name: "EcoTrack Admin",
      email: adminEmail,
      password,
      role: UserRole.ADMIN
    }
  });

  console.info("Seeded admin user: admin@ecotrack.local / Admin12345");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
