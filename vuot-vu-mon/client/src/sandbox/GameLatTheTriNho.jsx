import React, { useState, useEffect } from 'react';
import './GameLatTheTriNho.css';

const GameLatTheTriNho = ({ pairs: propPairs }) => {
  // ============================================
  // SAMPLE DATA - 20 cặp cho level tối đa
  // ============================================
  const allSamplePairs = [
    { id: 1, q: "5 × 3", a: "15" },
    { id: 2, q: "7 × 2", a: "14" },
    { id: 3, q: "Cat", a: "Con mèo" },
    { id: 4, q: "Dog", a: "Con chó" },
    { id: 5, q: "9 × 2", a: "18" },
    { id: 6, q: "Apple", a: "Quả táo" },
    { id: 7, q: "4 × 4", a: "16" },
    { id: 8, q: "Bird", a: "Con chim" },
    { id: 9, q: "6 × 3", a: "18" },
    { id: 10, q: "Fish", a: "Con cá" },
    { id: 11, q: "8 × 2", a: "16" },
    { id: 12, q: "Book", a: "Quyển sách" },
    { id: 13, q: "3 × 5", a: "15" },
    { id: 14, q: "Tree", a: "Cái cây" },
    { id: 15, q: "9 × 3", a: "27" },
    { id: 16, q: "Sun", a: "Mặt trời" },
    { id: 17, q: "7 × 3", a: "21" },
    { id: 18, q: "Moon", a: "Mặt trăng" },
    { id: 19, q: "6 × 4", a: "24" },
    { id: 20, q: "Star", a: "Ngôi sao" },
  ];

  // ============================================
  // LEVEL CONFIGURATION
  // ============================================
  const LEVELS = [
    { level: 1, name: "Level 1", pairs: 4, emoji: "🌟" },
    { level: 2, name: "Level 2", pairs: 6, emoji: "⭐" },
    { level: 3, name: "Level 3", pairs: 8, emoji: "🎯" },
    { level: 4, name: "Level 4", pairs: 12, emoji: "🔥" },
    { level: 5, name: "Level 5", pairs: 20, emoji: "💪" },
  ];

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [currentLevel, setCurrentLevel] = useState(null); // null = chưa chọn level
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  // ============================================
  // SOUND EFFECTS
  // ============================================
  const playSound = (type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (type === 'match') {
        // Âm thanh vui nhộn khi đúng: C-E-G chord
        oscillator.frequency.value = 523.25; // C5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);

        // Thêm harmonic
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 659.25; // E5
        gain2.gain.setValueAtTime(0.2, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.3);
      } else {
        // Âm thanh nhẹ nhàng khi sai
        oscillator.frequency.value = 200; // G3
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      }
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  };

  // ============================================
  // SELECT LEVEL & INITIALIZE GAME
  // ============================================
  const selectLevel = (levelConfig) => {
    setCurrentLevel(levelConfig);
    setStartTime(Date.now());
    initializeGame(levelConfig.pairs);
  };

  const initializeGame = (pairCount) => {
    // Lấy số cặp theo level (hoặc dùng propPairs nếu có)
    let gamePairs;
    if (propPairs) {
      gamePairs = propPairs.slice(0, pairCount);
    } else {
      gamePairs = allSamplePairs.slice(0, pairCount);
    }

    // Tạo 2 thẻ cho mỗi cặp
    const newCards = [];
    gamePairs.forEach((pair) => {
      newCards.push({
        id: `${pair.id}-q`,
        pairId: pair.id,
        type: 'question',
        content: pair.q,
        isMatched: false,
      });
      newCards.push({
        id: `${pair.id}-a`,
        pairId: pair.id,
        type: 'answer',
        content: pair.a,
        isMatched: false,
      });
    });

    // Shuffle cards
    const shuffled = shuffleArray(newCards);
    setCards(shuffled);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setScore(0);
    setMoves(0);
    setGameComplete(false);
    setEndTime(null);
  };

  // Shuffle array using Fisher-Yates algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // ============================================
  // HANDLE CARD CLICK
  // ============================================
  const handleCardClick = (index) => {
    // Prevent clicks nếu:
    // - Đang check 2 thẻ
    // - Thẻ đã được lật
    // - Thẻ đã matched
    // - Đã lật 2 thẻ rồi
    if (
      isChecking ||
      flippedIndices.includes(index) ||
      cards[index].isMatched ||
      flippedIndices.length >= 2
    ) {
      return;
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // Nếu đã lật 2 thẻ → check match
    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      checkMatch(newFlipped);
    }
  };

  // ============================================
  // CHECK MATCH
  // ============================================
  const checkMatch = (indices) => {
    setIsChecking(true);
    const [index1, index2] = indices;
    const card1 = cards[index1];
    const card2 = cards[index2];

    // Check if same pairId
    if (card1.pairId === card2.pairId) {
      // MATCH! Play success sound
      playSound('match');

      setTimeout(() => {
        const newCards = [...cards];
        newCards[index1].isMatched = true;
        newCards[index2].isMatched = true;
        setCards(newCards);

        const newMatchedPairs = [...matchedPairs, card1.pairId];
        setMatchedPairs(newMatchedPairs);

        // Tính điểm: 100 điểm cho mỗi cặp đúng
        const newScore = score + 100;
        setScore(newScore);

        setFlippedIndices([]);
        setIsChecking(false);

        // Check game complete
        if (newMatchedPairs.length === currentLevel.pairs) {
          setTimeout(() => {
            setEndTime(Date.now());
            setGameComplete(true);
          }, 500);
        }
      }, 600);
    } else {
      // NO MATCH - Play fail sound and úp lại sau 1 giây
      playSound('no-match');

      setTimeout(() => {
        setFlippedIndices([]);
        setIsChecking(false);
      }, 1000);
    }
  };

  // ============================================
  // HANDLE BACK TO LEVEL SELECT
  // ============================================
  const backToLevelSelect = () => {
    setCurrentLevel(null);
    setCards([]);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setScore(0);
    setMoves(0);
    setGameComplete(false);
    setStartTime(null);
    setEndTime(null);
  };

  // ============================================
  // HANDLE RESTART SAME LEVEL
  // ============================================
  const handleRestart = () => {
    setStartTime(Date.now());
    initializeGame(currentLevel.pairs);
  };

  // ============================================
  // CALCULATE TIME
  // ============================================
  const getPlayTime = () => {
    if (!startTime) return 0;
    const end = endTime || Date.now();
    return Math.floor((end - startTime) / 1000); // seconds
  };

  // ============================================
  // RENDER: LEVEL SELECT SCREEN
  // ============================================
  if (!currentLevel) {
    return (
      <div className="game-lat-the-tri-nho">
        <div className="level-select-screen">
          <h1 className="game-title">🎮 CÙNG CHƠI GAME NÀO!!</h1>
          <p className="game-subtitle">Chọn mức độ:</p>
          <div className="level-buttons">
            {LEVELS.map((level) => (
              <button
                key={level.level}
                className="level-btn"
                onClick={() => selectLevel(level)}
              >
                <span className="level-btn-emoji">{level.emoji}</span>
                <span className="level-btn-text">{level.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: GAME SCREEN
  // ============================================
  return (
    <div className="game-lat-the-tri-nho">
      {/* Header */}
      <div className="game-header">
        <button className="btn-back" onClick={backToLevelSelect}>
          ← Menu
        </button>
        <div className="game-level-info">
          <span className="level-badge">
            {currentLevel.emoji} {currentLevel.name}
          </span>
        </div>
        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">Điểm:</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Lượt:</span>
            <span className="stat-value">{moves}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Cặp:</span>
            <span className="stat-value">{matchedPairs.length}/{currentLevel.pairs}</span>
          </div>
        </div>
        <button className="btn-restart" onClick={handleRestart}>
          🔄 Chơi lại
        </button>
      </div>

      {/* Game Board */}
      <div className={`game-board pairs-${currentLevel.pairs}`}>
        {cards.map((card, index) => {
          const isFlipped = flippedIndices.includes(index) || card.isMatched;
          return (
            <div
              key={card.id}
              className={`memory-card ${isFlipped ? 'flipped' : ''} ${
                card.isMatched ? 'matched' : ''
              }`}
              onClick={() => handleCardClick(index)}
            >
              <div className="card-inner">
                {/* Card Back */}
                <div className="card-back">
                  <div className="card-back-content">
                    <span className="card-back-icon">🎴</span>
                  </div>
                </div>

                {/* Card Front */}
                <div className="card-front">
                  <div className="card-front-content">
                    <div className="card-type-badge">
                      {card.type === 'question' ? '❓' : '💡'}
                    </div>
                    <div className="card-text">{card.content}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Popup */}
      {gameComplete && (
        <div className="game-complete-popup">
          <div className="popup-content">
            <div className="popup-icon">🎉</div>
            <h2>Hoàn thành!</h2>
            <div className="popup-level-badge">
              {currentLevel.emoji} {currentLevel.name}
            </div>
            <div className="popup-stats">
              <p className="popup-score">
                Điểm số: <strong>{score}</strong>
              </p>
              <p className="popup-moves">
                Lượt chơi: <strong>{moves}</strong>
              </p>
              <p className="popup-time">
                Thời gian: <strong>{getPlayTime()}s</strong>
              </p>
              <p className="popup-accuracy">
                Độ chính xác: <strong>{Math.round((currentLevel.pairs / moves) * 100)}%</strong>
              </p>
            </div>
            <div className="popup-message">
              <p>🌟 Xin chúc mừng, bạn nhận được <strong>5 Sao</strong>!</p>
              <p>Hãy đăng nhập để lưu điểm và đổi thưởng nhé ^^</p>
            </div>
            <div className="popup-buttons">
              <button className="btn-back-popup" onClick={backToLevelSelect}>
                ← Menu
              </button>
              <button className="btn-restart-popup" onClick={handleRestart}>
                🔄 Chơi lại
              </button>
              <button className="btn-login-popup" onClick={() => alert('Chuyển đến trang đăng nhập')}>
                🔐 Đăng nhập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLatTheTriNho;
