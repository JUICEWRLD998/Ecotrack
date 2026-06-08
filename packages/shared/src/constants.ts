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
