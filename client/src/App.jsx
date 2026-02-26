import { useState, useEffect } from 'react';
import { socket } from './socket';
import JoinScreen from './screens/JoinScreen';
import LobbyScreen from './screens/LobbyScreen';
import QuestionScreen from './screens/QuestionScreen';
import ResultScreen from './screens/ResultScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import GameOverScreen from './screens/GameOverScreen';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('join');
  const [player, setPlayer] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gameData, setGameData] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [gameOverData, setGameOverData] = useState(null);
  const [error, setError] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answerCount, setAnswerCount] = useState({ count: 0, total: 0 });

  useEffect(() => {
    socket.on('game_state', ({ state, players }) => {
      setPlayers(players);
    });

    socket.on('join_success', ({ id, name, emoji, gameState }) => {
      setPlayer({ id, name, emoji });
      setError(null);
      if (!gameState) {
        setScreen('lobby');
      } else if (gameState.state === 'question') {
        setGameData(gameState.questionData);
        setHasAnswered(false);
        setAnswerCount(gameState.answerCount);
        setScreen('question');
      } else {
        setLeaderboardData(gameState.leaderboardData);
        setScreen('leaderboard');
      }
    });

    socket.on('join_error', ({ message }) => {
      setError(message);
    });

    socket.on('lobby_update', ({ players }) => {
      setPlayers(players);
    });

    socket.on('question_start', (data) => {
      setGameData(data);
      setHasAnswered(false);
      setAnswerCount({ count: 0, total: 0 });
      setScreen('question');
    });

    socket.on('answer_count_update', ({ count, total }) => {
      setAnswerCount({ count, total });
    });

    socket.on('question_result', (data) => {
      setResultData(data);
      setScreen('result');
    });

    socket.on('show_leaderboard', (data) => {
      setLeaderboardData(data);
      setScreen('leaderboard');
    });

    socket.on('game_over', (data) => {
      setGameOverData(data);
      setScreen('gameover');
    });

    socket.on('game_reset', () => {
      setScreen('join');
      setPlayer(null);
      setPlayers([]);
      setGameData(null);
      setResultData(null);
      setLeaderboardData(null);
      setGameOverData(null);
      setHasAnswered(false);
    });

    return () => {
      socket.off('game_state');
      socket.off('join_success');
      socket.off('join_error');
      socket.off('lobby_update');
      socket.off('question_start');
      socket.off('answer_count_update');
      socket.off('question_result');
      socket.off('show_leaderboard');
      socket.off('game_over');
      socket.off('game_reset');
    };
  }, []);

  const handleJoin = (name, emoji) => {
    socket.emit('join_game', { name, emoji });
  };

  const handleStart = () => {
    socket.emit('start_game');
  };

  const handleAnswer = (optionIndex) => {
    if (hasAnswered) return;
    setHasAnswered(true);
    socket.emit('submit_answer', { optionIndex });
  };

  const handleReset = () => {
    socket.emit('reset_game');
  };

  return (
    <div className="app">
      {screen === 'join' && <JoinScreen onJoin={handleJoin} error={error} />}
      {screen === 'lobby' && (
        <LobbyScreen players={players} player={player} onStart={handleStart} />
      )}
      {screen === 'question' && (
        <QuestionScreen
          data={gameData}
          onAnswer={handleAnswer}
          hasAnswered={hasAnswered}
          answerCount={answerCount}
          player={player}
        />
      )}
      {screen === 'result' && resultData && (
        <ResultScreen data={resultData} player={player} />
      )}
      {screen === 'leaderboard' && leaderboardData && (
        <LeaderboardScreen data={leaderboardData} player={player} />
      )}
      {screen === 'gameover' && gameOverData && (
        <GameOverScreen data={gameOverData} player={player} onReset={handleReset} />
      )}
    </div>
  );
}
