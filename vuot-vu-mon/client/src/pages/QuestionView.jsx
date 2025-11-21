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

  const subject = searchParams.get('subject');

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

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

  const handleReportQuestion = async () => {
    try {
      await gameAPI.reportQuestion({
        question_id: currentQuestion.id,
        report_type: 'error',
        context: {
          subject: subject,
          exam_type: 'quiz_race',
          user_answer: selectedAnswer,
          current_index: currentIndex
        }
      });

      setReportSubmitted(true);

      // Auto close modal after 2 seconds
      setTimeout(() => {
        setShowReportModal(false);
        setReportSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error('Report error:', error);
      alert('Lỗi khi gửi báo cáo. Vui lòng thử lại.');
    }
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
        <div className="header-left">
          <button onClick={handleBackToMap} className="btn-back">
            ← Về trang chủ
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="btn-report-error"
            title="Báo đề bị lỗi"
          >
            ⚠️
          </button>
        </div>
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

          {/* Media Display - Image and Audio */}
          {(currentQuestion.image_url || currentQuestion.audio_url) && (
            <div className="question-media" style={{ marginBottom: '20px' }}>
              {currentQuestion.image_url && (
                <div className="question-image" style={{ marginBottom: '12px' }}>
                  <img
                    src={currentQuestion.image_url}
                    alt="Question illustration"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      height: 'auto',
                      borderRadius: '8px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              )}
              {currentQuestion.audio_url && (
                <div className="question-audio">
                  <audio
                    controls
                    src={currentQuestion.audio_url}
                    style={{ width: '100%', maxWidth: '400px' }}
                  >
                    Trình duyệt của bạn không hỗ trợ phát audio.
                  </audio>
                </div>
              )}
            </div>
          )}

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

      {/* Report Error Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {!reportSubmitted ? (
              <>
                <h2>Báo cáo lỗi câu hỏi</h2>
                <p>Bạn có chắc muốn báo cáo câu hỏi này có vấn đề?</p>
                <div className="modal-actions">
                  <button onClick={handleReportQuestion} className="btn btn-primary">
                    Xác nhận
                  </button>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="btn btn-secondary"
                  >
                    Hủy
                  </button>
                </div>
              </>
            ) : (
              <div className="report-success">
                <div className="success-icon">✅</div>
                <h2>Cảm ơn bạn đã thông báo!</h2>
                <p>Chúng tôi sẽ kiểm tra và chỉnh sửa trong thời gian sớm nhất.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionView;
