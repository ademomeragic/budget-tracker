import React from "react";
import "./dashboard.css";

// Mock data
const balanceData = { total: 4500, income: 6000, expenses: 1500 };
const recentTransactions = [
  { id: 1, name: "Grocery", amount: -120, category: "Food" },
  { id: 2, name: "Salary", amount: 3000, category: "Income" },
];

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>

      {/* Balance Cards */}
      <div className="balance-grid">
        <div className="balance-card total-balance">
          <h2>Total Balance</h2>
          <p className={balanceData.total >= 0 ? "positive" : "negative"}>
            ${balanceData.total.toLocaleString()}
          </p>
        </div>

        <div className="balance-card income">
          <h2>Income</h2>
          <p className="positive">+${balanceData.income.toLocaleString()}</p>
        </div>

        <div className="balance-card expenses">
          <h2>Expenses</h2>
          <p className="negative">-${balanceData.expenses.toLocaleString()}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="btn income-btn">Add Income</button>
        <button className="btn expense-btn">Add Expense</button>
      </div>

      {/* Recent Transactions */}
      <div className="transactions-section">
        <h2>Recent Transactions</h2>
        <div className="transactions-list">
          {recentTransactions.map((txn) => (
            <div key={txn.id} className="transaction-item">
              <span>{txn.name}</span>
              <span className={txn.amount >= 0 ? "positive" : "negative"}>
                {txn.amount >= 0 ? "+" : ""}
                {txn.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
