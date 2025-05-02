
import { Piece, PieceColor, Position } from "../types/chess";
import { cloneBoard, findKingPosition, isValidPosition } from "./chessUtils";

// Get all valid moves for a piece at the given position
export const getValidMoves = (
  board: (Piece | null)[][],
  position: Position,
  checkForCheck: boolean = true
): Position[] => {
  const { x, y } = position;
  const piece = board[y][x];
  
  if (!piece) return [];
  
  let moves: Position[] = [];
  
  switch (piece.type) {
    case 'pawn':
      moves = getPawnMoves(board, position);
      break;
    case 'rook':
      moves = getRookMoves(board, position);
      break;
    case 'knight':
      moves = getKnightMoves(board, position);
      break;
    case 'bishop':
      moves = getBishopMoves(board, position);
      break;
    case 'queen':
      moves = getQueenMoves(board, position);
      break;
    case 'king':
      moves = getKingMoves(board, position);
      break;
  }
  
  // If we need to check for check, filter out moves that would leave the king in check
  if (checkForCheck) {
    moves = moves.filter(move => !moveResultsInCheck(board, position, move, piece.color));
  }
  
  return moves;
};

// Check if a move would leave the king in check
const moveResultsInCheck = (
  board: (Piece | null)[][],
  from: Position,
  to: Position,
  color: PieceColor
): boolean => {
  // Create a copy of the board and make the move
  const newBoard = cloneBoard(board);
  const piece = newBoard[from.y][from.x];
  
  // Make the move
  newBoard[to.y][to.x] = piece;
  newBoard[from.y][from.x] = null;
  
  // Check if the king is in check after the move
  return isInCheck(newBoard, color);
};

// Check if the king of the given color is in check
export const isInCheck = (board: (Piece | null)[][], color: PieceColor): boolean => {
  const kingPosition = findKingPosition(board, color);
  if (!kingPosition) return false;
  
  const oppositeColor = color === 'white' ? 'black' : 'white';
  
  // Check if any piece of the opposite color can attack the king
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece && piece.color === oppositeColor) {
        const moves = getValidMoves(board, { x, y }, false);
        if (moves.some(move => move.x === kingPosition.x && move.y === kingPosition.y)) {
          return true;
        }
      }
    }
  }
  
  return false;
};

// Check if the current player is in checkmate
export const isCheckmate = (board: (Piece | null)[][], color: PieceColor): boolean => {
  // If not in check, not checkmate
  if (!isInCheck(board, color)) return false;
  
  // Try all possible moves for all pieces of the current player
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, { x, y }, true);
        if (moves.length > 0) {
          return false; // If there's at least one valid move, not checkmate
        }
      }
    }
  }
  
  // If no valid moves and in check, it's checkmate
  return true;
};

// Check if the current player is in stalemate
export const isStalemate = (board: (Piece | null)[][], color: PieceColor): boolean => {
  // If in check, not stalemate
  if (isInCheck(board, color)) return false;
  
  // Try all possible moves for all pieces of the current player
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, { x, y }, true);
        if (moves.length > 0) {
          return false; // If there's at least one valid move, not stalemate
        }
      }
    }
  }
  
  // If no valid moves and not in check, it's stalemate
  return true;
};

