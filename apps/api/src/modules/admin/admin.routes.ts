import { Router } from "express";
import { Prisma } from "@prisma/client";
import {
  REQUEST_STATUSES,
  WASTE_TYPES,
  adminUpdateUserSchema,
  assignWasteRequestSchema,
  requestStatusSchema,
  scheduleCollectionSchema,
  updateCollectionScheduleSchema,
  updateWasteRequestStatusSchema,
  userRoleSchema,
  wasteTypeSchema
} from "@ecotrack/shared";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { authenticate } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/require-role";
import { validateRequest } from "../../middleware/validate-request";
import { AppError } from "../../utils/app-error";
import { asyncHandler } from "../../utils/async-handler";

export const adminRouter = Router();

adminRouter.use(authenticate, requireRole("ADMIN"));

const idParamsSchema = z.object({
  id: z.string().cuid()
});

const adminRequestsQuerySchema = z.object({
  status: requestStatusSchema.optional(),
  wasteType: wasteTypeSchema.optional(),
  assignedToId: z.union([z.string().cuid(), z.literal("unassigned")]).optional(),
  search: z.string().trim().max(120).optional()
});

const adminUsersQuerySchema = z.object({
  role: userRoleSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().trim().max(120).optional()
});

const adminSchedulesQuerySchema = z.object({
  status: requestStatusSchema.optional(),
  wasteType: wasteTypeSchema.optional(),
  assignedToId: z.union([z.string().cuid(), z.literal("unassigned")]).optional(),
  search: z.string().trim().max(120).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional()
});

const requestInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true
    }
  },
  assignedTo: {
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true
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

const scheduleInclude = {
  request: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true
        }
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true
        }
      }
    }
  }
};

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      requests: true,
      assigned: true
    }
  }
};

function buildRequestWhere(query: z.infer<typeof adminRequestsQuerySchema>) {
  const where: Prisma.WasteRequestWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.wasteType) {
    where.wasteType = query.wasteType;
  }

  if (query.assignedToId === "unassigned") {
    where.assignedToId = null;
  } else if (query.assignedToId) {
    where.assignedToId = query.assignedToId;
  }

  if (query.search) {
    where.OR = [
      {
        address: {
          contains: query.search,
          mode: "insensitive"
        }
      },
      {
        description: {
          contains: query.search,
          mode: "insensitive"
        }
      },
      {
        user: {
          name: {
            contains: query.search,
            mode: "insensitive"
          }
        }
      },
      {
        user: {
          email: {
            contains: query.search,
            mode: "insensitive"
          }
        }
      }
    ];
  }

  return where;
}

function buildScheduleWhere(query: z.infer<typeof adminSchedulesQuerySchema>) {
  const where: Prisma.CollectionScheduleWhereInput = {};
  const requestWhere: Prisma.WasteRequestWhereInput = {};

  if (query.from || query.to) {
    where.collectionDate = {
      ...(query.from ? { gte: query.from } : {}),
      ...(query.to ? { lte: query.to } : {})
    };
  }

  if (query.status) {
    requestWhere.status = query.status;
  }

  if (query.wasteType) {
    requestWhere.wasteType = query.wasteType;
  }

  if (query.assignedToId === "unassigned") {
    requestWhere.assignedToId = null;
  } else if (query.assignedToId) {
    requestWhere.assignedToId = query.assignedToId;
  }

  if (query.search) {
    requestWhere.OR = [
      {
        address: {
          contains: query.search,
          mode: "insensitive"
        }
      },
      {
        user: {
          name: {
            contains: query.search,
            mode: "insensitive"
          }
        }
      },
      {
        user: {
          email: {
            contains: query.search,
            mode: "insensitive"
          }
        }
      }
    ];
  }

  if (Object.keys(requestWhere).length > 0) {
    where.request = requestWhere;
  }

  return where;
}

function buildUserWhere(query: z.infer<typeof adminUsersQuerySchema>) {
  const where: Prisma.UserWhereInput = {};

  if (query.role) {
    where.role = query.role;
  }

  if (typeof query.isActive === "boolean") {
    where.isActive = query.isActive;
  }

  if (query.search) {
    where.OR = [
      {
        name: {
          contains: query.search,
          mode: "insensitive"
        }
      },
      {
        email: {
          contains: query.search,
          mode: "insensitive"
        }
      }
    ];
  }

  return where;
}

