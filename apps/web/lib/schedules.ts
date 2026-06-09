import type { RequestStatus, WasteType } from "@/lib/schemas";
import { apiClient } from "@/lib/api-client";

export type ResidentCollectionSchedule = {
  id: string;
  requestId: string;
  collectionDate: string;
  notes: string | null;
  createdAt: string;
  request: {
    id: string;
    wasteType: WasteType;
    address: string;
    status: RequestStatus;
    preferredDate: string | null;
    scheduledDate: string | null;
    assignedTo: {
      id: string;
      name: string;
      email: string;
    } | null;
  };
};

export type AdminCollectionSchedule = {
  id: string;
  requestId: string;
  collectionDate: string;
  notes: string | null;
  createdAt: string;
  request: {
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
    user: {
      id: string;
      name: string;
      email: string;
      isActive: boolean;
    };
    assignedTo: {
      id: string;
      name: string;
      email: string;
      isActive: boolean;
    } | null;
  };
};

type ResidentSchedulesResponse = {
  schedules: ResidentCollectionSchedule[];
};

type AdminSchedulesResponse = {
  schedules: AdminCollectionSchedule[];
};

function withAuth(apiToken: string) {
  return {
    Authorization: `Bearer ${apiToken}`
  };
}

function toQueryString(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

export async function getMySchedules(apiToken: string) {
  const payload = await apiClient<ResidentSchedulesResponse>("/schedules/my", {
    headers: withAuth(apiToken),
    cache: "no-store"
  });

  return payload.schedules;
}

export async function getAdminSchedules(
  apiToken: string,
  filters: {
    status?: string;
    wasteType?: string;
    assignedToId?: string;
    search?: string;
    from?: string;
    to?: string;
  } = {}
) {
  const payload = await apiClient<AdminSchedulesResponse>(`/admin/schedules${toQueryString(filters)}`, {
    headers: withAuth(apiToken),
    cache: "no-store"
  });

  return payload.schedules;
}

export function toDateInputValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

export function dateInputToIso(value: string) {
  return `${value}T12:00:00.000Z`;
}
