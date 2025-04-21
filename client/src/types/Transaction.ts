export interface TransactionResponse {
  id?: number;
  amount: number;
  description?: string;
  date: string;
  budgetId: number;
  budgetName?: string;
  categoryId: number;
  categoryName?: string;
}

export interface CreateTransactionRequest {
  amount: number;
  description?: string;
  categoryId: number;
  budgetId: number;
  date: string;
}

export interface UpdateTransactionRequest {
  id: number;
  amount: number;
  description?: string;
  date: string;
  budgetId: number;
  categoryId: number;
}
