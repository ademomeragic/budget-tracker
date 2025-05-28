import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7173/api', // adjust your actual port
  withCredentials: true,
});

interface NotificationPreferences {
  deadlineWarnings: boolean;
  nearLimitWarnings: boolean;
  exceededWarnings: boolean;
  incomeCongratulations: boolean;
}

interface UserSettings {
  threshold: number;
  preferences: NotificationPreferences;
}

// Automatically include JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchNotifications = async () => {
  const res = await api.get("/notification");
  return res.data;
};

export const deleteNotification = async (id: number) => {
  await api.delete(`/notification/${id}`);
};

export const updatePassword = async (data: { currentPassword: string; newPassword: string }) => {
  await api.post("/profile/change-password", data);
};

export const updateThreshold = async (threshold: number) => {
  await api.put("/profile/notification-threshold", { threshold });
};

export const fetchUserSettings = async (): Promise<UserSettings> => {
  const res = await api.get("/profile/settings");
  return res.data;
};

export const updateNotificationPreferences = async (preferences: NotificationPreferences) => {
  await api.put("/profile/notification-preferences", preferences);
};

// FLOAT NOTE ENDPOINTS

export const fetchFloatNotes = async () => {
  const res = await api.get("/floatnote");
  return res.data;
};

export const createFloatNote = async (data: { content: string; color: string; displayUntil?: string }) => {
  const res = await api.post("/floatnote", data);
  return res.data;
};

export const deleteFloatNote = async (id: number) => {
  await api.delete(`/floatnote/${id}`);
};

export default api;

