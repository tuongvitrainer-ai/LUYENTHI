import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gameAPI } from '../services/api';
import UserAvatar from '../components/UserAvatar';
import './QuestionView.css';

function QuestionView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updateUser } = useAuth();

  const subjectFromUrl = searchParams.get('subject');

  // Setup screen states
  const [showSetup, setShowSetup] = useState(true);
  const [questionCount, setQuestionCount] = useState(10);
  const [difficultyLevel, setDifficultyLevel] = useState(4);
  const [selectedSubjects, setSelectedSubjects] = useState(['Tất cả']);
  const [gradeLevel, setGradeLevel] = useState('');

  // Game states
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());

  // Initialize subjects on mount
  useEffect(() => {
    if (subjectFromUrl) {
      setSelectedSubjects([subjectFromUrl]);
    }
  }, [subjectFromUrl]);

  // Convert difficulty level (1-10) to difficulty distribution
  const getDifficultyDistribution = (level) => {
    if (level <= 3) {
      // Levels 1-3: Mostly easy
      return { easy: 0.8, medium: 0.2, hard: 0 };
    } else if (level <= 5) {
      // Levels 4-5: Mix easy and medium
      return { easy: 0.5, medium: 0.4, hard: 0.1 };
    } else if (level <= 7) {
      // Levels 6-7: Mix medium and some hard
      return { easy: 0.2, medium: 0.6, hard: 0.2 };
    } else {
      // Levels 8-10: Mostly hard
      return { easy: 0, medium: 0.3, hard: 0.7 };
    }
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);

      // Prepare params - load more questions to ensure we have enough for filtering
      const params = {
        limit: Math.min(questionCount * 3, 50), // Load 3x more to ensure variety
      };

      // Add subject filter if specific subjects selected
      if (selectedSubjects.length > 0 && !selectedSubjects.includes('Tất cả')) {
        // For now, API only supports one subject at a time
        params.subject = selectedSubjects[0];
      }

      const response = await gameAPI.getQuestions(params);

      if (response.data.success && response.data.data.questions.length > 0) {
        let loadedQuestions = response.data.data.questions;

        // Filter questions by difficulty level (client-side filtering)
        const distribution = getDifficultyDistribution(difficultyLevel);
        const easyCount = Math.floor(questionCount * distribution.easy);
        const mediumCount = Math.floor(questionCount * distribution.medium);
        const hardCount = questionCount - easyCount - mediumCount;

        const easyQuestions = loadedQuestions.filter(q => q.difficulty === 'easy');
        const mediumQuestions = loadedQuestions.filter(q => q.difficulty === 'medium');
        const hardQuestions = loadedQuestions.filter(q => q.difficulty === 'hard');

        const selectedQuestions = [
          ...easyQuestions.slice(0, easyCount),
          ...mediumQuestions.slice(0, mediumCount),
          ...hardQuestions.slice(0, hardCount)
        ];

        // Shuffle questions
        const shuffled = selectedQuestions.sort(() => Math.random() - 0.5);

        // Take only the requested number of questions
        const finalQuestions = shuffled.slice(0, questionCount);

        if (finalQuestions.length >= Math.min(5, questionCount)) {
          setQuestions(finalQuestions);
          setStartTime(Date.now());
          setShowSetup(false);
        } else {
          alert('Không đủ câu hỏi phù hợp với mức độ đã chọn! Vui lòng thử mức độ khác hoặc chọn ít câu hỏi hơn.');
        }
      } else {
        alert('Không tìm thấy câu hỏi nào!');
      }
    } catch (error) {
      console.error('Load questions error:', error);
      alert('Lỗi khi tải câu hỏi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = () => {
    loadQuestions();
  };

  const handleSubjectToggle = (subject) => {
    if (subject === 'Tất cả') {
      setSelectedSubjects(['Tất cả']);
    } else {
      const filtered = selectedSubjects.filter(s => s !== 'Tất cả');
      if (selectedSubjects.includes(subject)) {
        const updated = filtered.filter(s => s !== subject);
        setSelectedSubjects(updated.length === 0 ? ['Tất cả'] : updated);
      } else {
        setSelectedSubjects([...filtered, subject]);
      }
    }
  };

  const currentQuestion = questions[currentIndex];

  const handleAnswerSelect = (answerId) => {
    if (!result) {
      // Only allow selection if not yet submitted
      setSelectedAnswer(answerId);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer) {
      alert('Vui lòng chọn đáp án!');
      return;
    }

    if (submitting) return;

    setSubmitting(true);

    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      // Check if answer is correct
      const isCorrect = selectedAnswer === currentQuestion.correct_answer;
      const score = isCorrect ? 100 : 0;

      // Submit as exam-level result (V6 API format)
      const response = await gameAPI.submitResult({
        exam_type: 'quiz_race',
        score: score,
        details_json: {
          question_id: currentQuestion.id,
          user_answer: selectedAnswer,
          correct_answer: currentQuestion.correct_answer,
          time_spent: timeSpent,
          subject: subject
        }
      });

      if (response.data.success) {
        const resultData = response.data.data;

        // Set result for display
        setResult({
          is_correct: isCorrect,
          correct_answer: currentQuestion.correct_answer,
          explanation: currentQuestion.explanation,
          points_earned: resultData.stars_earned || 0,
          current_streak: resultData.streak_status?.current_streak || 0
        });

        // Update user stats in context
        updateUser({
          ...user,
          stars_balance: resultData.stars_balance,
          current_streak: resultData.streak_status?.current_streak,
          max_streak: resultData.streak_status?.max_streak,
          freeze_streaks: resultData.streak_status?.freeze_remaining
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Lỗi khi nộp bài. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      // Move to next question
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setResult(null);
      setStartTime(Date.now());
    } else {
      // All questions completed
      alert('Bạn đã hoàn thành tất cả câu hỏi! 🎉');
      navigate('/');
    }
  };

  const handleBackToMap = () => {
    navigate('/');
  };

  const getDifficultyLabel = (level) => {
    if (level <= 3) return 'Dễ';
    if (level <= 5) return 'Trung bình';
    if (level <= 7) return 'Khó';
    return 'Rất khó';
  };

  // Show setup screen
  if (showSetup) {
    return (
      <div className="question-page setup-page">
        <div className="setup-container">
          <button onClick={handleBackToMap} className="btn-back">
            ← Về trang chủ
          </button>

          <h1 className="setup-title">🎯 Cài đặt trò chơi</h1>

          {/* Question Count */}
          <div className="setup-section">
            <label className="setup-label">
              📝 Chọn số lượng câu hỏi:
            </label>
            <div className="question-count-buttons">
              {[5, 10, 15, 20, 30, 50].map(count => (
                <button
                  key={count}
                  className={`count-btn ${questionCount === count ? 'active' : ''}`}
                  onClick={() => setQuestionCount(count)}
                >
                  {count}
                </button>
              ))}
            </div>
            <p className="setup-hint">
              💡 <em>Chọn số lượng câu hỏi nhiều thì mức độ đánh giá kỹ năng của bạn càng chính xác nhé!</em>
            </p>
          </div>

          {/* Difficulty Level */}
          <div className="setup-section">
            <label className="setup-label">
              ⚡ Mức độ khó: <strong>{getDifficultyLabel(difficultyLevel)}</strong> (Cấp {difficultyLevel})
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={difficultyLevel}
              onChange={(e) => setDifficultyLevel(parseInt(e.target.value))}
              className="difficulty-slider"
            />
            <div className="difficulty-marks">
              <span>1<br/>Dễ</span>
              <span>5<br/>TB</span>
              <span>10<br/>Khó</span>
            </div>
          </div>

          {/* Subject Filter */}
          <div className="setup-section">
            <label className="setup-label">
              📚 Môn học:
            </label>
            <div className="subject-checkboxes">
              {['Tất cả', 'Toán', 'Tiếng Việt', 'Tiếng Anh'].map(subject => (
                <label key={subject} className="subject-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject) ||
                            (subject === 'Tất cả' && selectedSubjects.length === 0)}
                    onChange={() => handleSubjectToggle(subject)}
                  />
                  <span>{subject}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartGame}
            className="btn btn-primary btn-start"
            disabled={loading}
          >
            {loading ? '⏳ Đang tải...' : '🚀 Bắt đầu chơi'}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="question-page loading">
        <div className="loading-spinner">Đang tải câu hỏi...</div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const content = currentQuestion.content;
  const isMultipleChoice = content.question_type === 'multiple_choice';

  return (
    <div className="question-page">
      {/* Header */}
      <div className="question-header">
        <button onClick={handleBackToMap} className="btn-back">
          ← Về trang chủ
        </button>
        <div className="question-progress">
          Câu {currentIndex + 1} / {questions.length}
        </div>
        <div className="header-right">
          <div className="user-stars">⭐ {user?.stars_balance || 0}</div>
          <UserAvatar />
        </div>
      </div>

      {/* Question Content */}
      <div className="question-container">
        <div className="question-card">
          <div className="question-info">
            <span className="question-subject">{subject}</span>
            <span className="question-difficulty">
              {'⭐'.repeat(currentQuestion.difficulty_level)}
            </span>
            <span className="question-points">
              +{currentQuestion.points} sao
            </span>
          </div>

          <h2 className="question-text">{content.question_text}</h2>

          {isMultipleChoice && (
            <div className="options-container">
              {content.options.map((option) => {
                const isSelected = selectedAnswer === option.id;
                const isCorrect = result && option.id === result.correct_answer;
                const isWrong = result && isSelected && !result.is_correct;

                let className = 'option-card';
                if (isSelected && !result) className += ' selected';
                if (result && isCorrect) className += ' correct';
                if (result && isWrong) className += ' wrong';

                return (
                  <div
                    key={option.id}
                    className={className}
                    onClick={() => handleAnswerSelect(option.id)}
                  >
                    <span className="option-id">{option.id}</span>
                    <span className="option-text">{option.text}</span>
                    {result && isCorrect && <span className="option-icon">✓</span>}
                    {result && isWrong && <span className="option-icon">✗</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className={`result-card ${result.is_correct ? 'correct' : 'wrong'}`}>
              <div className="result-icon">
                {result.is_correct ? '🎉' : '😢'}
              </div>
              <h3>{result.is_correct ? 'Chính xác!' : 'Chưa đúng'}</h3>
              {result.explanation && (
                <p className="result-explanation">{result.explanation}</p>
              )}
              <div className="result-stats">
                <span>+{result.points_earned} sao</span>
                <span>🔥 {result.current_streak} ngày</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="question-actions">
            {!result ? (
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={!selectedAnswer || submitting}
              >
                {submitting ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            ) : (
              <button onClick={handleNext} className="btn btn-primary">
                {currentIndex < questions.length - 1 ? 'Câu tiếp theo →' : 'Hoàn thành'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionView;
