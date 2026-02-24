export default function LobbyScreen({ players, player, onStart }) {
  const isHost = player && players.length > 0 && players[0].id === player.id;

  return (
    <div className="screen">
      <div className="lobby-header">
        <div className="logo">bark<span>.</span></div>
        <div className="tagline">waiting room</div>
        <div className="player-count">
          {players.length} / 20 players joined
        </div>
      </div>

      <div className="card">
        <div className="player-grid">
          {players.map((p) => (
            <div
              key={p.id}
              className={`player-chip ${player && p.id === player.id ? 'me' : ''}`}
            >
              <span className="player-chip-emoji">{p.emoji}</span>
              <span className="player-chip-name">{p.name}</span>
              {player && p.id === player.id && (
                <span style={{ fontSize: '0.65rem', color: 'var(--accent)' }}>you</span>
              )}
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="player-chip" style={{ opacity: 0.25 }}>
              <span className="player-chip-emoji">…</span>
              <span className="player-chip-name">waiting</span>
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary"
          onClick={onStart}
          disabled={players.length < 1}
        >
          🚀 Start Game
        </button>

        <div className="start-hint">
          {isHost
            ? 'You\'re the host — tap Start when everyone\'s in!'
            : 'Waiting for the host to start…'}
        </div>
      </div>
    </div>
  );
}
