import { z } from "zod";
import { USER_ROLES } from "../constants";

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
