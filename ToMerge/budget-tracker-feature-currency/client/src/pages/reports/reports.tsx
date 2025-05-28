import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import api from "../../api/api";
import "./reports.css";

interface Transaction {
  amount: number;
  convertedAmount: number | null;
  convertedCurrencyCode: string;
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

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#a4de6c",
  "#d0ed57",
  "#FF6666",
  "#AAFFEE",
];

export default function Reports() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<"all" | number>(
    "all"
  );
  const [targetCurrency, setTargetCurrency] = useState<string>("BAM"); // default BAM
  const [showConverted, setShowConverted] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found in localStorage");
          return;
        }

        // Using the correct authorization header format
        const [txRes, walletRes] = await Promise.all([
          api.get("/transaction/all", {
            params: { targetCurrency },
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/wallet", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        console.log(
          "🔄 Fetched transactions for currency:",
          targetCurrency,
          txRes.data
        );
        setTransactions(txRes.data);
        setWallets(walletRes.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };

    fetchData();
  }, [targetCurrency]);

  // Filter transactions by wallet or all wallets
  const filteredTransactions =
    selectedWalletId === "all"
      ? transactions
      : transactions.filter((t) => t.walletId === selectedWalletId);

  // Separate income and expense
  const expenses = filteredTransactions.filter((t) => t.type === "expense");
  const income = filteredTransactions.filter((t) => t.type === "income");

  // Helper to get amount, using converted if enabled and available
  const getAmount = (t: Transaction) =>
    showConverted && t.convertedAmount != null ? t.convertedAmount : t.amount;

  // Calculate totals and net balance
  const totalExpenses = expenses.reduce((sum, t) => sum + getAmount(t), 0);
  const totalIncome = income.reduce((sum, t) => sum + getAmount(t), 0);
  const netBalance = totalIncome - totalExpenses;

  // Aggregate expenses by category for pie chart
  const expenseByCategory = expenses.reduce<Record<string, number>>(
    (acc, curr) => {
      const amt = getAmount(curr);
      acc[curr.category] = (acc[curr.category] || 0) + amt;
      return acc;
    },
    {}
  );

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  // Top 5 largest expenses
  const topExpenses = [...expenses]
    .sort((a, b) => getAmount(b) - getAmount(a))
    .slice(0, 5);

  // Prepare monthly trend data
  const monthlyData: { [month: string]: { income: number; expense: number } } =
    {};
  filteredTransactions.forEach((t) => {
    const month = t.date.slice(0, 7);
    const amt = getAmount(t);
    if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
    monthlyData[month][t.type] += amt;
  });

  const trendData = Object.keys(monthlyData)
    .sort()
    .map((month) => ({
      month,
      income: monthlyData[month].income,
      expenses: monthlyData[month].expense,
      net: monthlyData[month].income - monthlyData[month].expense,
    }));

  const handleExportPDF = () => {
    const input = document.getElementById("report-content");
    if (!input) return;

    html2canvas(input, {
      scale: 2, // higher resolution
      useCORS: true,
    }).then((canvas) => {
      const imgWidth = 190; // A4 width in mm minus 10mm margin on each side
      const pageHeight = 297; // A4 height in mm
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      const ratio = imgWidth / canvasWidth;
      const imgHeight = canvasHeight * ratio;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      let remainingHeight = imgHeight;
      let position = 0;

      while (remainingHeight > 0) {
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvasWidth;
        pageCanvas.height = Math.min(canvasHeight, pageHeight / ratio);

        const ctx = pageCanvas.getContext("2d");
        if (!ctx) {
          console.error("Failed to get 2D context for PDF page slice.");
          return;
        }

        ctx.drawImage(
          canvas,
          0,
          position / ratio,
          canvasWidth,
          pageCanvas.height,
          0,
          0,
          canvasWidth,
          pageCanvas.height
        );

        const imgData = pageCanvas.toDataURL("image/png");
        if (position > 0) pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          10,
          10,
          imgWidth,
          pageCanvas.height * ratio
        );

        remainingHeight -= pageHeight;
        position += pageHeight;
      }

      pdf.save("financial-report.pdf");
    });
  };

  const formatCurrency = (
    amount: number | null | undefined,
    currency: string | null | undefined
  ) => {
    const safeAmount = typeof amount === "number" ? amount : 0;
    const safeCurrency = currency || "BAM";
    try {
      return safeAmount.toLocaleString(undefined, {
        style: "currency",
        currency: safeCurrency,
      });
    } catch {
      return safeAmount.toLocaleString();
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Financial Report</h1>
        <button className="export-btn" onClick={handleExportPDF}>
          Download PDF
        </button>
      </div>

      <div className="selectors">
        <div className="currency-selector">
          <label htmlFor="currency-select">Select Currency: </label>
          <select
            id="currency-select"
            value={targetCurrency}
            onChange={(e) => setTargetCurrency(e.target.value)}
          >
            <option value="BAM">BAM</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <div className="wallet-selector">
          <label htmlFor="wallet-select">Select Wallet: </label>
          <select
            id="wallet-select"
            value={selectedWalletId}
            onChange={(e) =>
              setSelectedWalletId(
                e.target.value === "all" ? "all" : parseInt(e.target.value)
              )
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

        <div className="toggle-selector">
          <label htmlFor="converted-toggle">Show Converted Values:</label>
          <input
            id="converted-toggle"
            type="checkbox"
            checked={showConverted}
            onChange={() => setShowConverted(!showConverted)}
          />
        </div>
      </div>

      <div id="report-content">
        <div className="summary-section">
          <div className="summary-card income">
            Total Income: {formatCurrency(totalIncome, targetCurrency)}
          </div>
          <div className="summary-card expense">
            Total Expenses: {formatCurrency(totalExpenses, targetCurrency)}
          </div>
          <div
            className={`summary-card ${
              netBalance >= 0 ? "net-positive" : "net-negative"
            }`}
          >
            Net Balance: {formatCurrency(netBalance, targetCurrency)}
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
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
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
                <strong>
                  {formatCurrency(
                    getAmount(txn),
                    showConverted ? targetCurrency : txn.convertedCurrencyCode
                  )}
                </strong>{" "}
                {showConverted && (
                  <span className="original-amount">
                    ({formatCurrency(txn.amount, txn.convertedCurrencyCode)})
                  </span>
                )}{" "}
                — {txn.description} ({txn.date.slice(0, 10)})
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
              <Line
                type="monotone"
                dataKey="net"
                stroke="#4ade80"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
