import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';
import './GameMap.css';

function GameMap() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const subjects = [
    {
      id: 'toan',
      name: 'Toán',
      icon: '🔢',
      color: '#3498db',
      description: 'Phép tính, hình học'
    },
    {
      id: 'tieng-viet',
      name: 'Tiếng Việt',
      icon: '📚',
      color: '#e74c3c',
      description: 'Từ vựng, chính tả'
    },
    {
      id: 'tieng-anh',
      name: 'Tiếng Anh',
      icon: '🌍',
      color: '#2ecc71',
      description: 'Vocabulary, Grammar'
    }
  ];

  const handleSubjectClick = (subject) => {
    // Navigate to question view with subject filter
    navigate(`/game/play?subject=${encodeURIComponent(subject.name)}`);
  };

  return (
    <div className="game-map-page">
      {/* Header */}
      <header className="game-header">
        <div className="header-content">
          <h1>Vượt Vũ Môn</h1>
          <div className="user-info">
            <span className="user-stars">⭐ {user?.stars_balance || 0}</span>
            <span className="user-streak">🔥 {user?.current_streak || 0}</span>
            {user?.is_anonymous ? (
              <div className="auth-buttons">
                <button
                  className="btn-login"
                  onClick={() => navigate('/login')}
                >
                  Đăng nhập
                </button>
                <button
                  className="btn-register"
                  onClick={() => navigate('/register')}
                >
                  Đăng ký
                </button>
              </div>
            ) : (
              <UserAvatar />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="game-map-container">
        <div className="welcome-section">
          <h2>Chào mừng trở lại! 👋</h2>
          <p>Chọn môn học để bắt đầu luyện tập</p>
        </div>

        {/* Subject Islands */}
        <div className="subjects-grid">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="subject-card"
              style={{ borderColor: subject.color }}
              onClick={() => handleSubjectClick(subject)}
            >
              <div className="subject-icon" style={{ background: subject.color }}>
                {subject.icon}
              </div>
              <h3>{subject.name}</h3>
              <p>{subject.description}</p>
              <button
                className="btn-play"
                style={{ background: subject.color }}
              >
                Chơi ngay
              </button>
            </div>
          ))}
        </div>

        {/* Mini Games Section - Lớp 3 */}
        <div className="mini-games-section">
          <h3>🎮 Mini Games - Lớp 3</h3>
          <div className="mini-games-grid">
            <Link to="/game/grade3/thu-thach-khoi-dau" className="mini-game-card">
              <div className="mini-game-icon">🚀</div>
              <h4>Khởi Động Thử Thách</h4>
              <p>Đánh giá năng lực toàn diện lớp 3-5</p>
              <span className="mini-game-badge" style={{ background: '#FF6B6B' }}>Hot</span>
            </Link>
            <Link to="/game/grade3/game-lat-the-tri-nho" className="mini-game-card">
              <div className="mini-game-icon">🎴</div>
              <h4>Lật Thẻ Trí Nhớ</h4>
              <p>Luyện trí nhớ với từ vựng & toán học</p>
              <span className="mini-game-badge">Mới</span>
            </Link>
            <Link to="/game/grade3/bang-cuu-chuong" className="mini-game-card">
              <div className="mini-game-icon">🎈</div>
              <h4>Bay Lên Toán Học</h4>
              <p>Bắn bong bóng học bảng cửu chương</p>
              <span className="mini-game-badge">Mới</span>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <h3>Thành tích của bạn</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">{user?.stars_balance || 0}</div>
              <div className="stat-label">Tổng sao</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-value">{user?.current_streak || 0}</div>
              <div className="stat-label">Chuỗi ngày</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-value">{user?.max_streak || 0}</div>
              <div className="stat-label">Kỷ lục</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameMap;
