import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

/**
 * GuestRoute Component - Chiến lược "Guest-First"
 *
 * Logic:
 * - Nếu user chưa có token → Tự động tạo guest user
 * - Cho phép truy cập ngay lập tức mà không cần login
 * - User có thể chơi game và tích lũy điểm/streak
 */
function GuestRoute({ children }) {
  const { isAuthenticated, loading, updateUser } = useAuth();

  useEffect(() => {
    // Nếu chưa login, tự động tạo guest user
    if (!loading && !isAuthenticated) {
      createGuestUserAuto();
    }
  }, [loading, isAuthenticated]);

  const createGuestUserAuto = async () => {
    try {
      console.log('🎮 Tạo Guest User tự động...');

      const response = await authAPI.createGuest();

      if (response.data.success) {
        const { user, token } = response.data.data;

        // Lưu token và user vào localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Cập nhật auth context
        updateUser(user);

        console.log('✅ Guest user created:', user.id);
      }
    } catch (error) {
      console.error('❌ Error creating guest:', error);
    }
  };

  // Đang tạo guest user
  if (loading || (!isAuthenticated && !localStorage.getItem('token'))) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '20px'
      }}>
        <div className="spinner"></div>
        <h2 style={{ color: '#000' }}>Đang khởi động game...</h2>
      </div>
    );
  }

  // Render children sau khi có token
  return children;
}

export default GuestRoute;
