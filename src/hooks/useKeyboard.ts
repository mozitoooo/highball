import { useEffect, useRef } from 'react';
import { KeyState } from '../game/types';

const GAME_KEYS = new Set([
  'KeyA', 'KeyD', 'KeyW',
  'ArrowLeft', 'ArrowRight', 'ArrowUp',
  'Space', 'Enter', 'Escape',
]);

export function useKeyboard() {
  const stateRef = useRef<KeyState>({
    pressed: new Set(),
    justPressed: new Set(),
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (GAME_KEYS.has(e.code)) {
        e.preventDefault();
      }
      if (!stateRef.current.pressed.has(e.code)) {
        stateRef.current.justPressed.add(e.code);
      }
      stateRef.current.pressed.add(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (GAME_KEYS.has(e.code)) {
        e.preventDefault();
      }
      stateRef.current.pressed.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return stateRef;
}
