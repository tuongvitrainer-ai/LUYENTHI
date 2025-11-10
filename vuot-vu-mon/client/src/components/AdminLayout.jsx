import { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;

function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
    },
    {
      key: '/admin/question-bank',
      icon: <QuestionCircleOutlined />,
      label: 'Ngân hàng câu hỏi',
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Quản lý người dùng',
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
  ];

  const handleMenuClick = (e) => {
    if (e.key === 'logout') {
      logout();
      navigate('/login');
    } else if (e.key === 'home') {
      navigate('/');
    } else {
      navigate(e.key);
    }
  };

  // Get current selected key
  const selectedKey = location.pathname;

  return (
    <Layout className="admin-layout" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Logo */}
        <div className="admin-logo">
          {collapsed ? (
            <h2>VVM</h2>
          ) : (
            <h2>🎯 Vượt Vũ Môn</h2>
          )}
        </div>

        {/* Main Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={menuItems}
        />

        {/* Bottom Actions */}
        <div className="admin-sidebar-footer">
          <Menu
            theme="dark"
            mode="inline"
            onClick={handleMenuClick}
            items={[
              {
                key: 'home',
                icon: <HomeOutlined />,
                label: 'Về trang chủ',
              },
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Đăng xuất',
                danger: true,
              },
            ]}
          />
        </div>
      </Sider>

      {/* Main Content */}
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
        {/* Header */}
        <Header
          style={{
            padding: 0,
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {collapsed ? (
              <MenuUnfoldOutlined
                style={{ fontSize: '18px', padding: '0 24px', cursor: 'pointer' }}
                onClick={() => setCollapsed(!collapsed)}
              />
            ) : (
              <MenuFoldOutlined
                style={{ fontSize: '18px', padding: '0 24px', cursor: 'pointer' }}
                onClick={() => setCollapsed(!collapsed)}
              />
            )}
            <span style={{ fontSize: '16px', fontWeight: 500 }}>
              Admin Panel
            </span>
          </div>

          <div style={{ paddingRight: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <UserOutlined />
            <span>{user?.display_name || user?.username}</span>
            <span style={{
              background: '#1890ff',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              ADMIN
            </span>
          </div>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 'calc(100vh - 112px)',
            background: '#fff',
            borderRadius: '8px',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
