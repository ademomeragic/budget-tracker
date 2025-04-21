// src/services/TransactionService.ts
import axiosInstance from "../axios";
import {
  TransactionResponse,
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from "../types/Transaction";

export const getTransactions = async (): Promise<TransactionResponse[]> => {
  const response = await axiosInstance.get("/transactions");
  return response.data;
};

export const createTransaction = async (
  transaction: CreateTransactionRequest
): Promise<TransactionResponse> => {
  const response = await axiosInstance.post("/transactions", transaction);
  return response.data;
};

export const updateTransaction = async (
  transaction: UpdateTransactionRequest
): Promise<TransactionResponse> => {
  const response = await axiosInstance.put(
    `/transactions/${transaction.id}`,
    transaction
  );
  return response.data;
};

export const deleteTransaction = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/transactions/${id}`);
};
