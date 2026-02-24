const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function GameOverScreen({ data, player, onReset }) {
  const { leaderboard } = data;
  const winner = leaderboard[0];
  const myEntry = player ? leaderboard.find((p) => p.id === player.id) : null;

  return (
    <div className="screen">
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="gameover-hero">
          <div className="winner-emoji">{winner?.emoji}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
            🏆 Winner
          </div>
          <div className="winner-name">{winner?.name}</div>
          <div className="winner-score">{winner?.score?.toLocaleString()} pts</div>
        </div>
      </div>

      {myEntry && myEntry.id !== winner?.id && (
        <div className="my-result-banner" style={{ marginBottom: '1rem' }}>
          <div className="my-rank">#{myEntry.rank}</div>
          <div className="my-score">
            You scored {myEntry.score.toLocaleString()} pts
          </div>
        </div>
      )}

      <div className="card">
        <div className="lb-title" style={{ marginBottom: '1rem' }}>Final Scores</div>
        <div className="lb-list">
          {leaderboard.map((p) => {
            const medal = RANK_MEDALS[p.rank] || `#${p.rank}`;
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

        <div style={{ marginTop: '1.5rem' }}>
          <button className="btn btn-primary" onClick={onReset}>
            🔄 Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
