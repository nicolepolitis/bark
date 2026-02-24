const QUESTIONS = require('./questions');

const QUESTION_DURATION = 20000; // 20 seconds
const RESULT_DURATION = 9000;    // 9 seconds to show result
const LEADERBOARD_DURATION = 11000; // 11 seconds to show leaderboard

class Game {
  constructor(io) {
    this.io = io;
    this.reset();
  }

  reset() {
    this.players = new Map(); // socketId -> { id, name, emoji, score, answers }
    this.state = 'lobby';     // lobby | question | result | leaderboard | finished
    this.currentQuestionIndex = -1;
    this.currentAnswers = new Map(); // socketId -> { optionIndex, timeMs }
    this.questionTimer = null;
    this.questionStartTime = null;
    this.majorityAnswer = null;
    this.answerCounts = [];
  }

  addPlayer(socketId, name, emoji) {
    this.players.set(socketId, {
      id: socketId,
      name,
      emoji,
      score: 0,
      answers: []
    });
    this.broadcastLobbyState();
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
    if (this.state === 'lobby') {
      this.broadcastLobbyState();
    }
  }

  broadcastLobbyState() {
    this.io.emit('lobby_update', {
      players: this.getPlayersArray(),
      state: this.state
    });
  }

  getPlayersArray() {
    return Array.from(this.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      emoji: p.emoji,
      score: p.score
    }));
  }

  getLeaderboard() {
    return Array.from(this.players.values())
      .map(p => ({ id: p.id, name: p.name, emoji: p.emoji, score: p.score }))
      .sort((a, b) => b.score - a.score)
      .map((p, idx) => ({ ...p, rank: idx + 1 }));
  }

  startGame() {
    if (this.state !== 'lobby') return false;
    if (this.players.size < 1) return false;
    this.state = 'playing';
    this.currentQuestionIndex = -1;
    this.nextQuestion();
    return true;
  }

  nextQuestion() {
    this.currentQuestionIndex++;

    if (this.currentQuestionIndex >= QUESTIONS.length) {
      this.endGame();
      return;
    }

    this.currentAnswers = new Map();
    this.answerCounts = [];
    this.majorityAnswer = null;
    this.state = 'question';
    this.questionStartTime = Date.now();

    const question = QUESTIONS[this.currentQuestionIndex];

    this.io.emit('question_start', {
      questionIndex: this.currentQuestionIndex,
      totalQuestions: QUESTIONS.length,
      question: {
        id: question.id,
        text: question.text,
        options: question.options
      },
      duration: QUESTION_DURATION
    });

    this.questionTimer = setTimeout(() => {
      this.resolveQuestion();
    }, QUESTION_DURATION);
  }

  submitAnswer(socketId, optionIndex) {
    if (this.state !== 'question') return;
    if (this.currentAnswers.has(socketId)) return; // already answered

    const timeMs = Date.now() - this.questionStartTime;
    this.currentAnswers.set(socketId, { optionIndex, timeMs });

    // Emit answer count (not which option) so others can see activity
    this.io.emit('answer_count_update', {
      count: this.currentAnswers.size,
      total: this.players.size
    });

    // If everyone answered, resolve early
    if (this.currentAnswers.size >= this.players.size) {
      clearTimeout(this.questionTimer);
      this.resolveQuestion();
    }
  }

  resolveQuestion() {
    this.state = 'result';
    const question = QUESTIONS[this.currentQuestionIndex];
    const numOptions = question.options.length;

    // Count votes per option
    const counts = new Array(numOptions).fill(0);
    this.currentAnswers.forEach(({ optionIndex }) => {
      if (optionIndex >= 0 && optionIndex < numOptions) {
        counts[optionIndex]++;
      }
    });
    this.answerCounts = counts;

    // Find all options tied for the most votes
    const maxCount = Math.max(...counts, 0);
    const majorityIndices = counts
      .map((c, i) => (c === maxCount ? i : -1))
      .filter(i => i !== -1);
    const isTie = majorityIndices.length > 1;
    const majorityIndex = majorityIndices[0];
    this.majorityAnswer = majorityIndex;

    // Score players — any tied option counts as correct
    const playerResults = {};
    this.players.forEach((player, socketId) => {
      const answer = this.currentAnswers.get(socketId);
      let pointsEarned = 0;
      let isCorrect = false;

      if (answer !== undefined) {
        isCorrect = majorityIndices.includes(answer.optionIndex);
        if (isCorrect) {
          // Base 1000 pts + speed bonus up to 1000 pts
          const timeRatio = Math.max(0, 1 - answer.timeMs / QUESTION_DURATION);
          const speedBonus = Math.round(timeRatio * 1000);
          pointsEarned = 1000 + speedBonus;
        }
      }

      player.score += pointsEarned;
      player.answers.push({ optionIndex: answer?.optionIndex ?? null, isCorrect, pointsEarned });
      playerResults[socketId] = { isCorrect, pointsEarned, optionChosen: answer?.optionIndex ?? null };
    });

    // Broadcast result to all
    this.io.emit('question_result', {
      questionIndex: this.currentQuestionIndex,
      majorityAnswer: majorityIndex,
      majorityOption: question.options[majorityIndex],
      majorityIndices,
      isTie,
      options: question.options,
      answerCounts: counts,
      totalAnswers: this.currentAnswers.size,
      playerResults,
      leaderboard: this.getLeaderboard()
    });

    // After result, check if leaderboard or next question
    const nextIndex = this.currentQuestionIndex + 1;
    const showLeaderboard = nextIndex > 0 && nextIndex % 3 === 0 && nextIndex < QUESTIONS.length;

    setTimeout(() => {
      if (nextIndex >= QUESTIONS.length) {
        this.endGame();
      } else if (showLeaderboard) {
        this.showLeaderboard();
      } else {
        this.nextQuestion();
      }
    }, RESULT_DURATION);
  }

  showLeaderboard() {
    this.state = 'leaderboard';
    this.io.emit('show_leaderboard', {
      leaderboard: this.getLeaderboard(),
      questionsCompleted: this.currentQuestionIndex + 1,
      totalQuestions: QUESTIONS.length,
      isFinal: false
    });

    setTimeout(() => {
      this.nextQuestion();
    }, LEADERBOARD_DURATION);
  }

  endGame() {
    this.state = 'finished';
    this.io.emit('game_over', {
      leaderboard: this.getLeaderboard(),
      isFinal: true
    });
  }

  canStart() {
    return this.state === 'lobby' && this.players.size >= 1;
  }

  isFull() {
    return this.players.size >= 20;
  }
}

module.exports = Game;
