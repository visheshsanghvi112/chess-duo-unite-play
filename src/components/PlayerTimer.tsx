
import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import type { PlayerTimer as PlayerTimerType } from '@/types/chess';

interface PlayerTimerProps {
  timers: PlayerTimerType;
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
  
  // Calculate progress percentages (based on 10-minute default)
  const whiteProgress = (whiteTime / 600) * 100;
  const blackProgress = (blackTime / 600) * 100;

  useEffect(() => {
    // Update local state when props change (e.g., game restart)
    setWhiteTime(timers.white);
    setBlackTime(timers.black);
  }, [timers.white, timers.black]);

  useEffect(() => {
    if (gameStatus !== 'playing' && gameStatus !== 'check') {
      return; // Don't run timer if game is over
    }

    const interval = setInterval(() => {
      if (currentPlayer === 'white') {
        // Only decrease time for the current player
        setWhiteTime(prevTime => Math.max(0, prevTime - 1));
      } else {
        // Only decrease time for the current player
        setBlackTime(prevTime => Math.max(0, prevTime - 1));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPlayer, gameStatus]);

  // Determine if time is getting low (less than 30 seconds)
  const isWhiteTimeLow = whiteTime < 30;
  const isBlackTimeLow = blackTime < 30;

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className={`relative overflow-hidden rounded-lg transition-all duration-300 ${currentPlayer === 'white' ? 'bg-primary/10 border-2 border-primary shadow-md' : 'bg-card border border-border'}`}>
        <div className="flex items-center gap-2 p-3">
          <div className={`rounded-full p-1 ${currentPlayer === 'white' ? 'bg-primary/20' : ''}`}>
            <Clock size={18} className={currentPlayer === 'white' ? 'text-primary animate-pulse' : ''} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold">White</span>
              <span className={`font-mono text-lg ${isWhiteTimeLow ? 'text-destructive font-bold' : ''}`}>
                {formatTime(whiteTime)}
                {isWhiteTimeLow && <AlertTriangle size={16} className="inline ml-1 animate-pulse" />}
              </span>
            </div>
            <Progress value={whiteProgress} className="h-1.5 mt-1" 
              variant={isWhiteTimeLow ? "destructive" : "default"} />
          </div>
        </div>
      </div>
      
      <div className={`relative overflow-hidden rounded-lg transition-all duration-300 ${currentPlayer === 'black' ? 'bg-primary/10 border-2 border-primary shadow-md' : 'bg-card border border-border'}`}>
        <div className="flex items-center gap-2 p-3">
          <div className={`rounded-full p-1 ${currentPlayer === 'black' ? 'bg-primary/20' : ''}`}>
            <Clock size={18} className={currentPlayer === 'black' ? 'text-primary animate-pulse' : ''} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Black</span>
              <span className={`font-mono text-lg ${isBlackTimeLow ? 'text-destructive font-bold' : ''}`}>
                {formatTime(blackTime)}
                {isBlackTimeLow && <AlertTriangle size={16} className="inline ml-1 animate-pulse" />}
              </span>
            </div>
            <Progress value={blackProgress} className="h-1.5 mt-1" 
              variant={isBlackTimeLow ? "destructive" : "default"} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerTimer;
