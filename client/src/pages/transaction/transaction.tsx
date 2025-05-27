import React, { useEffect, useState } from "react";
import api from "../../api/api";
import "./transaction.css";

interface TransactionDto {
  id: number;
  amount: number;
  date: string;
  description: string;
  type: string;
  categoryId: number;
  walletId: number;
  currencyCode: string;
  convertedAmount?: number;
  convertedCurrencyCode?: string;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [formData, setFormData] = useState({
    amount: "",
    date: "",
    description: "",
    type: "expense",
    categoryId: "",
    walletId: "",
    currencyCode: "", // Added currencyCode here
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/transaction/all", {
        headers: { Authorization: token ?? "" },
      });
      setTransactions(res.data);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const payload = {
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description,
        type: formData.type,
        categoryId: parseInt(formData.categoryId),
        walletId: parseInt(formData.walletId),
        currencyCode: formData.currencyCode, // Include currencyCode here
      };

      console.log("➡️ Sending transaction payload:", payload);

      await api.post("/transaction", payload, {
        headers: { Authorization: token ?? "" },
      });

      await fetchTransactions();
      setFormData({
        amount: "",
        date: "",
        description: "",
        type: "expense",
        categoryId: "",
        walletId: "",
        currencyCode: "",
      });
    } catch (error: any) {
      console.error("❌ Failed to add transaction", error);

      if (error.response) {
        console.error("💥 Server Response Data:", error.response.data);
        alert(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        alert("An unknown error occurred");
      }
    }
  };

  return (
    <div className="transactions-page">
      <h1>Transactions</h1>

      {/* Transaction Form */}
      <form className="transaction-form" onSubmit={handleAddTransaction}>
        <input
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <input
          name="amount"
          type="number"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          required
        />
        <input
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
        <input
          name="categoryId"
          type="number"
          placeholder="Category ID"
          value={formData.categoryId}
          onChange={handleChange}
          required
        />
        <input
          name="walletId"
          type="number"
          placeholder="Wallet ID"
          value={formData.walletId}
          onChange={handleChange}
          required
        />
        <input
          name="currencyCode"
          placeholder="Currency Code (e.g. USD)"
          value={formData.currencyCode}
          onChange={handleChange}
          required
        />
        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <button type="submit">Add Transaction</button>
      </form>

      {/* Transaction List */}
      <div className="transactions-list">
        {transactions.map((txn) => (
          <div
            key={txn.id}
            className={`transaction-card ${
              txn.type === "income" ? "income" : "expense"
            }`}
          >
            <div className="transaction-info">
              <h3>{txn.description}</h3>
              <p>
                {txn.date.slice(0, 10)} • Category ID: {txn.categoryId}
              </p>
              <p>
                Wallet ID: {txn.walletId} • {txn.currencyCode}
              </p>
            </div>
            <div className="transaction-amount">
              {txn.type === "income" ? "+" : "-"}
              {txn.amount} {txn.currencyCode}
              {txn.convertedAmount && txn.convertedCurrencyCode && (
                <span className="converted">
                  {" "}
                  (~{txn.convertedAmount} {txn.convertedCurrencyCode})
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
