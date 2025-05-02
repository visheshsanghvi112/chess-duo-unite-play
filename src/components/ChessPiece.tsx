
import React from 'react';
import { Piece } from '../types/chess';
import { pieceToUnicode } from '../utils/chessUtils';

interface ChessPieceProps {
  piece: Piece;
  isDragging?: boolean;
}

const ChessPiece: React.FC<ChessPieceProps> = ({ piece, isDragging = false }) => {
  const { color, type } = piece;
  
  const baseClasses = "chess-piece z-10 w-full h-full flex items-center justify-center";
  const sizeClasses = "text-3xl sm:text-4xl"; // Smaller text on mobile
  const animationClasses = isDragging ? "scale-110 cursor-grabbing" : "hover:scale-105";
  
  return (
    <div className={`${baseClasses} ${sizeClasses} ${animationClasses} transition-all`}>
      <span className={color === 'white' ? 'text-white drop-shadow-md' : 'text-black drop-shadow-md'}>
        {pieceToUnicode(piece)}
      </span>
    </div>
  );
};

export default ChessPiece;
