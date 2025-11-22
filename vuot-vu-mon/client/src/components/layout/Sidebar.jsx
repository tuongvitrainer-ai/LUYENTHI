import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLayout } from '../../context/LayoutContext';
import './Sidebar.css';

/**
 * Sidebar Component - Navigation sidebar cho toàn bộ ứng dụng
 *
 * Features:
 * - Responsive (mobile hamburger menu)
 * - Collapsible (thu gọn chỉ hiện icon)
 * - Active state highlighting
 * - User profile section
 * - Smooth animations
 *
 * Props:
 * - variant: 'default' | 'compact' | 'collapsed'
 * - showStats: boolean - Hiển thị stars/streak
 * - activeItem: string - Item đang active (tự động detect từ URL)
 */

const Sidebar = ({
  variant = 'default',
  showStats = true,
  className = ''
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sidebarOpen, sidebarCollapsed, toggleSidebar, collapseSidebar } = useLayout();

  // Menu items configuration
  const menuItems = [
    {
      id: 'home',
      label: 'Trang chủ',
      icon: '🏠',
      path: '/game-map',
      ariaLabel: 'Về trang chủ'
    },
    {
      id: 'practice',
      label: 'Ôn luyện',
      icon: '📝',
      path: '/practice',
      ariaLabel: 'Ôn luyện các câu hỏi'
    },
    {
      id: 'exam',
      label: 'Thi thử',
      icon: '🎓',
      path: '/exam',
      ariaLabel: 'Làm bài thi thử'
    },
    {
      id: 'course',
      label: 'Khóa học',
      icon: '📚',
      path: '/courses',
      ariaLabel: 'Xem các khóa học'
    },
    {
      id: 'lesson',
      label: 'Bài giảng',
      icon: '🎯',
      path: '/lessons',
      ariaLabel: 'Xem bài giảng'
    }
  ];

  // Determine active item from current path
  const getActiveItem = () => {
    const currentPath = location.pathname;
    const activeMenuItem = menuItems.find(item => currentPath.startsWith(item.path));
    return activeMenuItem?.id || 'home';
  };

  const activeItem = getActiveItem();

  // Handle navigation
  const handleNavigate = (path) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const sidebarClasses = `
    sidebar
    ${variant === 'compact' ? 'sidebar--compact' : ''}
    ${sidebarCollapsed ? 'sidebar--collapsed' : ''}
    ${!sidebarOpen ? 'sidebar--closed' : ''}
    ${className}
  `.trim();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={sidebarClasses} role="navigation" aria-label="Main navigation">
        {/* Logo Section */}
        <div className="sidebar-logo">
          <Link to="/game-map" className="logo-link" aria-label="Về trang chủ">
            <div className="logo-icon">🎯</div>
            {!sidebarCollapsed && (
              <span className="logo-text">Hiện trạ</span>
            )}
          </Link>
        </div>

        {/* User Profile Section (if logged in) */}
        {user && showStats && !sidebarCollapsed && (
          <div className="sidebar-profile">
            <div className="profile-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} />
              ) : (
                <div className="avatar-placeholder">
                  {user.username?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className="profile-info">
              <div className="profile-name">{user.username}</div>
              <div className="profile-stats">
                <span className="stat-item" title="Số sao">
                  ⭐ {user.stars_balance || 0}
                </span>
                <span className="stat-item" title="Chuỗi ngày">
                  🔥 {user.current_streak || 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map(item => (
              <li key={item.id} className="nav-item">
                <button
                  onClick={() => handleNavigate(item.path)}
                  className={`nav-link ${activeItem === item.id ? 'nav-link--active' : ''}`}
                  aria-label={item.ariaLabel}
                  aria-current={activeItem === item.id ? 'page' : undefined}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <span className="nav-label">{item.label}</span>
                  )}
                  {activeItem === item.id && (
                    <span className="nav-indicator" aria-hidden="true" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="sidebar-footer">
          {/* Collapse Toggle (Desktop only) */}
          {!sidebarCollapsed && (
            <button
              onClick={collapseSidebar}
              className="collapse-toggle"
              aria-label="Thu gọn sidebar"
              title="Thu gọn sidebar"
            >
              ◀
            </button>
          )}

          {/* Login/Logout Button */}
          {user ? (
            <button
              onClick={() => {
                // Handle logout logic
                navigate('/');
              }}
              className="sidebar-action-btn sidebar-action-btn--logout"
              aria-label="Đăng xuất"
            >
              {!sidebarCollapsed && 'Đăng xuất'}
              {sidebarCollapsed && '🚪'}
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="sidebar-action-btn sidebar-action-btn--login"
              aria-label="Đăng nhập"
            >
              {!sidebarCollapsed && 'Đăng nhập'}
              {sidebarCollapsed && '👤'}
            </button>
          )}
        </div>
      </aside>

      {/* Hamburger Menu Button (Mobile) */}
      <button
        className="hamburger-menu"
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? 'Đóng menu' : 'Mở menu'}
        aria-expanded={sidebarOpen}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>
    </>
  );
};

export default Sidebar;
