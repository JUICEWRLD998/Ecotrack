import { z } from "zod";

// ============================================================================
// CONSTANTS
// ============================================================================

export const USER_ROLES = ["RESIDENT", "ADMIN"] as const;

export const WASTE_TYPES = ["HOUSEHOLD", "RECYCLABLE", "ORGANIC"] as const;

export const REQUEST_STATUSES = [
  "PENDING",
  "ASSIGNED",
  "SCHEDULED",
  "IN_PROGRESS",
  "COLLECTED"
] as const;

export const REQUEST_STATUS_LABELS: Record<(typeof REQUEST_STATUSES)[number], string> = {
  PENDING: "Pending",
  ASSIGNED: "Assigned",
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  COLLECTED: "Collected"
};

export const WASTE_TYPE_LABELS: Record<(typeof WASTE_TYPES)[number], string> = {
  HOUSEHOLD: "Household",
  RECYCLABLE: "Recyclable",
  ORGANIC: "Organic"
};

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

export const idSchema = z.string().cuid();

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const userRoleSchema = z.enum(USER_ROLES);

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80)
});

export const adminUpdateUserSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional()
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email address").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters").max(128)
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").toLowerCase(),
  password: z.string().min(1, "Password is required")
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// ============================================================================
// REQUEST SCHEMAS
// ============================================================================

export const wasteTypeSchema = z.enum(WASTE_TYPES);
export const requestStatusSchema = z.enum(REQUEST_STATUSES);

export const createWasteRequestSchema = z.object({
  wasteType: wasteTypeSchema,
  address: z.string().trim().min(5, "Address must be at least 5 characters").max(240),
  description: z.string().trim().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  preferredDate: z.coerce.date().optional()
});

export const updateWasteRequestSchema = createWasteRequestSchema.partial();

export const assignWasteRequestSchema = z.object({
  assignedToId: z.string().cuid()
});

export const updateWasteRequestStatusSchema = z.object({
  status: requestStatusSchema,
  note: z.string().trim().max(500).optional()
});

export const scheduleCollectionSchema = z.object({
  requestId: z.string().cuid(),
  collectionDate: z.coerce.date(),
  notes: z.string().trim().max(500).optional()
});

export const updateCollectionScheduleSchema = z.object({
  collectionDate: z.coerce.date().optional(),
  notes: z.string().trim().max(500).nullable().optional()
});

export type WasteType = z.infer<typeof wasteTypeSchema>;
export type RequestStatus = z.infer<typeof requestStatusSchema>;
export type CreateWasteRequestInput = z.infer<typeof createWasteRequestSchema>;
export type UpdateWasteRequestInput = z.infer<typeof updateWasteRequestSchema>;
export type AssignWasteRequestInput = z.infer<typeof assignWasteRequestSchema>;
export type UpdateWasteRequestStatusInput = z.infer<typeof updateWasteRequestStatusSchema>;
export type ScheduleCollectionInput = z.infer<typeof scheduleCollectionSchema>;
export type UpdateCollectionScheduleInput = z.infer<typeof updateCollectionScheduleSchema>;
