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
import { CurrencyProvider } from "./context/CurrencyContext";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import Categories from "./pages/categories/categories";
import Goals from "./pages/goals/goals";
import Profile from "./pages/profile/profile";
import FloatNotePanel from "./components/floatnote/FloatNotePanel";

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
          <Route
            path="/categories"
            element={
              <PrivateRoute>
                <Categories />
              </PrivateRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <PrivateRoute>
                <Goals />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
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
        <CurrencyProvider> {/* ✅ WRAPS EVERYTHING */}
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
          <FloatNotePanel />
        </CurrencyProvider>
      </AuthProvider>
    </Router>
  );
}
