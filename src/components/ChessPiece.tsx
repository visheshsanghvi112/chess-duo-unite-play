
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
  const animationClasses = isDragging 
    ? "scale-110 cursor-grabbing" 
    : "hover:scale-105 hover:animate-piece-bounce";
  
  // Enhanced 3D effect classes
  const threeDClasses = `${color === 'white' 
    ? 'text-white drop-shadow-[0_4px_5px_rgba(0,0,0,0.5)] dark:drop-shadow-[0_3px_5px_rgba(0,0,0,0.8)]' 
    : 'text-black drop-shadow-[0_3px_3px_rgba(255,255,255,0.5)] dark:drop-shadow-[0_2px_3px_rgba(255,255,255,0.3)]'}`;
  
  return (
    <div className={`${baseClasses} ${sizeClasses} ${animationClasses} transition-all duration-200`}>
      <span className={`${threeDClasses} transform hover:translate-y-[-2px] transition-transform`}>
        {pieceToUnicode(piece)}
      </span>
    </div>
  );
};

export default ChessPiece;
