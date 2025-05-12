
import React from 'react';
import { GameState, Move, PieceColor } from '../types/chess';
import { formatMoveForDisplay } from '../utils/notationUtils';
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Undo, RotateCcw } from 'lucide-react';
import { BoardTheme } from './BoardThemeSelector';
import BoardThemeSelector from './BoardThemeSelector';

interface GameInfoProps {
  gameState: GameState;
  onRestart: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  boardTheme: BoardTheme;
  onChangeBoardTheme: (theme: BoardTheme) => void;
}

const GameInfo: React.FC<GameInfoProps> = ({
  gameState,
  onRestart,
  onCreateRoom,
  onJoinRoom,
  soundEnabled,
  onToggleSound,
  boardTheme,
  onChangeBoardTheme
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
    <div className="bg-card rounded-md shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-2">Game Status</h2>
        <div className="text-lg">
          {renderStatus()}
        </div>
        
        {isOnline && roomId && (
          <div className="mt-2 p-2 bg-muted rounded-md">
            <p className="font-medium">Room ID: <span className="font-mono font-bold">{roomId}</span></p>
            <p className="text-sm text-muted-foreground">Share this ID with your opponent</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-3">Game Controls</h3>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onRestart} variant="outline" size="sm" className="gap-1">
            <RotateCcw size={16} />
            New Game
          </Button>
          
          <Button onClick={onToggleSound} variant="outline" size="sm" className="gap-1" title={soundEnabled ? "Mute sounds" : "Unmute sounds"}>
            {soundEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            {soundEnabled ? "Sound On" : "Sound Off"}
          </Button>
          
          <BoardThemeSelector 
            currentTheme={boardTheme}
            onChange={onChangeBoardTheme}
          />
          
          {!isOnline && (
            <>
              <Button onClick={onCreateRoom} variant="secondary" size="sm">
                Create Online Room
              </Button>
              <Button onClick={onJoinRoom} variant="secondary" size="sm">
                Join Online Room
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold mb-2">Move History</h3>
        <div className="h-48 overflow-y-auto bg-muted/50 p-2 rounded-md">
          {history.length === 0 ? (
            <p className="text-muted-foreground italic">No moves yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              {history.map((move, idx) => {
                const moveNumber = Math.floor(idx / 2) + 1;
                const isWhiteMove = idx % 2 === 0;
                const isCheckMove = idx === history.length - 1 && check.inCheck;
                const isCheckmateMove = isCheckMove && gameStatus === 'checkmate';
                
                return (
                  <div 
                    key={idx} 
                    className={`px-2 py-1 rounded ${isWhiteMove ? 'bg-background/80' : ''} ${
                      idx === history.length - 1 ? 'ring-1 ring-primary' : ''
                    }`}
                  >
                    {isWhiteMove && (
                      <span className="font-semibold mr-1">{moveNumber}.</span>
                    )}
                    {formatMoveForDisplay(move, idx + 1, isCheckMove, isCheckmateMove)}
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
