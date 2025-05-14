import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import api from "../../api/api";
import "./calendar.css"; // We'll create this for styling

interface Transaction {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
  type: "income" | "expense";
  category: string;
}

export default function CalendarPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsByDate, setTransactionsByDate] = useState<Record<string, Transaction[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const handleDayClick = (value: Date) => {
    setSelectedDate(value);
  };

  const tileContent = ({ date }: { date: Date }) => {
    const key = date.toISOString().split("T")[0];
    const txns = transactionsByDate[key];
    if (!txns) return null;

    const hasIncome = txns.some((t) => t.type === "income");
    const hasExpense = txns.some((t) => t.type === "expense");

    return (
      <div className="calendar-marker">
        {hasIncome && <span className="marker income" />} 
        {hasExpense && <span className="marker expense" />} 
      </div>
    );
  };

  const selectedKey = selectedDate?.toISOString().split("T")[0];
  const selectedTransactions = selectedKey ? transactionsByDate[selectedKey] : [];

  return (
    <div className="calendar-page">
      <h1>Transaction Calendar</h1>
      <Calendar onClickDay={handleDayClick} tileContent={tileContent} />

      {selectedDate && (
        <div className="transactions-list">
          <h2>Transactions on {selectedKey}</h2>
          {selectedTransactions && selectedTransactions.length > 0 ? (
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
    </div>
  );
}
