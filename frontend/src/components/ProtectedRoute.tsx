import { Navigate } from 'react-router-dom';
import { useAuth, Role } from '../auth/AuthContext';

export function ProtectedRoute({
  role,
  children,
}: {
  role: Role | Role[];
  children: JSX.Element;
}) {
  const { token, role: currentRole } = useAuth();
  const allowed = Array.isArray(role) ? role : [role];

  if (!token || !currentRole || !allowed.includes(currentRole)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
