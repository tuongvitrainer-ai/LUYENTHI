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
  const [questionCount, setQuestionCount] = useState(15); // NEW: Số câu hỏi
  const [showTest, setShowTest] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState(null);

  // API integration
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [reviewQuestions, setReviewQuestions] = useState([]); // NEW: Detailed review

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

  const startTest = async () => {
    if (!selectedLevel) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch questions from API
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE}/api/challenge/questions/${selectedLevel}?count=${questionCount}`);

      if (!response.ok) {
        throw new Error('Không thể tải câu hỏi');
      }

      const data = await response.json();

      if (data.success && data.data.questions.length > 0) {
        // Transform API data to match frontend format
        const transformedQuestions = data.data.questions.map(q => ({
          id: q.id,
          subject: q.subject,
          topic: q.topic,
          question: q.question_text,
          options: q.options,
          // correctAnswer will be checked on backend
        }));

        setQuestions(transformedQuestions);
        setShowTest(true);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setTimeRemaining(30 * 60);
        setShowResults(false);
        setStartTime(Date.now());
        console.log(`✅ Loaded ${transformedQuestions.length} questions from API`);
      } else {
        throw new Error('Không có câu hỏi nào');
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.message);

      // Fallback to MOCK_QUESTIONS if API fails
      console.log('⚠️  Using mock data as fallback');
      setQuestions(MOCK_QUESTIONS);
      setShowTest(true);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setTimeRemaining(30 * 60);
      setShowResults(false);
      setStartTime(Date.now());
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answerIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
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
    if (answeredCount < questions.length) {
      setShowConfirmDialog(true);
    } else {
      handleSubmit();
    }
  };

  const handleAutoSubmit = () => {
    handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Prepare answers for API
      const answersArray = questions.map(q => {
        const answerIndex = userAnswers[q.id];
        const answerText = (answerIndex !== undefined && q.options && q.options[answerIndex])
          ? q.options[answerIndex]
          : '';

        console.log(`Question ${q.id}: User selected index ${answerIndex}, which is "${answerText}"`);

        return {
          question_id: q.id,
          user_answer: answerText
        };
      });

      const timeTaken = Math.floor((Date.now() - startTime) / 1000); // seconds

      console.log('📤 Submitting answers:', answersArray);

      // Submit to API
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE}/api/challenge/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1, // TODO: Get from auth context
          grade_level: selectedLevel,
          answers: answersArray,
          time_taken: timeTaken
        })
      });

      if (!response.ok) {
        throw new Error('Không thể nộp bài');
      }

      const data = await response.json();

      if (data.success) {
        // Use results from API
        const results = {
          score: data.data.correct_answers,
          total: data.data.total_questions,
          percentage: data.data.score,
          subjectScores: data.data.subject_scores,
          timeTaken: data.data.time_taken,
          starsEarned: data.data.stars_earned,
          testId: data.data.test_id
        };

        console.log('✅ Test submitted successfully:', results);
        console.log('📋 Review questions received:', data.data.review_questions);
        console.log('📊 Review questions count:', data.data.review_questions?.length || 0);

        // If backend doesn't return review_questions, create fallback from frontend
        let reviewData = data.data.review_questions;
        if (!reviewData || reviewData.length === 0) {
          console.warn('⚠️ Backend did not return review_questions, creating fallback...');
          reviewData = questions.map((q, index) => {
            const answerIndex = userAnswers[q.id];
            const userAnswerText = (answerIndex !== undefined && q.options)
              ? q.options[answerIndex]
              : '';

            // We don't know the correct answer from frontend, so mark as unknown
            return {
              question_id: q.id,
              question_text: q.question || q.question_text,
              options: q.options,
              user_answer: userAnswerText,
              correct_answer: 'N/A (chưa có từ backend)',
              is_correct: false, // Can't determine without backend
              explanation: 'Chưa có giải thích (backend chưa trả về dữ liệu)',
              subject: q.subject,
              topic: q.topic
            };
          });
        }

        setTestResults(results);
        setReviewQuestions(reviewData);
        setShowResults(true);
        setShowConfirmDialog(false);
      } else {
        throw new Error(data.message || 'Lỗi khi nộp bài');
      }
    } catch (err) {
      console.error('Error submitting test:', err);

      // Fallback: Calculate locally if API fails
      console.log('⚠️  Calculating results locally as fallback');

      let correctCount = 0;
      const subjectScores = {};

      questions.forEach((question) => {
        const userAnswerIndex = userAnswers[question.id];
        const userAnswerText = question.options[userAnswerIndex];

        // Can't verify correctness without API, so just count answered
        const isAnswered = userAnswerIndex !== undefined;

        if (!subjectScores[question.subject]) {
          subjectScores[question.subject] = { correct: 0, total: 0 };
        }
        subjectScores[question.subject].total++;
        if (isAnswered) subjectScores[question.subject].correct++; // Assume correct for fallback
      });

      correctCount = Object.keys(userAnswers).length;

      const results = {
        score: correctCount,
        total: questions.length,
        percentage: Math.round((correctCount / questions.length) * 100),
        subjectScores,
        timeTaken: 30 * 60 - timeRemaining,
        starsEarned: 0 // Unknown without API
      };

      setTestResults(results);
      setShowResults(true);
      setShowConfirmDialog(false);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (index) => {
    if (questions.length === 0) return 'pending';
    const question = questions[index];
    if (!question) return 'pending';
    if (index === currentQuestionIndex) return 'current';
    if (userAnswers[question.id] !== undefined) return 'completed';
    return 'pending';
  };

  const getSubjectProgress = (subject) => {
    if (questions.length === 0) return { answered: 0, total: 0 };

    const subjectQuestions = questions.filter(q => q.subject === subject);
    const answered = subjectQuestions.filter(q => userAnswers[q.id] !== undefined).length;
    return { answered, total: subjectQuestions.length };
  };

  const getGridColumns = () => {
    const count = questions.length;
    if (count <= 15) return 3;  // 3 cột: tối đa 5 dòng
    if (count <= 24) return 4;  // 4 cột: tối đa 6 dòng
    if (count <= 30) return 5;  // 5 cột: tối đa 6 dòng
    return 6;                    // 6 cột: 45 câu = 7.5 dòng ~ 8 dòng
  };

  const getGridGap = () => {
    const count = questions.length;
    if (count <= 15) return '8px';
    if (count <= 24) return '6px';
    if (count <= 30) return '5px';
    return '4px'; // 45 questions - gap rất nhỏ
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

          {/* Question Count Selection */}
          {selectedLevel && (
            <div className="question-count-selection">
              <div className="count-label">Chọn số lượng câu hỏi:</div>
              <div className="count-options">
                {[15, 24, 30, 45].map(count => (
                  <button
                    key={count}
                    className={`count-option ${questionCount === count ? 'selected' : ''}`}
                    onClick={() => setQuestionCount(count)}
                  >
                    {count} câu
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Start Button */}
          {selectedLevel && (
            <div className="action-buttons">
              <button
                className="btn-start-test"
                onClick={startTest}
                disabled={loading}
              >
                {loading ? 'Đang tải câu hỏi...' : 'Bắt đầu thử thách! 🚀'}
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
    // Safe get subject config
    const getSafeSubjectConfig = (subject) => {
      return SUBJECT_CONFIG[subject] || {
        name: subject || 'Không xác định',
        icon: '❓',
        color: '#87CEEB'
      };
    };

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
                <div className="score-number">{testResults.percentage || 0}%</div>
                <div className="score-label">Điểm số</div>
              </div>
              <div className="score-detail">
                Đúng <strong>{testResults.score || 0}</strong> / {testResults.total || 0} câu
              </div>
            </div>

            {/* Subject Breakdown */}
            <div className="subject-breakdown">
              <h3 className="breakdown-title">Phân tích theo môn học</h3>
              <div className="subject-scores">
                {testResults.subjectScores && Object.entries(testResults.subjectScores).map(([subject, scores]) => {
                  const subjectConfig = getSafeSubjectConfig(subject);
                  return (
                    <div key={subject} className="subject-score-card">
                      <div className="subject-header">
                        <span className="subject-icon">{subjectConfig.icon}</span>
                        <span className="subject-name">{subjectConfig.name}</span>
                      </div>
                      <div className="subject-progress">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${scores.total > 0 ? (scores.correct / scores.total) * 100 : 0}%`,
                              backgroundColor: subjectConfig.color
                            }}
                          ></div>
                        </div>
                        <div className="progress-text">
                          {scores.correct || 0}/{scores.total || 0} câu đúng
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time Taken */}
            <div className="time-info">
              ⏱️ Thời gian làm bài: {formatTime(testResults.timeTaken)}
            </div>

            {/* Detailed Review - ALWAYS VISIBLE */}
            <div className="detailed-review" style={{ marginTop: '24px' }}>
              <h3 className="review-title">📝 Chi tiết bài làm ({reviewQuestions.length} câu)</h3>
              {(() => {
                console.log('🔍 Rendering review section, reviewQuestions:', reviewQuestions);
                console.log('📊 Review questions count:', reviewQuestions.length);
                return null;
              })()}
              {reviewQuestions && reviewQuestions.length > 0 ? (
                <div className="review-questions">
                  {reviewQuestions.map((review, index) => {
                    const subjectConfig = getSafeSubjectConfig(review.subject);
                    return (
                      <div key={review.question_id || index} className={`review-item ${review.is_correct ? 'correct' : 'incorrect'}`}>
                        <div className="review-header">
                          <span className="review-number">Câu {index + 1}</span>
                          <span className={`review-badge ${review.is_correct ? 'correct' : 'incorrect'}`}>
                            {review.is_correct ? '✓ Đúng' : '✗ Sai'}
                          </span>
                        </div>
                        <div className="review-question-text">
                          <span className="subject-tag" style={{ backgroundColor: subjectConfig.color }}>
                            {subjectConfig.name}
                          </span>
                          {review.question_text || 'Không có nội dung câu hỏi'}
                        </div>
                        <div className="review-answers">
                          <div className="review-answer">
                            <strong>Đáp án của bạn:</strong>{' '}
                            <span className={review.is_correct ? 'answer-correct' : 'answer-wrong'}>
                              {review.user_answer || '(Chưa trả lời)'}
                            </span>
                          </div>
                          {!review.is_correct && (
                            <div className="review-answer">
                              <strong>Đáp án đúng:</strong>{' '}
                              <span className="answer-correct">{review.correct_answer || 'N/A'}</span>
                            </div>
                          )}
                        </div>
                        {review.explanation && review.explanation !== 'Chưa có giải thích (backend chưa trả về dữ liệu)' && (
                          <div className="review-explanation">
                            <strong>💡 Giải thích:</strong> {review.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="review-placeholder" style={{
                  textAlign: 'center',
                  padding: '40px',
                  background: '#fff5f5',
                  borderRadius: '12px',
                  color: '#FF6B6B',
                  border: '2px dashed #FF6B6B'
                }}>
                  <h3>❌ Không có dữ liệu chi tiết</h3>
                  <p style={{ marginTop: '10px' }}>
                    Backend chưa trả về review_questions. Vui lòng chạy:
                  </p>
                  <code style={{
                    display: 'block',
                    background: '#000',
                    color: '#0f0',
                    padding: '10px',
                    borderRadius: '4px',
                    marginTop: '10px',
                    fontFamily: 'monospace'
                  }}>
                    cd vuot-vu-mon/server && npx knex migrate:latest
                  </code>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="results-actions">
              <button
                className="btn-retry"
                onClick={() => {
                  setShowTest(false);
                  setShowResults(false);
                  setSelectedLevel(null);
                  setReviewQuestions([]);
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
  const currentQuestion = questions[currentQuestionIndex] || null;
  const currentAnswer = currentQuestion ? userAnswers[currentQuestion.id] : undefined;

  // Guard: Nếu không có câu hỏi hoặc data không hợp lệ, hiển thị loading
  if (questions.length === 0 || !currentQuestion) {
    console.warn('⚠️ No questions available or currentQuestion is null', {
      questionsLength: questions.length,
      currentQuestionIndex,
      currentQuestion
    });

    return (
      <div className="thu-thach-khoi-dau test-mode">
        <div className="test-container">
          <div className="test-content" style={{ width: '100%', textAlign: 'center', padding: '40px' }}>
            <h2>⏳ Đang tải câu hỏi...</h2>
            <p>Vui lòng đợi trong giây lát</p>
            {questions.length === 0 && (
              <button
                onClick={() => window.location.reload()}
                style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
              >
                🔄 Tải lại trang
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Safe get subject config with fallback
  const getSubjectConfig = (subject) => {
    return SUBJECT_CONFIG[subject] || {
      name: subject || 'Không xác định',
      icon: '❓',
      color: '#87CEEB'
    };
  };

  const subjectConfig = getSubjectConfig(currentQuestion.subject);

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
            <div
              className="question-numbers"
              style={{
                gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`,
                gap: getGridGap()
              }}
            >
              {questions.map((q, index) => (
                <button
                  key={q.id || index}
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
              if (progress.total === 0) return null; // Skip subjects with no questions
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
              <span className="topic-icon">{subjectConfig.icon}</span>
              <span className="topic-text">
                {subjectConfig.name}: {currentQuestion.topic || 'Chưa có chủ đề'}
              </span>
            </div>
          </div>

          {/* Question Content */}
          <div className="question-content">
            <div className="question-text">
              {currentQuestion.question || currentQuestion.question_text || 'Không có nội dung câu hỏi'}
            </div>

            {/* Answer Options */}
            <div className="answer-options">
              {(currentQuestion.options || []).map((option, index) => (
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
              disabled={currentQuestionIndex === questions.length - 1}
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
              <p>Bé vẫn còn <strong>{questions.length - Object.keys(userAnswers).length}</strong> câu chưa làm.</p>
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
