import React, { useEffect, useState } from "react";
import { createBudget } from "../services/BudgetServices";
import { getCategories } from "../services/CategoryServices";
import { CreateBudgetRequest } from "../types/Budget";
import { CategoryResponse } from "../types/Category";

const CreateBudgetForm: React.FC = () => {
  const [amount, setAmount] = useState<number>(0);
  const [spendingLimit, setSpendingLimit] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newBudget: CreateBudgetRequest = {
      amount,
      spendingLimit,
      startDate,
      endDate,
      categoryId,
      userId: 1, // temporary static user until auth is implemented
    };

    try {
      await createBudget(newBudget);
      alert("Budget created successfully!");
      setAmount(0);
      setSpendingLimit(0);
      setStartDate("");
      setEndDate("");
      setCategoryId(undefined);
    } catch (error) {
      console.error("Error creating budget:", error);
    }
  };

  return (
    <div>
      <h2>Create Budget</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          required
        />
        <input
          type="number"
          placeholder="Spending Limit"
          value={spendingLimit}
          onChange={(e) => setSpendingLimit(parseFloat(e.target.value))}
          required
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        <select
          value={categoryId ?? ""}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default CreateBudgetForm;
