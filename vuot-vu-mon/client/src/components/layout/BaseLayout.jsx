import React, { useEffect } from 'react';
import { useLayout } from '../../context/LayoutContext';
import Sidebar from './Sidebar';
import Header from './Header';
import './BaseLayout.css';

/**
 * BaseLayout - Layout component cha cho tất cả các layout variants
 *
 * Features:
 * - Sidebar integration
 * - Header integration
 * - Loading state
 * - Notification system
 * - Progress bar
 * - Keyboard shortcuts
 * - Responsive design
 *
 * Props:
 * - children: ReactNode - Nội dung chính
 * - title: string - Tiêu đề trang
 * - backgroundColor: string - Màu nền (default: '#87CEEB')
 * - maxWidth: string - Max width của content (default: '1400px')
 * - showSidebar: boolean - Hiển thị sidebar (default: true)
 * - sidebarVariant: 'default' | 'compact' - Variant của sidebar
 * - showBackButton: boolean - Hiển thị nút back (default: true)
 * - backPath: string - Đường dẫn back (default: '/game-map')
 * - backText: string - Text nút back
 * - onBack: function - Custom handler cho back
 * - headerLeft: ReactNode - Custom header left
 * - headerCenter: ReactNode - Custom header center
 * - headerRight: ReactNode - Custom header right
 * - showBreadcrumb: boolean - Hiển thị breadcrumb
 * - breadcrumbItems: array - Breadcrumb items
 * - className: string - Custom class
 * - containerClassName: string - Custom container class
 * - keyboardShortcuts: object - Keyboard shortcuts config
 * - showProgress: boolean - Hiển thị progress bar
 */

const BaseLayout = ({
  children,
  title,
  backgroundColor = '#87CEEB',
  maxWidth = '1400px',
  showSidebar = true,
  sidebarVariant = 'default',
  showBackButton = true,
  backPath = '/game-map',
  backText = 'Về trang chủ',
  onBack,
  headerLeft,
  headerCenter,
  headerRight,
  showBreadcrumb = false,
  breadcrumbItems = [],
  className = '',
  containerClassName = '',
  keyboardShortcuts = {},
  showProgress = false
}) => {
  const {
    notification,
    hideNotification,
    isLoading,
    loadingText,
    progress,
    sidebarOpen,
    sidebarCollapsed
  } = useLayout();

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Default shortcuts
      if (e.key === 'Escape' && onBack) {
        onBack();
      }

      // Custom shortcuts
      const shortcut = keyboardShortcuts[e.key];
      if (shortcut && typeof shortcut === 'function') {
        shortcut(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardShortcuts, onBack]);

  // Update document title
  useEffect(() => {
    if (title) {
      document.title = `${title} - Vượt Vũ Môn`;
    }
  }, [title]);

  // Calculate margin-left based on sidebar state
  const getContentMarginLeft = () => {
    if (!showSidebar) return '0';
    if (window.innerWidth < 768) return '0'; // No margin on mobile
    if (sidebarCollapsed) return '70px';
    return '220px';
  };

  return (
    <div
      className={`base-layout ${className}`}
      style={{ backgroundColor }}
    >
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar variant={sidebarVariant} />
      )}

      {/* Main Content Area */}
      <main
        className={`layout-main ${!showSidebar ? 'layout-main--no-sidebar' : ''}`}
        style={{
          marginLeft: getContentMarginLeft(),
          maxWidth: showSidebar ? `calc(${maxWidth} - ${getContentMarginLeft()})` : maxWidth
        }}
      >
        {/* Progress Bar */}
        {showProgress && progress > 0 && (
          <div className="layout-progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
            <div
              className="layout-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Header */}
        <Header
          title={title}
          showBackButton={showBackButton}
          backPath={backPath}
          backText={backText}
          onBack={onBack}
          headerLeft={headerLeft}
          headerCenter={headerCenter}
          headerRight={headerRight}
          showBreadcrumb={showBreadcrumb}
          breadcrumbItems={breadcrumbItems}
        />

        {/* Content Container */}
        <div className={`layout-content ${containerClassName}`}>
          {children}
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="layout-loading-overlay" role="alert" aria-busy="true">
            <div className="loading-spinner">
              <div className="spinner-circle"></div>
              <div className="spinner-text">{loadingText || 'Đang tải...'}</div>
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {notification && (
          <div
            className={`layout-notification layout-notification--${notification.type}`}
            role="alert"
            aria-live="polite"
          >
            <div className="notification-content">
              <span className="notification-icon">
                {notification.type === 'success' && '✓'}
                {notification.type === 'error' && '✕'}
                {notification.type === 'warning' && '⚠'}
                {notification.type === 'info' && 'ℹ'}
              </span>
              <span className="notification-message">{notification.message}</span>
            </div>
            <button
              className="notification-close"
              onClick={hideNotification}
              aria-label="Đóng thông báo"
            >
              ✕
            </button>
          </div>
        )}
      </main>

      {/* Skip to Content Link (Accessibility) */}
      <a href="#main-content" className="skip-to-content">
        Bỏ qua đến nội dung chính
      </a>
    </div>
  );
};

export default BaseLayout;
