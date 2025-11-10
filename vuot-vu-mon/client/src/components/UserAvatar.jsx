import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './UserAvatar.css';

function UserAvatar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { themes, currentTheme, changeTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
        setIsThemeSelectorOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsThemeSelectorOpen(false);
  };

  const handleThemeSelect = (themeId) => {
    changeTheme(themeId);
    setIsThemeSelectorOpen(false);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  const handleNavigateToProfile = () => {
    setIsMenuOpen(false);
    navigate('/profile');
  };

  const handleNavigateToShop = () => {
    setIsMenuOpen(false);
    navigate('/shop');
  };

  const handleNavigateToHome = () => {
    setIsMenuOpen(false);
    navigate('/');
  };

  // Avatar mặc định (first letter of username)
  const avatarLetter = user?.display_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || '?';

  return (
    <div className="user-avatar-container" ref={menuRef}>
      {/* Avatar Button */}
      <button
        className="avatar-button"
        onClick={toggleMenu}
        aria-label="User menu"
      >
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt="Avatar" className="avatar-image" />
        ) : (
          <div className="avatar-default">
            {avatarLetter}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="avatar-dropdown">
          {/* User Info Section */}
          <div className="dropdown-header">
            <div className="dropdown-avatar">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" />
              ) : (
                <div className="avatar-default-large">
                  {avatarLetter}
                </div>
              )}
            </div>
            <div className="dropdown-user-info">
              <div className="dropdown-username">{user?.display_name || user?.username}</div>
              <div className="dropdown-stats">
                <span>⭐ {user?.total_stars || 0}</span>
                <span>🔥 {user?.current_streak || 0}</span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="dropdown-menu">
            <button className="menu-item" onClick={handleNavigateToHome}>
              <span className="menu-icon">🏠</span>
              <span>Trang chủ</span>
            </button>

            <button className="menu-item" onClick={handleNavigateToShop}>
              <span className="menu-icon">🛒</span>
              <span>Cửa hàng</span>
            </button>

            <button className="menu-item" onClick={handleNavigateToProfile}>
              <span className="menu-icon">👤</span>
              <span>Hồ sơ</span>
            </button>

            <div className="menu-divider"></div>

            {/* Theme Selector */}
            <button
              className="menu-item menu-item-theme"
              onClick={() => setIsThemeSelectorOpen(!isThemeSelectorOpen)}
            >
              <span className="menu-icon">🎨</span>
              <span>Giao diện</span>
              <span className="menu-arrow">{isThemeSelectorOpen ? '▼' : '▶'}</span>
            </button>

            {isThemeSelectorOpen && (
              <div className="theme-selector">
                {Object.values(themes).map((theme) => (
                  <button
                    key={theme.id}
                    className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
                    onClick={() => handleThemeSelect(theme.id)}
                  >
                    <span className="theme-icon">{theme.icon}</span>
                    <span className="theme-name">{theme.name}</span>
                    {currentTheme === theme.id && <span className="theme-check">✓</span>}
                  </button>
                ))}
              </div>
            )}

            <div className="menu-divider"></div>

            <button className="menu-item menu-item-logout" onClick={handleLogout}>
              <span className="menu-icon">🚪</span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserAvatar;
