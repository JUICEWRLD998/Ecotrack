import { Router } from "express";
import { adminRouter } from "./admin/admin.routes";
import { analyticsRouter } from "./analytics/analytics.routes";
import { authRouter } from "./auth/auth.routes";
import { healthRouter } from "./health/health.routes";
import { notificationsRouter } from "./notifications/notifications.routes";
import { requestsRouter } from "./requests/requests.routes";
import { schedulesRouter } from "./schedules/schedules.routes";
import { uploadsRouter } from "./uploads/uploads.routes";
import { usersRouter } from "./users/users.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/requests", requestsRouter);
apiRouter.use("/schedules", schedulesRouter);
apiRouter.use("/notifications", notificationsRouter);
apiRouter.use("/uploads", uploadsRouter);
apiRouter.use("/analytics", analyticsRouter);
