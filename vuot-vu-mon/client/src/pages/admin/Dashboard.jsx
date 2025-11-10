import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Spin } from 'antd';
import {
  UserOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  StarOutlined,
} from '@ant-design/icons';
import AdminLayout from '../../components/AdminLayout';

const { Title } = Typography;

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalAttempts: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      // TODO: Call API to get dashboard stats
      // For now, using mock data
      setTimeout(() => {
        setStats({
          totalUsers: 156,
          totalQuestions: 245,
          totalAttempts: 1523,
          activeUsers: 42,
        });
        setLoading(false);
      }, 500);

    } catch (error) {
      console.error('Load dashboard stats error:', error);
      setLoading(false);
    }
  };

  // Mock data for recent activities
  const recentActivities = [
    {
      key: '1',
      user: 'Nguyễn Văn A',
      action: 'Hoàn thành bài thi Toán lớp 3',
      time: '5 phút trước',
      score: '8/10'
    },
    {
      key: '2',
      user: 'Trần Thị B',
      action: 'Đăng ký tài khoản mới',
      time: '15 phút trước',
      score: '-'
    },
    {
      key: '3',
      user: 'Lê Văn C',
      action: 'Hoàn thành bài thi Tiếng Việt',
      time: '30 phút trước',
      score: '9/10'
    },
  ];

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Điểm',
      dataIndex: 'score',
      key: 'score',
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Title level={2}>📊 Tổng Quan Hệ Thống</Title>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Người Dùng"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Câu Hỏi"
              value={stats.totalQuestions}
              prefix={<QuestionCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Lượt Làm Bài"
              value={stats.totalAttempts}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Người Dùng Hoạt Động"
              value={stats.activeUsers}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Card title="🔔 Hoạt Động Gần Đây" style={{ marginBottom: '24px' }}>
        <Table
          dataSource={recentActivities}
          columns={columns}
          pagination={false}
        />
      </Card>

      {/* Quick Actions */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card
            title="⚡ Hành Động Nhanh"
            hoverable
            style={{ cursor: 'pointer' }}
            onClick={() => window.location.href = '/admin/question-bank/create'}
          >
            <p>➕ Tạo câu hỏi mới</p>
            <p>📋 Xem danh sách câu hỏi</p>
            <p>👥 Quản lý người dùng</p>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title="📈 Thống Kê Nhanh">
            <p>Số câu hỏi thêm hôm nay: <strong>12</strong></p>
            <p>Người dùng mới hôm nay: <strong>5</strong></p>
            <p>Lượt làm bài hôm nay: <strong>87</strong></p>
          </Card>
        </Col>
      </Row>
    </AdminLayout>
  );
}

export default Dashboard;
