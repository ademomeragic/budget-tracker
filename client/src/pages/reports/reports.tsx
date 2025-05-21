import React from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis } from "recharts";
import "./reports.css";

const categoryData = [
  { name: "Food", value: 35 },
  { name: "Transport", value: 25 },
  { name: "Bills", value: 40 },
];

const monthlyData = [
  { month: "Jan", income: 4000, expenses: 2400 },
  { month: "Feb", income: 3000, expenses: 1398 },
];

export default function Reports() {
  return (
    <div className="reports-page">
      <h1>Financial Reports</h1>

      <div className="charts-container">
        <div className="chart-card">
          <h3>Spending by Category</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {categoryData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={["#0088FE", "#00C49F", "#FFBB28"][index % 3]}
                />
              ))}
            </Pie>
          </PieChart>
        </div>

        <div className="chart-card">
          <h3>Monthly Summary</h3>
          <BarChart width={400} height={300} data={monthlyData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Bar dataKey="income" fill="#4CAF50" />
            <Bar dataKey="expenses" fill="#F44336" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}
