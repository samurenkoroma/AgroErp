import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Spinner } from '@/components/common/Spinner';

export const PublicRoute = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuthStore();
  const from = location.state?.from?.pathname || '/dashboard';

  if (isLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};