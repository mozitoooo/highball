import { useState, useCallback } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { GameCanvas } from './components/GameCanvas';
import { GameOverScreen } from './components/GameOverScreen';
import { Side } from './game/types';

type Screen = 'title' | 'game' | 'gameOver';

function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [winner, setWinner] = useState<Side>('floor');
  const [gameKey, setGameKey] = useState(0);

  const handleStart = useCallback(() => {
    setGameKey(k => k + 1);
    setScreen('game');
  }, []);

  const handleGameOver = useCallback((w: Side) => {
    setWinner(w);
    setScreen('gameOver');
  }, []);

  const handleTitle = useCallback(() => {
    setScreen('title');
  }, []);

  if (screen === 'title') {
    return <TitleScreen onStart={handleStart} />;
  }

  if (screen === 'gameOver') {
    return (
      <GameOverScreen
        winner={winner}
        onRestart={handleStart}
        onTitle={handleTitle}
      />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#101018]">
      <GameCanvas key={gameKey} onGameOver={handleGameOver} />
    </div>
  );
}

export default App;
