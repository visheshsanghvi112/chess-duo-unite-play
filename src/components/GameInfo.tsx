
import React from 'react';
import { GameState, Move, PieceColor } from '../types/chess';
import { formatMoveForDisplay } from '../utils/notationUtils';
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from 'lucide-react';
import { setSoundMuted } from '../utils/soundUtils';

interface GameInfoProps {
  gameState: GameState;
  onRestart: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const GameInfo: React.FC<GameInfoProps> = ({
  gameState,
  onRestart,
  onCreateRoom,
  onJoinRoom,
  soundEnabled,
  onToggleSound,
}) => {
  const { currentPlayer, gameStatus, history, isOnline, roomId, check } = gameState;

  const renderStatus = () => {
    switch (gameStatus) {
      case 'check':
        return <span className="font-bold text-orange-500">Check!</span>;
      case 'checkmate':
        const winner = currentPlayer === 'white' ? 'Black' : 'White';
        return <span className="font-bold text-green-600">Checkmate! {winner} wins!</span>;
      case 'stalemate':
        return <span className="font-bold text-blue-500">Stalemate! Game is a draw.</span>;
      case 'draw':
        return <span className="font-bold text-blue-500">Draw!</span>;
      default:
        return <span>{currentPlayer === 'white' ? 'White' : 'Black'}'s turn</span>;
    }
  };

  return (
    <div className="bg-card p-4 rounded-md shadow-md">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Game Status</h2>
        <div className="text-lg">
          {renderStatus()}
        </div>
        
        {isOnline && roomId && (
          <div className="mt-2 p-2 bg-muted rounded-md">
            <p className="font-medium">Room ID: <span className="font-bold">{roomId}</span></p>
            <p className="text-sm text-gray-500">Share this ID with your opponent</p>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Game Controls</h3>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onRestart} variant="outline">
            New Game
          </Button>
          
          <Button onClick={onToggleSound} variant="outline" className="px-3" title={soundEnabled ? "Mute sounds" : "Unmute sounds"}>
            {soundEnabled ? <Bell size={18} /> : <BellOff size={18} />}
          </Button>
          
          {!isOnline && (
            <>
              <Button onClick={onCreateRoom} variant="secondary">
                Create Online Room
              </Button>
              <Button onClick={onJoinRoom} variant="secondary">
                Join Online Room
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Move History</h3>
        <div className="h-48 overflow-y-auto bg-muted p-2 rounded-md">
          {history.length === 0 ? (
            <p className="text-gray-500 italic">No moves yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {history.map((move, idx) => {
                const moveNumber = idx + 1;
                const isCheckMove = idx === history.length - 1 && check.inCheck;
                const isCheckmateMove = isCheckMove && gameStatus === 'checkmate';
                
                return (
                  <div 
                    key={idx} 
                    className={`px-2 py-1 ${idx % 2 === 0 ? 'bg-background rounded-sm' : ''}`}
                  >
                    {idx % 2 === 0 && (
                      <span className="font-semibold mr-1">{Math.ceil(moveNumber/2)}.</span>
                    )}
                    {formatMoveForDisplay(move, moveNumber, isCheckMove, isCheckmateMove)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameInfo;
