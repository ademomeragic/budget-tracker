// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CategoryList from "./components/CategoryList";
import CreateCategoryForm from "./components/CategoryForm";
import BudgetList from "./components/BudgetList";
import CreateBudgetForm from "./components/CreateBudgetForm";
import AuthForm from "./components/AuthForm";

const App: React.FC = () => {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> | <Link to="/categories">Categories</Link> |{" "}
        <Link to="/budgets">Budgets</Link> |{" "}
        <Link to="/login">Login</Link>
      </nav>
      <Routes>
        <Route
          path="/categories"
          element={
            <>
              <CreateCategoryForm />
              <CategoryList />
            </>
          }
        />
        <Route
          path="/budgets"
          element={
            <>
              <CreateBudgetForm />
              <BudgetList />
            </>
          }
        />
        <Route
          path="/login"
          element={
            <>
              <AuthForm />
            </>
          }
        />

        <Route path="/" element={<h1>Welcome to Budget Tracker</h1>} />
      </Routes>
    </Router>
  );
};

export default App;
