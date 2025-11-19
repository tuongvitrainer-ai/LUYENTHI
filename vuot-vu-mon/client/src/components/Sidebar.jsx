import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-logo">
        <div className="logo-placeholder">
          <span className="logo-icon">🎯</span>
          <span className="logo-text">VƯỢT VŨ MÔN</span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="sidebar-menu">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? 'menu-item active' : 'menu-item'
          }
        >
          <span className="menu-icon">🏠</span>
          <span className="menu-text">Trang chủ</span>
        </NavLink>

        <NavLink
          to="/game-map"
          className={({ isActive }) =>
            isActive ? 'menu-item active' : 'menu-item'
          }
        >
          <span className="menu-icon">🎮</span>
          <span className="menu-text">Chơi mà học</span>
        </NavLink>

        <NavLink
          to="/shop"
          className={({ isActive }) =>
            isActive ? 'menu-item active' : 'menu-item'
          }
        >
          <span className="menu-icon">🛒</span>
          <span className="menu-text">Cửa hàng</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? 'menu-item active' : 'menu-item'
          }
        >
          <span className="menu-icon">👤</span>
          <span className="menu-text">Hồ sơ</span>
        </NavLink>

        {/* Admin menu - chỉ hiện cho admin */}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive ? 'menu-item active' : 'menu-item'
            }
          >
            <span className="menu-icon">⚙️</span>
            <span className="menu-text">Quản trị</span>
          </NavLink>
        )}
      </nav>

      {/* User Info Section */}
      {isAuthenticated && user && (
        <div className="sidebar-user-info">
          <div className="user-stats">
            <div className="stat-item">
              <span className="stat-icon">⭐</span>
              <span className="stat-value">{user.total_stars || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🔥</span>
              <span className="stat-value">{user.current_streak || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* Login/Logout Button */}
      <div className="sidebar-footer">
        {isAuthenticated ? (
          <button className="btn-logout" onClick={handleLogout}>
            <span className="btn-icon">🚪</span>
            <span className="btn-text">Đăng xuất</span>
          </button>
        ) : (
          <button className="btn-login" onClick={() => navigate('/login')}>
            <span className="btn-icon">🔑</span>
            <span className="btn-text">Đăng nhập</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
