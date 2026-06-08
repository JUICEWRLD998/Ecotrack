import { Router } from "express";
import { prisma } from "../../config/prisma";
import { authenticate } from "../../middleware/authenticate";
import { asyncHandler } from "../../utils/async-handler";

export const schedulesRouter = Router();

const residentScheduleInclude = {
  request: {
    select: {
      id: true,
      wasteType: true,
      address: true,
      status: true,
      preferredDate: true,
      scheduledDate: true,
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  }
};

schedulesRouter.get("/status", (_request, response) => {
  response.json({
    module: "schedules",
    status: "ready",
    phase: "Collection scheduling endpoints are implemented in Phase 5."
  });
});

schedulesRouter.get(
  "/my",
  authenticate,
  asyncHandler(async (request, response) => {
    const schedules = await prisma.collectionSchedule.findMany({
      where: {
        request: {
          userId: request.user!.id
        }
      },
      orderBy: {
        collectionDate: "asc"
      },
      include: residentScheduleInclude
    });

    response.json({ schedules });
  })
);
