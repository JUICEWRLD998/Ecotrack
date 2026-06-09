import { Router } from "express";
import { z } from "zod";
import { createWasteRequestSchema, updateWasteRequestSchema } from "../../schemas";
import { prisma } from "../../config/prisma";
import { authenticate } from "../../middleware/authenticate";
import { validateRequest } from "../../middleware/validate-request";
import { createNotification, notifyActiveAdmins } from "../../services/notification.service";
import { asyncHandler } from "../../utils/async-handler";
import { AppError } from "../../utils/app-error";

export const requestsRouter = Router();

const requestParamsSchema = z.object({
  id: z.string().cuid()
});

const requestInclude = {
  assignedTo: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  schedules: {
    orderBy: {
      collectionDate: "asc" as const
    }
  },
  statusHistory: {
    orderBy: {
      createdAt: "desc" as const
    },
    include: {
      changedBy: {
        select: {
          id: true,
          name: true,
          role: true
        }
      }
    }
  }
};

requestsRouter.get("/status", (_request, response) => {
  response.json({
    module: "requests",
    status: "ready",
    phase: "Waste request endpoints are implemented in Phase 3 and Phase 4."
  });
});

requestsRouter.post(
  "/",
  authenticate,
  validateRequest({ body: createWasteRequestSchema }),
  asyncHandler(async (request, response) => {
    const createdRequest = await prisma.wasteRequest.create({
      data: {
        userId: request.user!.id,
        wasteType: request.body.wasteType,
        address: request.body.address,
        description: request.body.description,
        imageUrl: request.body.imageUrl,
        preferredDate: request.body.preferredDate,
        statusHistory: {
          create: {
            status: "PENDING",
            note: "Request submitted",
            changedById: request.user!.id
          }
        }
      },
      include: requestInclude
    });

    await Promise.all([
      createNotification({
        userId: request.user!.id,
        title: "Request submitted",
        message: "Your collection request was submitted and is pending review."
      }),
      notifyActiveAdmins(
        "New collection request",
        `${request.user!.name} submitted a ${request.body.wasteType.toLowerCase()} collection request.`
      )
    ]);

    response.status(201).json({ request: createdRequest });
  })
);

requestsRouter.get(
  "/my",
  authenticate,
  asyncHandler(async (request, response) => {
    const requests = await prisma.wasteRequest.findMany({
      where: {
        userId: request.user!.id
      },
      orderBy: {
        createdAt: "desc"
      },
      include: requestInclude
    });

    response.json({ requests });
  })
);

requestsRouter.get(
  "/:id",
  authenticate,
  validateRequest({ params: requestParamsSchema }),
  asyncHandler(async (request, response) => {
    const wasteRequest = await prisma.wasteRequest.findFirst({
      where: {
        id: request.params.id,
        userId: request.user!.id
      },
      include: requestInclude
    });

    if (!wasteRequest) {
      throw new AppError("Request not found", 404);
    }

    response.json({ request: wasteRequest });
  })
);

requestsRouter.patch(
  "/:id",
  authenticate,
  validateRequest({ params: requestParamsSchema, body: updateWasteRequestSchema }),
  asyncHandler(async (request, response) => {
    const existingRequest = await prisma.wasteRequest.findFirst({
      where: {
        id: request.params.id,
        userId: request.user!.id
      },
      select: {
        id: true,
        status: true
      }
    });

    if (!existingRequest) {
      throw new AppError("Request not found", 404);
    }

    if (existingRequest.status !== "PENDING") {
      throw new AppError("Only pending requests can be edited", 400);
    }

    const updatedRequest = await prisma.wasteRequest.update({
      where: {
        id: existingRequest.id
      },
      data: request.body,
      include: requestInclude
    });

    response.json({ request: updatedRequest });
  })
);
