// src/services/BudgetService.ts
import axiosInstance from "../axios";
import {
  BudgetResponse,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from "../types/Budget";

export const getBudgets = async (): Promise<BudgetResponse[]> => {
  const response = await axiosInstance.get("/Budget");
  return response.data;
};

export const createBudget = async (
  budget: CreateBudgetRequest
): Promise<BudgetResponse> => {
  const response = await axiosInstance.post("/Budget", budget);
  return response.data;
};

export const updateBudget = async (
  budget: UpdateBudgetRequest
): Promise<BudgetResponse> => {
  const response = await axiosInstance.put(`/Budget/${budget.id}`, budget);
  return response.data;
};

export const deleteBudget = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/Budget/${id}`);
};
