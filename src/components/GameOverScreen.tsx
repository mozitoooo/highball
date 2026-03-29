import { useEffect, useCallback, useState } from 'react';
import { Side } from '../game/types';

interface GameOverScreenProps {
  winner: Side;
  onRestart: () => void;
  onTitle: () => void;
}

export function GameOverScreen({ winner, onRestart, onTitle }: GameOverScreenProps) {
  const [blink, setBlink] = useState(true);

  const handleRestart = useCallback(() => {
    onRestart();
  }, [onRestart]);

  const handleTitle = useCallback(() => {
    onTitle();
  }, [onTitle]);

  useEffect(() => {
    const interval = setInterval(() => setBlink(b => !b), 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleRestart();
      }
      if (e.code === 'Escape') {
        e.preventDefault();
        handleTitle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleRestart, handleTitle]);

  const isFloor = winner === 'floor';
  const winnerName = isFloor ? 'FLOOR' : 'BED';
  const winnerColor = isFloor ? '#40FF90' : '#FF6060';
  const winnerGlow = isFloor ? '#00FF60' : '#FF0000';

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen font-pixel select-none overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 50%, #0a0a2a 100%)',
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: winnerColor,
              opacity: Math.random() * 0.5 + 0.2,
              animation: `twinkle ${Math.random() * 2 + 1}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 to-purple-500" />
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-blue-500 via-cyan-500 via-green-500 via-yellow-500 to-red-500" />

      <div className="relative z-10 flex flex-col items-center px-4">
        <div
          className="text-2xl sm:text-4xl mb-6 tracking-wider"
          style={{
            color: '#FFE040',
            textShadow: '0 0 10px #FFE040, 0 0 20px #FF8000, 3px 3px 0 #8B4000',
          }}
        >
          GAME OVER
        </div>

        <div className="mb-2 text-sm sm:text-base text-cyan-300">WINNER</div>

        <div
          className="text-3xl sm:text-5xl mb-8 tracking-wider font-bold"
          style={{
            color: winnerColor,
            textShadow: `0 0 20px ${winnerGlow}, 0 0 40px ${winnerGlow}, 4px 4px 0 ${isFloor ? '#004020' : '#400000'}`,
            animation: 'pulse 1s ease-in-out infinite',
          }}
        >
          {winnerName}
        </div>

        <div className="w-16 h-20 sm:w-20 sm:h-24 relative mb-8">
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-12 sm:h-14 rounded-t-lg border-2"
            style={{
              backgroundColor: isFloor ? '#22c55e' : '#ef4444',
              borderColor: isFloor ? '#15803d' : '#b91c1c',
            }}
          />
          <div className="absolute bottom-10 sm:bottom-12 left-1/2 -translate-x-1/2 w-8 sm:w-10 h-8 sm:h-10 bg-[#F0B080] rounded-full border-2 border-[#D09060]" />
          <div
            className="absolute bottom-[52px] sm:bottom-[64px] left-1/2 -translate-x-1/2 w-8 sm:w-10 h-4 rounded-t"
            style={{ backgroundColor: isFloor ? '#166534' : '#991b1b' }}
          />
          <div
            className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl"
            style={{ animation: 'bounce 0.5s ease-in-out infinite' }}
          >
            👑
          </div>
        </div>

        <div className="space-y-4 text-center">
          <button
            onClick={handleRestart}
            className="block w-full px-6 py-2 rounded cursor-pointer transition-all hover:scale-105"
            style={{
              color: blink ? '#FFFFFF' : '#FFFF00',
              textShadow: blink ? '0 0 10px #FFFFFF' : '0 0 20px #FFFF00',
              background: 'linear-gradient(180deg, #3a3a6a 0%, #2a2a4a 100%)',
              border: '2px solid #5a5a9a',
            }}
          >
            <span className="text-xs sm:text-sm">PLAY AGAIN</span>
            <span className="text-[10px] block text-gray-400">[SPACE/ENTER]</span>
          </button>

          <button
            onClick={handleTitle}
            className="block w-full px-6 py-2 rounded cursor-pointer transition-all hover:scale-105"
            style={{
              color: '#A0B0C0',
              background: 'linear-gradient(180deg, #2a2a4a 0%, #1a1a3a 100%)',
              border: '2px solid #3a3a6a',
            }}
          >
            <span className="text-xs sm:text-sm">TITLE SCREEN</span>
            <span className="text-[10px] block text-gray-500">[ESC]</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
