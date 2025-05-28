import React, { useState } from "react";
import { FiPlus, FiDollarSign, FiTrendingUp } from "react-icons/fi";
import "./floatingButton.css";

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  // 🔧 Manual Type Assertion Fix
  const TrendingUpIcon = FiTrendingUp as unknown as React.FC;
  const DollarSignIcon = FiDollarSign as unknown as React.FC;
  const PlusIcon = FiPlus as unknown as React.FC;

  return (
    <div className="fab-container">
      {isOpen && (
        <>
          <button
            className="fab-option income-option"
            onClick={() => console.log("Add Income")}
          >
            <span className="fab-icon">
              <TrendingUpIcon />
            </span>
            <span className="fab-label">Income</span>
          </button>
          <button
            className="fab-option expense-option"
            onClick={() => console.log("Add Expense")}
          >
            <span className="fab-icon">
              <DollarSignIcon />
            </span>
            <span className="fab-label">Expense</span>
          </button>
        </>
      )}

      <button
        className="fab-main"
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: "inline" }}
      >
        <span className={`fab-icon ${isOpen ? "rotate" : ""}`}>
          <PlusIcon />
        </span>
      </button>
    </div>
  );
}
