import { useEffect, useState } from 'react';

const OPTION_COLORS = ['#F72585', '#7B2FBE', '#E040FB', '#9B59B6'];

export default function ResultScreen({ data, player }) {
  const {
    majorityAnswer,
    majorityOption,
    majorityIndices = [majorityAnswer],
    isTie = false,
    options = [],
    answerCounts,
    totalAnswers,
    playerResults,
    questionIndex,
  } = data;

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const myResult = player ? playerResults[player.id] : null;
  const isCorrect = myResult?.isCorrect;
  const pointsEarned = myResult?.pointsEarned ?? 0;
  const optionChosen = myResult?.optionChosen;
  const didAnswer = optionChosen !== null && optionChosen !== undefined;

  const maxCount = Math.max(...answerCounts, 1);

  return (
    <div className="screen" style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Verdict */}
      <div className={`result-verdict ${isCorrect ? 'correct' : 'wrong'}`}>
        <div className="verdict-icon">
          {!didAnswer ? '⏱️' : isCorrect ? '🎉' : '💀'}
        </div>
        <div className={`verdict-title ${isCorrect ? 'correct' : 'wrong'}`}>
          {!didAnswer
            ? "Time's up!"
            : isCorrect
            ? 'With the crowd!'
            : 'Against the grain'}
        </div>
        <div className="verdict-sub">
          {!didAnswer
            ? "You didn't answer in time"
            : isCorrect && isTie
            ? `It's a tie — your answer was one of the winners!`
            : isCorrect
            ? `You matched the majority answer`
            : `The majority picked: ${majorityOption}`}
        </div>
        {pointsEarned > 0 && (
          <div className="points-earned">+{pointsEarned} pts</div>
        )}
        {didAnswer && !isCorrect && (
          <div className="points-earned" style={{ color: 'var(--wrong)', fontSize: '1.2rem' }}>+0 pts</div>
        )}
      </div>

      {/* Vote breakdown */}
      <div className="card majority-reveal">
        <div className="majority-label">
          {isTie ? "It's a tie! " : ''}How {totalAnswers} player{totalAnswers !== 1 ? 's' : ''} voted
        </div>
        <div className="vote-bars">
          {answerCounts.map((count, idx) => {
            const isWinner = majorityIndices.includes(idx);
            return (
              <div key={idx} className="vote-row">
                <div
                  className="vote-label"
                  style={{
                    fontWeight: isWinner ? 700 : 400,
                    color: isWinner ? 'var(--correct)' : 'var(--text)',
                  }}
                >
                  {isWinner ? '✓ ' : ''}
                  {idx === optionChosen && !isWinner ? '→ ' : ''}
                  {options[idx] ?? `Option ${idx + 1}`}
                </div>
                <div className="vote-bar-track">
                  <div
                    className={`vote-bar-fill ${isWinner ? 'majority' : ''}`}
                    style={{
                      width: visible ? `${(count / maxCount) * 100}%` : '0%',
                      background: OPTION_COLORS[idx],
                      opacity: isWinner ? 1 : 0.5,
                    }}
                  />
                </div>
                <div className="vote-count">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="next-hint">Next question coming up…</div>
    </div>
  );
}
