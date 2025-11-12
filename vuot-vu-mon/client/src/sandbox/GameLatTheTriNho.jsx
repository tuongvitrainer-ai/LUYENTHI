import React, { useState, useEffect } from 'react';
import './GameLatTheTriNho.css';

const GameLatTheTriNho = ({ pairs: propPairs }) => {
  // ============================================
  // SAMPLE DATA (nếu không có props)
  // ============================================
  const samplePairs = [
    { id: 1, q: "5 × 3", a: "15" },
    { id: 2, q: "7 × 2", a: "14" },
    { id: 3, q: "Cat", a: "Con mèo" },
    { id: 4, q: "Dog", a: "Con chó" },
  ];

  const pairs = propPairs || samplePairs;

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // ============================================
  // INITIALIZE GAME
  // ============================================
  useEffect(() => {
    initializeGame();
  }, [pairs]);

  const initializeGame = () => {
    // Tạo 2 thẻ cho mỗi cặp
    const newCards = [];
    pairs.forEach((pair) => {
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
      // MATCH!
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
        if (newMatchedPairs.length === pairs.length) {
          setTimeout(() => {
            setGameComplete(true);
          }, 500);
        }
      }, 600);
    } else {
      // NO MATCH - úp lại sau 1 giây
      setTimeout(() => {
        setFlippedIndices([]);
        setIsChecking(false);
      }, 1000);
    }
  };

  // ============================================
  // HANDLE RESTART
  // ============================================
  const handleRestart = () => {
    initializeGame();
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="game-lat-the-tri-nho">
      {/* Header */}
      <div className="game-header">
        <h1>🎮 LẬT THẺ TRÍ NHỚ</h1>
        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">Điểm:</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Lượt chơi:</span>
            <span className="stat-value">{moves}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Cặp tìm được:</span>
            <span className="stat-value">{matchedPairs.length}/{pairs.length}</span>
          </div>
        </div>
        <button className="btn-restart" onClick={handleRestart}>
          🔄 Chơi lại
        </button>
      </div>

      {/* Game Board */}
      <div className="game-board">
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
            <div className="popup-stats">
              <p className="popup-score">
                Điểm số: <strong>{score}</strong>
              </p>
              <p className="popup-moves">
                Lượt chơi: <strong>{moves}</strong>
              </p>
              <p className="popup-accuracy">
                Độ chính xác: <strong>{Math.round((pairs.length / moves) * 100)}%</strong>
              </p>
            </div>
            <div className="popup-message">
              <p>🌟 Xin chúc mừng, bạn nhận được <strong>5 Sao</strong>!</p>
              <p>Hãy đăng nhập để lưu điểm và đổi thưởng nhé ^^</p>
            </div>
            <div className="popup-buttons">
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
