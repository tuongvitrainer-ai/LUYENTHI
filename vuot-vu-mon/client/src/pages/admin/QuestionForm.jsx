import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Card,
  Space,
  message,
  Row,
  Col,
  Divider,
  Tag,
  Radio,
  Upload,
  Image
} from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  FileImageOutlined,
  AudioOutlined
} from '@ant-design/icons';
import AdminLayout from '../../components/AdminLayout';

const { Option } = Select;

function QuestionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [options, setOptions] = useState([
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' }
  ]);
  const [imageUrl, setImageUrl] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const isEditMode = !!id;

  // Available options
  const subjects = ['Toán', 'Tiếng Việt', 'Tiếng Anh', 'Khoa học', 'Lịch sử'];
  const grades = ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'];
  const questionTypes = [
    { value: 'multiple_choice', label: 'Trắc nghiệm' },
    { value: 'true_false', label: 'Đúng/Sai' },
    { value: 'fill_blank', label: 'Điền vào chỗ trống' }
  ];

  useEffect(() => {
    if (isEditMode) {
      loadQuestion();
    }
  }, [id]);

  const loadQuestion = async () => {
    try {
      setLoading(true);

      const response = await fetch(`http://localhost:3000/api/admin/questions?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        const question = data.data.questions.find(q => q.id === parseInt(id));

        if (question) {
          // Set form values
          const content = question.content_json;
          setQuestionText(content.question_text || '');
          setExplanation(content.explanation || '');
          setImageUrl(question.image_url);
          setAudioUrl(question.audio_url);

          if (content.options) {
            setOptions(content.options);
          }

          // Find tags
          const subjectTag = question.tags.find(t => t.tag_type === 'subject');
          const gradeTag = question.tags.find(t => t.tag_type === 'grade');
          const topicTag = question.tags.find(t => t.tag_type === 'topic');

          form.setFieldsValue({
            question_type: content.question_type || 'multiple_choice',
            correct_answer: content.correct_answer || 'A',
            subject: subjectTag?.tag_value,
            grade: gradeTag?.tag_value,
            topic: topicTag?.tag_value,
            difficulty_level: question.difficulty_level || 1,
            points: question.points || 10,
            time_limit: question.time_limit || 60
          });
        } else {
          message.error('Không tìm thấy câu hỏi!');
          navigate('/admin/question-bank');
        }
      }
    } catch (error) {
      console.error('Load question error:', error);
      message.error('Lỗi khi tải câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file, type) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const url = `http://localhost:3000${data.data.url}`;
        if (type === 'image') {
          setImageUrl(url);
          message.success('Tải hình ảnh thành công!');
        } else if (type === 'audio') {
          setAudioUrl(url);
          message.success('Tải âm thanh thành công!');
        }
      } else {
        message.error(data.message || 'Lỗi khi tải file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Lỗi khi tải file');
    } finally {
      setUploading(false);
    }

    return false; // Prevent default upload behavior
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    const nextLetter = String.fromCharCode(65 + options.length); // A=65
    setOptions([...options, { id: nextLetter, text: '' }]);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) {
      message.warning('Cần ít nhất 2 đáp án!');
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = async (values) => {
    try {
      // Validate
      if (!questionText.trim()) {
        message.error('Vui lòng nhập câu hỏi!');
        return;
      }

      if (values.question_type === 'multiple_choice') {
        const hasEmptyOption = options.some(opt => !opt.text.trim());
        if (hasEmptyOption) {
          message.error('Vui lòng điền đầy đủ các đáp án!');
          return;
        }
      }

      setLoading(true);

      // Prepare content_json
      const content_json = {
        question_type: values.question_type,
        question_text: questionText,
        correct_answer: values.correct_answer,
        explanation: explanation
      };

      if (values.question_type === 'multiple_choice') {
        content_json.options = options;
      }

      // Prepare tags
      const tags = [];
      if (values.subject) {
        tags.push({ tag_type: 'subject', tag_value: values.subject });
      }
      if (values.grade) {
        tags.push({ tag_type: 'grade', tag_value: values.grade });
      }
      if (values.topic) {
        tags.push({ tag_type: 'topic', tag_value: values.topic });
      }

      if (tags.length === 0) {
        message.error('Vui lòng chọn ít nhất một tag (Môn học, Lớp, hoặc Chủ đề)!');
        setLoading(false);
        return;
      }

      // Prepare request body
      const requestBody = {
        content_json,
        tags,
        difficulty_level: values.difficulty_level,
        points: values.points,
        time_limit: values.time_limit,
        image_url: imageUrl,
        audio_url: audioUrl
      };

      // API call
      const url = isEditMode
        ? `http://localhost:3000/api/admin/questions/${id}`
        : 'http://localhost:3000/api/admin/questions';

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        message.success(isEditMode ? 'Cập nhật câu hỏi thành công!' : 'Tạo câu hỏi thành công!');
        navigate('/admin/question-bank');
      } else {
        message.error(data.message || 'Lỗi khi lưu câu hỏi');
      }
    } catch (error) {
      console.error('Submit question error:', error);
      message.error('Lỗi khi lưu câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ]
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link', 'image'
  ];

  return (
    <AdminLayout>
      <div style={{ padding: '24px' }}>
        <Card>
          <h2>{isEditMode ? '✏️ Chỉnh sửa câu hỏi' : '➕ Tạo câu hỏi mới'}</h2>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              question_type: 'multiple_choice',
              correct_answer: 'A',
              difficulty_level: 1,
              points: 10,
              time_limit: 60
            }}
          >
            <Row gutter={24}>
              {/* Left Column */}
              <Col xs={24} lg={16}>
                <Card title="📝 Nội dung câu hỏi" size="small" style={{ marginBottom: '16px' }}>
                  <Form.Item
                    label="Loại câu hỏi"
                    name="question_type"
                    rules={[{ required: true, message: 'Vui lòng chọn loại câu hỏi!' }]}
                  >
                    <Select>
                      {questionTypes.map(type => (
                        <Option key={type.value} value={type.value}>{type.label}</Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item label="Câu hỏi" required>
                    <ReactQuill
                      value={questionText}
                      onChange={setQuestionText}
                      modules={quillModules}
                      formats={quillFormats}
                      theme="snow"
                      style={{ background: 'white' }}
                      placeholder="Nhập nội dung câu hỏi..."
                    />
                  </Form.Item>

                  <Divider />

                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) =>
                      prevValues.question_type !== currentValues.question_type
                    }
                  >
                    {({ getFieldValue }) => {
                      const questionType = getFieldValue('question_type');

                      if (questionType === 'multiple_choice') {
                        return (
                          <>
                            <Form.Item label="Các đáp án">
                              <Space direction="vertical" style={{ width: '100%' }}>
                                {options.map((option, index) => (
                                  <div key={option.id} style={{ display: 'flex', gap: '8px' }}>
                                    <Tag color="blue" style={{ minWidth: '30px', textAlign: 'center' }}>
                                      {option.id}
                                    </Tag>
                                    <Input
                                      value={option.text}
                                      onChange={(e) => handleOptionChange(index, e.target.value)}
                                      placeholder={`Đáp án ${option.id}`}
                                      style={{ flex: 1 }}
                                    />
                                    {options.length > 2 && (
                                      <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleRemoveOption(index)}
                                      />
                                    )}
                                  </div>
                                ))}
                              </Space>
                            </Form.Item>

                            {options.length < 6 && (
                              <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={handleAddOption}
                                style={{ marginBottom: '16px' }}
                              >
                                Thêm đáp án
                              </Button>
                            )}

                            <Form.Item
                              label="Đáp án đúng"
                              name="correct_answer"
                              rules={[{ required: true, message: 'Vui lòng chọn đáp án đúng!' }]}
                            >
                              <Radio.Group>
                                {options.map(option => (
                                  <Radio key={option.id} value={option.id}>
                                    {option.id}
                                  </Radio>
                                ))}
                              </Radio.Group>
                            </Form.Item>
                          </>
                        );
                      }

                      return null;
                    }}
                  </Form.Item>

                  <Divider />

                  <Form.Item label="Giải thích (tùy chọn)">
                    <ReactQuill
                      value={explanation}
                      onChange={setExplanation}
                      modules={quillModules}
                      formats={quillFormats}
                      theme="snow"
                      style={{ background: 'white' }}
                      placeholder="Nhập phần giải thích cho câu trả lời..."
                    />
                  </Form.Item>

                  <Divider />

                  <div style={{ marginBottom: '16px' }}>
                    <Form.Item label="Hình ảnh (tùy chọn)">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Upload
                          beforeUpload={(file) => handleFileUpload(file, 'image')}
                          showUploadList={false}
                          accept="image/*"
                        >
                          <Button icon={<FileImageOutlined />} loading={uploading}>
                            Chọn hình ảnh
                          </Button>
                        </Upload>
                        {imageUrl && (
                          <div>
                            <Image src={imageUrl} alt="Question image" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                            <Button
                              danger
                              size="small"
                              onClick={() => setImageUrl(null)}
                              style={{ marginTop: '8px' }}
                            >
                              Xóa hình ảnh
                            </Button>
                          </div>
                        )}
                      </Space>
                    </Form.Item>

                    <Form.Item label="Âm thanh (tùy chọn)">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Upload
                          beforeUpload={(file) => handleFileUpload(file, 'audio')}
                          showUploadList={false}
                          accept="audio/*"
                        >
                          <Button icon={<AudioOutlined />} loading={uploading}>
                            Chọn file âm thanh
                          </Button>
                        </Upload>
                        {audioUrl && (
                          <div>
                            <audio controls src={audioUrl} style={{ width: '100%', maxWidth: '400px' }} />
                            <Button
                              danger
                              size="small"
                              onClick={() => setAudioUrl(null)}
                              style={{ marginTop: '8px' }}
                            >
                              Xóa âm thanh
                            </Button>
                          </div>
                        )}
                      </Space>
                    </Form.Item>
                  </div>
                </Card>
              </Col>

              {/* Right Column */}
              <Col xs={24} lg={8}>
                <Card title="🏷️ Phân loại" size="small" style={{ marginBottom: '16px' }}>
                  <Form.Item
                    label="Môn học"
                    name="subject"
                  >
                    <Select placeholder="Chọn môn học" allowClear>
                      {subjects.map(subject => (
                        <Option key={subject} value={subject}>{subject}</Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Lớp"
                    name="grade"
                  >
                    <Select placeholder="Chọn lớp" allowClear>
                      {grades.map(grade => (
                        <Option key={grade} value={grade}>{grade}</Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Chủ đề"
                    name="topic"
                  >
                    <Input placeholder="Ví dụ: Phép cộng, Ngữ pháp, ..." />
                  </Form.Item>
                </Card>

                <Card title="⚙️ Cài đặt" size="small">
                  <Form.Item
                    label="Độ khó"
                    name="difficulty_level"
                    rules={[{ required: true, message: 'Vui lòng chọn độ khó!' }]}
                  >
                    <Select>
                      <Option value={1}>⭐ Rất dễ</Option>
                      <Option value={2}>⭐⭐ Dễ</Option>
                      <Option value={3}>⭐⭐⭐ Trung bình</Option>
                      <Option value={4}>⭐⭐⭐⭐ Khó</Option>
                      <Option value={5}>⭐⭐⭐⭐⭐ Rất khó</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Điểm"
                    name="points"
                    rules={[{ required: true, message: 'Vui lòng nhập điểm!' }]}
                  >
                    <InputNumber min={1} max={100} style={{ width: '100%' }} />
                  </Form.Item>

                  <Form.Item
                    label="Thời gian (giây)"
                    name="time_limit"
                    rules={[{ required: true, message: 'Vui lòng nhập thời gian!' }]}
                  >
                    <InputNumber min={10} max={600} style={{ width: '100%' }} />
                  </Form.Item>
                </Card>
              </Col>
            </Row>

            {/* Action Buttons */}
            <Divider />

            <Space style={{ float: 'right' }}>
              <Button
                icon={<CloseOutlined />}
                onClick={() => navigate('/admin/question-bank')}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                htmlType="submit"
                loading={loading}
                size="large"
              >
                {isEditMode ? 'Cập nhật' : 'Tạo câu hỏi'}
              </Button>
            </Space>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default QuestionForm;
