import { z } from "zod";
import { REQUEST_STATUSES, WASTE_TYPES } from "../constants";

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
