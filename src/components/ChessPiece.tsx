
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
  
  // Enhanced 3D effect classes
  const threeDClasses = `${color === 'white' 
    ? 'text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)] dark:drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]' 
    : 'text-black drop-shadow-[0_2px_2px_rgba(255,255,255,0.4)] dark:drop-shadow-[0_1px_2px_rgba(255,255,255,0.2)]'}`;
  
  return (
    <div className={`${baseClasses} ${sizeClasses} ${animationClasses} transition-all`}>
      <span className={`${threeDClasses} transform hover:translate-y-[-2px] transition-transform`}>
        {pieceToUnicode(piece)}
      </span>
    </div>
  );
};

export default ChessPiece;
