import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Space,
  Select,
  Input,
  Tag,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import AdminLayout from '../../components/AdminLayout';

const { Option } = Select;

function QuestionBank() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    subject: null,
    grade: null,
    topic: null,
    difficulty: null,
    searchText: ''
  });

  // Available filter options
  const subjects = ['Toán', 'Tiếng Việt', 'Tiếng Anh', 'Khoa học', 'Lịch sử'];
  const grades = ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'];
  const difficulties = [
    { value: 1, label: 'Rất dễ' },
    { value: 2, label: 'Dễ' },
    { value: 3, label: 'Trung bình' },
    { value: 4, label: 'Khó' },
    { value: 5, label: 'Rất khó' }
  ];

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [questions, filters]);

  const loadQuestions = async () => {
    try {
      setLoading(true);

      const response = await fetch('http://localhost:3000/api/admin/questions?limit=1000', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setQuestions(data.data.questions || []);
      } else {
        message.error(data.message || 'Lỗi khi tải danh sách câu hỏi');
      }
    } catch (error) {
      console.error('Load questions error:', error);
      message.error('Lỗi khi tải danh sách câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...questions];

    // Filter by subject
    if (filters.subject) {
      filtered = filtered.filter(q =>
        q.tags.some(tag => tag.tag_type === 'subject' && tag.tag_value === filters.subject)
      );
    }

    // Filter by grade
    if (filters.grade) {
      filtered = filtered.filter(q =>
        q.tags.some(tag => tag.tag_type === 'grade' && tag.tag_value === filters.grade)
      );
    }

    // Filter by topic
    if (filters.topic) {
      filtered = filtered.filter(q =>
        q.tags.some(tag => tag.tag_type === 'topic' && tag.tag_value.includes(filters.topic))
      );
    }

    // Filter by difficulty
    if (filters.difficulty) {
      filtered = filtered.filter(q => q.difficulty_level === filters.difficulty);
    }

    // Filter by search text
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(q => {
        const questionText = q.content_json?.question_text?.toLowerCase() || '';
        const tagsText = q.tags.map(tag => tag.tag_value).join(' ').toLowerCase();
        return questionText.includes(searchLower) || tagsText.includes(searchLower);
      });
    }

    setFilteredQuestions(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      subject: null,
      grade: null,
      topic: null,
      difficulty: null,
      searchText: ''
    });
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        message.success('Đã xóa câu hỏi thành công!');
        loadQuestions();
      } else {
        message.error(data.message || 'Lỗi khi xóa câu hỏi');
      }
    } catch (error) {
      console.error('Delete question error:', error);
      message.error('Lỗi khi xóa câu hỏi');
    }
  };

  const getDifficultyColor = (level) => {
    const colors = {
      1: 'green',
      2: 'blue',
      3: 'orange',
      4: 'red',
      5: 'purple'
    };
    return colors[level] || 'default';
  };

  const getDifficultyText = (level) => {
    const texts = {
      1: 'Rất dễ',
      2: 'Dễ',
      3: 'Trung bình',
      4: 'Khó',
      5: 'Rất khó'
    };
    return texts[level] || 'N/A';
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
      title: 'Câu hỏi',
      dataIndex: 'content_json',
      key: 'question_text',
      width: 350,
      render: (content_json) => (
        <Tooltip title={content_json?.question_text || 'N/A'}>
          <div style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '350px'
          }}>
            {content_json?.question_text || 'N/A'}
          </div>
        </Tooltip>
      )
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      width: 300,
      render: (tags) => (
        <Space wrap size={[0, 4]}>
          {tags.map((tag, index) => {
            let color = 'default';
            if (tag.tag_type === 'subject') color = 'blue';
            if (tag.tag_type === 'grade') color = 'green';
            if (tag.tag_type === 'topic') color = 'orange';

            return (
              <Tag color={color} key={index}>
                {tag.tag_value}
              </Tag>
            );
          })}
        </Space>
      )
    },
    {
      title: 'Độ khó',
      dataIndex: 'difficulty_level',
      key: 'difficulty_level',
      width: 120,
      render: (level) => (
        <Tag color={getDifficultyColor(level)}>
          {getDifficultyText(level)}
        </Tag>
      ),
      sorter: (a, b) => a.difficulty_level - b.difficulty_level
    },
    {
      title: 'Điểm',
      dataIndex: 'points',
      key: 'points',
      width: 80,
      sorter: (a, b) => a.points - b.points
    },
    {
      title: 'Thời gian',
      dataIndex: 'time_limit',
      key: 'time_limit',
      width: 100,
      render: (seconds) => `${seconds}s`
    },
    {
      title: 'Thống kê',
      key: 'stats',
      width: 120,
      render: (_, record) => {
        const successRate = record.total_attempts > 0
          ? Math.round((record.correct_attempts / record.total_attempts) * 100)
          : 0;

        return (
          <div>
            <div>Lượt: {record.total_attempts}</div>
            <div>Đúng: {successRate}%</div>
          </div>
        );
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/admin/question-bank/edit/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa câu hỏi"
              description="Bạn có chắc chắn muốn xóa câu hỏi này?"
              onConfirm={() => handleDeleteQuestion(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        <Card>
          <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
            <Col>
              <h2 style={{ margin: 0 }}>📚 Ngân hàng câu hỏi</h2>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => navigate('/admin/question-bank/create')}
              >
                Tạo câu hỏi mới
              </Button>
            </Col>
          </Row>

          {/* Filters */}
          <Card
            size="small"
            style={{ marginBottom: '16px', background: '#fafafa' }}
            title="🔍 Bộ lọc"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6} lg={4}>
                <Select
                  placeholder="Môn học"
                  allowClear
                  style={{ width: '100%' }}
                  value={filters.subject}
                  onChange={(value) => handleFilterChange('subject', value)}
                >
                  {subjects.map(subject => (
                    <Option key={subject} value={subject}>{subject}</Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} sm={12} md={6} lg={4}>
                <Select
                  placeholder="Lớp"
                  allowClear
                  style={{ width: '100%' }}
                  value={filters.grade}
                  onChange={(value) => handleFilterChange('grade', value)}
                >
                  {grades.map(grade => (
                    <Option key={grade} value={grade}>{grade}</Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} sm={12} md={6} lg={4}>
                <Input
                  placeholder="Chủ đề"
                  allowClear
                  value={filters.topic}
                  onChange={(e) => handleFilterChange('topic', e.target.value)}
                />
              </Col>

              <Col xs={24} sm={12} md={6} lg={4}>
                <Select
                  placeholder="Độ khó"
                  allowClear
                  style={{ width: '100%' }}
                  value={filters.difficulty}
                  onChange={(value) => handleFilterChange('difficulty', value)}
                >
                  {difficulties.map(diff => (
                    <Option key={diff.value} value={diff.value}>{diff.label}</Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} sm={12} md={12} lg={6}>
                <Input
                  placeholder="Tìm kiếm câu hỏi..."
                  prefix={<SearchOutlined />}
                  allowClear
                  value={filters.searchText}
                  onChange={(e) => handleFilterChange('searchText', e.target.value)}
                />
              </Col>

              <Col xs={24} sm={12} md={6} lg={2}>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleResetFilters}
                  >
                    Reset
                  </Button>
                </Space>
              </Col>
            </Row>

            <div style={{ marginTop: '12px', color: '#666' }}>
              Hiển thị <strong>{filteredQuestions.length}</strong> / {questions.length} câu hỏi
            </div>
          </Card>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={filteredQuestions}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1400 }}
            pagination={{
              defaultPageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} câu hỏi`,
              pageSizeOptions: ['10', '20', '50', '100']
            }}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}

export default QuestionBank;
