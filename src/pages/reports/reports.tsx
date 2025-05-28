import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import api, { withCurrency } from "../../api/api";
import { useCurrency } from "../../context/CurrencyContext";
import "./reports.css";

interface Transaction {
  amount: number;
  convertedAmount?: number;
  currency?: string;
  date: string;
  description: string;
  type: "income" | "expense";
  category: string;
  walletId: number;
}

interface Wallet {
  id: number;
  name: string;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c", "#d0ed57", "#FF6666", "#AAFFEE"];

export default function Reports() {
  const { currency } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<"all" | number>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, walletRes] = await Promise.all([
          api.get(withCurrency("/transaction/all")),
          api.get("/wallet"),
        ]);

        setTransactions(txRes.data);
        setWallets(walletRes.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };

    fetchData();
  }, [currency]);

  const filteredTransactions =
    selectedWalletId === "all"
      ? transactions
      : transactions.filter((t) => t.walletId === selectedWalletId);

  const getAmount = (t: Transaction) => t.convertedAmount ?? t.amount;
  const symbol = transactions[0]?.currency ?? "KM";

  const expenses = filteredTransactions.filter((t) => t.type === "expense");
  const income = filteredTransactions.filter((t) => t.type === "income");

  const totalExpenses = expenses.reduce((sum, t) => sum + getAmount(t), 0);
  const totalIncome = income.reduce((sum, t) => sum + getAmount(t), 0);
  const netBalance = totalIncome - totalExpenses;

  const expenseByCategory = expenses.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + getAmount(curr);
    return acc;
  }, {});
  const pieData = Object.keys(expenseByCategory).map((key) => ({
    name: key,
    value: expenseByCategory[key],
  }));

  const topExpenses = [...expenses]
    .sort((a, b) => getAmount(b) - getAmount(a))
    .slice(0, 5);

  const monthlyData: { [month: string]: { income: number; expense: number } } = {};
  filteredTransactions.forEach((t) => {
    const month = t.date.slice(0, 7); // YYYY-MM
    if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
    monthlyData[month][t.type] += getAmount(t);
  });

  const trendData = Object.keys(monthlyData).map((month) => ({
    month,
    income: monthlyData[month].income,
    expenses: monthlyData[month].expense,
    net: monthlyData[month].income - monthlyData[month].expense,
  }));

  const handleExportPDF = () => {
    const input = document.getElementById("report-content");
    if (!input) return;

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
      pdf.save("financial-report.pdf");
    });
  };

  const format = (amount: number): string =>
    amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,") + ` ${symbol}`;

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Financial Report</h1>
        <button className="export-btn" onClick={handleExportPDF}>
          Download PDF
        </button>
      </div>

      <div className="wallet-selector">
        <label>Select Wallet: </label>
        <select
          value={selectedWalletId}
          onChange={(e) =>
            setSelectedWalletId(e.target.value === "all" ? "all" : parseInt(e.target.value))
          }
        >
          <option value="all">All Wallets</option>
          {wallets.map((wallet) => (
            <option key={wallet.id} value={wallet.id}>
              {wallet.name}
            </option>
          ))}
        </select>
      </div>

      <div id="report-content">
        <div className="summary-section">
          <div className="summary-card income">Total Income: {format(totalIncome)}</div>
          <div className="summary-card expense">Total Expenses: {format(totalExpenses)}</div>
          <div className={`summary-card ${netBalance >= 0 ? "net-positive" : "net-negative"}`}>
            Net Balance: {format(netBalance)}
          </div>
        </div>

        <div className="chart-section">
          <h2>Expense Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-section">
          <h2>Top 5 Largest Expenses</h2>
          <ul className="top-expense-list">
            {topExpenses.map((txn, index) => (
              <li key={index} className="top-expense-item">
                <strong>{format(getAmount(txn))}</strong> — {txn.description} ({txn.date.slice(0, 10)})
              </li>
            ))}
          </ul>
        </div>

        <div className="chart-section">
          <h2>Monthly Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#82ca9d" />
              <Bar dataKey="expenses" fill="#ff8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-section">
          <h2>Net Income Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="net" stroke="#4ade80" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
