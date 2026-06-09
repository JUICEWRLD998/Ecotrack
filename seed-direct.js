const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...\n");

  const password = await bcrypt.hash("Admin12345", 12);
  const residentPassword = await bcrypt.hash("Password123", 12);

  // Seed admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@ecotrack.local" },
    update: {
      name: "EcoTrack Admin",
      role: "ADMIN",
      isActive: true
    },
    create: {
      name: "EcoTrack Admin",
      email: "admin@ecotrack.local",
      password,
      role: "ADMIN"
    }
  });

  console.log("✓ Admin: admin@ecotrack.local / Admin12345");

  // Seed resident
  const resident = await prisma.user.upsert({
    where: { email: "john.doe@example.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "john.doe@example.com",
      password: residentPassword,
      role: "RESIDENT"
    }
  });

  console.log("✓ Resident: john.doe@example.com / Password123");

  console.log("\n✅ Database seeded successfully!\n");
}

main()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
