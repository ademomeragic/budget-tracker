import { CategoryResponse } from "./Category";
import { TransactionResponse } from "./Transaction";

export interface BudgetResponse {
  id: number;
  amount: number;
  spendingLimit: number;
  startDate: string;
  endDate: string;
  categoryId?: number;
  categoryName?: string;
  category?: CategoryResponse;
  transactions: TransactionResponse[];
}

export interface CreateBudgetRequest {
  amount: number;
  spendingLimit: number;
  startDate: string;
  endDate: string;
  categoryId?: number;
  userId: number;
}

export interface UpdateBudgetRequest {
  id: number;
  amount: number;
  spendingLimit: number;
  startDate: string;
  endDate: string;
  categoryId: number;
}
