
import { Move, Piece, Position } from '../types/chess';
import { positionToAlgebraic } from './chessUtils';

// Convert a move to algebraic notation (e.g. "e4", "Nf3", "Qxd5+")
export const moveToAlgebraic = (move: Move, isCheck: boolean = false, isCheckmate: boolean = false): string => {
  const { from, to, piece, capturedPiece, isPromotion, promotionPiece, isCastling } = move;
  
  // Handle castling notation
  if (isCastling) {
    return to.x > from.x ? "O-O" : "O-O-O";
  }
  
  // Piece symbol (empty for pawns)
  let notation = piece.type === 'pawn' ? '' : piece.type.charAt(0).toUpperCase();
  
  // For knights use 'N' instead of 'K' to avoid confusion with the king
  if (piece.type === 'knight') notation = 'N';
  
  // Add capture symbol if applicable
  if (capturedPiece) {
    // If it's a pawn making the capture, include the from-file
    if (piece.type === 'pawn') {
      notation += positionToAlgebraic(from).charAt(0);
    }
    notation += 'x';
  }
  
  // Add destination square
  notation += positionToAlgebraic(to);
  
  // Add promotion piece if applicable
  if (isPromotion && promotionPiece) {
    notation += '=' + promotionPiece.charAt(0).toUpperCase();
    if (promotionPiece === 'knight') notation += 'N'; // Use 'N' for knight
  }
  
  // Add check or checkmate symbol
  if (isCheckmate) {
    notation += '#';
  } else if (isCheck) {
    notation += '+';
  }
  
  return notation;
};

// Format a move for display with move number
export const formatMoveForDisplay = (move: Move, moveNumber: number, isCheck: boolean = false, isCheckmate: boolean = false): string => {
  const algebraic = moveToAlgebraic(move, isCheck, isCheckmate);
  const prefix = move.piece.color === 'white' ? `${Math.ceil(moveNumber / 2)}. ` : '';
  return `${prefix}${algebraic}`;
};
