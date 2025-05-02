import React, { useState, useEffect, useCallback } from 'react';
import ChessBoard from './ChessBoard';
import GameInfo from './GameInfo';
import PawnPromotionModal from './PawnPromotionModal';
import RoomModal from './RoomModal';
import { GameMode, GameState, GameStatus, Move, Piece, PieceColor, PieceType, Position } from '../types/chess';
import { cloneBoard, findKingPosition, generateRoomId, initializeChessBoard, isPawnPromotion } from '../utils/chessUtils';
import { getValidMoves, isCheckmate, isInCheck, isStalemate } from '../utils/moveValidator';
import { useToast } from "@/components/ui/use-toast";

interface ChessGameProps {
  initialMode?: GameMode;
}

const ChessGame: React.FC<ChessGameProps> = ({ initialMode = { type: 'local' } }) => {
  const { toast } = useToast();
  
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    board: initializeChessBoard(),
    currentPlayer: 'white',
    selectedPiece: null,
    validMoves: [],
    gameStatus: 'playing',
    history: [],
    check: {
      inCheck: false,
      kingPosition: null,
    },
    isOnline: initialMode.type === 'online',
    roomId: initialMode.roomId,
    playerColor: initialMode.type === 'online' ? 'white' : undefined,
  });

  // Modals
  const [pawnPromotion, setPawnPromotion] = useState<{
    isOpen: boolean;
    position: Position | null;
    color: PieceColor;
  }>({
    isOpen: false,
    position: null,
    color: 'white',
  });

  const [roomModal, setRoomModal] = useState<{
    isOpen: boolean;
    type: 'create' | 'join';
  }>({
    isOpen: false,
    type: 'create',
  });

  // Handle square click
  const handleSquareClick = (position: Position) => {
    const { board, currentPlayer, selectedPiece, gameStatus, isOnline, playerColor } = gameState;
    
    // Don't allow moves if game is over
    if (gameStatus !== 'playing' && gameStatus !== 'check') {
      return;
    }
    
    // In online mode, only allow player to move their pieces
    if (isOnline && playerColor !== currentPlayer) {
      toast({
        title: "Not your turn",
        description: "Wait for your opponent to make a move.",
        variant: "destructive",
      });
      return;
    }
    
    const piece = board[position.y][position.x];
    
    // If a piece is already selected
    if (selectedPiece) {
      // Clicking the same square again deselects
      if (selectedPiece.x === position.x && selectedPiece.y === position.y) {
        setGameState(prev => ({
          ...prev,
          selectedPiece: null,
          validMoves: [],
        }));
        return;
      }
      
      // Check if the clicked position is a valid move
      const isValidMove = gameState.validMoves.some(
        move => move.x === position.x && move.y === position.y
      );
      
      if (isValidMove) {
        // Make the move
        makeMove(selectedPiece, position);
      } else {
        // If clicking another piece of same color, select that piece instead
        if (piece && piece.color === currentPlayer) {
          const validMoves = getValidMoves(board, position);
          setGameState(prev => ({
            ...prev,
            selectedPiece: position,
            validMoves,
          }));
        } else {
          // Otherwise deselect
          setGameState(prev => ({
            ...prev,
            selectedPiece: null,
            validMoves: [],
          }));
        }
      }
    } else {
      // No piece selected yet, select one if it's the current player's piece
      if (piece && piece.color === currentPlayer) {
        const validMoves = getValidMoves(board, position);
        setGameState(prev => ({
          ...prev,
          selectedPiece: position,
          validMoves,
        }));
      }
    }
  };

  // Make a move
  const makeMove = (from: Position, to: Position) => {
    const { board, currentPlayer, history } = gameState;
    const newBoard = cloneBoard(board);
    
    const piece = newBoard[from.y][from.x];
    const capturedPiece = newBoard[to.y][to.x];
    
    if (!piece) return;
    
    // Check for pawn promotion
    if (piece.type === 'pawn' && isPawnPromotion(piece, to)) {
      setPawnPromotion({
        isOpen: true,
        position: to,
        color: piece.color,
      });
      
      // Move the pawn to the promotion square
      newBoard[to.y][to.x] = piece;
      newBoard[from.y][from.x] = null;
      
      // Create a new move for the history
      const newMove: Move = {
        from,
        to,
        piece,
        capturedPiece: capturedPiece || undefined,
        isPromotion: true,
      };
      
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        selectedPiece: null,
        validMoves: [],
        history: [...history, newMove],
      }));
      
      return;
    }
    
    // Regular move
    newBoard[to.y][to.x] = {
      ...piece,
      hasMoved: true,
    };
    newBoard[from.y][from.x] = null;
    
    // Create a new move for the history
    const newMove: Move = {
      from,
      to,
      piece,
      capturedPiece: capturedPiece || undefined,
    };
    
    const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
    
    // Check for check, checkmate, stalemate
    const inCheck = isInCheck(newBoard, nextPlayer);
    const kingPosition = findKingPosition(newBoard, nextPlayer);
    
    let gameStatus: GameStatus = 'playing';
    
    if (inCheck) {
      gameStatus = 'check';
      
      if (isCheckmate(newBoard, nextPlayer)) {
        gameStatus = 'checkmate';
      }
    } else if (isStalemate(newBoard, nextPlayer)) {
      gameStatus = 'stalemate';
    }
    
    // Update game state
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: nextPlayer,
      selectedPiece: null,
      validMoves: [],
      gameStatus,
      history: [...history, newMove],
      check: {
        inCheck,
        kingPosition,
      },
    }));
  };

  // Handle pawn promotion
  const handlePawnPromotion = (position: Position, pieceType: PieceType) => {
    if (!position || !pawnPromotion.position) return;
    
    const { board, history } = gameState;
    const newBoard = cloneBoard(board);
    
    // Get the last move from history which should be the pawn move
    const lastMove = history[history.length - 1];
    
    if (lastMove && lastMove.isPromotion) {
      // Promote the pawn
      newBoard[position.y][position.x] = {
        type: pieceType,
        color: pawnPromotion.color,
        hasMoved: true,
      };
      
      // Update the last move in the history
      const updatedHistory = [...history];
      updatedHistory[updatedHistory.length - 1] = {
        ...lastMove,
        promotionPiece: pieceType,
      };
      
      // Check game state again with the promoted piece
      const nextPlayer = gameState.currentPlayer;
      const inCheck = isInCheck(newBoard, nextPlayer);
      const kingPosition = findKingPosition(newBoard, nextPlayer);
      
      let gameStatus: GameStatus = 'playing';
      
      if (inCheck) {
        gameStatus = 'check';
        
        if (isCheckmate(newBoard, nextPlayer)) {
          gameStatus = 'checkmate';
        }
      } else if (isStalemate(newBoard, nextPlayer)) {
        gameStatus = 'stalemate';
      }
      
      // Update game state
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        history: updatedHistory,
        gameStatus,
        check: {
          inCheck,
          kingPosition,
        },
      }));
    }
    
    // Close the promotion modal
    setPawnPromotion({
      isOpen: false,
      position: null,
      color: 'white',
    });
  };

  // Restart game
  const handleRestart = () => {
    setGameState({
      board: initializeChessBoard(),
      currentPlayer: 'white',
      selectedPiece: null,
      validMoves: [],
      gameStatus: 'playing',
      history: [],
      check: {
        inCheck: false,
        kingPosition: null,
      },
      isOnline: gameState.isOnline,
      roomId: gameState.roomId,
      playerColor: gameState.playerColor,
    });
    
    toast({
      title: "New Game Started",
      description: "The board has been reset to the starting position.",
    });
  };

  // Handle create room
  const handleCreateRoom = () => {
    setRoomModal({
      isOpen: true,
      type: 'create',
    });
  };

  // Handle join room
  const handleJoinRoom = () => {
    setRoomModal({
      isOpen: true,
      type: 'join',
    });
  };

  // Create a new room
  const createRoom = (customRoomId?: string) => {
    const roomId = customRoomId || generateRoomId();
    
    setGameState({
      board: initializeChessBoard(),
      currentPlayer: 'white',
      selectedPiece: null,
      validMoves: [],
      gameStatus: 'playing',
      history: [],
      check: {
        inCheck: false,
        kingPosition: null,
      },
      isOnline: true,
      roomId,
      playerColor: 'white', // Creator is white
    });
    
    setRoomModal({ isOpen: false, type: 'create' });
    
    toast({
      title: "Room Created",
      description: `Room ID: ${roomId} - Share this with your opponent.`,
    });
    
    // In a real app, we would establish a WebSocket connection here
  };

  // Join an existing room
  const joinRoom = (roomId: string) => {
    if (!roomId || roomId.length !== 6) {
      toast({
        title: "Invalid Room ID",
        description: "Please enter a valid 6-character room ID.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, we would validate the room exists here via API call
    
    setGameState({
      board: initializeChessBoard(),
      currentPlayer: 'white',
      selectedPiece: null,
      validMoves: [],
      gameStatus: 'playing',
      history: [],
      check: {
        inCheck: false,
        kingPosition: null,
      },
      isOnline: true,
      roomId,
      playerColor: 'black', // Joiner is black
    });
    
    setRoomModal({ isOpen: false, type: 'join' });
    
    toast({
      title: "Room Joined",
      description: `You've joined room ${roomId} as black.`,
    });
    
    // In a real app, we would establish a WebSocket connection here
  };

  // Close room modal
  const handleCloseRoomModal = () => {
    setRoomModal({ ...roomModal, isOpen: false });
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ChessBoard 
            gameState={gameState}
            onSquareClick={handleSquareClick}
            flipped={gameState.isOnline && gameState.playerColor === 'black'}
          />
        </div>
        
        <div>
          <GameInfo 
            gameState={gameState}
            onRestart={handleRestart}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
          />
        </div>
      </div>
      
      {/* Pawn Promotion Modal */}
      {pawnPromotion.position && (
        <PawnPromotionModal
          isOpen={pawnPromotion.isOpen}
          position={pawnPromotion.position}
          color={pawnPromotion.color}
          onPromote={handlePawnPromotion}
        />
      )}
      
      {/* Room Modal */}
      <RoomModal
        isOpen={roomModal.isOpen}
        type={roomModal.type}
        onClose={handleCloseRoomModal}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
      />
    </div>
  );
};

export default ChessGame;
