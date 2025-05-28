import React from "react";
import "./transaction.css";

export default function Transactions() {
  // Sample transaction data
  const transactions = [
    {
      id: 1,
      name: "Grocery",
      amount: -120,
      date: "2023-10-05",
      category: "Food",
    },
    {
      id: 2,
      name: "Salary",
      amount: 3000,
      date: "2023-10-01",
      category: "Income",
    },
  ];

  return (
    <div className="transactions-page">
      <h1>Transactions</h1>
      <div className="transactions-list">
        {transactions.map((txn) => (
          <div
            key={txn.id}
            className={`transaction-card ${
              txn.amount >= 0 ? "income" : "expense"
            }`}
          >
            <div className="transaction-info">
              <h3>{txn.name}</h3>
              <p>
                {txn.date} • {txn.category}
              </p>
            </div>
            <div className="transaction-amount">
              {txn.amount >= 0 ? "+" : ""}
              {txn.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
