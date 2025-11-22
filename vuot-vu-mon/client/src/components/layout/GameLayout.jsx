import React from 'react';
import BaseLayout from './BaseLayout';
import './GameLayout.css';

/**
 * GameLayout - Layout đặc biệt cho các mini game
 *
 * Features:
 * - Màu nền xanh da trời cố định (#87CEEB)
 * - Fullscreen-friendly (không scroll mặc định)
 * - Nút "Về trang chủ" luôn về /game-map
 * - Hỗ trợ timer, score display, sound toggle
 * - Keyboard shortcuts cho game
 *
 * Props:
 * - children: ReactNode - Nội dung game
 * - title: string - Tên game (hiển thị ở header)
 * - showTimer: boolean - Hiển thị timer ở header
 * - timerValue: number - Giá trị timer (seconds)
 * - showScore: boolean - Hiển thị score ở header
 * - scoreValue: number - Giá trị score
 * - showSoundToggle: boolean - Hiển thị nút bật/tắt nhạc
 * - soundEnabled: boolean - Trạng thái âm thanh
 * - onSoundToggle: function - Handler toggle âm thanh
 * - showFullscreenToggle: boolean - Hiển thị nút fullscreen
 * - onFullscreenToggle: function - Handler fullscreen
 * - showHelpButton: boolean - Hiển thị nút trợ giúp
 * - onHelp: function - Handler trợ giúp
 * - keyboardShortcuts: object - Custom keyboard shortcuts
 * - className: string - Custom class
 */

const GameLayout = ({
  children,
  title = 'CÙNG CHƠI GAME NÀO!!',
  showTimer = false,
  timerValue = 0,
  showScore = false,
  scoreValue = 0,
  showSoundToggle = false,
  soundEnabled = true,
  onSoundToggle,
  showFullscreenToggle = false,
  onFullscreenToggle,
  showHelpButton = false,
  onHelp,
  keyboardShortcuts = {},
  className = '',
  ...restProps
}) => {
  // Format timer display (MM:SS)
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Header right content (timer, score, action buttons)
  const headerRight = (
    <div className="game-header-right">
      {/* Timer */}
      {showTimer && (
        <div className="game-timer" title="Thời gian">
          <span className="timer-icon">⏱️</span>
          <span className="timer-value">{formatTimer(timerValue)}</span>
        </div>
      )}

      {/* Score */}
      {showScore && (
        <div className="game-score" title="Điểm số">
          <span className="score-icon">⭐</span>
          <span className="score-value">{scoreValue}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="game-actions">
        {/* Sound Toggle */}
        {showSoundToggle && (
          <button
            className="game-action-btn"
            onClick={onSoundToggle}
            aria-label={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        )}

        {/* Fullscreen Toggle */}
        {showFullscreenToggle && (
          <button
            className="game-action-btn"
            onClick={onFullscreenToggle}
            aria-label="Toàn màn hình"
            title="Toàn màn hình (F11)"
          >
            ⛶
          </button>
        )}

        {/* Help Button */}
        {showHelpButton && (
          <button
            className="game-action-btn game-action-btn--primary"
            onClick={onHelp}
            aria-label="Trợ giúp"
            title="Trợ giúp"
          >
            ❓
          </button>
        )}
      </div>
    </div>
  );

  // Default keyboard shortcuts cho game
  const defaultShortcuts = {
    'F11': (e) => {
      e.preventDefault();
      if (onFullscreenToggle) onFullscreenToggle();
    },
    'h': () => {
      if (onHelp) onHelp();
    },
    'm': () => {
      if (onSoundToggle) onSoundToggle();
    },
    ...keyboardShortcuts
  };

  return (
    <BaseLayout
      title={title}
      backgroundColor="#87CEEB"
      maxWidth="100%"
      showSidebar={true}
      sidebarVariant="default"
      showBackButton={true}
      backPath="/game-map"
      backText="Về trang chủ"
      headerRight={headerRight}
      keyboardShortcuts={defaultShortcuts}
      className={`game-layout ${className}`}
      containerClassName="game-container"
      {...restProps}
    >
      <div className="game-content" id="main-content">
        {children}
      </div>
    </BaseLayout>
  );
};

export default GameLayout;
