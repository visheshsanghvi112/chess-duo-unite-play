
export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';

export interface Piece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  capturedPiece?: Piece;
  isPromotion?: boolean;
  promotionPiece?: PieceType;
  isCastling?: boolean;
  isEnPassant?: boolean;
}

export interface PlayerTimer {
  white: number; // time in seconds
  black: number; // time in seconds
  startTime?: number; // timestamp when current player's timer started
}

export interface GameState {
  board: (Piece | null)[][];
  currentPlayer: PieceColor;
  selectedPiece: Position | null;
  validMoves: Position[];
  gameStatus: GameStatus;
  history: Move[];
  check: {
    inCheck: boolean;
    kingPosition: Position | null;
  };
  roomId?: string;
  isOnline: boolean;
  playerColor?: PieceColor;
  players?: {
    white?: string;
    black?: string;
  };
  timers?: PlayerTimer;
}

export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';

export interface GameMode {
  type: 'local' | 'online';
  roomId?: string;
}

// Helper functions to convert game types to/from JSON-compatible formats
export const serializeBoard = (board: (Piece | null)[][]): any => {
  return board;
};

export const deserializeBoard = (boardData: any): (Piece | null)[][] => {
  if (!Array.isArray(boardData)) {
    return initializeChessBoard();
  }
  return boardData;
};

export const serializeHistory = (history: Move[]): any => {
  return history;
};

export const deserializeHistory = (historyData: any): Move[] => {
  if (!Array.isArray(historyData)) {
    return [];
  }
  return historyData;
};

export const serializeTimers = (timers: PlayerTimer): any => {
  return timers;
};

export const deserializeTimers = (timersData: any): PlayerTimer => {
  if (!timersData || typeof timersData !== 'object') {
    return { white: 600, black: 600 }; // Default 10 minutes per player
  }
  return {
    white: timersData.white || 600,
    black: timersData.black || 600,
    startTime: timersData.startTime
  };
};

// Import the necessary function
import { initializeChessBoard } from '../utils/chessUtils';
