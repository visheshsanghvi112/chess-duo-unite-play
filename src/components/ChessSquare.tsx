
import React from 'react';
import { Piece, Position } from '../types/chess';
import ChessPiece from './ChessPiece';
import { getSquareClassName } from '../utils/themeUtils';
import { BoardTheme } from './BoardThemeSelector';

interface ChessSquareProps {
  position: Position;
  piece: Piece | null;
  isSelected: boolean;
  isValidMove: boolean;
  isCheck: boolean;
  boardTheme: BoardTheme;
  onSquareClick: (position: Position) => void;
}

const ChessSquare: React.FC<ChessSquareProps> = ({
  position,
  piece,
  isSelected,
  isValidMove,
  isCheck,
  boardTheme,
  onSquareClick,
}) => {
  const { x, y } = position;
  const isDark = (x + y) % 2 === 1; // Updated to make sure a1 is dark
  
  const squareClasses = `chess-square relative aspect-square flex items-center justify-center ${
    getSquareClassName(isDark, boardTheme, isSelected, isValidMove, isCheck)
  }`;

  const handleClick = () => {
    onSquareClick(position);
  };

  return (
    <div 
      className={squareClasses}
      onClick={handleClick}
      data-position={`${x},${y}`}
    >
      {piece && <ChessPiece piece={piece} isDragging={isSelected} />}
      
      {/* File and rank labels on the edge squares */}
      {x === 0 && (
        <div className="absolute left-1 top-1 text-xs opacity-60 pointer-events-none">
          {8 - y}
        </div>
      )}
      
      {y === 7 && (
        <div className="absolute right-1 bottom-1 text-xs opacity-60 pointer-events-none">
          {String.fromCharCode(97 + x)}
        </div>
      )}
    </div>
  );
};

export default ChessSquare;
