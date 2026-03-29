import { GameState, Player, Ball } from './types';
import {
  GAME_WIDTH, GAME_HEIGHT, MIDPOINT_X, FLOOR_SURFACE_Y, BED_SURFACE_Y, COLORS,
  CATCH_RADIUS,
} from './constants';

export function drawGame(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.imageSmoothingEnabled = false;
  drawBackground(ctx);
  drawCatchIndicator(ctx, state);
  drawPlayer(ctx, state.floorPlayer);
  drawPlayer(ctx, state.bedPlayer);
  drawBall(ctx, state.ball);
  drawScoreboard(ctx, state.floorScore, state.bedScore);

  if (state.phase === 'countdown') {
    drawCountdown(ctx, Math.ceil(state.countdownTimer));
  }
  if (state.phase === 'scored' && state.lastScorer) {
    drawScoredMessage(ctx, state.lastScorer);
  }
}

function drawBackground(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, GAME_WIDTH, BED_SURFACE_Y);

  ctx.fillStyle = COLORS.wallAccent;
  for (let x = 10; x < GAME_WIDTH; x += 20) {
    for (let y = 10; y < BED_SURFACE_Y - 20; y += 20) {
      ctx.fillRect(x, y, 2, 2);
    }
  }

  ctx.fillStyle = COLORS.wallTrim;
  ctx.fillRect(0, FLOOR_SURFACE_Y - 4, MIDPOINT_X, 4);

  drawWindow(ctx, 130, 25, 60, 70);
  drawPoster(ctx, 30, 30, 40, 50);
  drawShelf(ctx, 240, 60, 50, 6);

  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, BED_SURFACE_Y, MIDPOINT_X, FLOOR_SURFACE_Y - BED_SURFACE_Y);

  for (let y = FLOOR_SURFACE_Y; y < GAME_HEIGHT; y += 8) {
    ctx.fillStyle = y % 16 < 8 ? COLORS.floorDark : COLORS.floorLight;
    ctx.fillRect(0, y, MIDPOINT_X, 8);
  }
  ctx.fillStyle = COLORS.floorLine;
  for (let y = FLOOR_SURFACE_Y; y < GAME_HEIGHT; y += 8) {
    ctx.fillRect(0, y, MIDPOINT_X, 1);
  }
  for (let x = 0; x < MIDPOINT_X; x += 40) {
    ctx.fillRect(x, FLOOR_SURFACE_Y, 1, GAME_HEIGHT - FLOOR_SURFACE_Y);
  }

  drawBed(ctx);
}

function drawWindow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = COLORS.windowFrame;
  ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
  ctx.fillStyle = COLORS.windowGlass;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#A0D0F0';
  ctx.fillRect(x, y, w, h / 3);
  ctx.fillStyle = COLORS.windowFrame;
  ctx.fillRect(x + w / 2 - 1, y, 2, h);
  ctx.fillRect(x, y + h / 2 - 1, w, 2);
  ctx.fillStyle = COLORS.curtain;
  ctx.fillRect(x - 7, y - 5, 8, h + 8);
  ctx.fillRect(x + w - 1, y - 5, 8, h + 8);
  ctx.fillStyle = '#A03030';
  ctx.fillRect(x - 7, y - 5, 8, 3);
  ctx.fillRect(x + w - 1, y - 5, 8, 3);
}

function drawPoster(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = '#E8D0A0';
  ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = '#2A5A2A';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#3A7A3A';
  ctx.fillRect(x + 4, y + 8, w - 8, h - 20);
  ctx.fillStyle = '#F0E060';
  ctx.font = '6px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('HB', x + w / 2, y + h / 2 + 2);
}

function drawShelf(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = '#6A4420';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#8A6040';
  ctx.fillRect(x, y, w, 2);

  ctx.fillStyle = '#C04040';
  ctx.fillRect(x + 4, y - 12, 8, 12);
  ctx.fillStyle = '#4040C0';
  ctx.fillRect(x + 14, y - 10, 6, 10);
  ctx.fillStyle = '#40A040';
  ctx.fillRect(x + 22, y - 14, 7, 14);
  ctx.fillStyle = '#C0A040';
  ctx.fillRect(x + 34, y - 8, 10, 8);
}

function drawBed(ctx: CanvasRenderingContext2D): void {
  const bx = MIDPOINT_X + 6;
  const by = BED_SURFACE_Y;
  const bw = GAME_WIDTH - MIDPOINT_X - 12;
  const bh = GAME_HEIGHT - BED_SURFACE_Y;

  // Left bed border (shorter - from bed surface to bottom)
  ctx.fillStyle = COLORS.bedBorder;
  ctx.fillRect(MIDPOINT_X, BED_SURFACE_Y, 6, GAME_HEIGHT - BED_SURFACE_Y);

  // Right bed border (taller - from second wall dot from bottom to bottom)
  ctx.fillStyle = COLORS.bedBorder;
  ctx.fillRect(GAME_WIDTH - 6, 130, 6, GAME_HEIGHT - 130);

  // Mattress
  ctx.fillStyle = COLORS.mattress;
  ctx.fillRect(bx, by, bw, bh);

  // Pillow at top - smaller
  ctx.fillStyle = COLORS.pillow;
  ctx.fillRect(bx + 6, by + 4, bw - 12, 10);

  // Blue blanket - bigger, covering more of the bed
  ctx.fillStyle = COLORS.blanket;
  ctx.fillRect(bx, by + 14, bw, bh - 14);
}

