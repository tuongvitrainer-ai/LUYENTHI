import { useState } from 'react';
import Sidebar from './layout/Sidebar'; // Dùng Sidebar MỚI - đồng bộ với GameLayout
import { LayoutProvider } from '../context/LayoutContext'; // Cần LayoutProvider
import './Layout.css';

function Layout({ children }) {
  return (
    <LayoutProvider>
      <div className="layout-container">
        {/* Sidebar - Giống với GameLayout */}
        <Sidebar variant="default" showStats={true} />

        {/* Main Content */}
        <div className="layout-content" style={{ marginLeft: '220px' }}>
          {/* Page Content */}
          <div className="page-content">{children}</div>
        </div>
      </div>
    </LayoutProvider>
  );
}

export default Layout;
