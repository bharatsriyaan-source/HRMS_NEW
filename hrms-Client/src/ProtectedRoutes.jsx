import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 1. If no token, kick them to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 2. If their role is NOT in the list of allowed roles, kick them out
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // 3. Otherwise, let them in!
  return children;
}