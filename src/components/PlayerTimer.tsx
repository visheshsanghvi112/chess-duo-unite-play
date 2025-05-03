
import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { PlayerTimer } from '@/types/chess';

interface PlayerTimerProps {
  timers: PlayerTimer;
  currentPlayer: 'white' | 'black';
  gameStatus: string;
  isPlayerTurn: boolean;
}

const formatTime = (seconds: number): string => {
  if (seconds <= 0) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const PlayerTimer: React.FC<PlayerTimerProps> = ({ timers, currentPlayer, gameStatus, isPlayerTurn }) => {
  const [whiteTime, setWhiteTime] = useState(timers.white);
  const [blackTime, setBlackTime] = useState(timers.black);

  useEffect(() => {
    setWhiteTime(timers.white);
    setBlackTime(timers.black);
  }, [timers.white, timers.black]);

  useEffect(() => {
    if (gameStatus !== 'playing' && gameStatus !== 'check') {
      return; // Don't run timer if game is over
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = timers.startTime ? Math.floor((now - timers.startTime) / 1000) : 0;
      
      if (currentPlayer === 'white') {
        setWhiteTime(Math.max(0, timers.white - elapsed));
      } else {
        setBlackTime(Math.max(0, timers.black - elapsed));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timers, currentPlayer, gameStatus]);

  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className={`flex items-center gap-2 p-2 rounded-md ${currentPlayer === 'white' ? 'bg-primary/10 border border-primary/30' : ''}`}>
        <Clock size={16} className={currentPlayer === 'white' ? 'text-primary animate-pulse' : ''} />
        <span className="font-mono">White: {formatTime(whiteTime)}</span>
      </div>
      <div className={`flex items-center gap-2 p-2 rounded-md ${currentPlayer === 'black' ? 'bg-primary/10 border border-primary/30' : ''}`}>
        <Clock size={16} className={currentPlayer === 'black' ? 'text-primary animate-pulse' : ''} />
        <span className="font-mono">Black: {formatTime(blackTime)}</span>
      </div>
    </div>
  );
};

export default PlayerTimer;