// Valid moves for each piece type
const getPawnMoves = (board: (Piece | null)[][], position: Position): Position[] => {
  const { x, y } = position;
  const piece = board[y][x];
  if (!piece) return [];
  
  const direction = piece.color === 'white' ? -1 : 1;
  const moves: Position[] = [];
  
  // Move forward one square
  const forward = { x, y: y + direction };
  if (isValidPosition(forward) && !board[forward.y][forward.x]) {
    moves.push(forward);
    
    // Move forward two squares if the pawn hasn't moved yet
    const twoForward = { x, y: y + 2 * direction };
    const startingRank = piece.color === 'white' ? 6 : 1;
    if (y === startingRank && isValidPosition(twoForward) && !board[twoForward.y][twoForward.x]) {
      moves.push(twoForward);
    }
  }
  
  // Capture diagonally
  const diagLeft = { x: x - 1, y: y + direction };
  const diagRight = { x: x + 1, y: y + direction };
  
  if (isValidPosition(diagLeft) && board[diagLeft.y][diagLeft.x] && board[diagLeft.y][diagLeft.x]?.color !== piece.color) {
    moves.push(diagLeft);
  }
  
  if (isValidPosition(diagRight) && board[diagRight.y][diagRight.x] && board[diagRight.y][diagRight.x]?.color !== piece.color) {
    moves.push(diagRight);
  }
  
  // En passant (TODO: implement en passant)
  // This requires tracking the previous move
  
  return moves;
};

const getRookMoves = (board: (Piece | null)[][], position: Position): Position[] => {
  return getLinearMoves(board, position, [
    { x: 0, y: 1 },  // Down
    { x: 0, y: -1 }, // Up
    { x: 1, y: 0 },  // Right
    { x: -1, y: 0 }, // Left
  ]);
};

const getBishopMoves = (board: (Piece | null)[][], position: Position): Position[] => {
  return getLinearMoves(board, position, [
    { x: 1, y: 1 },   // Down-right
    { x: 1, y: -1 },  // Up-right
    { x: -1, y: 1 },  // Down-left
    { x: -1, y: -1 }, // Up-left
  ]);
};

const getQueenMoves = (board: (Piece | null)[][], position: Position): Position[] => {
  return [
    ...getRookMoves(board, position),
    ...getBishopMoves(board, position),
  ];
};

const getKnightMoves = (board: (Piece | null)[][], position: Position): Position[] => {
  const { x, y } = position;
  const piece = board[y][x];
  if (!piece) return [];
  
  const possibleMoves = [
    { x: x + 1, y: y + 2 },
    { x: x + 2, y: y + 1 },
    { x: x + 2, y: y - 1 },
    { x: x + 1, y: y - 2 },
    { x: x - 1, y: y - 2 },
    { x: x - 2, y: y - 1 },
    { x: x - 2, y: y + 1 },
    { x: x - 1, y: y + 2 },
  ];
  
  return possibleMoves.filter(move => {
    return isValidPosition(move) && (!board[move.y][move.x] || board[move.y][move.x]?.color !== piece.color);
  });
};

const getKingMoves = (board: (Piece | null)[][], position: Position): Position[] => {
  const { x, y } = position;
  const piece = board[y][x];
  if (!piece) return [];
  
  const possibleMoves = [
    { x: x - 1, y: y - 1 },
    { x: x, y: y - 1 },
    { x: x + 1, y: y - 1 },
    { x: x - 1, y: y },
    { x: x + 1, y: y },
    { x: x - 1, y: y + 1 },
    { x: x, y: y + 1 },
    { x: x + 1, y: y + 1 },
  ];
  
  const moves = possibleMoves.filter(move => {
    return isValidPosition(move) && (!board[move.y][move.x] || board[move.y][move.x]?.color !== piece.color);
  });
  
  // TODO: Implement castling
  
  return moves;
};

const getLinearMoves = (
  board: (Piece | null)[][],
  position: Position,
  directions: Position[]
): Position[] => {
  const { x, y } = position;
  const piece = board[y][x];
  if (!piece) return [];
  
  const moves: Position[] = [];
  
  directions.forEach(dir => {
    let currentX = x + dir.x;
    let currentY = y + dir.y;
    
    while (isValidPosition({ x: currentX, y: currentY })) {
      const currentPiece = board[currentY][currentX];
      
      if (!currentPiece) {
        moves.push({ x: currentX, y: currentY });
      } else {
        if (currentPiece.color !== piece.color) {
          moves.push({ x: currentX, y: currentY });
        }
        break; // Stop in this direction if we hit a piece
      }
      
      currentX += dir.x;
      currentY += dir.y;
    }
  });
  
  return moves;
};
