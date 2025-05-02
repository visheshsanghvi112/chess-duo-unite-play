
import { Piece, PieceColor, PieceType, Position } from "../types/chess";

// Initialize an empty 8x8 board
export const createEmptyBoard = (): (Piece | null)[][] => {
  return Array(8).fill(null).map(() => Array(8).fill(null));
};

// Initialize a new chess game with pieces in their starting positions
export const initializeChessBoard = (): (Piece | null)[][] => {
  const board = createEmptyBoard();
  
  // Set up pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: 'pawn', color: 'black' };
    board[6][i] = { type: 'pawn', color: 'white' };
  }
  
  // Set up rooks
  board[0][0] = { type: 'rook', color: 'black' };
  board[0][7] = { type: 'rook', color: 'black' };
  board[7][0] = { type: 'rook', color: 'white' };
  board[7][7] = { type: 'rook', color: 'white' };
  
  // Set up knights
  board[0][1] = { type: 'knight', color: 'black' };
  board[0][6] = { type: 'knight', color: 'black' };
  board[7][1] = { type: 'knight', color: 'white' };
  board[7][6] = { type: 'knight', color: 'white' };
  
  // Set up bishops
  board[0][2] = { type: 'bishop', color: 'black' };
  board[0][5] = { type: 'bishop', color: 'black' };
  board[7][2] = { type: 'bishop', color: 'white' };
  board[7][5] = { type: 'bishop', color: 'white' };
  
  // Set up queens
  board[0][3] = { type: 'queen', color: 'black' };
  board[7][3] = { type: 'queen', color: 'white' };
  
  // Set up kings
  board[0][4] = { type: 'king', color: 'black' };
  board[7][4] = { type: 'king', color: 'white' };
  
  return board;
};

// Convert algebraic notation (e.g., "e4") to a position object { x, y }
export const algebraicToPosition = (algebraic: string): Position => {
  const file = algebraic.charCodeAt(0) - 97; // 'a' is 97 in ASCII
  const rank = 8 - parseInt(algebraic[1], 10);
  return { x: file, y: rank };
};

// Convert a position object { x, y } to algebraic notation (e.g., "e4")
export const positionToAlgebraic = (position: Position): string => {
  const file = String.fromCharCode(position.x + 97); // 0 -> 'a', 1 -> 'b', etc.
  const rank = 8 - position.y;
  return `${file}${rank}`;
};

// Check if a position is valid (within the board)
export const isValidPosition = (position: Position): boolean => {
  return position.x >= 0 && position.x < 8 && position.y >= 0 && position.y < 8;
};

// Get the color of a square based on its position
export const getSquareColor = (position: Position): 'light' | 'dark' => {
  return (position.x + position.y) % 2 === 0 ? 'dark' : 'light';
};

// Deep clone a board to avoid mutation issues
export const cloneBoard = (board: (Piece | null)[][]): (Piece | null)[][] => {
  return board.map(row => row.map(piece => piece ? { ...piece } : null));
};

// Generate a random room ID for online play
export const generateRoomId = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Get the position of the king for a specific color
export const findKingPosition = (board: (Piece | null)[][], color: PieceColor): Position | null => {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { x, y };
      }
    }
  }
  return null;
};

// Get the opposite color
export const getOppositeColor = (color: PieceColor): PieceColor => {
  return color === 'white' ? 'black' : 'white';
};

// Process pawn promotion
export const promotePawn = (board: (Piece | null)[][], position: Position, promotionPiece: PieceType): (Piece | null)[][] => {
  const newBoard = cloneBoard(board);
  const piece = newBoard[position.y][position.x];
  
  if (piece && piece.type === 'pawn') {
    newBoard[position.y][position.x] = {
      ...piece,
      type: promotionPiece,
    };
  }
  
  return newBoard;
};

// Determine if a given move is a valid pawn promotion
export const isPawnPromotion = (piece: Piece, to: Position): boolean => {
  if (piece.type !== 'pawn') return false;
  return (piece.color === 'white' && to.y === 0) || (piece.color === 'black' && to.y === 7);
};

// Format timestamp for move history
export const formatTime = (): string => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: true 
  });
};

export const pieceToUnicode = (piece: Piece | null): string => {
  if (!piece) return '';
  
  const pieces = {
    white: {
      king: '♔',
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘',
      pawn: '♙',
    },
    black: {
      king: '♚',
      queen: '♛',
      rook: '♜',
      bishop: '♝',
      knight: '♞',
      pawn: '♟',
    },
  };
  
  return pieces[piece.color][piece.type];
};