adminRouter.get(
  "/requests",
  validateRequest({ query: adminRequestsQuerySchema }),
  asyncHandler(async (request, response) => {
    const requests = await prisma.wasteRequest.findMany({
      where: buildRequestWhere(request.query),
      orderBy: {
        createdAt: "desc"
      },
      include: requestInclude
    });

    response.json({ requests });
  })
);

adminRouter.get(
  "/requests/:id",
  validateRequest({ params: idParamsSchema }),
  asyncHandler(async (request, response) => {
    const wasteRequest = await prisma.wasteRequest.findUnique({
      where: {
        id: request.params.id
      },
      include: requestInclude
    });

    if (!wasteRequest) {
      throw new AppError("Request not found", 404);
    }

    response.json({ request: wasteRequest });
  })
);

adminRouter.patch(
  "/requests/:id/assign",
  validateRequest({ params: idParamsSchema, body: assignWasteRequestSchema }),
  asyncHandler(async (request, response) => {
    const existingRequest = await prisma.wasteRequest.findUnique({
      where: {
        id: request.params.id
      },
      select: {
        id: true,
        status: true
      }
    });

    if (!existingRequest) {
      throw new AppError("Request not found", 404);
    }

    const assignee = await prisma.user.findFirst({
      where: {
        id: request.body.assignedToId,
        role: "ADMIN",
        isActive: true
      },
      select: {
        id: true,
        name: true
      }
    });

    if (!assignee) {
      throw new AppError("Assignee must be an active administrator", 400);
    }

    const nextStatus = existingRequest.status === "PENDING" ? "ASSIGNED" : existingRequest.status;

    const [updatedRequest] = await prisma.$transaction([
      prisma.wasteRequest.update({
        where: {
          id: existingRequest.id
        },
        data: {
          assignedToId: assignee.id,
          status: nextStatus,
          statusHistory: {
            create: {
              status: nextStatus,
              note: `Assigned to ${assignee.name}`,
              changedById: request.user!.id
            }
          }
        },
        include: requestInclude
      }),
      prisma.auditLog.create({
        data: {
          actorId: request.user!.id,
          action: "REQUEST_ASSIGNED",
          entity: "WasteRequest",
          entityId: existingRequest.id,
          metadata: {
            assignedToId: assignee.id
          }
        }
      })
    ]);

    response.json({ request: updatedRequest });
  })
);

adminRouter.patch(
  "/requests/:id/status",
  validateRequest({ params: idParamsSchema, body: updateWasteRequestStatusSchema }),
  asyncHandler(async (request, response) => {
    const existingRequest = await prisma.wasteRequest.findUnique({
      where: {
        id: request.params.id
      },
      select: {
        id: true,
        status: true
      }
    });

    if (!existingRequest) {
      throw new AppError("Request not found", 404);
    }

    const [updatedRequest] = await prisma.$transaction([
      prisma.wasteRequest.update({
        where: {
          id: existingRequest.id
        },
        data: {
          status: request.body.status,
          statusHistory: {
            create: {
              status: request.body.status,
              note: request.body.note || `Status changed from ${existingRequest.status} to ${request.body.status}`,
              changedById: request.user!.id
            }
          }
        },
        include: requestInclude
      }),
      prisma.auditLog.create({
        data: {
          actorId: request.user!.id,
          action: "REQUEST_STATUS_UPDATED",
          entity: "WasteRequest",
          entityId: existingRequest.id,
          metadata: {
            previousStatus: existingRequest.status,
            nextStatus: request.body.status
          }
        }
      })
    ]);

    response.json({ request: updatedRequest });
  })
);

adminRouter.get(
  "/users",
  validateRequest({ query: adminUsersQuerySchema }),
  asyncHandler(async (request, response) => {
    const users = await prisma.user.findMany({
      where: buildUserWhere(request.query),
      orderBy: {
        createdAt: "desc"
      },
      select: userSelect
    });

    response.json({ users });
  })
);

