
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
}

export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';

export interface GameMode {
  type: 'local' | 'online';
  roomId?: string;
}
