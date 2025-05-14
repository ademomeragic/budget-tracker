import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar/sidebar";
import Dashboard from "./pages/dashboard/dashboard";
import "./App.css";
import FloatingActionButton from "./components/sidebar/floatingButton/floatingButton";
import Transactions from "./pages/transaction/transaction";
import Wallet from "./pages/wallet/wallet";
import Reports from "./pages/reports/reports";
import Calendar from "./pages/calendar/calendar";
import AuthForm from "./pages/auth/authForm";
import Register from "./pages/auth/register";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";

function MainLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="content-area">
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <PrivateRoute>
                <Wallet />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <PrivateRoute>
                <Calendar />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Route */}
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <AuthForm />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Private Route protecting everything else */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}