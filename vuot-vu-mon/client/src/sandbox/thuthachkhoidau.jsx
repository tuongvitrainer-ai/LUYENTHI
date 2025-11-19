import React, { useState, useEffect } from 'react';
import './thuthachkhoidau.css';

// Mock data - 15 câu hỏi phân bổ đều cho lớp 3
const MOCK_QUESTIONS = [
  // Toán học - 4 câu
  {
    id: 1,
    subject: 'math',
    topic: 'Phép cộng',
    question: '125 + 378 = ?',
    options: ['493', '503', '513', '523'],
    correctAnswer: 1
  },
  {
    id: 2,
    subject: 'math',
    topic: 'Phép trừ',
    question: '500 - 247 = ?',
    options: ['253', '263', '243', '273'],
    correctAnswer: 0
  },
  {
    id: 3,
    subject: 'math',
    topic: 'Phép nhân',
    question: '8 × 7 = ?',
    options: ['54', '56', '58', '64'],
    correctAnswer: 1
  },
  {
    id: 4,
    subject: 'math',
    topic: 'Phép chia',
    question: '72 ÷ 8 = ?',
    options: ['7', '8', '9', '10'],
    correctAnswer: 2
  },
  // Tiếng Việt - 4 câu
  {
    id: 5,
    subject: 'vietnamese',
    topic: 'Chính tả',
    question: 'Từ nào viết đúng?',
    options: ['Học sịnh', 'Học sinh', 'Hoc sinh', 'Học xịnh'],
    correctAnswer: 1
  },
  {
    id: 6,
    subject: 'vietnamese',
    topic: 'Từ vựng',
    question: 'Từ trái nghĩa của "cao" là gì?',
    options: ['Thấp', 'Nhỏ', 'Bé', 'Ngắn'],
    correctAnswer: 0
  },
  {
    id: 7,
    subject: 'vietnamese',
    topic: 'Ngữ pháp',
    question: 'Câu nào đúng?',
    options: ['Tôi đi học', 'Tôi học đi', 'Đi tôi học', 'Học đi tôi'],
    correctAnswer: 0
  },
  {
    id: 8,
    subject: 'vietnamese',
    topic: 'Đọc hiểu',
    question: 'Con vật nào sống ở nước?',
    options: ['Chó', 'Mèo', 'Cá', 'Gà'],
    correctAnswer: 2
  },
  // Tiếng Anh - 4 câu
  {
    id: 9,
    subject: 'english',
    topic: 'Vocabulary',
    question: 'What color is the sky?',
    options: ['Red', 'Blue', 'Green', 'Yellow'],
    correctAnswer: 1
  },
  {
    id: 10,
    subject: 'english',
    topic: 'Numbers',
    question: 'How many fingers do you have?',
    options: ['Five', 'Eight', 'Ten', 'Twelve'],
    correctAnswer: 2
  },
  {
    id: 11,
    subject: 'english',
    topic: 'Grammar',
    question: 'I ___ a student.',
    options: ['is', 'am', 'are', 'be'],
    correctAnswer: 1
  },
  {
    id: 12,
    subject: 'english',
    topic: 'Animals',
    question: 'A cat says:',
    options: ['Woof', 'Meow', 'Moo', 'Quack'],
    correctAnswer: 1
  },
  // Tư duy Logic - 3 câu
  {
    id: 13,
    subject: 'logic',
    topic: 'Dãy số',
    question: 'Tìm số tiếp theo: 2, 4, 6, 8, ?',
    options: ['9', '10', '11', '12'],
    correctAnswer: 1
  },
  {
    id: 14,
    subject: 'logic',
    topic: 'Hình học',
    question: 'Hình nào có 4 cạnh bằng nhau?',
    options: ['Tam giác', 'Hình vuông', 'Hình chữ nhật', 'Hình tròn'],
    correctAnswer: 1
  },
  {
    id: 15,
    subject: 'logic',
    topic: 'So sánh',
    question: 'Số nào lớn nhất?',
    options: ['45', '54', '44', '55'],
    correctAnswer: 3
  }
];

