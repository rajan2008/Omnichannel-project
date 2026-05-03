import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);
  const token = localStorage.getItem("token");
  const location = useLocation();

  // If token exists but user isn't in Redux yet (on refresh), show loading
  if (!user && token) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc] dark:bg-[#0b0f1a]">
        <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If no user and no token, redirect to login but save the attempted location
  if (!user && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
