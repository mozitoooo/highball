import { useEffect, useCallback, useState, useRef } from 'react';

interface TitleScreenProps {
  onStart: () => void;
}

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  trail: Array<{ x: number; y: number }>;
  color: string;
  big: boolean;
}

function generateStars(count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const big = i < count * 0.3;
    const size = big ? Math.random() * 0.5 + 1.2 : Math.random() * 0.6 + 0.7;
    const speed = Math.random() * 0.025 + 0.008;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const maxTrail = big ? 80 : 40;
    const trail: Array<{ x: number; y: number }> = [];
    for (let t = maxTrail; t > 0; t--) {
      trail.push({ x: x - vx * t, y: y - vy * t });
    }
    stars.push({
      x,
      y,
      vx,
      vy,
      size,
      trail,
      color: `hsl(${Math.random() * 20 + 45}, 90%, 92%)`,
      big,
    });
  }
  return stars;
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  const starsRef = useRef<Star[]>(generateStars(40));
  const [, forceUpdate] = useState({});
  const [sunScale, setSunScale] = useState(1);
  const [moonRotation, setMoonRotation] = useState(0);

  const handleStart = useCallback(() => {
    onStart();
  }, [onStart]);

  const handleSunClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSunScale(1.4);
    setTimeout(() => setSunScale(1), 1000);
  }, []);

  const handleMoonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMoonRotation(prev => prev + 720);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleStart();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleStart]);

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      const stars = starsRef.current;

      stars.forEach(star => {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0) star.x = 100;
        if (star.x > 100) star.x = 0;
        if (star.y < 0) star.y = 100;
        if (star.y > 100) star.y = 0;

        const wrapped =
          star.x === 0 || star.x === 100 || star.y === 0 || star.y === 100;
        if (wrapped) star.trail = [];
        star.trail.push({ x: star.x, y: star.y });
        const maxTrail = star.big ? 80 : 40;
        if (star.trail.length > maxTrail) {
          star.trail.shift();
        }
      });

      forceUpdate({});
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen font-pixel select-none overflow-hidden cursor-pointer"
      onClick={handleStart}
      style={{
        background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 50%, #0a0a2a 100%)',
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="pointer-events-none" style={{ zIndex: 0 }}>
          {starsRef.current.map((star, i) => (
            <div key={i}>
              {star.trail.map((point, j) => {
                const progress = star.trail.length > 1 ? j / (star.trail.length - 1) : 1;
                const trailOpacity = Math.pow(progress, 1.2) * 0.75;
                const trailSize = star.size * (0.3 + progress * 0.7) * (star.big ? 2.5 : 1.4);
                return (
                  <div
                    key={`${i}-trail-${j}`}
                    className="absolute rounded-full"
                    style={{
                      width: trailSize,
                      height: trailSize,
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                      opacity: trailOpacity,
                      background: progress > 0.7 ? '#fffde8' : star.color,
                      transform: 'translate(-50%, -50%)',
                      boxShadow: `0 0 ${trailSize * 1.2}px ${star.color}`,
                      pointerEvents: 'none',
                    }}
                  />
                );
              })}
              <div
                className="absolute rounded-full"
                style={{
                  width: star.big ? star.size * 2.5 : star.size * 1.4,
                  height: star.big ? star.size * 2.5 : star.size * 1.4,
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  opacity: 1,
                  background: '#fffde8',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: star.big
                    ? `0 0 ${star.size * 1.5}px #fffde8, 0 0 ${star.size * 3}px ${star.color}`
                    : `0 0 ${star.size * 1.5}px #fffde8, 0 0 ${star.size * 2.5}px ${star.color}`,
                  pointerEvents: 'none',
                }}
              />
            </div>
          ))}
        </div>

        <div
          className="absolute rounded-full cursor-pointer transition-all duration-1000"
          onClick={handleSunClick}
          style={{
            width: '80px',
            height: '80px',
            left: '10%',
            top: '10%',
            background: 'radial-gradient(circle, #FFF9E6 0%, #FFE680 50%, #FFD700 100%)',
            boxShadow: `0 0 ${40 * sunScale}px #FFD700, 0 0 ${80 * sunScale}px #FFA500`,
            transform: `scale(${sunScale})`,
            pointerEvents: 'auto',
            zIndex: 1,
          }}
        />

        <div
          className="absolute rounded-full cursor-pointer"
          onClick={handleMoonClick}
          style={{
            width: '60px',
            height: '60px',
            right: '8%',
            top: '15%',
            background: 'radial-gradient(circle at 35% 35%, #E8E8F0 0%, #D0D0E0 50%, #B0B0C8 100%)',
            boxShadow: '0 0 30px rgba(200, 200, 240, 0.6), inset -8px -8px 15px rgba(0, 0, 0, 0.3)',
            transform: `rotate(${moonRotation}deg)`,
            transition: 'transform 0.6s linear',
            pointerEvents: 'auto',
            zIndex: 1,
          }}
        />
      </div>

      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 to-purple-500" />
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-blue-500 via-cyan-500 via-green-500 via-yellow-500 to-red-500" />

      <div className="relative z-10 flex flex-col items-center px-4">
        <div className="mb-2 text-[10px] sm:text-xs tracking-widest text-cyan-400">
          MOZITO STUDIOS PRESENT
        </div>

        <div className="relative mb-2">
          <div
            className="text-4xl sm:text-6xl font-bold tracking-wider"
            style={{
              color: '#FFE040',
              textShadow: '0 0 10px #FFE040, 0 0 20px #FF8000, 0 0 30px #FF4000, 4px 4px 0 #8B4000',
              WebkitTextStroke: '1px #FF8000',
            }}
          >
            High-Ball
          </div>
        </div>

        <div className="relative mb-6">
          <div
            className="text-3xl sm:text-5xl font-bold tracking-wider"
            style={{
              color: '#40FF90',
              textShadow: '0 0 10px #40FF90, 0 0 20px #00FF60, 0 0 30px #00AA40, 3px 3px 0 #004020',
              WebkitTextStroke: '1px #00AA40',
            }}
          >
            LEGENDS
          </div>
        </div>

        <div className="flex gap-8 sm:gap-16 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-12 h-16 sm:w-16 sm:h-20 relative mb-2">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 sm:w-10 h-10 sm:h-12 bg-green-500 rounded-t-lg border-2 border-green-700" />
              <div className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 w-6 sm:w-8 h-6 sm:h-8 bg-[#F0B080] rounded-full border-2 border-[#D09060]" />
              <div className="absolute bottom-[42px] sm:bottom-[52px] left-1/2 -translate-x-1/2 w-6 sm:w-8 h-3 bg-green-800 rounded-t" />
            </div>
            <div className="text-green-400 text-[10px] sm:text-xs">FLOOR</div>
          </div>
          <div className="text-2xl sm:text-3xl text-yellow-400 self-center font-bold">VS</div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-16 sm:w-16 sm:h-20 relative mb-2">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 sm:w-10 h-10 sm:h-12 rounded-t-lg border-2" style={{ backgroundColor: '#FFE040', borderColor: '#CCA000' }} />
              <div className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 w-6 sm:w-8 h-6 sm:h-8 bg-[#F0B080] rounded-full border-2 border-[#D09060]" />
              <div className="absolute bottom-[42px] sm:bottom-[52px] left-1/2 -translate-x-1/2 w-6 sm:w-8 h-3 rounded-t" style={{ backgroundColor: '#8B7000' }} />
            </div>
            <div className="text-[10px] sm:text-xs" style={{ color: '#FFE040' }}>BED</div>
          </div>
        </div>

        <div
          className="mb-6 px-4 sm:px-6 py-3 sm:py-4 rounded-lg border-2"
          style={{
            background: 'linear-gradient(180deg, #2a2a5a 0%, #1a1a3a 100%)',
            borderColor: '#4a4a8a',
            boxShadow: '0 0 20px rgba(100, 100, 200, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="text-[10px] sm:text-xs mb-3 text-cyan-300 text-center tracking-wider">
            CONTROLS
          </div>
          <div className="text-[8px] sm:text-[10px] space-y-2">
            <div className="flex justify-between gap-6 sm:gap-10">
              <span className="text-green-400">FLOOR</span>
              <span className="text-gray-300">
                <span className="text-yellow-300">[A]</span>
                <span className="text-yellow-300">[D]</span> Move
                <span className="text-yellow-300 ml-2">[W]</span> Hit
              </span>
            </div>
            <div className="flex justify-between gap-6 sm:gap-10">
              <span style={{ color: '#FFE040' }}>BED</span>
              <span className="text-gray-300">
                <span className="text-yellow-300">[←]</span>
                <span className="text-yellow-300">[→]</span> Move
                <span className="text-yellow-300 ml-2">[↑]</span> Hit
              </span>
            </div>
          </div>
        </div>

        <div className="text-sm sm:text-base mb-4 text-orange-400 tracking-wider">
          FIRST TO <span className="text-2xl sm:text-3xl text-yellow-300 mx-1">5</span> WINS!
        </div>

        <button
          onClick={handleStart}
          className="group relative mt-2 px-7 py-3 rounded-lg font-bold tracking-widest transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #0a1628 0%, #0d2040 50%, #0a1628 100%)',
            border: '2px solid #00bfff',
            boxShadow: '0 0 18px rgba(0,191,255,0.5), 0 0 40px rgba(0,100,200,0.3), inset 0 0 20px rgba(0,150,255,0.08)',
            color: '#e0f4ff',
            textShadow: '0 0 8px #00bfff, 0 0 18px #0080ff',
          }}
        >
          <span
            className="block text-sm sm:text-base tracking-widest"
            style={{ letterSpacing: '0.25em' }}
          >
            PRESS START
          </span>
          <span
            className="block text-[10px] sm:text-xs tracking-widest mt-0.5"
            style={{
              color: '#7dd3fc',
              textShadow: '0 0 6px #38bdf8',
              letterSpacing: '0.35em',
              fontWeight: 400,
            }}
          >
            [SPACEBAR]
          </span>
          <span
            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(0,191,255,0.12) 0%, rgba(0,100,255,0.08) 100%)',
              boxShadow: 'inset 0 0 30px rgba(0,191,255,0.15)',
            }}
          />
        </button>

        <div className="mt-6 text-[8px] text-gray-500">
          2024 RETRO ARCADE
        </div>
      </div>
    </div>
  );
}