adminRouter.get(
  "/users/:id",
  validateRequest({ params: idParamsSchema }),
  asyncHandler(async (request, response) => {
    const user = await prisma.user.findUnique({
      where: {
        id: request.params.id
      },
      select: userSelect
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    response.json({ user });
  })
);

adminRouter.patch(
  "/users/:id",
  validateRequest({ params: idParamsSchema, body: adminUpdateUserSchema }),
  asyncHandler(async (request, response) => {
    if (request.params.id === request.user!.id && request.body.isActive === false) {
      throw new AppError("You cannot deactivate your own admin account", 400);
    }

    if (request.params.id === request.user!.id && request.body.role === "RESIDENT") {
      throw new AppError("You cannot remove your own admin role", 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: request.params.id
      },
      select: {
        id: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    if (!existingUser) {
      throw new AppError("User not found", 404);
    }

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: {
          id: existingUser.id
        },
        data: request.body,
        select: userSelect
      }),
      prisma.auditLog.create({
        data: {
          actorId: request.user!.id,
          action: "USER_UPDATED",
          entity: "User",
          entityId: existingUser.id,
          metadata: {
            previousRole: existingUser.role,
            previousIsActive: existingUser.isActive,
            nextRole: request.body.role ?? existingUser.role,
            nextIsActive: request.body.isActive ?? existingUser.isActive
          }
        }
      })
    ]);

    response.json({ user: updatedUser });
  })
);

adminRouter.get(
  "/schedules",
  validateRequest({ query: adminSchedulesQuerySchema }),
  asyncHandler(async (request, response) => {
    const schedules = await prisma.collectionSchedule.findMany({
      where: buildScheduleWhere(request.query),
      orderBy: {
        collectionDate: "asc"
      },
      include: scheduleInclude
    });

    response.json({ schedules });
  })
);

adminRouter.post(
  "/schedules",
  validateRequest({ body: scheduleCollectionSchema }),
  asyncHandler(async (request, response) => {
    const schedule = await prisma.$transaction(async (tx) => {
      const wasteRequest = await tx.wasteRequest.findUnique({
        where: {
          id: request.body.requestId
        },
        select: {
          id: true,
          status: true
        }
      });

      if (!wasteRequest) {
        throw new AppError("Request not found", 404);
      }

      const createdSchedule = await tx.collectionSchedule.create({
        data: {
          requestId: wasteRequest.id,
          collectionDate: request.body.collectionDate,
          notes: request.body.notes
        },
        include: scheduleInclude
      });

      const nextStatus = wasteRequest.status === "COLLECTED" ? wasteRequest.status : "SCHEDULED";

      await tx.wasteRequest.update({
        where: {
          id: wasteRequest.id
        },
        data: {
          scheduledDate: request.body.collectionDate,
          status: nextStatus,
          statusHistory: {
            create: {
              status: nextStatus,
              note: `Collection scheduled for ${request.body.collectionDate.toISOString()}`,
              changedById: request.user!.id
            }
          }
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: request.user!.id,
          action: "SCHEDULE_CREATED",
          entity: "CollectionSchedule",
          entityId: createdSchedule.id,
          metadata: {
            requestId: wasteRequest.id,
            collectionDate: request.body.collectionDate.toISOString()
          }
        }
      });

      return createdSchedule;
    });

    response.status(201).json({ schedule });
  })
);

adminRouter.patch(
  "/schedules/:id",
  validateRequest({ params: idParamsSchema, body: updateCollectionScheduleSchema }),
  asyncHandler(async (request, response) => {
    const schedule = await prisma.$transaction(async (tx) => {
      const existingSchedule = await tx.collectionSchedule.findUnique({
        where: {
          id: request.params.id
        },
        include: {
          request: {
            select: {
              id: true,
              status: true
            }
          }
        }
      });

      if (!existingSchedule) {
        throw new AppError("Schedule not found", 404);
      }

      const updatedSchedule = await tx.collectionSchedule.update({
        where: {
          id: existingSchedule.id
        },
        data: {
          collectionDate: request.body.collectionDate,
          notes: request.body.notes
        },
        include: scheduleInclude
      });

      const primarySchedule = await tx.collectionSchedule.findFirst({
        where: {
          requestId: existingSchedule.requestId
        },
        orderBy: {
          collectionDate: "asc"
        },
        select: {
          collectionDate: true
        }
      });

      const nextStatus = existingSchedule.request.status === "COLLECTED" ? "COLLECTED" : "SCHEDULED";

      await tx.wasteRequest.update({
        where: {
          id: existingSchedule.requestId
        },
        data: {
          scheduledDate: primarySchedule?.collectionDate ?? updatedSchedule.collectionDate,
          status: nextStatus,
          statusHistory: request.body.collectionDate
            ? {
                create: {
                  status: nextStatus,
                  note: `Collection rescheduled for ${request.body.collectionDate.toISOString()}`,
                  changedById: request.user!.id
                }
              }
            : undefined
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: request.user!.id,
          action: "SCHEDULE_UPDATED",
          entity: "CollectionSchedule",
          entityId: existingSchedule.id,
          metadata: {
            requestId: existingSchedule.requestId,
            collectionDate: updatedSchedule.collectionDate.toISOString()
          }
        }
      });

      return updatedSchedule;
    });

    response.json({ schedule });
  })
);

