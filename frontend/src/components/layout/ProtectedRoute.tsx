import { Navigate } from 'react-router-dom';
import { tokenStorage } from '../../utils/tokenStorage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!tokenStorage.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}