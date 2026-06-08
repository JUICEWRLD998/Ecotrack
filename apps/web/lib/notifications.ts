import { apiClient } from "@/lib/api-client";

export type AppNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

type NotificationsResponse = {
  notifications: AppNotification[];
  unreadCount: number;
};

type UnreadCountResponse = {
  unreadCount: number;
};

type NotificationResponse = {
  notification: AppNotification;
};

type MarkAllNotificationsResponse = {
  success: boolean;
};

function withAuth(apiToken: string) {
  return {
    Authorization: `Bearer ${apiToken}`
  };
}

export async function getNotifications(apiToken: string) {
  return apiClient<NotificationsResponse>("/notifications", {
    headers: withAuth(apiToken),
    cache: "no-store"
  });
}

export async function getUnreadNotificationCount(apiToken: string) {
  const payload = await apiClient<UnreadCountResponse>("/notifications/unread-count", {
    headers: withAuth(apiToken),
    cache: "no-store"
  });

  return payload.unreadCount;
}

export async function markNotificationRead(apiToken: string, notificationId: string) {
  const payload = await apiClient<NotificationResponse>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: withAuth(apiToken)
  });

  return payload.notification;
}

export async function markAllNotificationsRead(apiToken: string) {
  return apiClient<MarkAllNotificationsResponse>("/notifications/read-all", {
    method: "PATCH",
    headers: withAuth(apiToken)
  });
}