adminRouter.delete(
  "/schedules/:id",
  validateRequest({ params: idParamsSchema }),
  asyncHandler(async (request, response) => {
    const deletedSchedule = await prisma.$transaction(async (tx) => {
      const existingSchedule = await tx.collectionSchedule.findUnique({
        where: {
          id: request.params.id
        },
        include: {
          request: {
            select: {
              id: true,
              status: true,
              assignedToId: true
            }
          }
        }
      });

      if (!existingSchedule) {
        throw new AppError("Schedule not found", 404);
      }

      const removedSchedule = await tx.collectionSchedule.delete({
        where: {
          id: existingSchedule.id
        },
        include: scheduleInclude
      });

      const nextSchedule = await tx.collectionSchedule.findFirst({
        where: {
          requestId: existingSchedule.requestId
        },
        orderBy: {
          collectionDate: "asc"
        },
        select: {
          collectionDate: true
        }
      });

      const nextStatus =
        existingSchedule.request.status === "COLLECTED"
          ? "COLLECTED"
          : nextSchedule
            ? "SCHEDULED"
            : existingSchedule.request.assignedToId
              ? "ASSIGNED"
              : "PENDING";

      await tx.wasteRequest.update({
        where: {
          id: existingSchedule.requestId
        },
        data: {
          scheduledDate: nextSchedule?.collectionDate ?? null,
          status: nextStatus,
          statusHistory: {
            create: {
              status: nextStatus,
              note: "Collection schedule removed",
              changedById: request.user!.id
            }
          }
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: request.user!.id,
          action: "SCHEDULE_DELETED",
          entity: "CollectionSchedule",
          entityId: existingSchedule.id,
          metadata: {
            requestId: existingSchedule.requestId
          }
        }
      });

      return removedSchedule;
    });

    response.json({ schedule: deletedSchedule });
  })
);

adminRouter.get(
  "/analytics/overview",
  asyncHandler(async (_request, response) => {
    const [
      totalRequests,
      pendingRequests,
      assignedRequests,
      scheduledRequests,
      completedRequests,
      totalUsers,
      activeUsers,
      statusGroups,
      wasteTypeGroups,
      recentRequests
    ] = await Promise.all([
      prisma.wasteRequest.count(),
      prisma.wasteRequest.count({ where: { status: "PENDING" } }),
      prisma.wasteRequest.count({ where: { status: "ASSIGNED" } }),
      prisma.wasteRequest.count({ where: { status: "SCHEDULED" } }),
      prisma.wasteRequest.count({ where: { status: "COLLECTED" } }),
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.wasteRequest.groupBy({
        by: ["status"],
        _count: {
          status: true
        }
      }),
      prisma.wasteRequest.groupBy({
        by: ["wasteType"],
        _count: {
          wasteType: true
        }
      }),
      prisma.wasteRequest.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc"
        },
        include: requestInclude
      })
    ]);

    const completionRate = totalRequests === 0 ? 0 : Math.round((completedRequests / totalRequests) * 100);

    response.json({
      overview: {
        totalRequests,
        pendingRequests,
        assignedRequests,
        scheduledRequests,
        completedRequests,
        completionRate,
        totalUsers,
        activeUsers,
        statusDistribution: REQUEST_STATUSES.map((status) => ({
          status,
          count: statusGroups.find((group) => group.status === status)?._count.status ?? 0
        })),
        wasteTypeDistribution: WASTE_TYPES.map((wasteType) => ({
          wasteType,
          count: wasteTypeGroups.find((group) => group.wasteType === wasteType)?._count.wasteType ?? 0
        })),
        recentRequests
      }
    });
  })
);
