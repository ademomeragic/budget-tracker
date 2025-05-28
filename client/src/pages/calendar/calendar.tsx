import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import api from "../../api/api";
import "./calendar.css";

interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  type: "income" | "expense";
  category: string;
}

export default function CalendarPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsByDate, setTransactionsByDate] = useState<Record<string, Transaction[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newTxn, setNewTxn] = useState({ amount: "", description: "", type: "expense", category: "" });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/transaction/all", {
          headers: { Authorization: `${token}` },
        });

        setTransactions(response.data);

        const grouped: Record<string, Transaction[]> = {};
        response.data.forEach((txn: Transaction) => {
          const dateKey = txn.date.split("T")[0];
          if (!grouped[dateKey]) grouped[dateKey] = [];
          grouped[dateKey].push(txn);
        });

        setTransactionsByDate(grouped);
      } catch (err) {
        console.error("Failed to load transactions", err);
      }
    };
    fetchTransactions();
  }, []);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowModal(true);
  };

  const handleAddTransaction = async () => {
  if (!selectedDate) return;

  const newTransaction = {
    ...newTxn,
    amount: parseFloat(newTxn.amount),
    date: selectedDate.toISOString().split("T")[0],
  };

  try {
    const token = localStorage.getItem("token");
    const response = await api.post("/transaction", newTransaction, {
      headers: { Authorization: `${token}` },
    });

    const addedTxn = response.data;

    // Dodaj u globalni niz transakcija
    setTransactions((prev) => [...prev, addedTxn]);

    // Dodaj u mapu po datumima
    const dateKey = addedTxn.date.split("T")[0];
    setTransactionsByDate((prev) => {
      const updated = { ...prev };
      if (!updated[dateKey]) updated[dateKey] = [];
      updated[dateKey] = [...updated[dateKey], addedTxn];
      return updated;
    });

    // Resetuj modal i polja
    setShowModal(false);
    setNewTxn({ amount: "", description: "", type: "expense", category: "" });
  } catch (err) {
    console.error("Failed to add transaction", err);
  }
};


  const tileContent = ({ date }: { date: Date }) => {
    const key = date.toISOString().split("T")[0];
    const txns = transactionsByDate[key];
    if (!txns) return null;

    const income = txns.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expense = txns.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

    return (
      <div className="calendar-marker">
        {income > 0 && <div className="daily-total income">💰 {income.toFixed(2)}</div>}
        {expense > 0 && <div className="daily-total expense">🔻 {expense.toFixed(2)}</div>}
      </div>
    );
  };

  const selectedKey = selectedDate?.toISOString().split("T")[0];
  const selectedTransactions = selectedKey ? transactionsByDate[selectedKey] : [];

  return (
    <div className="calendar-page">
      <h1>Transaction Calendar</h1>
      <Calendar onClickDay={handleDayClick} tileContent={tileContent} locale="en-US" />

      {selectedDate && (
        <div className="transactions-list">
          <h2>Transactions on {selectedKey}</h2>
          {selectedTransactions?.length > 0 ? (
            <ul>
              {selectedTransactions.map((t) => (
                <li key={t.id} className={`txn-item ${t.type}`}>
                  <span>{t.description}</span>
                  <span>{t.amount.toFixed(2)} KM</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No transactions.</p>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Transaction</h2>
            <input
              type="text"
              placeholder="Description"
              value={newTxn.description}
              onChange={(e) => setNewTxn({ ...newTxn, description: e.target.value })}
            />
            <input
              type="number"
              placeholder="Amount"
              value={newTxn.amount}
              onChange={(e) => setNewTxn({ ...newTxn, amount: e.target.value })}
            />
            <select
              value={newTxn.type}
              onChange={(e) => setNewTxn({ ...newTxn, type: e.target.value })}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input
              type="text"
              placeholder="Category"
              value={newTxn.category}
              onChange={(e) => setNewTxn({ ...newTxn, category: e.target.value })}
            />
            <div className="modal-buttons">
              <button onClick={handleAddTransaction}>Add</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
