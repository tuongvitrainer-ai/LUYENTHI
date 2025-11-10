import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gameAPI } from '../services/api';
import './QuestionView.css';

function QuestionView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updateUser } = useAuth();

  const subject = searchParams.get('subject');

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, [subject]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await gameAPI.getQuestions({ subject, limit: 5 });

      if (response.data.success && response.data.data.questions.length > 0) {
        setQuestions(response.data.data.questions);
        setStartTime(Date.now());
      } else {
        alert('Không tìm thấy câu hỏi nào!');
        navigate('/');
      }
    } catch (error) {
      console.error('Load questions error:', error);
      alert('Lỗi khi tải câu hỏi. Vui lòng thử lại.');
      navigate('/');
    } finally {
      setLoading(false);
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

      const response = await gameAPI.submitResult({
        question_id: currentQuestion.id,
        user_answer: selectedAnswer,
        time_spent: timeSpent
      });

      if (response.data.success) {
        const resultData = response.data.data;
        setResult(resultData);

        // Update user stats in context
        updateUser({
          ...user,
          total_stars: resultData.new_total_stars,
          current_streak: resultData.current_streak,
          max_streak: resultData.max_streak
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
        <div className="user-stars">⭐ {user?.total_stars || 0}</div>
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
