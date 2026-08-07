import { Navigate } from 'react-router-dom';
import { useAuth, Role } from '../auth/AuthContext';

export function ProtectedRoute({
  role,
  children,
}: {
  role: Role;
  children: JSX.Element;
}) {
  const { token, role: currentRole } = useAuth();

  if (!token || currentRole !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}
