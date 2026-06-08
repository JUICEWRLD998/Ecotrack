import bcrypt from "bcryptjs";
import { PrismaClient, UserRole, WasteType, RequestStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Admin12345", 12);
  const residentPassword = await bcrypt.hash("Password123", 12);

  // Seed admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@ecotrack.local" },
    update: {
      name: "EcoTrack Admin",
      role: UserRole.ADMIN,
      isActive: true
    },
    create: {
      name: "EcoTrack Admin",
      email: "admin@ecotrack.local",
      password,
      role: UserRole.ADMIN
    }
  });

  console.info("✓ Seeded admin user: admin@ecotrack.local / Admin12345");

  // Seed additional admin for testing assignment
  const admin2 = await prisma.user.upsert({
    where: { email: "sarah.admin@ecotrack.local" },
    update: {
      name: "Sarah Williams",
      role: UserRole.ADMIN,
      isActive: true
    },
    create: {
      name: "Sarah Williams",
      email: "sarah.admin@ecotrack.local",
      password: await bcrypt.hash("Admin12345", 12),
      role: UserRole.ADMIN
    }
  });

  console.info("✓ Seeded secondary admin: sarah.admin@ecotrack.local / Admin12345");

  // Seed resident users
  const residents = await Promise.all([
    prisma.user.upsert({
      where: { email: "john.doe@example.com" },
      update: {},
      create: {
        name: "John Doe",
        email: "john.doe@example.com",
        password: residentPassword,
        role: UserRole.RESIDENT
      }
    }),
    prisma.user.upsert({
      where: { email: "jane.smith@example.com" },
      update: {},
      create: {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        password: residentPassword,
        role: UserRole.RESIDENT
      }
    }),
    prisma.user.upsert({
      where: { email: "mike.johnson@example.com" },
      update: {},
      create: {
        name: "Mike Johnson",
        email: "mike.johnson@example.com",
        password: residentPassword,
        role: UserRole.RESIDENT
      }
    }),
    prisma.user.upsert({
      where: { email: "emily.brown@example.com" },
      update: {},
      create: {
        name: "Emily Brown",
        email: "emily.brown@example.com",
        password: residentPassword,
        role: UserRole.RESIDENT
      }
    })
  ]);

  console.info("✓ Seeded 4 resident users (password: Password123)");

  // Seed waste requests with various statuses
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Pending request
  const request1 = await prisma.wasteRequest.create({
    data: {
      userId: residents[0].id,
      wasteType: WasteType.HOUSEHOLD,
      address: "123 Oak Street, Springfield",
      description: "Two large bins are completely full and need urgent collection",
      status: RequestStatus.PENDING,
      preferredDate: tomorrow,
      createdAt: yesterday
    }
  });

  await prisma.statusHistory.create({
    data: {
      requestId: request1.id,
      status: RequestStatus.PENDING,
      note: "Request submitted by resident",
      changedById: residents[0].id,
      createdAt: yesterday
    }
  });

  // Assigned request
  const request2 = await prisma.wasteRequest.create({
    data: {
      userId: residents[1].id,
      assignedToId: admin.id,
      wasteType: WasteType.RECYCLABLE,
      address: "456 Maple Avenue, Springfield",
      description: "Recyclable materials including cardboard and plastic bottles",
      status: RequestStatus.ASSIGNED,
      preferredDate: nextWeek,
      createdAt: twoDaysAgo
    }
  });

  await prisma.statusHistory.createMany({
    data: [
      {
        requestId: request2.id,
        status: RequestStatus.PENDING,
        note: "Request submitted",
        changedById: residents[1].id,
        createdAt: twoDaysAgo
      },
      {
        requestId: request2.id,
        status: RequestStatus.ASSIGNED,
        note: "Assigned to collection team",
        changedById: admin.id,
        createdAt: yesterday
      }
    ]
  });

  // Scheduled request with collection schedule
  const request3 = await prisma.wasteRequest.create({
    data: {
      userId: residents[2].id,
      assignedToId: admin2.id,
      wasteType: WasteType.ORGANIC,
      address: "789 Pine Road, Springfield",
      description: "Organic waste from garden cleanup",
      status: RequestStatus.SCHEDULED,
      scheduledDate: tomorrow,
      createdAt: twoDaysAgo
    }
  });

  await prisma.collectionSchedule.create({
    data: {
      requestId: request3.id,
      collectionDate: tomorrow,
      notes: "Early morning collection scheduled"
    }
  });

  await prisma.statusHistory.createMany({
    data: [
      {
        requestId: request3.id,
        status: RequestStatus.PENDING,
        changedById: residents[2].id,
        createdAt: twoDaysAgo
      },
      {
        requestId: request3.id,
        status: RequestStatus.ASSIGNED,
        changedById: admin2.id,
        createdAt: yesterday
      },
      {
        requestId: request3.id,
        status: RequestStatus.SCHEDULED,
        note: "Collection scheduled for tomorrow morning",
        changedById: admin2.id,
        createdAt: yesterday
      }
    ]
  });

  // In progress request
  const request4 = await prisma.wasteRequest.create({
    data: {
      userId: residents[3].id,
      assignedToId: admin.id,
      wasteType: WasteType.HOUSEHOLD,
      address: "321 Elm Street, Springfield",
      description: "Regular household waste collection",
      status: RequestStatus.IN_PROGRESS,
      scheduledDate: now,
      createdAt: twoDaysAgo
    }
  });

  await prisma.statusHistory.createMany({
    data: [
      {
        requestId: request4.id,
        status: RequestStatus.PENDING,
        changedById: residents[3].id,
        createdAt: twoDaysAgo
      },
      {
        requestId: request4.id,
        status: RequestStatus.ASSIGNED,
        changedById: admin.id
      },
      {
        requestId: request4.id,
        status: RequestStatus.SCHEDULED,
        changedById: admin.id
      },
      {
        requestId: request4.id,
        status: RequestStatus.IN_PROGRESS,
        note: "Collection team en route",
        changedById: admin.id
      }
    ]
  });

  // Completed request
  const request5 = await prisma.wasteRequest.create({
    data: {
      userId: residents[0].id,
      assignedToId: admin2.id,
      wasteType: WasteType.RECYCLABLE,
      address: "123 Oak Street, Springfield",
      description: "Recycling bins full of paper and cardboard",
      status: RequestStatus.COLLECTED,
      scheduledDate: yesterday,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.statusHistory.createMany({
    data: [
      {
        requestId: request5.id,
        status: RequestStatus.PENDING,
        changedById: residents[0].id,
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        requestId: request5.id,
        status: RequestStatus.ASSIGNED,
        changedById: admin2.id,
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        requestId: request5.id,
        status: RequestStatus.SCHEDULED,
        changedById: admin2.id,
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        requestId: request5.id,
        status: RequestStatus.IN_PROGRESS,
        changedById: admin2.id,
        createdAt: yesterday
      },
      {
        requestId: request5.id,
        status: RequestStatus.COLLECTED,
        note: "Successfully collected and processed",
        changedById: admin2.id,
        createdAt: yesterday
      }
    ]
  });

  console.info("✓ Seeded 5 waste requests with status history");

  // Seed notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: residents[0].id,
        title: "Welcome to EcoTrack",
        message: "Thank you for registering. You can now submit waste collection requests.",
        read: true,
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        userId: residents[0].id,
        title: "Request Submitted",
        message: "Your waste collection request has been submitted successfully.",
        read: true,
        createdAt: yesterday
      },
      {
        userId: residents[1].id,
        title: "Request Assigned",
        message: "Your waste collection request has been assigned to our team.",
        read: false,
        createdAt: yesterday
      },
      {
        userId: residents[2].id,
        title: "Collection Scheduled",
        message: `Your waste collection has been scheduled for ${tomorrow.toLocaleDateString()}.`,
        read: false,
        createdAt: yesterday
      },
      {
        userId: residents[3].id,
        title: "Collection In Progress",
        message: "Our collection team is on the way to your location.",
        read: false
      },
      {
        userId: residents[0].id,
        title: "Collection Completed",
        message: "Your waste has been successfully collected. Thank you for using EcoTrack!",
        read: false,
        createdAt: yesterday
      }
    ]
  });

  console.info("✓ Seeded notifications");

  // Seed audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: admin.id,
        action: "REQUEST_ASSIGNED",
        entity: "WasteRequest",
        entityId: request2.id,
        metadata: {
          requestId: request2.id,
          assignedTo: admin.id
        },
        createdAt: yesterday
      },
      {
        actorId: admin2.id,
        action: "REQUEST_SCHEDULED",
        entity: "WasteRequest",
        entityId: request3.id,
        metadata: {
          requestId: request3.id,
          scheduledDate: tomorrow.toISOString()
        },
        createdAt: yesterday
      },
      {
        actorId: admin2.id,
        action: "REQUEST_COMPLETED",
        entity: "WasteRequest",
        entityId: request5.id,
        metadata: {
          requestId: request5.id,
          completedAt: yesterday.toISOString()
        },
        createdAt: yesterday
      }
    ]
  });

  console.info("✓ Seeded audit logs");

  console.info("\n🌱 Database seeding completed successfully!\n");
  console.info("Login credentials:");
  console.info("  Admin: admin@ecotrack.local / Admin12345");
  console.info("  Admin: sarah.admin@ecotrack.local / Admin12345");
  console.info("  Residents: john.doe@example.com (and 3 others) / Password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
