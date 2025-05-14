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
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import api from "../../api/api";
import "./reports.css";

interface Transaction {
  amount: number;
  date: string;
  description: string;
  type: "income" | "expense";
  category: string;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c", "#d0ed57"];

export default function Reports() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token being used:", token);

        const response = await api.get("/transaction/all", {
          headers: { Authorization: `${token}` },
        });

        console.log("Transaction response:", response.data);
        setTransactions(response.data);
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      }
    };

    fetchTransactions();
  }, []);

  const expenses = transactions.filter((t) => t.type === "expense");
  const income = transactions.filter((t) => t.type === "income");

  const expenseByCategory = expenses.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const pieData = Object.keys(expenseByCategory).map((key) => ({
    name: key,
    value: expenseByCategory[key],
  }));

  const monthlyData: { [month: string]: { income: number; expense: number } } = {};
  transactions.forEach((t) => {
    const month = t.date.slice(0, 7); // YYYY-MM
    if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
    monthlyData[month][t.type] += t.amount;
  });

  const barData = Object.keys(monthlyData).map((month) => ({
    month,
    income: monthlyData[month].income,
    expenses: monthlyData[month].expense,
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

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Financial Report</h1>
        <button className="export-btn" onClick={handleExportPDF}>Download PDF</button>
      </div>

      <div id="report-content">
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
                fill="#8884d8"
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
          <h2>Monthly Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
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
      </div>
    </div>
  );
}
