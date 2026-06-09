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
} from "../../schemas";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { authenticate } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/require-role";
import { validateRequest } from "../../middleware/validate-request";
import { createNotification, createNotifications } from "../../services/notification.service";
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

const adminAnalyticsQuerySchema = z.object({
  status: requestStatusSchema.optional(),
  wasteType: wasteTypeSchema.optional(),
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
  schedule: true,
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

function startOfDayUtc(date: Date) {
  const nextDate = new Date(date);
  nextDate.setUTCHours(0, 0, 0, 0);
  return nextDate;
}

function endOfDayUtc(date: Date) {
  const nextDate = new Date(date);
  nextDate.setUTCHours(23, 59, 59, 999);
  return nextDate;
}

function startOfMonthUtc(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function endOfMonthUtc(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999));
}

function addMonthsUtc(date: Date, amount: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1));
}

function formatMonthKey(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatMonthLabel(monthKey: string) {
  const [year = 0, month = 1] = monthKey.split("-").map(Number);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function buildDateRange(from?: Date, to?: Date) {
  const createdAt: Prisma.DateTimeFilter = {};

  if (from) {
    createdAt.gte = startOfDayUtc(from);
  }

  if (to) {
    createdAt.lte = endOfDayUtc(to);
  }

  return Object.keys(createdAt).length > 0 ? createdAt : undefined;
}

function buildAnalyticsRequestWhere(query: z.infer<typeof adminAnalyticsQuerySchema>) {
  const where: Prisma.WasteRequestWhereInput = {};
  const dateRange = buildDateRange(query.from, query.to);

  if (query.status) {
    where.status = query.status;
  }

  if (query.wasteType) {
    where.wasteType = query.wasteType;
  }

  if (dateRange) {
    where.createdAt = dateRange;
  }

  return where;
}

function shouldCountStatus(queryStatus: z.infer<typeof requestStatusSchema> | undefined, status: z.infer<typeof requestStatusSchema>) {
  return !queryStatus || queryStatus === status;
}

function buildAnalyticsStatusWhere(
  query: z.infer<typeof adminAnalyticsQuerySchema>,
  status: z.infer<typeof requestStatusSchema>
) {
  if (!shouldCountStatus(query.status, status)) {
    return null;
  }

  return {
    ...buildAnalyticsRequestWhere(query),
    status
  } satisfies Prisma.WasteRequestWhereInput;
}

function buildMonthlyTrendWindow(query: z.infer<typeof adminAnalyticsQuerySchema>) {
  const now = new Date();
  const to = query.to ? endOfMonthUtc(query.to) : endOfMonthUtc(now);
  const from = query.from ? startOfMonthUtc(query.from) : startOfMonthUtc(addMonthsUtc(to, -5));

  return { from, to };
}

function buildMonthlyTrendBuckets(from: Date, to: Date) {
  const buckets = new Map<
    string,
    {
      month: string;
      monthKey: string;
      total: number;
      collected: number;
      pending: number;
    }
  >();

  for (let cursor = startOfMonthUtc(from); cursor <= to; cursor = addMonthsUtc(cursor, 1)) {
    const monthKey = formatMonthKey(cursor);
    buckets.set(monthKey, {
      month: formatMonthLabel(monthKey),
      monthKey,
      total: 0,
      collected: 0,
      pending: 0
    });
  }

  return buckets;
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
        status: true,
        userId: true
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

    await createNotifications([
      {
        userId: existingRequest.userId,
        title: "Request assigned",
        message: `Your collection request has been assigned to ${assignee.name}.`
      },
      {
        userId: assignee.id,
        title: "Request assigned to you",
        message: "A collection request has been assigned to you."
      }
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
        status: true,
        userId: true,
        assignedToId: true
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

    await createNotifications([
      {
        userId: existingRequest.userId,
        title: "Request status updated",
        message: `Your collection request status is now ${request.body.status.replace("_", " ").toLowerCase()}.`
      },
      ...(existingRequest.assignedToId && existingRequest.assignedToId !== request.user!.id
        ? [
            {
              userId: existingRequest.assignedToId,
              title: "Assigned request updated",
              message: `A request assigned to you is now ${request.body.status.replace("_", " ").toLowerCase()}.`
            }
          ]
        : [])
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
          status: true,
          userId: true,
          assignedToId: true
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

    await createNotifications([
      {
        userId: schedule.request.userId,
        title: "Collection scheduled",
        message: `Your collection is scheduled for ${schedule.collectionDate.toLocaleDateString("en-US")}.`
      },
      ...(schedule.request.assignedToId && schedule.request.assignedToId !== request.user!.id
        ? [
            {
              userId: schedule.request.assignedToId,
              title: "Collection scheduled",
              message: `A request assigned to you is scheduled for ${schedule.collectionDate.toLocaleDateString("en-US")}.`
            }
          ]
        : [])
    ]);

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
              status: true,
              userId: true,
              assignedToId: true
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

    await createNotifications([
      {
        userId: schedule.request.userId,
        title: "Collection rescheduled",
        message: `Your collection is now scheduled for ${schedule.collectionDate.toLocaleDateString("en-US")}.`
      },
      ...(schedule.request.assignedToId && schedule.request.assignedToId !== request.user!.id
        ? [
            {
              userId: schedule.request.assignedToId,
              title: "Collection rescheduled",
              message: `A request assigned to you is now scheduled for ${schedule.collectionDate.toLocaleDateString("en-US")}.`
            }
          ]
        : [])
    ]);

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
              assignedToId: true,
              userId: true
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

    await createNotifications([
      {
        userId: deletedSchedule.request.userId,
        title: "Collection schedule removed",
        message: "A scheduled collection for your request was removed."
      },
      ...(deletedSchedule.request.assignedToId && deletedSchedule.request.assignedToId !== request.user!.id
        ? [
            {
              userId: deletedSchedule.request.assignedToId,
              title: "Collection schedule removed",
              message: "A scheduled collection for a request assigned to you was removed."
            }
          ]
        : [])
    ]);

    response.json({ schedule: deletedSchedule });
  })
);

adminRouter.get(
  "/analytics/overview",
  validateRequest({ query: adminAnalyticsQuerySchema }),
  asyncHandler(async (request, response) => {
    const where = buildAnalyticsRequestWhere(request.query);
    const pendingWhere = buildAnalyticsStatusWhere(request.query, "PENDING");
    const assignedWhere = buildAnalyticsStatusWhere(request.query, "ASSIGNED");
    const scheduledWhere = buildAnalyticsStatusWhere(request.query, "SCHEDULED");
    const completedWhere = buildAnalyticsStatusWhere(request.query, "COLLECTED");
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
      prisma.wasteRequest.count({ where }),
      pendingWhere ? prisma.wasteRequest.count({ where: pendingWhere }) : Promise.resolve(0),
      assignedWhere ? prisma.wasteRequest.count({ where: assignedWhere }) : Promise.resolve(0),
      scheduledWhere ? prisma.wasteRequest.count({ where: scheduledWhere }) : Promise.resolve(0),
      completedWhere ? prisma.wasteRequest.count({ where: completedWhere }) : Promise.resolve(0),
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.wasteRequest.groupBy({
        by: ["status"],
        where,
        _count: {
          status: true
        }
      }),
      prisma.wasteRequest.groupBy({
        by: ["wasteType"],
        where,
        _count: {
          wasteType: true
        }
      }),
      prisma.wasteRequest.findMany({
        where,
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

adminRouter.get(
  "/analytics/waste-types",
  validateRequest({ query: adminAnalyticsQuerySchema }),
  asyncHandler(async (request, response) => {
    const where = buildAnalyticsRequestWhere(request.query);
    const [totalRequests, wasteTypeGroups] = await Promise.all([
      prisma.wasteRequest.count({ where }),
      prisma.wasteRequest.groupBy({
        by: ["wasteType"],
        where,
        _count: {
          wasteType: true
        }
      })
    ]);

    response.json({
      wasteTypes: WASTE_TYPES.map((wasteType) => {
        const count = wasteTypeGroups.find((group) => group.wasteType === wasteType)?._count.wasteType ?? 0;
        const percentage = totalRequests === 0 ? 0 : Math.round((count / totalRequests) * 100);

        return {
          wasteType,
          count,
          percentage
        };
      })
    });
  })
);

adminRouter.get(
  "/analytics/monthly-trends",
  validateRequest({ query: adminAnalyticsQuerySchema }),
  asyncHandler(async (request, response) => {
    const { from, to } = buildMonthlyTrendWindow(request.query);
    const where = buildAnalyticsRequestWhere({
      ...request.query,
      from,
      to
    });
    const requests = await prisma.wasteRequest.findMany({
      where,
      select: {
        createdAt: true,
        status: true
      }
    });
    const buckets = buildMonthlyTrendBuckets(from, to);

    requests.forEach((wasteRequest) => {
      const monthKey = formatMonthKey(wasteRequest.createdAt);
      const bucket = buckets.get(monthKey);

      if (!bucket) {
        return;
      }

      bucket.total += 1;

      if (wasteRequest.status === "COLLECTED") {
        bucket.collected += 1;
      }

      if (wasteRequest.status === "PENDING") {
        bucket.pending += 1;
      }
    });

    response.json({
      trends: Array.from(buckets.values()).map((bucket) => ({
        ...bucket,
        completionRate: bucket.total === 0 ? 0 : Math.round((bucket.collected / bucket.total) * 100)
      }))
    });
  })
);

adminRouter.get(
  "/analytics/completion-rate",
  validateRequest({ query: adminAnalyticsQuerySchema }),
  asyncHandler(async (request, response) => {
    const where = buildAnalyticsRequestWhere(request.query);
    const completedWhere = buildAnalyticsStatusWhere(request.query, "COLLECTED");
    const inProgressWhere = buildAnalyticsStatusWhere(request.query, "IN_PROGRESS");
    const [totalRequests, completedRequests, inProgressRequests] = await Promise.all([
      prisma.wasteRequest.count({ where }),
      completedWhere ? prisma.wasteRequest.count({ where: completedWhere }) : Promise.resolve(0),
      inProgressWhere ? prisma.wasteRequest.count({ where: inProgressWhere }) : Promise.resolve(0)
    ]);
    const completionRate = totalRequests === 0 ? 0 : Math.round((completedRequests / totalRequests) * 100);

    response.json({
      completionRate: {
        totalRequests,
        completedRequests,
        inProgressRequests,
        outstandingRequests: totalRequests - completedRequests,
        completionRate
      }
    });
  })
);
