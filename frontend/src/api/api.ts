import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7173/api", // adjust to your actual port
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

// Helper to attach currency to any request
export const withCurrency = (url: string): string => {
  const currency = localStorage.getItem("currency") || "BAM";
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}currency=${currency}`;
};

// Notifications

export const fetchNotifications = async () => {
  const res = await api.get("/notification");
  return res.data;
};

export const deleteNotification = async (id: number) => {
  await api.delete(`/notification/${id}`);
};

// Profile / Settings

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

// Float Notes

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

// Categories

export const fetchCategoriesByType = async (type: "income" | "expense" | "both") => {
  const res = await api.get(`/category?type=${type}`);
  return res.data;
};

// Recurring Transactions

export const fetchRecurringTransactions = async () => {
  const res = await api.get("/recurringtransaction");
  return res.data;
};

export const createRecurringTransaction = async (recurringData: {
  amount: number;
  description: string;
  type: "income" | "expense";
  walletId: number;
  categoryId: number;
  nextRunDate: string; // ISO string
  frequency: string; // "daily" | "weekly" | "monthly"
}) => {
  const res = await api.post("/recurringtransaction", recurringData);
  return res.data;
};

export const updateRecurringTransaction = async (id: number, updatedData: any) => {
  const res = await api.put(`/recurringtransaction/${id}`, updatedData);
  return res.data;
};

export const deleteRecurringTransaction = async (id: number) => {
  const res = await api.delete(`/recurringtransaction/${id}`);
  return res.data;
};

// OCR Parse

export const parseReceipt = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/receipt/parse", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data; // { amount, date, description, type }
};

export default api;
