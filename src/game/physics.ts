import { Ball, Player, Side } from './types';
import {
  GRAVITY, BALL_VX_MIN, BALL_VX_MAX, BALL_VY_MIN, BALL_VY_MAX,
  FLOOR_SURFACE_Y, BED_SURFACE_Y, MIDPOINT_X, CATCH_RADIUS, BALL_RADIUS, GAME_WIDTH,
  PLAYER_HITBOX_WIDTH, PLAYER_HITBOX_HEIGHT,
} from './constants';

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

type ShotType = 'lob' | 'fastFlat' | 'highArc' | 'earlyPeak' | 'latePeak';

function chooseShotType(): ShotType {
  const types: ShotType[] = ['lob', 'fastFlat', 'highArc', 'earlyPeak', 'latePeak'];
  return types[Math.floor(Math.random() * types.length)];
}

export function launchBall(ball: Ball, fromSide: Side): void {
  const direction = fromSide === 'floor' ? 1 : -1;
  const shotType = chooseShotType();

  let speedX: number;
  let apexHeight: number;
  let apexOffset: number;

  switch (shotType) {
    case 'lob':
      speedX = randomRange(BALL_VX_MIN, BALL_VX_MIN + (BALL_VX_MAX - BALL_VX_MIN) * 0.4);
      apexHeight = randomRange(90, 120);
      apexOffset = 0.5;
      break;
    case 'fastFlat':
      speedX = randomRange(BALL_VX_MIN + (BALL_VX_MAX - BALL_VX_MIN) * 0.6, BALL_VX_MAX);
      apexHeight = randomRange(50, 70);
      apexOffset = 0.5;
      break;
    case 'highArc':
      speedX = randomRange(BALL_VX_MIN + (BALL_VX_MAX - BALL_VX_MIN) * 0.3, BALL_VX_MIN + (BALL_VX_MAX - BALL_VX_MIN) * 0.7);
      apexHeight = randomRange(110, 140);
      apexOffset = 0.5;
      break;
    case 'earlyPeak':
      speedX = randomRange(BALL_VX_MIN + (BALL_VX_MAX - BALL_VX_MIN) * 0.3, BALL_VX_MAX);
      apexHeight = randomRange(70, 100);
      apexOffset = 0.3;
      break;
    case 'latePeak':
      speedX = randomRange(BALL_VX_MIN + (BALL_VX_MAX - BALL_VX_MIN) * 0.3, BALL_VX_MAX);
      apexHeight = randomRange(70, 100);
      apexOffset = 0.7;
      break;
  }

  // Store launch parameters
  ball.launchX = ball.x;
  ball.launchY = ball.y;
  ball.elapsedTime = 0;

  // Calculate target X based on speed and apex height
  const flightTime = Math.sqrt((4 * apexHeight) / GRAVITY);
  ball.totalFlightTime = flightTime;
  ball.targetX = ball.x + direction * speedX * flightTime;

  // Clamp target to game bounds
  ball.targetX = Math.max(BALL_RADIUS, Math.min(GAME_WIDTH - BALL_RADIUS, ball.targetX));

  // Determine target Y based on which side the ball will land on
  ball.targetY = ball.targetX < MIDPOINT_X ? FLOOR_SURFACE_Y : BED_SURFACE_Y;

  // Calculate apex position with offset for asymmetric curves
  ball.apexX = ball.launchX + (ball.targetX - ball.launchX) * apexOffset;
  ball.apexY = ball.launchY - apexHeight;

  // Set velocities for visual consistency
  ball.vx = direction * speedX;
  ball.vy = -(apexHeight * GRAVITY * flightTime) / (flightTime * flightTime);

  ball.state = 'flying';
  ball.holder = null;
}

