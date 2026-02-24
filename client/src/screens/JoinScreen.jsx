import { useState } from 'react';

const EMOJIS = [
  '🐶','🐱','🐼','🦊','🐯','🦁','🐸','🐧',
  '🦄','🦋','🌈','🔥','⚡','🎯','💎','🚀',
  '🎸','🎮','🏆','🍕','🌮','🎃','👾','🤖',
];

export default function JoinScreen({ onJoin, error }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🐶');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onJoin(trimmed, emoji);
  };

  return (
    <div className="screen">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div className="logo">bark<span>.</span></div>
        <div className="tagline">the majority rules — be the crowd</div>
      </div>

      <div className="card">
        <form className="join-form" onSubmit={handleSubmit}>
          <div>
            <div className="field-label">Your name</div>
            <input
              className="text-input"
              type="text"
              placeholder="e.g. Alex"
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <div className="field-label">Pick your vibe</div>
            <div className="emoji-grid">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`emoji-btn ${emoji === e ? 'selected' : ''}`}
                  onClick={() => setEmoji(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={!name.trim()}
          >
            {emoji} Join Game
          </button>
        </form>

        {error && <div className="error-msg">{error}</div>}
      </div>
    </div>
  );
}
