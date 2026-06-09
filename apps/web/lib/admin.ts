import {
  REQUEST_STATUS_LABELS,
  WASTE_TYPE_LABELS,
  type RequestStatus,
  type UserRole,
  type WasteType
} from "@/lib/schemas";
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
  schedule: RequestSchedule | null;
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

export type AnalyticsFilters = {
  status?: string;
  wasteType?: string;
  from?: string;
  to?: string;
};

export type WasteTypeAnalytics = {
  wasteType: WasteType;
  count: number;
  percentage: number;
};

export type MonthlyTrend = {
  month: string;
  monthKey: string;
  total: number;
  collected: number;
  pending: number;
  completionRate: number;
};

export type CompletionRateAnalytics = {
  totalRequests: number;
  completedRequests: number;
  inProgressRequests: number;
  outstandingRequests: number;
  completionRate: number;
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

type WasteTypeAnalyticsResponse = {
  wasteTypes: WasteTypeAnalytics[];
};

type MonthlyTrendsResponse = {
  trends: MonthlyTrend[];
};

type CompletionRateAnalyticsResponse = {
  completionRate: CompletionRateAnalytics;
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

export async function getAdminOverview(apiToken: string, filters: AnalyticsFilters = {}) {
  const payload = await apiClient<AdminOverviewResponse>(`/admin/analytics/overview${toQueryString(filters)}`, {
    headers: withAuth(apiToken),
    cache: "no-store"
  });

  return payload.overview;
}

export async function getAdminWasteTypeAnalytics(apiToken: string, filters: AnalyticsFilters = {}) {
  const payload = await apiClient<WasteTypeAnalyticsResponse>(
    `/admin/analytics/waste-types${toQueryString(filters)}`,
    {
      headers: withAuth(apiToken),
      cache: "no-store"
    }
  );

  return payload.wasteTypes;
}

export async function getAdminMonthlyTrends(apiToken: string, filters: AnalyticsFilters = {}) {
  const payload = await apiClient<MonthlyTrendsResponse>(`/admin/analytics/monthly-trends${toQueryString(filters)}`, {
    headers: withAuth(apiToken),
    cache: "no-store"
  });

  return payload.trends;
}

export async function getAdminCompletionRate(apiToken: string, filters: AnalyticsFilters = {}) {
  const payload = await apiClient<CompletionRateAnalyticsResponse>(
    `/admin/analytics/completion-rate${toQueryString(filters)}`,
    {
      headers: withAuth(apiToken),
      cache: "no-store"
    }
  );

  return payload.completionRate;
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
