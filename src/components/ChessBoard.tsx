
import React from 'react';
import { GameState, Position } from '../types/chess';
import ChessSquare from './ChessSquare';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChessBoardProps {
  gameState: GameState;
  onSquareClick: (position: Position) => void;
  flipped?: boolean;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ gameState, onSquareClick, flipped = false }) => {
  const { board, selectedPiece, validMoves, check } = gameState;
  const isMobile = useIsMobile();

  // Determine if a position is a valid move
  const isValidMovePosition = (pos: Position): boolean => {
    return validMoves.some(move => move.x === pos.x && move.y === pos.y);
  };

  // Determine if a position is in check
  const isInCheck = (pos: Position): boolean => {
    return (
      check.inCheck &&
      check.kingPosition &&
      check.kingPosition.x === pos.x &&
      check.kingPosition.y === pos.y
    );
  };

  // Generate the board, properly flipped when needed
  const renderBoard = () => {
    const elements = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        // Convert logical positions to board display positions based on flipped state
        const displayY = flipped ? 7 - row : row;
        const displayX = flipped ? 7 - col : col;
        
        const position = { x: displayX, y: displayY };
        const piece = board[displayY][displayX];
        const isSelected = selectedPiece !== null && 
                          selectedPiece.x === displayX && 
                          selectedPiece.y === displayY;
        
        elements.push(
          <ChessSquare
            key={`${displayX},${displayY}`}
            position={position}
            piece={piece}
            isSelected={isSelected}
            isValidMove={isValidMovePosition(position)}
            isCheck={isInCheck(position)}
            onSquareClick={onSquareClick}
          />
        );
      }
    }
    return elements;
  };

  // Render rank and file labels
  const renderBoardLabels = () => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    
    // Flip labels as needed
    const displayFiles = flipped ? [...files].reverse() : files;
    const displayRanks = flipped ? [...ranks].reverse() : ranks;

    if (isMobile) {
      // Simplified labels for mobile
      return (
        <div className="flex-1 grid grid-cols-8 grid-rows-8">
          {renderBoard()}
        </div>
      );
    }

    return (
      <>
        <div className="flex">
          <div className="w-6"></div> {/* Spacer */}
          {displayFiles.map((file, i) => (
            <div key={file} className="flex-1 text-center font-semibold text-sm">
              {file}
            </div>
          ))}
          <div className="w-6"></div> {/* Spacer */}
        </div>
        
        <div className="flex">
          <div className="w-6 flex flex-col">
            {displayRanks.map((rank, i) => (
              <div key={rank} className="flex-1 flex items-center justify-center font-semibold text-sm">
                {rank}
              </div>
            ))}
          </div>
          
          <div className="flex-1 grid grid-cols-8 grid-rows-8">
            {renderBoard()}
          </div>
          
          <div className="w-6 flex flex-col">
            {displayRanks.map((rank, i) => (
              <div key={`right-${rank}`} className="flex-1 flex items-center justify-center font-semibold text-sm">
                {rank}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex">
          <div className="w-6"></div> {/* Spacer */}
          {displayFiles.map((file, i) => (
            <div key={`bottom-${file}`} className="flex-1 text-center font-semibold text-sm">
              {file}
            </div>
          ))}
          <div className="w-6"></div> {/* Spacer */}
        </div>
      </>
    );
  };

  return (
    <div className="chess-board-container max-w-full w-full">
      {renderBoardLabels()}
      
      <div className="mt-2 text-center text-sm">
        {flipped ? "Playing as Black" : "Playing as White"}
      </div>
    </div>
  );
};

export default ChessBoard;
