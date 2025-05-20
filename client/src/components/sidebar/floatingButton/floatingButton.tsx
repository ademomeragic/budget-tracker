import React, { useState } from "react";
import {
  FiTrendingUp,
  FiDollarSign,
  FiPlus,
} from "react-icons/fi";

import "./floatingButton.css";

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fab-container">
      {isOpen && (
        <>
          <button
            className="fab-option income-option"
            onClick={() => console.log("Add Income")}
          >
            <span className="fab-icon">
              <FiTrendingUp />
            </span>
            <span className="fab-label">Income</span>
          </button>
          <button
            className="fab-option expense-option"
            onClick={() => console.log("Add Expense")}
          >
            <span className="fab-icon">
              <FiDollarSign />
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
          <FiPlus />
        </span>
      </button>
    </div>
  );
}
