import React, { useState } from 'react';
import './thuthachkhoidau.css';

const ThuThachKhoiDau = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showTest, setShowTest] = useState(false);

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    // Sau khi chọn lớp, có thể chuyển sang màn hình test
    // Tạm thời chỉ hiển thị thông báo
  };

  const startTest = () => {
    if (selectedLevel) {
      setShowTest(true);
    }
  };

  // Màn hình chọn cấp độ
  if (!showTest) {
    return (
      <div className="thu-thach-khoi-dau">
        <div className="game-container">
          {/* Header */}
          <div className="game-header">
            <h1 className="game-title">THỬ THÁCH KHỞI ĐẦU</h1>
            <h2 className="game-subtitle">Bé đang học lớp mấy nhỉ ^^</h2>
          </div>

          {/* Level Selection */}
          <div className="level-selection">
            <div
              className={`level-card ${selectedLevel === 3 ? 'selected' : ''}`}
              onClick={() => handleLevelSelect(3)}
            >
              <div className="level-icon">🎓</div>
              <div className="level-number">Lớp 3</div>
              <div className="level-description">Bắt đầu từ cơ bản</div>
            </div>

            <div
              className={`level-card ${selectedLevel === 4 ? 'selected' : ''}`}
              onClick={() => handleLevelSelect(4)}
            >
              <div className="level-icon">📚</div>
              <div className="level-number">Lớp 4</div>
              <div className="level-description">Nâng cao hơn chút</div>
            </div>

            <div
              className={`level-card ${selectedLevel === 5 ? 'selected' : ''}`}
              onClick={() => handleLevelSelect(5)}
            >
              <div className="level-icon">🏆</div>
              <div className="level-number">Lớp 5</div>
              <div className="level-description">Thử thách cao cấp</div>
            </div>
          </div>

          {/* Start Button */}
          {selectedLevel && (
            <div className="action-buttons">
              <button className="btn-start-test" onClick={startTest}>
                Bắt đầu thử thách! 🚀
              </button>
            </div>
          )}

          {/* Back Button */}
          <div className="back-section">
            <button className="btn-back" onClick={() => window.history.back()}>
              ← Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Màn hình test (tạm thời)
  return (
    <div className="thu-thach-khoi-dau">
      <div className="game-container">
        <div className="test-screen">
          <h2>🎉 Chúc mừng bé!</h2>
          <p>Bé đã chọn <strong>Lớp {selectedLevel}</strong></p>
          <p className="coming-soon">Phần bài test sẽ được phát triển tiếp theo...</p>
          <button
            className="btn-back-to-select"
            onClick={() => {
              setShowTest(false);
              setSelectedLevel(null);
            }}
          >
            Chọn lại cấp độ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThuThachKhoiDau;
