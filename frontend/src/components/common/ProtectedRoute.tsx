// src/components/common/ProtectedRoute.tsx
import { useAuth } from "../../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { LoadingSpinner } from "./LoadingSpinner";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - loading:', loading, 'user:', user);

  if (loading) {
    console.log('ProtectedRoute - Showing loading spinner');
    return <LoadingSpinner />;
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute - Rendering Outlet');
  return <Outlet />;
};

export default ProtectedRoute;