import {
  REQUEST_STATUS_LABELS,
  WASTE_TYPE_LABELS,
  type RequestStatus,
  type UserRole,
  type WasteType
} from "@/lib/schemas";
import { apiClient } from "@/lib/api-client";

export type RequestSchedule = {
  id: string;
  requestId: string;
  collectionDate: string;
  notes: string | null;
  createdAt: string;
};

export type RequestStatusHistory = {
  id: string;
  requestId: string;
  status: RequestStatus;
  note: string | null;
  changedById: string | null;
  createdAt: string;
  changedBy: {
    id: string;
    name: string;
    role: UserRole;
  } | null;
};

export type ResidentWasteRequest = {
  id: string;
  userId: string;
  assignedToId: string | null;
  wasteType: WasteType;
  address: string;
  description: string | null;
  imageUrl: string | null;
  status: RequestStatus;
  preferredDate: string | null;
  scheduledDate: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo: {
    id: string;
    name: string;
    email: string;
  } | null;
  schedule: RequestSchedule | null;
  statusHistory: RequestStatusHistory[];
};

type RequestsResponse = {
  requests: ResidentWasteRequest[];
};

type RequestResponse = {
  request: ResidentWasteRequest;
};

function withAuth(apiToken: string) {
  return {
    Authorization: `Bearer ${apiToken}`
  };
}

export async function getMyRequests(apiToken: string) {
  const payload = await apiClient<RequestsResponse>("/requests/my", {
    headers: withAuth(apiToken),
    cache: "no-store"
  });

  return payload.requests;
}

export async function getMyRequest(apiToken: string, id: string) {
  const payload = await apiClient<RequestResponse>(`/requests/${id}`, {
    headers: withAuth(apiToken),
    cache: "no-store"
  });

  return payload.request;
}

export function formatRequestStatus(status: RequestStatus) {
  return REQUEST_STATUS_LABELS[status];
}

export function formatWasteType(wasteType: WasteType) {
  return WASTE_TYPE_LABELS[wasteType];
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "None";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function getRequestCollectionDate(request: ResidentWasteRequest) {
  return request.scheduledDate ?? request.schedule?.collectionDate ?? null;
}

export function getNextCollectionDate(requests: ResidentWasteRequest[]) {
  const now = Date.now();
  const scheduledDates = requests
    .flatMap((request) => [request.scheduledDate, ...request.schedules.map((schedule) => schedule.collectionDate)])
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((date) => date.getTime() >= now)
    .sort((first, second) => first.getTime() - second.getTime());

  return scheduledDates[0]?.toISOString() ?? null;
}
