import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import api, { withCurrency } from "../../api/api";
import "./calendar.css";
import { useCurrency } from "../../context/CurrencyContext";

interface Transaction {
  id: string;
  amount: number;
  convertedAmount?: number;
  currency?: string;
  date: string; // YYYY-MM-DD
  description: string;
  type: "income" | "expense";
  category: string;
}

export default function CalendarPage() {
  const { currency } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsByDate, setTransactionsByDate] = useState<Record<string, Transaction[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get(withCurrency("/transaction/all"));
        const txns = res.data;

        setTransactions(txns);

        const grouped: Record<string, Transaction[]> = {};
        txns.forEach((txn: Transaction) => {
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
  }, [currency]);

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

  const formatCurrency = (amount: number, symbol: string = "KM"): string => {
    if (typeof amount !== "number" || isNaN(amount)) return `0.00 ${symbol}`;
    return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,") + ` ${symbol}`;
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
                  <span>
                    {formatCurrency(t.convertedAmount ?? t.amount, t.currency ?? "KM")}
                  </span>
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
