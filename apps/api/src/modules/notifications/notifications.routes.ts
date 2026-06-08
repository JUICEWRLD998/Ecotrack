import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { authenticate } from "../../middleware/authenticate";
import { validateRequest } from "../../middleware/validate-request";
import { AppError } from "../../utils/app-error";
import { asyncHandler } from "../../utils/async-handler";

export const notificationsRouter = Router();

const notificationParamsSchema = z.object({
  id: z.string().cuid()
});

notificationsRouter.get("/status", (_request, response) => {
  response.json({
    module: "notifications",
    status: "ready",
    phase: "In-app notification endpoints are implemented in Phase 6."
  });
});

notificationsRouter.get(
  "/",
  authenticate,
  asyncHandler(async (request, response) => {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: {
          userId: request.user!.id
        },
        orderBy: {
          createdAt: "desc"
        }
      }),
      prisma.notification.count({
        where: {
          userId: request.user!.id,
          read: false
        }
      })
    ]);

    response.json({ notifications, unreadCount });
  })
);

notificationsRouter.get(
  "/unread-count",
  authenticate,
  asyncHandler(async (request, response) => {
    const unreadCount = await prisma.notification.count({
      where: {
        userId: request.user!.id,
        read: false
      }
    });

    response.json({ unreadCount });
  })
);

notificationsRouter.patch(
  "/read-all",
  authenticate,
  asyncHandler(async (request, response) => {
    await prisma.notification.updateMany({
      where: {
        userId: request.user!.id,
        read: false
      },
      data: {
        read: true
      }
    });

    response.json({ success: true });
  })
);

notificationsRouter.patch(
  "/:id/read",
  authenticate,
  validateRequest({ params: notificationParamsSchema }),
  asyncHandler(async (request, response) => {
    const notification = await prisma.notification.findFirst({
      where: {
        id: request.params.id,
        userId: request.user!.id
      }
    });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id: notification.id
      },
      data: {
        read: true
      }
    });

    response.json({ notification: updatedNotification });
  })
);
