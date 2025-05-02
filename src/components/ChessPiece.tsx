
import React from 'react';
import { Piece } from '../types/chess';
import { pieceToUnicode } from '../utils/chessUtils';

interface ChessPieceProps {
  piece: Piece;
  isDragging?: boolean;
}

const ChessPiece: React.FC<ChessPieceProps> = ({ piece, isDragging = false }) => {
  const { color, type } = piece;
  
  // Load appropriate SVG image for the piece
  const getPieceSrc = () => {
    return `/chess-pieces/${color}-${type}.svg`;
  };
  
  return (
    <div className={`chess-piece z-10 ${isDragging ? 'chess-piece-dragging' : ''}`}>
      <div className="w-full h-full flex items-center justify-center text-4xl">
        {pieceToUnicode(piece)}
      </div>
    </div>
  );
};

export default ChessPiece;
