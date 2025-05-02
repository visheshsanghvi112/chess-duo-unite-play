
import React from 'react';
import { Piece, Position } from '../types/chess';
import ChessPiece from './ChessPiece';

interface ChessSquareProps {
  position: Position;
  piece: Piece | null;
  isSelected: boolean;
  isValidMove: boolean;
  isCheck: boolean;
  onSquareClick: (position: Position) => void;
}

const ChessSquare: React.FC<ChessSquareProps> = ({
  position,
  piece,
  isSelected,
  isValidMove,
  isCheck,
  onSquareClick,
}) => {
  const { x, y } = position;
  const isDark = (x + y) % 2 === 0;
  
  const getSquareClasses = () => {
    const baseClass = `chess-square ${isDark ? 'chess-square-dark' : 'chess-square-light'}`;
    const stateClasses = [
      isSelected && 'chess-square-selected',
      isValidMove && 'chess-square-move',
      isCheck && 'chess-square-check',
    ].filter(Boolean).join(' ');
    
    return `${baseClass} ${stateClasses}`;
  };

  const handleClick = () => {
    onSquareClick(position);
  };

  return (
    <div 
      className={getSquareClasses()}
      onClick={handleClick}
      data-position={`${x},${y}`}
    >
      {piece && <ChessPiece piece={piece} />}
      {isValidMove && !piece && (
        <div className="h-3/5 w-3/5 rounded-full bg-chess-move-highlight opacity-60 z-10" />
      )}
    </div>
  );
};

export default ChessSquare;
