import React, { useEffect, useState } from "react";
import { getBudgets, deleteBudget } from "../services/BudgetServices";
import { BudgetResponse } from "../types/Budget";

const BudgetList: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetResponse[]>([]);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const data = await getBudgets();
        setBudgets(data);
      } catch (error) {
        console.error("Error fetching budgets:", error);
      }
    };

    fetchBudgets();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteBudget(id);
      setBudgets(budgets.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };

  return (
    <div>
      <h2>Budgets</h2>
      <ul>
        {budgets.map((budget) => (
          <li key={budget.id}>
            {budget.amount} - {budget.spendingLimit} - {budget.startDate} to{" "}
            {budget.endDate}
            <br />
            Category: {budget.category?.name ?? budget.categoryName}
            <br />
            <button onClick={() => handleDelete(budget.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BudgetList;