export function updateBall(ball: Ball, dt: number): void {
  if (ball.state !== 'flying') return;
  if (!ball.launchX || !ball.launchY || !ball.apexX || !ball.apexY || !ball.targetX || !ball.targetY || !ball.totalFlightTime) return;

  // Update elapsed time
  ball.elapsedTime = (ball.elapsedTime || 0) + dt;

  // Calculate progress through trajectory (0 to 1)
  let progress = ball.elapsedTime / ball.totalFlightTime;
  progress = Math.min(progress, 1);

  // Horizontal position: linear interpolation
  ball.x = ball.launchX + (ball.targetX - ball.launchX) * progress;

  // Vertical position: asymmetric parabola using quadratic Bezier curve
  // Calculate where apex occurs in normalized time (0 to 1)
  const apexProgress = (ball.apexX - ball.launchX) / (ball.targetX - ball.launchX);

  // Use piecewise quadratic for smoother asymmetric curves
  let y: number;
  if (progress <= apexProgress) {
    // First half: launch to apex
    const t = progress / apexProgress;
    const p0 = ball.launchY;
    const p1 = ball.apexY;
    y = p0 + (p1 - p0) * (2 * t - t * t);
  } else {
    // Second half: apex to target
    const t = (progress - apexProgress) / (1 - apexProgress);
    const p0 = ball.apexY;
    const p1 = ball.targetY;
    y = p0 + (p1 - p0) * (t * t);
  }
  ball.y = y;

  // Update velocities for visual consistency
  ball.vx = (ball.targetX - ball.launchX) / ball.totalFlightTime;

  // Calculate vertical velocity based on which segment we're in
  if (progress <= apexProgress) {
    const t = progress / apexProgress;
    const p0 = ball.launchY;
    const p1 = ball.apexY;
    ball.vy = ((p1 - p0) * (2 - 2 * t)) / (apexProgress * ball.totalFlightTime);
  } else {
    const t = (progress - apexProgress) / (1 - apexProgress);
    const p0 = ball.apexY;
    const p1 = ball.targetY;
    ball.vy = ((p1 - p0) * 2 * t) / ((1 - apexProgress) * ball.totalFlightTime);
  }

  // Handle wall bounces by recalculating trajectory
  if (ball.x < BALL_RADIUS || ball.x > GAME_WIDTH - BALL_RADIUS) {
    ball.x = ball.x < BALL_RADIUS ? BALL_RADIUS : GAME_WIDTH - BALL_RADIUS;
    ball.vx *= -0.6;
    // Recalculate trajectory from current position
    const direction = ball.vx > 0 ? 1 : -1;
    const remainingHeight = ball.y - ball.apexY;
    const newApexHeight = Math.max(30, remainingHeight * 0.8);

    ball.launchX = ball.x;
    ball.launchY = ball.y;
    ball.elapsedTime = 0;

    const flightTime = Math.sqrt((4 * newApexHeight) / GRAVITY);
    ball.totalFlightTime = flightTime;
    ball.targetX = ball.x + direction * Math.abs(ball.vx) * flightTime;
    ball.targetX = Math.max(BALL_RADIUS, Math.min(GAME_WIDTH - BALL_RADIUS, ball.targetX));

    ball.targetY = ball.targetX < MIDPOINT_X ? FLOOR_SURFACE_Y : BED_SURFACE_Y;

    const apexOffset = 0.4 + Math.random() * 0.2;
    ball.apexX = ball.launchX + (ball.targetX - ball.launchX) * apexOffset;
    ball.apexY = ball.launchY - newApexHeight;
  }

  // Handle ceiling bounce
  if (ball.y < BALL_RADIUS) {
    ball.y = BALL_RADIUS;
    ball.vy = Math.abs(ball.vy) * 0.5;
    // Recalculate trajectory from current position
    const direction = ball.vx > 0 ? 1 : -1;

    ball.launchX = ball.x;
    ball.launchY = ball.y;
    ball.elapsedTime = 0;

    const newApexHeight = 40;
    const flightTime = Math.sqrt((4 * newApexHeight) / GRAVITY);
    ball.totalFlightTime = flightTime;
    ball.targetX = ball.x + direction * Math.abs(ball.vx) * flightTime;
    ball.targetX = Math.max(BALL_RADIUS, Math.min(GAME_WIDTH - BALL_RADIUS, ball.targetX));

    ball.targetY = ball.targetX < MIDPOINT_X ? FLOOR_SURFACE_Y : BED_SURFACE_Y;

    const apexOffset = 0.4 + Math.random() * 0.2;
    ball.apexX = ball.launchX + (ball.targetX - ball.launchX) * apexOffset;
    ball.apexY = ball.launchY - newApexHeight;
  }
}

export function checkBallLanding(ball: Ball): Side | null {
  if (ball.state !== 'flying') return null;

  if (ball.x < MIDPOINT_X) {
    if (ball.y + ball.radius >= FLOOR_SURFACE_Y) return 'floor';
  } else {
    if (ball.y + ball.radius >= BED_SURFACE_Y) return 'bed';
  }
  return null;
}

export function checkBallPlayerProximity(ball: Ball, player: Player): boolean {
  if (ball.state !== 'flying') return false;

  const hitboxOffsetX = (PLAYER_HITBOX_WIDTH - player.width) / 2;
  const hitboxOffsetY = (PLAYER_HITBOX_HEIGHT - player.height) / 2;
  const playerCenterX = player.x + player.width / 2;
  const playerCenterY = player.y + player.height / 2;
  const dx = ball.x - playerCenterX;
  const dy = ball.y - playerCenterY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const effectiveHitboxRadius = Math.sqrt(
    (PLAYER_HITBOX_WIDTH / 2) ** 2 + (PLAYER_HITBOX_HEIGHT / 2) ** 2
  );

  return dist < CATCH_RADIUS + hitboxOffsetX;
}

export function holdBall(ball: Ball, player: Player): void {
  ball.state = 'held';
  ball.holder = player.side;
  ball.x = player.x + player.width / 2;
  ball.y = player.y - ball.radius - 2;
  ball.vx = 0;
  ball.vy = 0;
}