function drawCatchIndicator(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (state.ball.state !== 'flying') return;

  const checkPlayer = (player: Player) => {
    const pcx = player.x + player.width / 2;
    const pcy = player.y + player.height / 2;
    const dx = state.ball.x - pcx;
    const dy = state.ball.y - pcy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < CATCH_RADIUS) {
      ctx.fillStyle = COLORS.catchHighlight;
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, state.ball.radius + 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  if (state.ball.x < MIDPOINT_X + 20) checkPlayer(state.floorPlayer);
  if (state.ball.x >= MIDPOINT_X - 20) checkPlayer(state.bedPlayer);
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: Player): void {
  const x = Math.round(player.x);
  const y = Math.round(player.y);
  const isFloor = player.side === 'floor';
  const mainColor = isFloor ? COLORS.playerFloor : COLORS.playerBed;
  const darkColor = isFloor ? COLORS.playerFloorDark : COLORS.playerBedDark;

  ctx.fillStyle = COLORS.pants;
  ctx.fillRect(x + 3, y + 18, 4, 6);
  ctx.fillRect(x + 9, y + 18, 4, 6);

  ctx.fillStyle = '#202020';
  ctx.fillRect(x + 2, y + 22, 6, 2);
  ctx.fillRect(x + 8, y + 22, 6, 2);

  ctx.fillStyle = mainColor;
  ctx.fillRect(x + 2, y + 8, 12, 10);
  ctx.fillStyle = darkColor;
  ctx.fillRect(x + 2, y + 8, 12, 2);

  ctx.fillStyle = COLORS.skin;
  if (player.shooting && player.shootTimer > 0) {
    ctx.fillRect(x - 2, y + 2, 4, 6);
    ctx.fillRect(x + 14, y + 2, 4, 6);
  } else {
    ctx.fillRect(x, y + 10, 3, 6);
    ctx.fillRect(x + 13, y + 10, 3, 6);
  }

  ctx.fillStyle = COLORS.skin;
  ctx.fillRect(x + 3, y, 10, 8);
  ctx.fillStyle = COLORS.hair;
  ctx.fillRect(x + 3, y, 10, 3);
  ctx.fillStyle = isFloor ? '#204020' : '#806000';
  ctx.fillRect(x + 3, y, 10, 2);
  ctx.fillStyle = '#202020';
  ctx.fillRect(x + 5, y + 4, 2, 2);
  ctx.fillRect(x + 9, y + 4, 2, 2);
  ctx.fillStyle = '#F08070';
  ctx.fillRect(x + 7, y + 6, 2, 1);
}

function drawBall(ctx: CanvasRenderingContext2D, ball: Ball): void {
  const bx = Math.round(ball.x);
  const by = Math.round(ball.y);
  const r = ball.radius;

  const shadowY = ball.x < MIDPOINT_X ? FLOOR_SURFACE_Y : BED_SURFACE_Y;
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(bx, shadowY + 2, r, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFE020';
  ctx.beginPath();
  ctx.arc(bx, by, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FF6020';
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.arc(bx, by, r, 0, Math.PI / 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#FF6020';
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.arc(bx, by, r, Math.PI, Math.PI * 1.5);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#CC4010';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(bx, by, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.arc(bx - 2, by - 2, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawScoreboard(ctx: CanvasRenderingContext2D, floorScore: number, bedScore: number): void {
  const sbW = 140;
  const sbH = 20;
  const sbX = (GAME_WIDTH - sbW) / 2;
  const sbY = 3;

  ctx.fillStyle = COLORS.scoreBg;
  ctx.fillRect(sbX, sbY, sbW, sbH);
  ctx.strokeStyle = COLORS.scoreBorder;
  ctx.lineWidth = 1;
  ctx.strokeRect(sbX + 0.5, sbY + 0.5, sbW - 1, sbH - 1);

  ctx.fillStyle = COLORS.scoreText;
  ctx.font = '9px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`FLOOR ${floorScore}-${bedScore} BED`, GAME_WIDTH / 2, sbY + sbH / 2 + 1);
}

function drawCountdown(ctx: CanvasRenderingContext2D, count: number): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.fillStyle = COLORS.textLight;
  ctx.font = '24px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(count > 0 ? String(count) : 'GO!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);

  ctx.font = '6px "Press Start 2P", monospace';
  ctx.fillStyle = '#A0A0A0';
  ctx.fillText('GET READY', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10);
}

function drawScoredMessage(ctx: CanvasRenderingContext2D, scorer: string): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.fillStyle = '#F8E030';
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const name = scorer === 'floor' ? 'FLOOR' : 'BED';
  ctx.fillText(`${name} SCORES!`, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10);
}
