import React, { useState, useEffect, useRef } from 'react';
import { gameAPI } from '../../../services/api';
import './GameLatTheTriNho.css';

const GameLatTheTriNho = ({ pairs: propPairs }) => {
  // ============================================
  // VOCABULARY DATA - Từ vựng tiếng Anh lớp 3
  // ============================================
  const vocabularyPool = [
    { id: 'v1', q: "Cat", a: "Con mèo" },
    { id: 'v2', q: "Dog", a: "Con chó" },
    { id: 'v3', q: "Bird", a: "Con chim" },
    { id: 'v4', q: "Fish", a: "Con cá" },
    { id: 'v5', q: "Apple", a: "Quả táo" },
    { id: 'v6', q: "Book", a: "Quyển sách" },
    { id: 'v7', q: "Tree", a: "Cái cây" },
    { id: 'v8', q: "Sun", a: "Mặt trời" },
    { id: 'v9', q: "Moon", a: "Mặt trăng" },
    { id: 'v10', q: "Star", a: "Ngôi sao" },
    { id: 'v11', q: "Water", a: "Nước" },
    { id: 'v12', q: "House", a: "Ngôi nhà" },
    { id: 'v13', q: "Car", a: "Xe hơi" },
    { id: 'v14', q: "Pen", a: "Bút viết" },
    { id: 'v15', q: "Ball", a: "Quả bóng" },
    { id: 'v16', q: "Red", a: "Màu đỏ" },
    { id: 'v17', q: "Blue", a: "Màu xanh" },
    { id: 'v18', q: "Green", a: "Màu xanh lá" },
    { id: 'v19', q: "Yellow", a: "Màu vàng" },
    { id: 'v20', q: "One", a: "Số một" },
    { id: 'v21', q: "Two", a: "Số hai" },
    { id: 'v22', q: "Three", a: "Số ba" },
    { id: 'v23', q: "Four", a: "Số bốn" },
    { id: 'v24', q: "Five", a: "Số năm" },
    { id: 'v25', q: "Hand", a: "Bàn tay" },
    { id: 'v26', q: "Foot", a: "Bàn chân" },
    { id: 'v27', q: "Head", a: "Đầu" },
    { id: 'v28', q: "Eye", a: "Mắt" },
    { id: 'v29', q: "Ear", a: "Tai" },
    { id: 'v30', q: "Nose", a: "Mũi" },
    { id: 'v31', q: "Mouth", a: "Miệng" },
    { id: 'v32', q: "Happy", a: "Vui vẻ" },
    { id: 'v33', q: "Sad", a: "Buồn" },
    { id: 'v34', q: "Big", a: "To" },
    { id: 'v35', q: "Small", a: "Nhỏ" },
    { id: 'v36', q: "Hot", a: "Nóng" },
    { id: 'v37', q: "Cold", a: "Lạnh" },
    { id: 'v38', q: "Good", a: "Tốt" },
    { id: 'v39', q: "Bad", a: "Xấu" },
    { id: 'v40', q: "Boy", a: "Con trai" },
    { id: 'v41', q: "Girl", a: "Con gái" },
    { id: 'v42', q: "Mother", a: "Mẹ" },
    { id: 'v43', q: "Father", a: "Bố" },
    { id: 'v44', q: "Teacher", a: "Giáo viên" },
    { id: 'v45', q: "Student", a: "Học sinh" },
    { id: 'v46', q: "Friend", a: "Bạn bè" },
    { id: 'v47', q: "Flower", a: "Hoa" },
    { id: 'v48', q: "Rain", a: "Mưa" },
    { id: 'v49', q: "Wind", a: "Gió" },
    { id: 'v50', q: "Cloud", a: "Mây" },
  ];

  // ============================================
  // MATH PROBLEM GENERATORS
  // ============================================
  const generateAdditionProblems = (count) => {
    const problems = [];
    const used = new Set();
    let id = 1;

    while (problems.length < count) {
      const a = Math.floor(Math.random() * 11) + 10; // 10-20
      const b = Math.floor(Math.random() * 10) + 1;   // 1-10
      const key = `${a}+${b}`;

      if (!used.has(key)) {
        used.add(key);
        problems.push({
          id: `add${id++}`,
          q: `${a} + ${b}`,
          a: `${a + b}`
        });
      }
    }
    return problems;
  };

  const generateSubtractionProblems = (count) => {
    const problems = [];
    const used = new Set();
    let id = 1;

    while (problems.length < count) {
      const a = Math.floor(Math.random() * 11) + 10; // 10-20
      const b = Math.floor(Math.random() * a) + 1;   // 1 to a
      const key = `${a}-${b}`;

      if (!used.has(key)) {
        used.add(key);
        problems.push({
          id: `sub${id++}`,
          q: `${a} − ${b}`,
          a: `${a - b}`
        });
      }
    }
    return problems;
  };

  const generateMultiplicationProblems = (count) => {
    const problems = [];
    const used = new Set();
    let id = 1;

    while (problems.length < count) {
      const a = Math.floor(Math.random() * 10) + 1; // 1-10
      const b = Math.floor(Math.random() * 10) + 1; // 1-10
      const key = `${a}×${b}`;

      if (!used.has(key)) {
        used.add(key);
        problems.push({
          id: `mul${id++}`,
          q: `${a} × ${b}`,
          a: `${a * b}`
        });
      }
    }
    return problems;
  };

  const generateDivisionProblems = (count) => {
    const problems = [];
    const used = new Set();
    let id = 1;

    while (problems.length < count) {
      const b = Math.floor(Math.random() * 9) + 2; // 2-10
      const result = Math.floor(Math.random() * 10) + 1; // 1-10
      const a = b * result;
      const key = `${a}÷${b}`;

      if (!used.has(key)) {
        used.add(key);
        problems.push({
          id: `div${id++}`,
          q: `${a} ÷ ${b}`,
          a: `${result}`
        });
      }
    }
    return problems;
  };

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
  const [isDifferentiateMode, setIsDifferentiateMode] = useState(false);
  const [bgMusicVolume, setBgMusicVolume] = useState(0.3);
  const [selectedMathTypes, setSelectedMathTypes] = useState({
    addition: false,
    subtraction: false,
    multiplication: false,
    division: false
  });
  const [starsEarned, setStarsEarned] = useState(0);
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);

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
      audio.volume = bgMusicVolume;

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

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setBgMusicVolume(newVolume);
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = newVolume;
    }
  };

  // ============================================
  // SUBMIT GAME RESULT TO API
  // ============================================
  const submitGameResult = async (finalScore, playTime, accuracy) => {
    try {
      setIsSubmittingResult(true);

      const response = await gameAPI.submitResult({
        exam_type: 'memory_card',
        score: finalScore,
        details_json: {
          level: currentLevel.level,
          pairs: currentLevel.pairs,
          moves: moves,
          time_seconds: playTime,
          accuracy_percent: accuracy,
          math_types_selected: selectedMathTypes,
          differentiate_mode: isDifferentiateMode
        }
      });

      if (response.data && response.data.success) {
        // Lưu số sao nhận được
        setStarsEarned(response.data.data.stars_earned || 0);
      }
    } catch (error) {
      console.error('Failed to submit game result:', error);
      // Game vẫn hiển thị kết quả ngay cả khi API fail
      setStarsEarned(0);
    } finally {
      setIsSubmittingResult(false);
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
      // Generate pairs based on selected math types
      const mathTypes = [];
      if (selectedMathTypes.addition) mathTypes.push('addition');
      if (selectedMathTypes.subtraction) mathTypes.push('subtraction');
      if (selectedMathTypes.multiplication) mathTypes.push('multiplication');
      if (selectedMathTypes.division) mathTypes.push('division');

      let allPairs = [];

      // Nếu có chọn loại toán, mix vocab + math
      if (mathTypes.length > 0) {
        // Tính toán số lượng mỗi loại
        const mathProblemsPerType = Math.ceil(pairCount / 2 / mathTypes.length);
        const vocabCount = Math.max(2, pairCount - (mathProblemsPerType * mathTypes.length));

        // Lấy từ vựng
        const shuffledVocab = shuffleArray([...vocabularyPool]);
        allPairs = shuffledVocab.slice(0, vocabCount);

        // Thêm bài toán
        mathTypes.forEach(type => {
          if (type === 'addition') {
            allPairs = allPairs.concat(generateAdditionProblems(mathProblemsPerType));
          } else if (type === 'subtraction') {
            allPairs = allPairs.concat(generateSubtractionProblems(mathProblemsPerType));
          } else if (type === 'multiplication') {
            allPairs = allPairs.concat(generateMultiplicationProblems(mathProblemsPerType));
          } else if (type === 'division') {
            allPairs = allPairs.concat(generateDivisionProblems(mathProblemsPerType));
          }
        });

        // Shuffle và lấy đúng số lượng cần thiết
        allPairs = shuffleArray(allPairs).slice(0, pairCount);
      } else {
        // Chỉ dùng từ vựng (mặc định)
        const shuffledVocab = shuffleArray([...vocabularyPool]);
        allPairs = shuffledVocab.slice(0, pairCount);
      }

      gamePairs = allPairs;
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
          setTimeout(async () => {
            const endTime = Date.now();
            setEndTime(endTime);
            stopBackgroundMusic(); // Dừng nhạc nền
            playVictorySound(); // Phát nhạc chiến thắng

            // Calculate final stats
            const playTime = Math.floor((endTime - startTime) / 1000);
            const accuracy = Math.round((currentLevel.pairs / (moves + 1)) * 100);

            // Submit result to API
            await submitGameResult(newScore, playTime, accuracy);

            // Show completion popup
            setGameComplete(true);
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

          <div className="math-types-section">
            <p className="math-types-title">Thêm đặc tính độ khó (tùy chọn):</p>
            <div className="math-types-checkboxes">
              <label className="math-type-checkbox">
                <input
                  type="checkbox"
                  checked={selectedMathTypes.addition}
                  onChange={(e) => setSelectedMathTypes({...selectedMathTypes, addition: e.target.checked})}
                />
                <span className="checkbox-label">➕ Toán cộng</span>
              </label>
              <label className="math-type-checkbox">
                <input
                  type="checkbox"
                  checked={selectedMathTypes.subtraction}
                  onChange={(e) => setSelectedMathTypes({...selectedMathTypes, subtraction: e.target.checked})}
                />
                <span className="checkbox-label">➖ Toán trừ</span>
              </label>
              <label className="math-type-checkbox">
                <input
                  type="checkbox"
                  checked={selectedMathTypes.multiplication}
                  onChange={(e) => setSelectedMathTypes({...selectedMathTypes, multiplication: e.target.checked})}
                />
                <span className="checkbox-label">✖️ Toán nhân</span>
              </label>
              <label className="math-type-checkbox">
                <input
                  type="checkbox"
                  checked={selectedMathTypes.division}
                  onChange={(e) => setSelectedMathTypes({...selectedMathTypes, division: e.target.checked})}
                />
                <span className="checkbox-label">➗ Toán chia</span>
              </label>
            </div>
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
        <div className="differentiate-switch-container">
          <label className="switch-label">Phân biệt</label>
          <label className="switch">
            <input
              type="checkbox"
              checked={isDifferentiateMode}
              onChange={() => setIsDifferentiateMode(!isDifferentiateMode)}
            />
            <span className="slider"></span>
          </label>
          <span className="switch-status">{isDifferentiateMode ? 'ON' : 'OFF'}</span>
        </div>
        <div className="volume-control-container">
          <label className="volume-label">🔊 Nhạc</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={bgMusicVolume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
          <span className="volume-value">{Math.round(bgMusicVolume * 100)}%</span>
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
                {/* Card Back - Có thể bật/tắt chế độ phân biệt */}
                <div className="card-back card-back-default">
                  <div className="card-back-content">
                    <span className="card-back-icon">
                      {isDifferentiateMode
                        ? (card.type === 'question' ? '❓' : '✓')
                        : '🎴'
                      }
                    </span>
                  </div>
                </div>

                {/* Card Front */}
                <div className="card-front">
                  <div className="card-front-content">
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
              {starsEarned > 0 ? (
                <p>🌟 Xin chúc mừng, bạn nhận được <strong>{starsEarned} Sao</strong>!</p>
              ) : (
                <p>🎉 Xin chúc mừng, bạn đã hoàn thành!</p>
              )}
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
