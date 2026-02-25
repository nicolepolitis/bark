import { useState, useEffect, useRef } from 'react';

const OPTION_COLORS = ['#F72585', '#7B2FBE', '#E040FB', '#9B59B6'];
const OPTION_SHADOWS = ['#B5006D', '#5B1F8E', '#9D174D', '#6D28D9'];

export default function QuestionScreen({ data, onAnswer, hasAnswered, answerCount, player }) {
  const { questionIndex, totalQuestions, question, duration } = data;
  const [timeLeft, setTimeLeft] = useState(duration / 1000);
  const [selected, setSelected] = useState(null);
  const startRef = useRef(Date.now());
  const intervalRef = useRef(null);

  useEffect(() => {
    startRef.current = Date.now();
    setTimeLeft(duration / 1000);
    setSelected(null);

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const remaining = Math.max(0, duration / 1000 - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(intervalRef.current);
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, [questionIndex, duration]);

  const handleAnswer = (idx) => {
    if (hasAnswered || timeLeft <= 0) return;
    setSelected(idx);
    onAnswer(idx);
  };

  const timerPct = (timeLeft / (duration / 1000)) * 100;
  const isUrgent = timeLeft <= 5;

  return (
    <div className="screen">
      <div className="question-meta">
        <span className="q-number">
          Q{questionIndex + 1} / {totalQuestions}
        </span>
        <div className="timer-wrap">
          <span className={`timer ${isUrgent ? 'urgent' : ''}`}>
            {Math.ceil(timeLeft)}s
          </span>
        </div>
      </div>

      <div className="timer-bar-track">
        <div
          className={`timer-bar-fill ${isUrgent ? 'urgent' : ''}`}
          style={{ width: `${timerPct}%` }}
        />
      </div>

      <div className="card">
        <div className="question-text">{question.text}</div>

        <div className="options-grid">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              className={`option-btn
                ${selected === idx ? 'selected' : ''}
                ${hasAnswered && selected !== idx ? 'faded' : ''}
              `}
              style={{ background: OPTION_COLORS[idx], boxShadow: `0 5px 0 ${OPTION_SHADOWS[idx]}` }}
              onClick={() => handleAnswer(idx)}
              disabled={hasAnswered || timeLeft <= 0}
            >
              {opt}
            </button>
          ))}
        </div>

        {hasAnswered ? (
          <div className="answered-indicator">
            <strong>✓ Answer locked in!</strong> Waiting for others…
            {answerCount.total > 0 && (
              <div className="answer-progress">
                {answerCount.count} / {answerCount.total} answered
              </div>
            )}
          </div>
        ) : (
          answerCount.count > 0 && (
            <div className="answer-progress">
              {answerCount.count} player{answerCount.count !== 1 ? 's' : ''} answered
            </div>
          )
        )}
      </div>

      {player && (
        <div style={{ textAlign: 'center', marginTop: '0.75rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          {player.emoji} {player.name}
        </div>
      )}
    </div>
  );
}
