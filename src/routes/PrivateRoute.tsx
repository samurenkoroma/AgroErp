import {Navigate, Outlet, useLocation} from 'react-router-dom';
import {useAuthStore} from '@/stores/authStore';

export const PrivateRoute = () => {
  const location = useLocation();
  const { isAuthenticated,  accessToken} = useAuthStore();

  const hasToken = !!accessToken;

  if (!isAuthenticated && !hasToken) {
    console.log('PrivateRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('PrivateRoute: Authenticated, rendering outlet');
  return <Outlet />;
};