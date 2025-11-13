import React, { useState, useEffect, useRef } from 'react';
import './BangCuuChuong1.css';

const BangCuuChuong1 = () => {
  // ============================================
  // GAME STATES
  // ============================================
  const [gameState, setGameState] = useState('mode-select'); // mode-select, table-select, speed-select, playing, game-over
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null); // 2-9
  const [selectedSpeed, setSelectedSpeed] = useState(3); // 1-10
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [balloons, setBalloons] = useState([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3); // For survival mode
  const [powerUps, setPowerUps] = useState([]);
  const [activePowerUp, setActivePowerUp] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [lastAnswer, setLastAnswer] = useState(null);

  const gameAreaRef = useRef(null);
  const animationFrameRef = useRef(null);

  // ============================================
  // GAME MODES CONFIGURATION
  // ============================================
  const GAME_MODES = [
    {
      id: 'practice',
      name: '🎓 Luyện Tập',
      description: 'Không giới hạn thời gian, học thoải mái',
      features: ['Không bị Game Over', 'Có giải thích khi sai', 'Phù hợp cho người mới']
    },
    {
      id: 'challenge',
      name: '🏆 Thử Thách',
      description: 'Thi đấu với thời gian, tranh top cao thủ',
      features: ['Có điểm số', 'Lưu bảng xếp hạng', 'Nhận sao thưởng ⭐']
    },
    {
      id: 'survival',
      name: '💖 Sinh Tồn',
      description: 'Chỉ có 3 mạng, cẩn thận kẻo thua!',
      features: ['3 mạng sống', 'Sai 3 lần → Game Over', 'Chơi 9 bảng liên tục']
    },
    {
      id: 'mixed',
      name: '🎲 Trộn Lẫn',
      description: 'Câu hỏi từ nhiều bảng cửu chương',
      features: ['Ngẫu nhiên 2-9', 'Khó đoán', 'Thử thách trí nhớ']
    }
  ];

  // ============================================
  // MULTIPLICATION TABLES
  // ============================================
  const TABLES = [2, 3, 4, 5, 6, 7, 8, 9];

  const TABLE_EMOJIS = {
    2: '🌱', 3: '🌿', 4: '🌳', 5: '🌺',
    6: '🌸', 7: '🌻', 8: '🌹', 9: '🌷'
  };

  // ============================================
  // POWER-UPS
  // ============================================
  const POWER_UP_TYPES = [
    { id: 'slow', icon: '⏰', name: 'Làm Chậm', description: 'Làm chậm bong bóng 3s' },
    { id: 'eliminate', icon: '💣', name: 'Nổ Sai', description: 'Loại 2 đáp án sai' },
    { id: 'double', icon: '⭐', name: 'x2 Điểm', description: 'Nhân đôi điểm câu sau' }
  ];

  // ============================================
  // GENERATE QUESTIONS
  // ============================================
  const generateQuestions = (table) => {
    const qs = [];
    for (let i = 1; i <= 9; i++) {
      qs.push({
        multiplicand: table,
        multiplier: i,
        answer: table * i
      });
    }
    // Shuffle questions
    return qs.sort(() => Math.random() - 0.5);
  };

  const generateMixedQuestions = () => {
    const qs = [];
    for (let table = 2; table <= 9; table++) {
      for (let i = 1; i <= 9; i++) {
        qs.push({
          multiplicand: table,
          multiplier: i,
          answer: table * i
        });
      }
    }
    // Shuffle and take random 20 questions
    return qs.sort(() => Math.random() - 0.5).slice(0, 20);
  };

  // ============================================
  // GENERATE WRONG ANSWERS
  // ============================================
  const generateWrongAnswers = (correctAnswer, count) => {
    const wrongs = new Set();
    const variations = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 10, -10];

    while (wrongs.size < count) {
      const variation = variations[Math.floor(Math.random() * variations.length)];
      const wrong = correctAnswer + variation;
      if (wrong > 0 && wrong !== correctAnswer && wrong <= 81) {
        wrongs.add(wrong);
      }
    }

    return Array.from(wrongs);
  };

  // ============================================
  // START GAME
  // ============================================
  const startGame = () => {
    let qs;
    if (selectedMode === 'mixed') {
      qs = generateMixedQuestions();
    } else if (selectedMode === 'survival') {
      // For survival, we'll play through tables 2-9
      qs = [];
      for (let table = 2; table <= 9; table++) {
        qs = qs.concat(generateQuestions(table));
      }
    } else {
      qs = generateQuestions(selectedTable);
    }

    setQuestions(qs);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCombo(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setLives(3);
    setPowerUps([]);
    setActivePowerUp(null);
    setGameComplete(false);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setGameState('playing');
  };

  // ============================================
  // SPAWN BALLOONS FOR CURRENT QUESTION
  // ============================================
  useEffect(() => {
    if (gameState === 'playing' && questions.length > 0 && currentQuestionIndex < questions.length) {
      spawnBalloons();
    }
  }, [currentQuestionIndex, gameState, questions]);

  const spawnBalloons = () => {
    const currentQ = questions[currentQuestionIndex];
    const correctAnswer = currentQ.answer;

    // Random number of balloons (4-6)
    const balloonCount = Math.floor(Math.random() * 3) + 4; // 4, 5, or 6
    const wrongCount = balloonCount - 1;
    const wrongAnswers = generateWrongAnswers(correctAnswer, wrongCount);

    const allAnswers = [correctAnswer, ...wrongAnswers];
    // Shuffle answers
    const shuffled = allAnswers.sort(() => Math.random() - 0.5);

    const newBalloons = shuffled.map((answer, index) => ({
      id: `balloon-${currentQuestionIndex}-${index}`,
      answer,
      isCorrect: answer === correctAnswer,
      x: (100 / (balloonCount + 1)) * (index + 1), // Distribute evenly
      y: 100, // Start at bottom
      speed: selectedSpeed * 0.5, // Base speed
      color: getRandomBalloonColor(),
      popped: false
    }));

    setBalloons(newBalloons);
  };

  const getRandomBalloonColor = () => {
    const colors = [
      '#FFB5E8', '#FF9CEE', '#FFCCF9', '#FCC2FF', // Pink shades
      '#B5DEFF', '#A0E7E5', '#B4F8C8', '#C7CEEA', // Blue/green shades
      '#FFD6A5', '#FDFFB6', '#CAFFBF'  // Yellow/peach shades
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // ============================================
  // BALLOON ANIMATION
  // ============================================
  useEffect(() => {
    if (gameState === 'playing' && balloons.length > 0) {
      const animate = () => {
        setBalloons(prevBalloons => {
          const updated = prevBalloons.map(balloon => {
            if (balloon.popped) return balloon;

            // Apply slow power-up effect
            const effectiveSpeed = activePowerUp === 'slow' ? balloon.speed * 0.3 : balloon.speed;

            return {
              ...balloon,
              y: balloon.y - effectiveSpeed
            };
          });

          // Check if any balloon reached the finish line (y <= 20)
          const reachedTop = updated.some(b => !b.popped && b.y <= 20);
          if (reachedTop) {
            handleBalloonReachedTop();
            return updated.map(b => ({ ...b, popped: true }));
          }

          return updated;
        });

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [gameState, balloons.length, activePowerUp, selectedSpeed]);

  // ============================================
  // HANDLE BALLOON CLICK
  // ============================================
  const handleBalloonClick = (balloon) => {
    if (balloon.popped) return;

    // Pop the clicked balloon
    setBalloons(prev => prev.map(b =>
      b.id === balloon.id ? { ...b, popped: true } : b
    ));

    if (balloon.isCorrect) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer(balloon.answer);
    }
  };

  const handleCorrectAnswer = () => {
    const questionTime = Date.now() - questionStartTime;
    const timeBonus = questionTime < 3000 ? 5 : 0;

    // Calculate combo multiplier
    const newCombo = combo + 1;
    let comboMultiplier = 1;
    if (newCombo >= 3 && newCombo < 6) comboMultiplier = 1.5;
    else if (newCombo >= 6 && newCombo < 9) comboMultiplier = 2;
    else if (newCombo >= 9) comboMultiplier = 2.5;

    // Apply double points power-up
    const doubleMultiplier = activePowerUp === 'double' ? 2 : 1;

    const points = Math.round((10 + timeBonus) * comboMultiplier * doubleMultiplier);

    setScore(prev => prev + points);
    setCombo(newCombo);
    setCorrectAnswers(prev => prev + 1);

    // Award power-up after 3 correct in a row
    if (newCombo % 3 === 0 && newCombo > 0) {
      const randomPowerUp = POWER_UP_TYPES[Math.floor(Math.random() * POWER_UP_TYPES.length)];
      setPowerUps(prev => [...prev, randomPowerUp]);
    }

    // Clear active double power-up after use
    if (activePowerUp === 'double') {
      setActivePowerUp(null);
    }

    // Play sound (would be implemented with audio)
    console.log('✅ Correct! +' + points + ' points');

    // Move to next question
    nextQuestion();
  };

  const handleWrongAnswer = (selectedAnswer) => {
    const currentQ = questions[currentQuestionIndex];

    setCombo(0);
    setWrongAnswers(prev => prev + 1);
    setLastAnswer({ selected: selectedAnswer, correct: currentQ.answer });

    // In practice mode, show explanation
    if (selectedMode === 'practice') {
      setShowExplanation(true);
      setTimeout(() => {
        setShowExplanation(false);
        nextQuestion();
      }, 3000);
    } else {
      // In survival mode, lose a life
      if (selectedMode === 'survival') {
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
          endGame();
          return;
        }
      }

      nextQuestion();
    }

    console.log('❌ Wrong!');
  };

  const handleBalloonReachedTop = () => {
    // Same as wrong answer
    const currentQ = questions[currentQuestionIndex];

    setCombo(0);
    setWrongAnswers(prev => prev + 1);
    setLastAnswer({ selected: 'Không chọn', correct: currentQ.answer });

    if (selectedMode === 'survival') {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        endGame();
        return;
      }
    }

    console.log('💥 Balloon reached top!');
    nextQuestion();
  };

  const nextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= questions.length) {
      endGame();
    } else {
      setCurrentQuestionIndex(nextIndex);
      setQuestionStartTime(Date.now());
      setBalloons([]);
    }
  };

  const endGame = () => {
    setEndTime(Date.now());
    setGameComplete(true);
    setGameState('game-over');

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // ============================================
  // POWER-UP USAGE
  // ============================================
  const usePowerUp = (powerUp) => {
    if (powerUps.length === 0) return;

    // Remove power-up from inventory
    setPowerUps(prev => {
      const index = prev.findIndex(p => p.id === powerUp.id);
      if (index !== -1) {
        const newPowerUps = [...prev];
        newPowerUps.splice(index, 1);
        return newPowerUps;
      }
      return prev;
    });

    if (powerUp.id === 'slow') {
      setActivePowerUp('slow');
      setTimeout(() => setActivePowerUp(null), 3000);
    } else if (powerUp.id === 'eliminate') {
      // Eliminate 2 wrong balloons
      const wrongBalloons = balloons.filter(b => !b.isCorrect && !b.popped);
      if (wrongBalloons.length >= 2) {
        const toEliminate = wrongBalloons.slice(0, 2);
        setBalloons(prev => prev.map(b => {
          if (toEliminate.find(tb => tb.id === b.id)) {
            return { ...b, popped: true };
          }
          return b;
        }));
      }
    } else if (powerUp.id === 'double') {
      setActivePowerUp('double');
    }
  };

  // ============================================
  // CALCULATE STARS
  // ============================================
  const calculateStars = () => {
    const accuracy = questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;

    if (accuracy >= 90) return 10;
    if (accuracy >= 80) return 9;
    if (accuracy >= 70) return 8;
    if (accuracy >= 60) return 7;
    if (accuracy >= 50) return 6;
    if (accuracy >= 40) return 5;
    if (accuracy >= 30) return 4;
    if (accuracy >= 20) return 3;
    if (accuracy >= 10) return 2;
    return 1;
  };

  const getPlayTime = () => {
    if (!startTime || !endTime) return 0;
    return Math.floor((endTime - startTime) / 1000);
  };

  // ============================================
  // RENDER: MODE SELECT SCREEN
  // ============================================
  if (gameState === 'mode-select') {
    return (
      <div className="game-bay-len-toan-hoc">
        <div className="mode-select-screen">
          <div className="game-mascot">🎈</div>
          <h1 className="game-main-title">🎈 Bay Lên Toán Học 🎈</h1>
          <p className="game-subtitle">Chọn chế độ chơi để bắt đầu</p>

          <div className="modes-grid">
            {GAME_MODES.map(mode => (
              <div
                key={mode.id}
                className="mode-card"
                onClick={() => {
                  setSelectedMode(mode.id);
                  setGameState(mode.id === 'mixed' || mode.id === 'survival' ? 'speed-select' : 'table-select');
                }}
              >
                <h2 className="mode-name">{mode.name}</h2>
                <p className="mode-description">{mode.description}</p>
                <ul className="mode-features">
                  {mode.features.map((feature, idx) => (
                    <li key={idx}>✓ {feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: TABLE SELECT SCREEN
  // ============================================
  if (gameState === 'table-select') {
    return (
      <div className="game-bay-len-toan-hoc">
        <div className="table-select-screen">
          <button className="btn-back-game" onClick={() => setGameState('mode-select')}>
            ← Quay lại
          </button>

          <h1 className="screen-title">Chọn Bảng Cửu Chương</h1>
          <p className="screen-subtitle">Bạn muốn luyện bảng nào? 🤔</p>

          <div className="tables-grid">
            {TABLES.map(table => (
              <button
                key={table}
                className="table-btn"
                onClick={() => {
                  setSelectedTable(table);
                  setGameState('speed-select');
                }}
              >
                <span className="table-emoji">{TABLE_EMOJIS[table]}</span>
                <span className="table-number">Bảng {table}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: SPEED SELECT SCREEN
  // ============================================
  if (gameState === 'speed-select') {
    return (
      <div className="game-bay-len-toan-hoc">
        <div className="speed-select-screen">
          <button className="btn-back-game" onClick={() => {
            if (selectedMode === 'mixed' || selectedMode === 'survival') {
              setGameState('mode-select');
            } else {
              setGameState('table-select');
            }
          }}>
            ← Quay lại
          </button>

          <h1 className="screen-title">Chọn Tốc Độ</h1>
          <p className="screen-subtitle">Bong bóng bay nhanh thế nào? 🎈</p>

          <div className="speed-slider-container">
            <div className="speed-labels">
              <span>🐌 Chậm</span>
              <span>🚀 Nhanh</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={selectedSpeed}
              onChange={(e) => setSelectedSpeed(Number(e.target.value))}
              className="speed-slider"
            />
            <div className="speed-value">Tốc độ: {selectedSpeed}</div>
          </div>

          <button className="btn-start-game" onClick={startGame}>
            🎮 Bắt Đầu Chơi
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: GAME PLAYING SCREEN
  // ============================================
  if (gameState === 'playing') {
    const currentQ = questions[currentQuestionIndex];

    return (
      <div className="game-bay-len-toan-hoc">
        <div className="game-playing-screen" ref={gameAreaRef}>
          {/* Header */}
          <div className="game-header-play">
            <div className="header-left">
              <button className="btn-back-small" onClick={() => {
                if (window.confirm('Bạn có chắc muốn thoát? Tiến trình sẽ không được lưu.')) {
                  setGameState('mode-select');
                }
              }}>
                ← Menu
              </button>
            </div>

            <div className="header-center">
              <div className="game-info">
                <span className="info-item">📊 Điểm: <strong>{score}</strong></span>
                <span className="info-item">🔥 Combo: <strong>x{combo}</strong></span>
                {selectedMode === 'survival' && (
                  <span className="info-item">💖 Mạng: <strong>{lives}</strong></span>
                )}
                <span className="info-item">
                  📝 Câu: <strong>{currentQuestionIndex + 1}/{questions.length}</strong>
                </span>
              </div>
            </div>

            <div className="header-right">
              <div className="mascot-cheerleader">🎈</div>
            </div>
          </div>

          {/* Question Display */}
          <div className="question-display">
            <div className="question-box">
              <span className="question-text">
                {currentQ.multiplicand} × {currentQ.multiplier} = ?
              </span>
            </div>
          </div>

          {/* Finish Line */}
          <div className="finish-line"></div>

          {/* Power-ups Bar */}
          {powerUps.length > 0 && (
            <div className="power-ups-bar">
              <span className="power-ups-label">Power-ups:</span>
              {powerUps.map((pu, idx) => (
                <button
                  key={idx}
                  className="power-up-btn"
                  onClick={() => usePowerUp(pu)}
                  title={pu.description}
                >
                  {pu.icon}
                </button>
              ))}
            </div>
          )}

          {/* Active Power-up Indicator */}
          {activePowerUp && (
            <div className="active-powerup-indicator">
              {activePowerUp === 'slow' && '⏰ Làm chậm đang kích hoạt!'}
              {activePowerUp === 'double' && '⭐ Điểm x2 cho câu tiếp theo!'}
            </div>
          )}

          {/* Balloons */}
          <div className="balloons-container">
            {balloons.map(balloon => (
              <div
                key={balloon.id}
                className={`balloon ${balloon.popped ? 'popped' : ''}`}
                style={{
                  left: `${balloon.x}%`,
                  bottom: `${balloon.y}%`,
                  backgroundColor: balloon.color
                }}
                onClick={() => handleBalloonClick(balloon)}
              >
                <div className="balloon-answer">{balloon.answer}</div>
                <div className="balloon-string"></div>
              </div>
            ))}
          </div>

          {/* Explanation (Practice Mode) */}
          {showExplanation && lastAnswer && (
            <div className="explanation-popup">
              <div className="explanation-content">
                <h3>❌ Sai rồi!</h3>
                <p>Bạn chọn: <strong>{lastAnswer.selected}</strong></p>
                <p>Đáp án đúng: <strong>{lastAnswer.correct}</strong></p>
                <p className="explanation-text">
                  {currentQ.multiplicand} × {currentQ.multiplier} = {currentQ.answer}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: GAME OVER SCREEN
  // ============================================
  if (gameState === 'game-over') {
    const stars = calculateStars();
    const accuracy = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;
    const playTime = getPlayTime();

    return (
      <div className="game-bay-len-toan-hoc">
        <div className="game-over-screen">
          <div className="game-over-popup">
            <div className="popup-icon-large">🎉</div>
            <h1 className="popup-title">Hoàn Thành!</h1>

            <div className="game-stats">
              <div className="stat-row">
                <span className="stat-label">Điểm số:</span>
                <span className="stat-value">{score}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Độ chính xác:</span>
                <span className="stat-value">{accuracy}%</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Đúng / Sai:</span>
                <span className="stat-value">{correctAnswers} / {wrongAnswers}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Thời gian:</span>
                <span className="stat-value">{playTime}s</span>
              </div>
            </div>

            <div className="stars-earned">
              <p className="stars-label">Bạn nhận được:</p>
              <div className="stars-display">
                {Array.from({ length: stars }).map((_, idx) => (
                  <span key={idx} className="star-icon">⭐</span>
                ))}
              </div>
              <p className="stars-count">{stars} Sao!</p>
            </div>

            {selectedMode === 'challenge' && (
              <div className="login-prompt">
                <p>🎁 Đăng nhập để lưu điểm và nhận sao vào ví!</p>
              </div>
            )}

            <div className="game-over-buttons">
              <button className="btn-menu" onClick={() => setGameState('mode-select')}>
                ← Menu
              </button>
              <button className="btn-play-again" onClick={() => {
                if (selectedMode === 'mixed' || selectedMode === 'survival') {
                  setGameState('speed-select');
                } else {
                  setGameState('table-select');
                }
              }}>
                🔄 Chơi Lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default BangCuuChuong1;
