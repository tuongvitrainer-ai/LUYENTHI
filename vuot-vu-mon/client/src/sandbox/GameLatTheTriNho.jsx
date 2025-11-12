import React, { useState, useEffect, useRef } from 'react';
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
  const [currentLevel, setCurrentLevel] = useState(null);
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  // Background music ref
  const bgMusicRef = useRef(null);

  // ============================================
  // SOUND EFFECTS - IMPROVED
  // ============================================

  // Âm thanh "TING TING" khi đúng - 2 nốt cao vui vẻ
  const playMatchSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Note 1: G5 (783.99 Hz) - "TING"
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      osc1.type = 'sine';
      osc1.frequency.value = 783.99; // G5
      gain1.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      osc1.start(audioContext.currentTime);
      osc1.stop(audioContext.currentTime + 0.15);

      // Note 2: C6 (1046.50 Hz) - "TING" (cao hơn)
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.type = 'sine';
      osc2.frequency.value = 1046.50; // C6
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
      osc2.start(audioContext.currentTime + 0.1);
      osc2.stop(audioContext.currentTime + 0.25);
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  };

  // Âm thanh "BÚM BÙM" khi sai - 2 nốt thấp
  const playNoMatchSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Note 1: E2 (82.41 Hz) - "BÚM"
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      osc1.type = 'triangle'; // Triangle wave cho âm ấm hơn
      osc1.frequency.value = 82.41; // E2
      gain1.gain.setValueAtTime(0.25, audioContext.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      osc1.start(audioContext.currentTime);
      osc1.stop(audioContext.currentTime + 0.2);

      // Note 2: C2 (65.41 Hz) - "BÙM" (thấp hơn)
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.type = 'triangle';
      osc2.frequency.value = 65.41; // C2
      gain2.gain.setValueAtTime(0.25, audioContext.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.32);
      osc2.start(audioContext.currentTime + 0.12);
      osc2.stop(audioContext.currentTime + 0.32);
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  };

  // Âm thanh chiến thắng - Melody vui vẻ
  const playVictorySound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Victory melody: C5-E5-G5-C6 (ascending happy tune)
      const notes = [
        { freq: 523.25, start: 0, duration: 0.15 },      // C5
        { freq: 659.25, start: 0.15, duration: 0.15 },   // E5
        { freq: 783.99, start: 0.3, duration: 0.15 },    // G5
        { freq: 1046.50, start: 0.45, duration: 0.4 },   // C6 (longer)
      ];

      notes.forEach(note => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.type = 'sine';
        osc.frequency.value = note.freq;

        const startTime = audioContext.currentTime + note.start;
        const endTime = startTime + note.duration;

        gain.gain.setValueAtTime(0.35, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, endTime);
        osc.start(startTime);
        osc.stop(endTime);
      });
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  };

  // ============================================
  // BACKGROUND MUSIC
  // ============================================

  const startBackgroundMusic = () => {
    try {
      // Try to load background music from public/sounds/background.mp3
      const audio = new Audio('/sounds/background.mp3');
      audio.loop = true;
      audio.volume = 0.3; // 30% volume

      // Play with user interaction (required by browsers)
      audio.play().catch(err => {
        console.log('Background music autoplay blocked:', err);
        console.log('📢 Hướng dẫn: Thêm file nhạc nền vào public/sounds/background.mp3');
      });

      bgMusicRef.current = audio;
    } catch (error) {
      console.log('Background music not available:', error);
    }
  };

  const stopBackgroundMusic = () => {
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
      bgMusicRef.current.currentTime = 0;
    }
  };

  // ============================================
  // SELECT LEVEL & INITIALIZE GAME
  // ============================================
  const selectLevel = (levelConfig) => {
    setCurrentLevel(levelConfig);
    setStartTime(Date.now());
    initializeGame(levelConfig.pairs);
    startBackgroundMusic(); // Bắt đầu nhạc nền khi chọn level
  };

  const initializeGame = (pairCount) => {
    let gamePairs;
    if (propPairs) {
      gamePairs = propPairs.slice(0, pairCount);
    } else {
      gamePairs = allSamplePairs.slice(0, pairCount);
    }

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

    const shuffled = shuffleArray(newCards);
    setCards(shuffled);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setScore(0);
    setMoves(0);
    setGameComplete(false);
    setEndTime(null);
  };

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

    if (card1.pairId === card2.pairId) {
      // MATCH! Play "TING TING"
      playMatchSound();

      setTimeout(() => {
        const newCards = [...cards];
        newCards[index1].isMatched = true;
        newCards[index2].isMatched = true;
        setCards(newCards);

        const newMatchedPairs = [...matchedPairs, card1.pairId];
        setMatchedPairs(newMatchedPairs);

        const newScore = score + 100;
        setScore(newScore);

        setFlippedIndices([]);
        setIsChecking(false);

        // Check game complete
        if (newMatchedPairs.length === currentLevel.pairs) {
          setTimeout(() => {
            setEndTime(Date.now());
            setGameComplete(true);
            stopBackgroundMusic(); // Dừng nhạc nền
            playVictorySound(); // Phát nhạc chiến thắng
          }, 500);
        }
      }, 600);
    } else {
      // NO MATCH - Play "BÚM BÙM"
      playNoMatchSound();

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
    stopBackgroundMusic();
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
    startBackgroundMusic(); // Restart nhạc nền
  };

  // ============================================
  // CLEANUP ON UNMOUNT
  // ============================================
  useEffect(() => {
    return () => {
      stopBackgroundMusic();
    };
  }, []);

  // ============================================
  // CALCULATE TIME
  // ============================================
  const getPlayTime = () => {
    if (!startTime) return 0;
    const end = endTime || Date.now();
    return Math.floor((end - startTime) / 1000);
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
                {/* Card Back - Phân biệt câu hỏi và trả lời */}
                <div className={`card-back card-back-${card.type}`}>
                  <div className="card-back-content">
                    <span className="card-back-icon">
                      {card.type === 'question' ? '❓' : '✓'}
                    </span>
                    <span className="card-back-label">
                      {card.type === 'question' ? 'Câu hỏi' : 'Trả lời'}
                    </span>
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
