import { useRef, useEffect, useCallback, useState } from 'react';
import { useKeyboard } from '../hooks/useKeyboard';
import { useGameLoop } from '../hooks/useGameLoop';
import { createGameState, updateGame } from '../game/engine';
import { drawGame } from '../game/renderer';
import { GAME_WIDTH, GAME_HEIGHT } from '../game/constants';
import { GameState, Side } from '../game/types';

interface GameCanvasProps {
  onGameOver: (winner: Side) => void;
}

export function GameCanvas({ onGameOver }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GameState>(createGameState());
  const keyboard = useKeyboard();
  const gameOverCalledRef = useRef(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    offscreenRef.current = document.createElement('canvas');
    offscreenRef.current.width = GAME_WIDTH;
    offscreenRef.current.height = GAME_HEIGHT;

    const updateSize = () => {
      const aspect = GAME_WIDTH / GAME_HEIGHT;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let w = vw;
      let h = vw / aspect;
      if (h > vh) {
        h = vh;
        w = vh * aspect;
      }
      setCanvasSize({ width: Math.floor(w), height: Math.floor(h) });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const tick = useCallback((dt: number) => {
    const state = stateRef.current;
    const keys = keyboard.current;

    updateGame(state, dt, keys);
    keys.justPressed.clear();

    if (state.phase === 'gameOver' && state.winner && !gameOverCalledRef.current) {
      gameOverCalledRef.current = true;
      setTimeout(() => onGameOver(state.winner!), 800);
    }

    const offscreen = offscreenRef.current;
    const canvas = canvasRef.current;
    if (!offscreen || !canvas) return;

    const offCtx = offscreen.getContext('2d');
    const ctx = canvas.getContext('2d');
    if (!offCtx || !ctx) return;

    drawGame(offCtx, state);

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height);
  }, [keyboard, onGameOver]);

  useGameLoop(tick);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#101018]">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="block"
        style={{ imageRendering: 'pixelated' }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        }}
      />
    </div>
  );
}
