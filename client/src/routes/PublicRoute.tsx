import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
};

export default PublicRoute;
