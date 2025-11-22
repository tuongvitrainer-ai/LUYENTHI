import React, { useState, useEffect } from 'react';
import GameLayout from '../components/layout/GameLayout';

/**
 * DEMO PAGE - Xem GameLayout hoạt động
 *
 * URL: http://localhost:5173/demo-game-layout
 *
 * Features được demo:
 * - Timer (đếm ngược)
 * - Score (tăng dần khi click nút)
 * - Sound toggle
 * - Fullscreen toggle
 * - Help button
 */

const DemoGameLayout = () => {
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 phút
  const [score, setScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSoundToggle = () => {
    setSoundEnabled(!soundEnabled);
    console.log(`🔊 Sound ${!soundEnabled ? 'ON' : 'OFF'}`);
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleHelp = () => {
    alert('📖 HƯỚNG DẪN:\n\n' +
          '1. Click "Tăng điểm" để tăng score\n' +
          '2. Click "Reset" để reset về 0\n' +
          '3. Timer sẽ đếm ngược tự động\n' +
          '4. Click các nút trên header để test chức năng');
  };

  return (
    <GameLayout
      title="DEMO GAME LAYOUT"
      showTimer={true}
      timerValue={timeRemaining}
      showScore={true}
      scoreValue={score}
      showSoundToggle={true}
      soundEnabled={soundEnabled}
      onSoundToggle={handleSoundToggle}
      showFullscreenToggle={true}
      onFullscreenToggle={handleFullscreenToggle}
      showHelpButton={true}
      onHelp={handleHelp}
    >
      {/* NỘI DUNG GAME */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '24px',
        padding: '40px'
      }}>
        <div className="game-card" style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '600px'
        }}>
          <h1 style={{ fontSize: '32px', color: '#2d5016', marginBottom: '16px' }}>
            🎮 Demo GameLayout Component
          </h1>

          <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
            Đây là trang demo để xem GameLayout hoạt động. Bạn có thể thấy:
          </p>

          <ul style={{ textAlign: 'left', marginBottom: '32px', lineHeight: '1.8' }}>
            <li>⏱️ <strong>Timer</strong> ở góc phải header (đang đếm ngược)</li>
            <li>⭐ <strong>Score</strong> ở góc phải header (điểm số: {score})</li>
            <li>🔊 <strong>Sound toggle</strong> - Bật/tắt âm thanh</li>
            <li>⛶ <strong>Fullscreen</strong> - Toàn màn hình</li>
            <li>❓ <strong>Help button</strong> - Trợ giúp</li>
            <li>🏠 <strong>Back button</strong> - Về trang chủ (góc trái header)</li>
            <li>📱 <strong>Sidebar</strong> - Menu điều hướng (bên trái)</li>
          </ul>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => setScore(score + 10)}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #4a7c2f 0%, #7ed87a 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(74,124,47,0.3)'
              }}
            >
              Tăng điểm (+10)
            </button>

            <button
              onClick={() => setScore(0)}
              style={{
                padding: '12px 24px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(244,67,54,0.3)'
              }}
            >
              Reset điểm
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div style={{
          background: '#fff5e1',
          border: '2px solid #ffb74d',
          borderRadius: '12px',
          padding: '20px',
          maxWidth: '600px'
        }}>
          <h3 style={{ color: '#f57c00', marginBottom: '12px' }}>
            📝 Cách chỉnh sửa GameLayout:
          </h3>
          <ol style={{ textAlign: 'left', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>Mở file: <code style={{background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px'}}>
              client/src/components/layout/GameLayout.jsx
            </code></li>
            <li>Chỉnh sửa props, style, layout theo ý bạn</li>
            <li>Save file - Vite sẽ tự động reload</li>
            <li>Xem kết quả ngay trên trang này!</li>
          </ol>
        </div>

        {/* Current State */}
        <div style={{
          background: '#e3f2fd',
          border: '2px solid #2196f3',
          borderRadius: '12px',
          padding: '20px',
          maxWidth: '600px'
        }}>
          <h3 style={{ color: '#1976d2', marginBottom: '12px' }}>
            📊 Trạng thái hiện tại:
          </h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>⏱️ Thời gian còn lại: <strong>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</strong></li>
            <li>⭐ Điểm số: <strong>{score}</strong></li>
            <li>🔊 Âm thanh: <strong>{soundEnabled ? 'BẬT' : 'TẮT'}</strong></li>
            <li>⛶ Fullscreen: <strong>{isFullscreen ? 'BẬT' : 'TẮT'}</strong></li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
};

export default DemoGameLayout;
