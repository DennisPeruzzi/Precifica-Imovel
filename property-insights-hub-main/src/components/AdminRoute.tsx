import { Navigate } from "react-router-dom";
import { useRole } from "@/hooks/useRole";

export default function AdminRoute({ children }: any) {
  const { role, loading } = useRole();

  if (loading) return <p>Carregando...</p>;

  if (role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return children;
}