const SUBJECT_CONFIG = {
  math: { name: 'Toán học', icon: '🔢', color: '#87CEEB', total: 4 },
  vietnamese: { name: 'Tiếng Việt', icon: '📚', color: '#FF6B6B', total: 4 },
  english: { name: 'Tiếng Anh', icon: '🗣️', color: '#51CF66', total: 4 },
  logic: { name: 'Tư duy Logic', icon: '🤔', color: '#9775FA', total: 3 }
};

const ThuThachKhoiDau = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showTest, setShowTest] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState(null);

  // Timer countdown
  useEffect(() => {
    if (showTest && !showResults) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showTest, showResults]);

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
  };

  const startTest = () => {
    if (selectedLevel) {
      setShowTest(true);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setTimeRemaining(30 * 60);
      setShowResults(false);
    }
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answerIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < MOCK_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionClick = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitClick = () => {
    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount < MOCK_QUESTIONS.length) {
      setShowConfirmDialog(true);
    } else {
      handleSubmit();
    }
  };

  const handleAutoSubmit = () => {
    handleSubmit();
  };

  const handleSubmit = () => {
    // Calculate results
    let correctCount = 0;
    const subjectScores = {};

    MOCK_QUESTIONS.forEach((question) => {
      const userAnswer = userAnswers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) correctCount++;

      if (!subjectScores[question.subject]) {
        subjectScores[question.subject] = { correct: 0, total: 0 };
      }
      subjectScores[question.subject].total++;
      if (isCorrect) subjectScores[question.subject].correct++;
    });

    const results = {
      score: correctCount,
      total: MOCK_QUESTIONS.length,
      percentage: Math.round((correctCount / MOCK_QUESTIONS.length) * 100),
      subjectScores,
      timeTaken: 30 * 60 - timeRemaining
    };

    setTestResults(results);
    setShowResults(true);
    setShowConfirmDialog(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (index) => {
    const question = MOCK_QUESTIONS[index];
    if (index === currentQuestionIndex) return 'current';
    if (userAnswers[question.id] !== undefined) return 'completed';
    return 'pending';
  };

  const getSubjectProgress = (subject) => {
    const questions = MOCK_QUESTIONS.filter(q => q.subject === subject);
    const answered = questions.filter(q => userAnswers[q.id] !== undefined).length;
    return { answered, total: questions.length };
  };

  // Màn hình chọn cấp độ
  if (!showTest) {
    return (
      <div className="thu-thach-khoi-dau">
        <div className="game-container">
          {/* Header */}
          <div className="game-header">
            <h1 className="game-title">THỬ THÁCH KHỞI ĐẦU</h1>
          </div>

          {/* Level Selection */}
          <div className="level-selection">
            <div
              className={`level-card ${selectedLevel === 3 ? 'selected' : ''}`}
              onClick={() => handleLevelSelect(3)}
            >
              <div className="level-icon">🎓</div>
              <div className="level-number">Lớp 3</div>
            </div>

            <div
              className={`level-card ${selectedLevel === 4 ? 'selected' : ''}`}
              onClick={() => handleLevelSelect(4)}
            >
              <div className="level-icon">📚</div>
              <div className="level-number">Lớp 4</div>
            </div>

            <div
              className={`level-card ${selectedLevel === 5 ? 'selected' : ''}`}
              onClick={() => handleLevelSelect(5)}
            >
              <div className="level-icon">🏆</div>
              <div className="level-number">Lớp 5</div>
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

  // Màn hình kết quả
  if (showResults && testResults) {
    return (
      <div className="thu-thach-khoi-dau">
        <div className="results-container">
          <div className="results-header">
            <h1 className="results-title">🎉 KẾT QUẢ BÀI TEST</h1>
          </div>

          <div className="results-content">
            {/* Overall Score */}
            <div className="score-card">
              <div className="score-circle">
                <div className="score-number">{testResults.percentage}%</div>
                <div className="score-label">Điểm số</div>
              </div>
              <div className="score-detail">
                Đúng <strong>{testResults.score}</strong> / {testResults.total} câu
              </div>
            </div>

            {/* Subject Breakdown */}
            <div className="subject-breakdown">
              <h3 className="breakdown-title">Phân tích theo môn học</h3>
              <div className="subject-scores">
                {Object.entries(testResults.subjectScores).map(([subject, scores]) => (
                  <div key={subject} className="subject-score-card">
                    <div className="subject-header">
                      <span className="subject-icon">{SUBJECT_CONFIG[subject].icon}</span>
                      <span className="subject-name">{SUBJECT_CONFIG[subject].name}</span>
                    </div>
                    <div className="subject-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${(scores.correct / scores.total) * 100}%`,
                            backgroundColor: SUBJECT_CONFIG[subject].color
                          }}
                        ></div>
                      </div>
                      <div className="progress-text">
                        {scores.correct}/{scores.total} câu đúng
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Taken */}
            <div className="time-info">
              ⏱️ Thời gian làm bài: {formatTime(testResults.timeTaken)}
            </div>

            {/* Action Buttons */}
            <div className="results-actions">
              <button
                className="btn-retry"
                onClick={() => {
                  setShowTest(false);
                  setShowResults(false);
                  setSelectedLevel(null);
                }}
              >
                Làm lại bài test
              </button>
              <button
                className="btn-home"
                onClick={() => window.history.back()}
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Màn hình làm bài test
  const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex];
  const currentAnswer = userAnswers[currentQuestion.id];

  return (
    <div className="thu-thach-khoi-dau test-mode">
      <div className="test-container">
        {/* Left Column - Navigation */}
        <div className="test-navigation">
          {/* Timer */}
          <div className="timer-box">
            <div className="timer-icon">⏱️</div>
            <div className="timer-value">{formatTime(timeRemaining)}</div>
            <div className="timer-label">Thời gian còn lại</div>
          </div>

          {/* Question Grid */}
          <div className="question-grid">
            <div className="grid-title">Danh sách câu hỏi</div>
            <div className="question-numbers">
              {MOCK_QUESTIONS.map((q, index) => (
                <button
                  key={q.id}
                  className={`question-number-btn ${getQuestionStatus(index)}`}
                  onClick={() => handleQuestionClick(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Progress */}
          <div className="subject-progress-box">
            <div className="progress-title">Tiến độ theo môn</div>
            {Object.entries(SUBJECT_CONFIG).map(([key, config]) => {
              const progress = getSubjectProgress(key);
              return (
                <div key={key} className="subject-item">
                  <span className="subject-icon">{config.icon}</span>
                  <span className="subject-name">{config.name}</span>
                  <span className="subject-count">
                    ({progress.answered}/{progress.total})
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column - Question Content */}
        <div className="test-content">
          {/* Question Header */}
          <div className="question-header">
            <div className="question-title">CÂU {currentQuestionIndex + 1}</div>
            <div className="question-topic">
              <span className="topic-icon">{SUBJECT_CONFIG[currentQuestion.subject].icon}</span>
              <span className="topic-text">
                {SUBJECT_CONFIG[currentQuestion.subject].name}: {currentQuestion.topic}
              </span>
            </div>
          </div>

          {/* Question Content */}
          <div className="question-content">
            <div className="question-text">{currentQuestion.question}</div>

            {/* Answer Options */}
            <div className="answer-options">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`answer-option ${currentAnswer === index ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                  {currentAnswer === index && <span className="option-check">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="test-navigation-buttons">
            <button
              className="btn-nav btn-prev"
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              ← Câu trước
            </button>

            <button
              className="btn-nav btn-submit"
              onClick={handleSubmitClick}
            >
              Nộp bài
            </button>

            <button
              className="btn-nav btn-next"
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === MOCK_QUESTIONS.length - 1}
            >
              Câu sau →
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="modal-overlay">
          <div className="modal-content confirm-dialog">
            <div className="modal-header">
              <h2>⚠️ Xác nhận nộp bài</h2>
            </div>
            <div className="modal-body">
              <p>Bé vẫn còn <strong>{MOCK_QUESTIONS.length - Object.keys(userAnswers).length}</strong> câu chưa làm.</p>
              <p>Bé có chắc chắn muốn nộp bài không?</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary-action"
                onClick={() => setShowConfirmDialog(false)}
              >
                Tiếp tục làm bài
              </button>
              <button
                className="btn-primary-action"
                onClick={handleSubmit}
              >
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThuThachKhoiDau;
