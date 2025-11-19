import { useState } from 'react';
import Sidebar from './Sidebar';
import './Layout.css';

function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <Sidebar className={isSidebarOpen ? 'open' : ''} />

      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`}
        onClick={closeSidebar}
      ></div>

      {/* Main Content */}
      <div className="layout-content">
        {/* Mobile Toggle Button */}
        <button
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span className="toggle-icon">{isSidebarOpen ? '✕' : '☰'}</span>
        </button>

        {/* Page Content */}
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}

export default Layout;
