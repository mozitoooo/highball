export type Side = 'floor' | 'bed';

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  side: Side;
  shooting: boolean;
  shootTimer: number;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  state: 'held' | 'flying' | 'landed';
  holder: Side | null;
  // Trajectory parameters for asymmetric parabola
  launchX?: number;
  launchY?: number;
  apexX?: number;
  apexY?: number;
  targetX?: number;
  targetY?: number;
  elapsedTime?: number;
  totalFlightTime?: number;
}

export type GamePhase = 'countdown' | 'serving' | 'playing' | 'scored' | 'gameOver';

export interface GameState {
  phase: GamePhase;
  floorScore: number;
  bedScore: number;
  floorPlayer: Player;
  bedPlayer: Player;
  ball: Ball;
  servingSide: Side;
  countdownTimer: number;
  scoredTimer: number;
  winner: Side | null;
  lastScorer: Side | null;
}

export interface KeyState {
  pressed: Set<string>;
  justPressed: Set<string>;
}
