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

interface Goal {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  type: "expense" | "income";
  targetAmount: number;
  currentAmount: number;
}

export default function CalendarPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactionsByDate, setTransactionsByDate] = useState<Record<string, Transaction[]>>({});
  const [goalsByDate, setGoalsByDate] = useState<Record<string, Goal[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch transactions
        const txnResponse = await api.get("/transaction/all", {
          headers: { Authorization: `${token}` },
        });
        setTransactions(txnResponse.data);

        const groupedTxns: Record<string, Transaction[]> = {};
        txnResponse.data.forEach((txn: Transaction) => {
          const dateKey = txn.date.split("T")[0];
          if (!groupedTxns[dateKey]) groupedTxns[dateKey] = [];
          groupedTxns[dateKey].push(txn);
        });
        setTransactionsByDate(groupedTxns);

        // Fetch goals
        const goalsResponse = await api.get("/goal", {
          headers: { Authorization: `${token}` },
        });
        setGoals(goalsResponse.data);

        const groupedGoals: Record<string, Goal[]> = {};
        goalsResponse.data.forEach((goal: Goal) => {
          // Add start date
          const startDateKey = goal.startDate.split("T")[0];
          if (!groupedGoals[startDateKey]) groupedGoals[startDateKey] = [];
          groupedGoals[startDateKey].push(goal);
          
          // Add end date
          const endDateKey = goal.endDate.split("T")[0];
          if (!groupedGoals[endDateKey]) groupedGoals[endDateKey] = [];
          groupedGoals[endDateKey].push(goal);
        });
        setGoalsByDate(groupedGoals);

      } catch (err) {
        console.error("Failed to load data", err);
      }
    };
    fetchData();
  }, []);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const tileContent = ({ date }: { date: Date }) => {
    const key = date.toISOString().split("T")[0];
    const txns = transactionsByDate[key] || [];
    const goals = goalsByDate[key] || [];

    const income = txns.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const expense = txns.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

    const startGoals = goals.filter(g => g.startDate.split("T")[0] === key);
    const endGoals = goals.filter(g => g.endDate.split("T")[0] === key);

    return (
      <div className="calendar-marker">
        {income > 0 && <div className="daily-total income">💰 {income.toFixed(2)}</div>}
        {expense > 0 && <div className="daily-total expense">🔻 {expense.toFixed(2)}</div>}
        {startGoals.length > 0 && <div className="daily-total goal-start">🎯 Start ({startGoals.length})</div>}
        {endGoals.length > 0 && <div className="daily-total goal-end">🏁 End ({endGoals.length})</div>}
      </div>
    );
  };

  const selectedKey = selectedDate?.toISOString().split("T")[0];
  const selectedTransactions = selectedKey ? transactionsByDate[selectedKey] || [] : [];
  const selectedGoals = selectedKey ? goalsByDate[selectedKey] || [] : [];

  return (
    <div className="calendar-page">
      <h1>Financial Calendar</h1>
      <Calendar 
        onClickDay={handleDayClick} 
        tileContent={tileContent} 
        locale="en-US"
        className="financial-calendar"
      />

      {selectedDate && (
        <div className="day-details">
          <h2>Details for {selectedKey}</h2>
          
          {selectedTransactions.length > 0 && (
            <div className="transactions-section">
              <h3>Transactions</h3>
              <ul>
                {selectedTransactions.map((t) => (
                  <li key={t.id} className={`txn-item ${t.type}`}>
                    <span>{t.description}</span>
                    <span>{t.amount.toFixed(2)} KM ({t.category})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedGoals.length > 0 && (
            <div className="goals-section">
              <h3>Goals</h3>
              <ul>
                {selectedGoals.map((g) => {
                  const isStart = g.startDate.split("T")[0] === selectedKey;
                  const isEnd = g.endDate.split("T")[0] === selectedKey;
                  
                  return (
                    <li key={g.id} className={`goal-item ${g.type}`}>
                      <div>
                        <strong>{g.name}</strong>
                        <span>{g.currentAmount.toFixed(2)}/{g.targetAmount.toFixed(2)} KM</span>
                      </div>
                      <div>
                        {isStart && "🏁 Goal started!"}
                        {isEnd && "🎯 Goal ended!"}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {selectedTransactions.length === 0 && selectedGoals.length === 0 && (
            <p>No financial activities for this date.</p>
          )}
        </div>
      )}
    </div>
  );
}