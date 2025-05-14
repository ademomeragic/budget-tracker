import api from "./api"; // your axios instance

export const fetchWallets = async () => {
  const response = await api.get("/wallet");
  return response.data;
};

export const addWallet = async (wallet: {
  name: string;
  balance: number;
  type: "account" | "savings";
}) => {
  const response = await api.post("/wallet", wallet);
  return response.data;
};

export const updateWallet = async (id: number, wallet: {
  name: string;
  balance: number;
  type: "account" | "savings";
}) => {
  const response = await api.put(`/wallet/${id}`, wallet);
  return response.data;
};

export const deleteWallet = async (id: number) => {
  const response = await api.delete(`/wallet/${id}`);
  return response.data;
};
