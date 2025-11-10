import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminRoute - Protect admin pages
 * Only users with role === 'admin' can access
 */
function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <h2>Đang tải...</h2>
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin - redirect to home with message
  if (user?.role !== 'admin') {
    alert('Bạn không có quyền truy cập trang này!');
    return <Navigate to="/" replace />;
  }

  // Is admin - allow access
  return children;
}

export default AdminRoute;
