import { prisma } from "../config/prisma";

type NotificationInput = {
  userId: string;
  title: string;
  message: string;
};

export async function createNotification(input: NotificationInput) {
  return prisma.notification.create({
    data: input
  });
}

export async function createNotifications(inputs: NotificationInput[]) {
  if (inputs.length === 0) {
    return;
  }

  await prisma.notification.createMany({
    data: inputs
  });
}

export async function notifyActiveAdmins(title: string, message: string, exceptUserId?: string) {
  const admins = await prisma.user.findMany({
    where: {
      role: "ADMIN",
      isActive: true,
      ...(exceptUserId ? { id: { not: exceptUserId } } : {})
    },
    select: {
      id: true
    }
  });

  await createNotifications(
    admins.map((admin) => ({
      userId: admin.id,
      title,
      message
    }))
  );
}
