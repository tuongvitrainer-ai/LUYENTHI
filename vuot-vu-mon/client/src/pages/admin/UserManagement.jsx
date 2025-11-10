import { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Space,
  Tag,
  Input,
  Button,
  message,
  Avatar,
  Tooltip
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  CrownOutlined
} from '@ant-design/icons';
import AdminLayout from '../../components/AdminLayout';

function UserManagement() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applySearch();
  }, [users, searchText]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // For now, show mock data since we don't have a user management API yet
      // TODO: Implement GET /api/admin/users endpoint
      const mockUsers = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          display_name: 'Administrator',
          role: 'admin',
          total_stars: 1500,
          current_streak: 45,
          max_streak: 60,
          created_at: '2025-01-01T00:00:00.000Z'
        },
        {
          id: 2,
          username: 'student1',
          email: 'student1@example.com',
          display_name: 'Học sinh 1',
          role: 'student',
          total_stars: 850,
          current_streak: 12,
          max_streak: 25,
          created_at: '2025-01-15T10:30:00.000Z'
        },
        {
          id: 3,
          username: 'student2',
          email: 'student2@example.com',
          display_name: 'Học sinh 2',
          role: 'student',
          total_stars: 620,
          current_streak: 8,
          max_streak: 18,
          created_at: '2025-01-20T14:20:00.000Z'
        }
      ];

      setUsers(mockUsers);
      message.info('Đang hiển thị dữ liệu mẫu. API quản lý người dùng sẽ được thêm sau.');
    } catch (error) {
      console.error('Load users error:', error);
      message.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    if (!searchText.trim()) {
      setFilteredUsers(users);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = users.filter(user => {
      return (
        user.username?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.display_name?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredUsers(filtered);
  };

  const handleResetPassword = (userId) => {
    // TODO: Implement reset password API
    message.info(`Chức năng reset mật khẩu cho user ID ${userId} sẽ được thêm sau.`);
  };

  const handleToggleRole = (userId, currentRole) => {
    // TODO: Implement toggle role API
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    message.info(`Chức năng thay đổi role thành "${newRole}" cho user ID ${userId} sẽ được thêm sau.`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      sorter: (a, b) => a.id - b.id
    },
    {
      title: 'Người dùng',
      key: 'user',
      width: 250,
      render: (_, record) => (
        <Space>
          <Avatar
            size={40}
            src={record.avatar_url}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#87d068' }}
          >
            {record.display_name?.[0]?.toUpperCase() || record.username?.[0]?.toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {record.display_name || record.username}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              @{record.username}
            </div>
          </div>
        </Space>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role) => (
        <Tag color={role === 'admin' ? 'gold' : 'blue'} icon={role === 'admin' ? <CrownOutlined /> : null}>
          {role === 'admin' ? 'Admin' : 'Học sinh'}
        </Tag>
      )
    },
    {
      title: 'Thống kê',
      key: 'stats',
      width: 150,
      render: (_, record) => (
        <div>
          <div>⭐ Sao: {record.total_stars}</div>
          <div>🔥 Streak: {record.current_streak} / {record.max_streak}</div>
        </div>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at)
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleResetPassword(record.id)}
          >
            🔑 Reset mật khẩu
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleToggleRole(record.id, record.role)}
          >
            {record.role === 'admin' ? '👤 Chuyển thành Student' : '👑 Chuyển thành Admin'}
          </Button>
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        <Card>
          <h2>👥 Quản lý người dùng</h2>

          {/* Search Bar */}
          <Space style={{ marginBottom: '16px', width: '100%' }} direction="vertical">
            <Space>
              <Input
                placeholder="Tìm kiếm theo tên, email, username..."
                prefix={<SearchOutlined />}
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 400 }}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={loadUsers}
              >
                Làm mới
              </Button>
            </Space>

            <div style={{ color: '#666' }}>
              Hiển thị <strong>{filteredUsers.length}</strong> / {users.length} người dùng
            </div>
          </Space>

          {/* Info Banner */}
          <Card
            size="small"
            style={{ marginBottom: '16px', background: '#e6f7ff', border: '1px solid #91d5ff' }}
          >
            <Space>
              <span style={{ fontSize: '20px' }}>ℹ️</span>
              <div>
                <strong>Lưu ý:</strong> Đây là giao diện mẫu với dữ liệu giả.
                Các tính năng quản lý người dùng (reset password, thay đổi role) sẽ được hoàn thiện sau.
              </div>
            </Space>
          </Card>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={filteredUsers}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1200 }}
            pagination={{
              defaultPageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} người dùng`,
              pageSizeOptions: ['10', '20', '50', '100']
            }}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}

export default UserManagement;
