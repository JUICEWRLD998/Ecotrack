import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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

  console.log("✓ Seeded admin user: admin@ecotrack.local / Admin12345");

  // Seed secondary admin
  const admin2 = await prisma.user.upsert({
    where: { email: "sarah.admin@ecotrack.local" },
    update: {
      name: "Sarah Williams",
      role: "ADMIN",
      isActive: true
    },
    create: {
      name: "Sarah Williams",
      email: "sarah.admin@ecotrack.local",
      password: await bcrypt.hash("Admin12345", 12),
      role: "ADMIN"
    }
  });

  console.log("✓ Seeded secondary admin: sarah.admin@ecotrack.local / Admin12345");

  // Seed resident users
  const resident1 = await prisma.user.upsert({
    where: { email: "john.doe@example.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "john.doe@example.com",
      password: residentPassword,
      role: "RESIDENT"
    }
  });

  const resident2 = await prisma.user.upsert({
    where: { email: "jane.smith@example.com" },
    update: {},
    create: {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      password: residentPassword,
      role: "RESIDENT"
    }
  });

  const resident3 = await prisma.user.upsert({
    where: { email: "mike.johnson@example.com" },
    update: {},
    create: {
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      password: residentPassword,
      role: "RESIDENT"
    }
  });

  const resident4 = await prisma.user.upsert({
    where: { email: "emily.brown@example.com" },
    update: {},
    create: {
      name: "Emily Brown",
      email: "emily.brown@example.com",
      password: residentPassword,
      role: "RESIDENT"
    }
  });

  console.log("✓ Seeded 4 resident users (password: Password123)");

  // Seed some waste requests
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const request1 = await prisma.wasteRequest.create({
    data: {
      userId: resident1.id,
      wasteType: "HOUSEHOLD",
      address: "123 Oak Street, Springfield",
      description: "Two large bins are completely full",
      status: "PENDING",
      preferredDate: tomorrow,
      createdAt: yesterday
    }
  });

  await prisma.statusHistory.create({
    data: {
      requestId: request1.id,
      status: "PENDING",
      note: "Request submitted by resident",
      changedById: resident1.id,
      createdAt: yesterday
    }
  });

  const request2 = await prisma.wasteRequest.create({
    data: {
      userId: resident2.id,
      assignedToId: admin.id,
      wasteType: "RECYCLABLE",
      address: "456 Maple Avenue, Springfield",
      description: "Recyclable materials",
      status: "ASSIGNED",
      preferredDate: tomorrow
    }
  });

  await prisma.statusHistory.create({
    data: {
      requestId: request2.id,
      status: "ASSIGNED",
      note: "Assigned to collection team",
      changedById: admin.id
    }
  });

  console.log("✓ Seeded 2 waste requests with status history");

  // Seed notifications
  await prisma.notification.create({
    data: {
      userId: resident1.id,
      title: "Welcome to EcoTrack",
      message: "Thank you for registering. You can now submit waste collection requests.",
      read: true,
      createdAt: yesterday
    }
  });

  await prisma.notification.create({
    data: {
      userId: resident2.id,
      title: "Request Assigned",
      message: "Your waste collection request has been assigned to our team.",
      read: false
    }
  });

  console.log("✓ Seeded notifications");

  console.log("\n🌱 Database seeding completed successfully!\n");
  console.log("Login credentials:");
  console.log("  Admin: admin@ecotrack.local / Admin12345");
  console.log("  Admin: sarah.admin@ecotrack.local / Admin12345");
  console.log("  Resident: john.doe@example.com / Password123");
  console.log("  Resident: jane.smith@example.com / Password123\n");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
