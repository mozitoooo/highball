import { GameState, KeyState, Side } from './types';
import {
  MIDPOINT_X, FLOOR_SURFACE_Y, BED_SURFACE_Y, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED,
  BALL_RADIUS, FLOOR_PLAYER_MIN_X, FLOOR_PLAYER_MAX_X,
  BED_PLAYER_MIN_X, BED_PLAYER_MAX_X, WINNING_SCORE,
  COUNTDOWN_DURATION, SCORED_PAUSE,
} from './constants';
import {
  launchBall, updateBall, checkBallLanding,
  checkBallPlayerProximity, holdBall,
} from './physics';

export function createGameState(): GameState {
  const servingSide: Side = Math.random() < 0.5 ? 'floor' : 'bed';

  const state: GameState = {
    phase: 'countdown',
    floorScore: 0,
    bedScore: 0,
    floorPlayer: {
      x: 80 - PLAYER_WIDTH / 2,
      y: FLOOR_SURFACE_Y - PLAYER_HEIGHT,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      side: 'floor',
      shooting: false,
      shootTimer: 0,
    },
    bedPlayer: {
      x: 240 - PLAYER_WIDTH / 2,
      y: BED_SURFACE_Y - PLAYER_HEIGHT,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      side: 'bed',
      shooting: false,
      shootTimer: 0,
    },
    ball: {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: BALL_RADIUS,
      state: 'held',
      holder: servingSide,
    },
    servingSide,
    countdownTimer: COUNTDOWN_DURATION,
    scoredTimer: 0,
    winner: null,
    lastScorer: null,
  };

  const server = servingSide === 'floor' ? state.floorPlayer : state.bedPlayer;
  holdBall(state.ball, server);

  return state;
}

export function updateGame(state: GameState, dt: number, keys: KeyState): void {
  updateShootTimers(state, dt);

  switch (state.phase) {
    case 'countdown':
      handleCountdown(state, dt);
      break;
    case 'serving':
      handleServing(state, dt, keys);
      break;
    case 'playing':
      handlePlaying(state, dt, keys);
      break;
    case 'scored':
      handleScored(state, dt);
      break;
    case 'gameOver':
      break;
  }
}

function updateShootTimers(state: GameState, dt: number): void {
  if (state.floorPlayer.shootTimer > 0) {
    state.floorPlayer.shootTimer -= dt;
    if (state.floorPlayer.shootTimer <= 0) state.floorPlayer.shooting = false;
  }
  if (state.bedPlayer.shootTimer > 0) {
    state.bedPlayer.shootTimer -= dt;
    if (state.bedPlayer.shootTimer <= 0) state.bedPlayer.shooting = false;
  }
}

function handleCountdown(state: GameState, dt: number): void {
  state.countdownTimer -= dt;
  if (state.countdownTimer <= 0) {
    state.phase = 'serving';
  }
}

function handleServing(state: GameState, dt: number, keys: KeyState): void {
  updatePlayers(state, dt, keys);
  updateHeldBall(state);

  const serveKey = state.servingSide === 'floor' ? 'KeyW' : 'ArrowUp';
  if (keys.justPressed.has(serveKey)) {
    const server = state.servingSide === 'floor' ? state.floorPlayer : state.bedPlayer;
    server.shooting = true;
    server.shootTimer = 0.2;
    launchBall(state.ball, state.servingSide);
    state.phase = 'playing';
  }
}

function handlePlaying(state: GameState, dt: number, keys: KeyState): void {
  updatePlayers(state, dt, keys);
  updateBall(state.ball, dt);
  checkCatch(state, keys);

  const landedSide = checkBallLanding(state.ball);
  if (landedSide) {
    state.ball.state = 'landed';
    state.ball.vy = 0;
    state.ball.vx = 0;

    if (landedSide === 'floor') {
      state.bedScore++;
      state.lastScorer = 'bed';
      state.servingSide = 'floor';
    } else {
      state.floorScore++;
      state.lastScorer = 'floor';
      state.servingSide = 'bed';
    }

    if (state.floorScore >= WINNING_SCORE) {
      state.winner = 'floor';
      state.phase = 'gameOver';
    } else if (state.bedScore >= WINNING_SCORE) {
      state.winner = 'bed';
      state.phase = 'gameOver';
    } else {
      state.phase = 'scored';
      state.scoredTimer = SCORED_PAUSE;
    }
  }
}

function handleScored(state: GameState, dt: number): void {
  state.scoredTimer -= dt;
  if (state.scoredTimer <= 0) {
    resetRound(state);
  }
}

function updatePlayers(state: GameState, dt: number, keys: KeyState): void {
  const fp = state.floorPlayer;
  if (keys.pressed.has('KeyA')) fp.x -= PLAYER_SPEED * dt;
  if (keys.pressed.has('KeyD')) fp.x += PLAYER_SPEED * dt;
  fp.x = Math.max(FLOOR_PLAYER_MIN_X, Math.min(FLOOR_PLAYER_MAX_X, fp.x));

  const bp = state.bedPlayer;
  if (keys.pressed.has('ArrowLeft')) bp.x -= PLAYER_SPEED * dt;
  if (keys.pressed.has('ArrowRight')) bp.x += PLAYER_SPEED * dt;
  bp.x = Math.max(BED_PLAYER_MIN_X, Math.min(BED_PLAYER_MAX_X, bp.x));
}

function updateHeldBall(state: GameState): void {
  const holder = state.servingSide === 'floor' ? state.floorPlayer : state.bedPlayer;
  state.ball.x = holder.x + holder.width / 2;
  state.ball.y = holder.y - state.ball.radius - 2;
}

function checkCatch(state: GameState, keys: KeyState): void {
  if (keys.justPressed.has('KeyW')) {
    state.floorPlayer.shooting = true;
    state.floorPlayer.shootTimer = 0.2;
  }
  if (keys.justPressed.has('ArrowUp')) {
    state.bedPlayer.shooting = true;
    state.bedPlayer.shootTimer = 0.2;
  }

  if (state.floorPlayer.shooting && state.ball.state === 'flying' && state.ball.x < MIDPOINT_X + 20) {
    if (checkBallPlayerProximity(state.ball, state.floorPlayer)) {
      launchBall(state.ball, 'floor');
    }
  }
  if (state.bedPlayer.shooting && state.ball.state === 'flying' && state.ball.x >= MIDPOINT_X - 20) {
    if (checkBallPlayerProximity(state.ball, state.bedPlayer)) {
      launchBall(state.ball, 'bed');
    }
  }
}

function resetRound(state: GameState): void {
  state.phase = 'countdown';
  state.countdownTimer = COUNTDOWN_DURATION;

  state.floorPlayer.x = 80 - state.floorPlayer.width / 2;
  state.floorPlayer.y = FLOOR_SURFACE_Y - PLAYER_HEIGHT;
  state.bedPlayer.x = 240 - state.bedPlayer.width / 2;
  state.bedPlayer.y = BED_SURFACE_Y - PLAYER_HEIGHT;
  state.floorPlayer.shooting = false;
  state.floorPlayer.shootTimer = 0;
  state.bedPlayer.shooting = false;
  state.bedPlayer.shootTimer = 0;

  state.ball.state = 'held';
  state.ball.holder = state.servingSide;
  const server = state.servingSide === 'floor' ? state.floorPlayer : state.bedPlayer;
  holdBall(state.ball, server);
}
