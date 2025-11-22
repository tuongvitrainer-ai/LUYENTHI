import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * LayoutContext - Quản lý state chung cho Layout system
 *
 * Features:
 * - Sidebar state (open/close, collapsed)
 * - Notification system
 * - Loading state
 * - Progress tracking
 * - Theme customization
 */

const LayoutContext = createContext(null);

export const LayoutProvider = ({ children }) => {
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Notification state
  const [notification, setNotification] = useState(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // Progress state
  const [progress, setProgress] = useState(0);

  // Layout customization
  const [layoutConfig, setLayoutConfig] = useState({
    backgroundColor: '#87CEEB',
    maxWidth: '1400px',
    showBreadcrumb: false,
    breadcrumbItems: []
  });

  // Sidebar methods
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const collapseSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // Notification methods
  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    setNotification({ message, type, id: Date.now() });

    if (duration > 0) {
      setTimeout(() => {
        setNotification(null);
      }, duration);
    }
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Loading methods
  const showLoading = useCallback((text = 'Đang tải...') => {
    setIsLoading(true);
    setLoadingText(text);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingText('');
  }, []);

  // Progress methods
  const updateProgress = useCallback((value) => {
    setProgress(Math.min(100, Math.max(0, value)));
  }, []);

  // Layout config methods
  const updateLayoutConfig = useCallback((config) => {
    setLayoutConfig(prev => ({ ...prev, ...config }));
  }, []);

  const value = {
    // Sidebar
    sidebarOpen,
    sidebarCollapsed,
    setSidebarOpen,
    setSidebarCollapsed,
    toggleSidebar,
    collapseSidebar,

    // Notification
    notification,
    showNotification,
    hideNotification,

    // Loading
    isLoading,
    loadingText,
    showLoading,
    hideLoading,

    // Progress
    progress,
    updateProgress,

    // Layout config
    layoutConfig,
    updateLayoutConfig
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

// Custom hook để sử dụng LayoutContext
export const useLayout = () => {
  const context = useContext(LayoutContext);

  if (!context) {
    throw new Error('useLayout must be used within LayoutProvider');
  }

  return context;
};

export default LayoutContext;
