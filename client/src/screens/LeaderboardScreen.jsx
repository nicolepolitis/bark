const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardScreen({ data, player }) {
  const { leaderboard, questionsCompleted, totalQuestions } = data;

  return (
    <div className="screen">
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="lb-title">Leaderboard</div>
        <div className="lb-sub">
          After {questionsCompleted} of {totalQuestions} questions
        </div>
      </div>

      <div className="card">
        <div className="lb-list">
          {leaderboard.map((p) => {
            const medal = RANK_MEDALS[p.rank] || p.rank;
            const isMe = player && p.id === player.id;
            return (
              <div
                key={p.id}
                className={`lb-row rank-${p.rank} ${isMe ? 'me' : ''}`}
              >
                <div className="lb-rank">{medal}</div>
                <div className="lb-emoji">{p.emoji}</div>
                <div className="lb-name">
                  {p.name}
                  {isMe && <span style={{ color: 'var(--accent)', marginLeft: '0.4rem', fontSize: '0.75rem' }}>(you)</span>}
                </div>
                <div className="lb-score">{p.score.toLocaleString()}</div>
              </div>
            );
          })}
        </div>

        <div className="next-hint-lb" style={{ marginTop: '1rem' }}>
          Next round starting soon…
        </div>
      </div>
    </div>
  );
}
