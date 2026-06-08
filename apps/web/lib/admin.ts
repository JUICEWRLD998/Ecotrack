import {
  REQUEST_STATUS_LABELS,
  WASTE_TYPE_LABELS,
  type RequestStatus,
  type UserRole,
  type WasteType
} from "@ecotrack/shared";
import { apiClient } from "@/lib/api-client";
import type { RequestSchedule, RequestStatusHistory } from "@/lib/requests";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    requests: number;
    assigned: number;
  };
};

export type AdminWasteRequest = {
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
  schedules: RequestSchedule[];
  statusHistory: RequestStatusHistory[];
};

export type AdminOverview = {
  totalRequests: number;
  pendingRequests: number;
  assignedRequests: number;
  scheduledRequests: number;
  completedRequests: number;
  completionRate: number;
  totalUsers: number;
  activeUsers: number;
  statusDistribution: Array<{
    status: RequestStatus;
    count: number;
  }>;
  wasteTypeDistribution: Array<{
    wasteType: WasteType;
    count: number;
  }>;
  recentRequests: AdminWasteRequest[];
};

type AdminRequestsResponse = {
  requests: AdminWasteRequest[];
};

type AdminRequestResponse = {
  request: AdminWasteRequest;
};

type AdminUsersResponse = {
  users: AdminUser[];
};

type AdminOverviewResponse = {
  overview: AdminOverview;
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

export async function getAdminRequests(
  apiToken: string,
  filters: {
    status?: string;
    wasteType?: string;
    assignedToId?: string;
    search?: string;
  } = {}
) {
  const payload = await apiClient<AdminRequestsResponse>(`/admin/requests${toQueryString(filters)}`, {
    headers: withAuth(apiToken),
    cache: "no-store"
  });

  return payload.requests;
}

export async function getAdminRequest(apiToken: string, id: string) {
  const payload = await apiClient<AdminRequestResponse>(`/admin/requests/${id}`, {
    headers: withAuth(apiToken),
    cache: "no-store"
  });

  return payload.request;
}

export async function getAdminUsers(
  apiToken: string,
  filters: {
    role?: string;
    isActive?: string;
    search?: string;
  } = {}
) {
  const payload = await apiClient<AdminUsersResponse>(`/admin/users${toQueryString(filters)}`, {
    headers: withAuth(apiToken),
    cache: "no-store"
  });

  return payload.users;
}

export async function getAdminOverview(apiToken: string) {
  const payload = await apiClient<AdminOverviewResponse>("/admin/analytics/overview", {
    headers: withAuth(apiToken),
    cache: "no-store"
  });

  return payload.overview;
}

export function getAdminUsersByRole(users: AdminUser[], role: UserRole) {
  return users.filter((user) => user.role === role && user.isActive);
}

export function formatRole(role: UserRole) {
  return role === "ADMIN" ? "Admin" : "Resident";
}

export function formatAdminStatus(status: RequestStatus) {
  return REQUEST_STATUS_LABELS[status];
}

export function formatAdminWasteType(wasteType: WasteType) {
  return WASTE_TYPE_LABELS[wasteType];
}
