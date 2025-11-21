import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import './QuestionReports.css';

function QuestionReports() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, resolved, rejected
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    loadReports();
    loadStats();
  }, [filter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params = filter === 'all' ? {} : { status: filter };
      const response = await adminAPI.getQuestionReports(params);

      if (response.data.success) {
        setReports(response.data.data.reports);
      }
    } catch (error) {
      console.error('Load reports error:', error);
      alert('Lỗi khi tải danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminAPI.getQuestionReportStats();
      if (response.data.success) {
        setStats(response.data.data.overall_stats);
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      const response = await adminAPI.updateQuestionReport(reportId, {
        status: newStatus,
        admin_note: adminNote
      });

      if (response.data.success) {
        alert('Cập nhật trạng thái thành công!');
        setSelectedReport(null);
        setAdminNote('');
        loadReports();
        loadStats();
      }
    } catch (error) {
      console.error('Update status error:', error);
      alert('Lỗi khi cập nhật trạng thái');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-pending', text: 'Chờ xử lý' },
      reviewing: { class: 'badge-reviewing', text: 'Đang xem xét' },
      resolved: { class: 'badge-resolved', text: 'Đã xử lý' },
      rejected: { class: 'badge-rejected', text: 'Từ chối' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  if (loading && reports.length === 0) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="question-reports-page">
      <div className="page-header">
        <h1>Quản lý báo cáo lỗi câu hỏi</h1>

        {/* Stats Cards */}
        {stats && (
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-number">{stats.total_reports}</div>
              <div className="stat-label">Tổng báo cáo</div>
            </div>
            <div className="stat-card pending">
              <div className="stat-number">{stats.pending_reports}</div>
              <div className="stat-label">Chờ xử lý</div>
            </div>
            <div className="stat-card reviewing">
              <div className="stat-number">{stats.reviewing_reports}</div>
              <div className="stat-label">Đang xem xét</div>
            </div>
            <div className="stat-card resolved">
              <div className="stat-number">{stats.resolved_reports}</div>
              <div className="stat-label">Đã xử lý</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Tất cả
        </button>
        <button
          className={filter === 'pending' ? 'active' : ''}
          onClick={() => setFilter('pending')}
        >
          Chờ xử lý
        </button>
        <button
          className={filter === 'reviewing' ? 'active' : ''}
          onClick={() => setFilter('reviewing')}
        >
          Đang xem xét
        </button>
        <button
          className={filter === 'resolved' ? 'active' : ''}
          onClick={() => setFilter('resolved')}
        >
          Đã xử lý
        </button>
        <button
          className={filter === 'rejected' ? 'active' : ''}
          onClick={() => setFilter('rejected')}
        >
          Từ chối
        </button>
      </div>

      {/* Reports Table */}
      <div className="reports-table">
        {reports.length === 0 ? (
          <div className="no-data">Không có báo cáo nào</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Câu hỏi</th>
                <th>Người báo cáo</th>
                <th>Loại lỗi</th>
                <th>Trạng thái</th>
                <th>Ngày báo cáo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>#{report.id}</td>
                  <td className="question-preview">
                    {report.content_json?.question || 'N/A'}
                  </td>
                  <td>{report.reporter_username || 'Guest'}</td>
                  <td>{report.report_type}</td>
                  <td>{getStatusBadge(report.status)}</td>
                  <td>{formatDate(report.created_at)}</td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => setSelectedReport(report)}
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết báo cáo #{selectedReport.id}</h2>

            <div className="report-details">
              <div className="detail-section">
                <h3>Thông tin câu hỏi</h3>
                <p><strong>Câu hỏi:</strong> {selectedReport.content_json?.question}</p>
                <p><strong>Đáp án đúng:</strong> {selectedReport.correct_answer}</p>
                <p><strong>Độ khó:</strong> {selectedReport.difficulty}</p>
              </div>

              <div className="detail-section">
                <h3>Thông tin báo cáo</h3>
                <p><strong>Người báo cáo:</strong> {selectedReport.reporter_username || 'Guest'}</p>
                <p><strong>Email:</strong> {selectedReport.reporter_email || 'N/A'}</p>
                <p><strong>Loại lỗi:</strong> {selectedReport.report_type}</p>
                <p><strong>Ngày báo cáo:</strong> {formatDate(selectedReport.created_at)}</p>
                <p><strong>Trạng thái:</strong> {getStatusBadge(selectedReport.status)}</p>
              </div>

              {selectedReport.comment && (
                <div className="detail-section">
                  <h3>Nhận xét của người dùng</h3>
                  <p>{selectedReport.comment}</p>
                </div>
              )}

              {selectedReport.context_json && (
                <div className="detail-section">
                  <h3>Thông tin bổ sung</h3>
                  <pre>{JSON.stringify(selectedReport.context_json, null, 2)}</pre>
                </div>
              )}

              {selectedReport.admin_note && (
                <div className="detail-section">
                  <h3>Ghi chú admin</h3>
                  <p>{selectedReport.admin_note}</p>
                </div>
              )}

              <div className="detail-section">
                <h3>Ghi chú xử lý</h3>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Nhập ghi chú (tùy chọn)..."
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                {selectedReport.status !== 'reviewing' && (
                  <button
                    className="btn btn-reviewing"
                    onClick={() => handleUpdateStatus(selectedReport.id, 'reviewing')}
                  >
                    Đánh dấu đang xem xét
                  </button>
                )}
                {selectedReport.status !== 'resolved' && (
                  <button
                    className="btn btn-resolved"
                    onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                  >
                    Đánh dấu đã xử lý
                  </button>
                )}
                {selectedReport.status !== 'rejected' && (
                  <button
                    className="btn btn-rejected"
                    onClick={() => handleUpdateStatus(selectedReport.id, 'rejected')}
                  >
                    Từ chối
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedReport(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionReports;
