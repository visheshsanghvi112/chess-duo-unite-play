
import React, { useState, useEffect, useCallback } from 'react';
import ChessBoard from './ChessBoard';
import GameInfo from './GameInfo';
import PawnPromotionModal from './PawnPromotionModal';
import RoomModal from './RoomModal';
import LayoutControls from './LayoutControls';
import { GameMode, GameState, GameStatus, Move, Piece, PieceColor, PieceType, Position } from '../types/chess';
import { cloneBoard, findKingPosition, generateRoomId, initializeChessBoard, isPawnPromotion } from '../utils/chessUtils';
import { getValidMoves, isCheckmate, isInCheck, isStalemate } from '../utils/moveValidator';
import { useToast } from "@/components/ui/use-toast";
import { playSound, setSoundMuted } from '../utils/soundUtils';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';

interface ChessGameProps {
  initialMode?: GameMode;
}

const ChessGame: React.FC<ChessGameProps> = ({ initialMode = { type: 'local' } }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Layout settings
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layoutType, setLayoutType] = useState<'horizontal' | 'vertical'>('horizontal');
  const [showGameInfo, setShowGameInfo] = useState(true);
  
  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  
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

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        toast({
          title: "Error",
          description: `Could not enter fullscreen: ${err.message}`,
          variant: "destructive",
        });
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Update fullscreen state when exiting fullscreen via browser controls
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Setup realtime subscription for online games
  useEffect(() => {
    if (!gameState.isOnline || !gameState.roomId) return;

    // Subscribe to room updates
    const channel = supabase
      .channel('chess_room_' + gameState.roomId)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'chess_rooms',
          filter: `id=eq.${gameState.roomId}`
        }, 
        (payload) => {
          const newData = payload.new;
          if (newData) {
            // Only update if it's the opponent's move
            if (gameState.playerColor !== newData.current_player) {
              setGameState(prev => ({
                ...prev,
                board: newData.board_state,
                currentPlayer: newData.current_player,
                history: newData.history,
                gameStatus: newData.game_status,
                check: {
                  inCheck: newData.game_status === 'check',
                  kingPosition: findKingPosition(newData.board_state, newData.current_player),
                }
              }));

              // Play appropriate sound based on game status
              if (newData.game_status === 'check') {
                playSound('check');
              } else if (newData.game_status === 'checkmate') {
                playSound('checkmate');
              } else if (newData.game_status === 'stalemate') {
                playSound('draw');
              } else {
                const lastMove = newData.history[newData.history.length - 1];
                if (lastMove && lastMove.capturedPiece) {
                  playSound('capture');
                } else {
                  playSound('move');
                }
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameState.isOnline, gameState.roomId, gameState.playerColor]);

  // Initialize online game from Supabase if roomId is provided
  useEffect(() => {
    const loadRoom = async () => {
      if (!gameState.isOnline || !gameState.roomId) return;

      try {
        const { data, error } = await supabase
          .from('chess_rooms')
          .select('*')
          .eq('id', gameState.roomId)
          .single();

        if (error) throw error;

        if (data) {
          // If joining an existing game, set player color to black
          if (!gameState.playerColor) {
            const playerColor: PieceColor = 'black';
            
            // Update room with player_black
            await supabase
              .from('chess_rooms')
              .update({ player_black: 'anonymous' })
              .eq('id', gameState.roomId);
            
            setGameState(prev => ({
              ...prev,
              playerColor,
              board: data.board_state || initializeChessBoard(),
              currentPlayer: data.current_player,
              history: data.history || [],
              gameStatus: data.game_status,
              check: {
                inCheck: data.game_status === 'check',
                kingPosition: findKingPosition(data.board_state || initializeChessBoard(), data.current_player),
              }
            }));
          }
        }
      } catch (error) {
        console.error('Error loading room:', error);
        toast({
          title: "Error Loading Game",
          description: "Could not load the game room. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadRoom();
  }, [gameState.isOnline, gameState.roomId, gameState.playerColor, toast]);

  // Toggle sound effects
  const handleToggleSound = () => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    setSoundMuted(!newSoundState);
    
    toast({
      title: newSoundState ? "Sounds enabled" : "Sounds disabled",
      description: newSoundState ? "Game sounds are now on" : "Game sounds are now off",
    });
  };

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
      playSound('illegal');
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
          
          // Play illegal move sound if trying to move to invalid square
          if (piece && piece.color !== currentPlayer) {
            playSound('illegal');
          }
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
  const makeMove = async (from: Position, to: Position) => {
    const { board, currentPlayer, history, isOnline, roomId } = gameState;
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
      
      // Play promotion sound
      playSound('promotion');
      
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        selectedPiece: null,
        validMoves: [],
        history: [...history, newMove],
      }));
      
      // If online, update the room
      if (isOnline && roomId) {
        try {
          await supabase
            .from('chess_rooms')
            .update({
              board_state: newBoard,
              history: [...history, newMove],
              last_active: new Date().toISOString()
            })
            .eq('id', roomId);
        } catch (error) {
          console.error('Error updating game state:', error);
        }
      }
      
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
        // Play checkmate sound
        playSound('checkmate');
      } else {
        // Play check sound
        playSound('check');
      }
    } else if (isStalemate(newBoard, nextPlayer)) {
      gameStatus = 'stalemate';
      playSound('draw');
    } else {
      // Play move or capture sound
      if (capturedPiece) {
        playSound('capture');
      } else {
        playSound('move');
      }
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
    
    // If online, update the room
    if (isOnline && roomId) {
      try {
        await supabase
          .from('chess_rooms')
          .update({
            board_state: newBoard,
            current_player: nextPlayer,
            game_status: gameStatus,
            history: [...history, newMove],
            last_active: new Date().toISOString()
          })
          .eq('id', roomId);
      } catch (error) {
        console.error('Error updating game state:', error);
      }
    }
  };

  // Handle pawn promotion
  const handlePawnPromotion = async (position: Position, pieceType: PieceType) => {
    if (!position || !pawnPromotion.position) return;
    
    const { board, history, isOnline, roomId } = gameState;
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
          playSound('checkmate');
        } else {
          playSound('check');
        }
      } else if (isStalemate(newBoard, nextPlayer)) {
        gameStatus = 'stalemate';
        playSound('draw');
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
      
      // If online, update the room
      if (isOnline && roomId) {
        try {
          await supabase
            .from('chess_rooms')
            .update({
              board_state: newBoard,
              game_status: gameStatus,
              history: updatedHistory,
              last_active: new Date().toISOString()
            })
            .eq('id', roomId);
        } catch (error) {
          console.error('Error updating game state:', error);
        }
      }
    }
    
    // Close the promotion modal
    setPawnPromotion({
      isOpen: false,
      position: null,
      color: 'white',
    });
  };

  // Restart game
  const handleRestart = async () => {
    const newState = {
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
    };
    
    setGameState(newState);
    
    // If online, update the room
    if (gameState.isOnline && gameState.roomId) {
      try {
        await supabase
          .from('chess_rooms')
          .update({
            board_state: newState.board,
            current_player: newState.currentPlayer,
            game_status: newState.gameStatus,
            history: newState.history,
            last_active: new Date().toISOString()
          })
          .eq('id', gameState.roomId);
      } catch (error) {
        console.error('Error restarting game:', error);
      }
    }
    
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
  const createRoom = async (customRoomId?: string) => {
    const roomId = customRoomId || generateRoomId();
    
    try {
      // Save the room to Supabase
      const { error } = await supabase
        .from('chess_rooms')
        .insert({
          id: roomId,
          board_state: initializeChessBoard(),
          player_white: 'anonymous',
          current_player: 'white',
          game_status: 'playing'
        });
      
      if (error) throw error;
      
      // Navigate to the room
      navigate(`/room/${roomId}`);
      
      toast({
        title: "Room Created",
        description: `Room ID: ${roomId} - Share this with your opponent.`,
      });
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error Creating Room",
        description: "Could not create the room. Please try again.",
        variant: "destructive",
      });
    }
    
    setRoomModal({ isOpen: false, type: 'create' });
  };

  // Join an existing room
  const joinRoom = async (roomId: string) => {
    if (!roomId || roomId.length !== 6) {
      toast({
        title: "Invalid Room ID",
        description: "Please enter a valid 6-character room ID.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Check if the room exists
      const { data, error } = await supabase
        .from('chess_rooms')
        .select('*')
        .eq('id', roomId)
        .single();
      
      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Room Not Found",
          description: "The room you entered doesn't exist.",
          variant: "destructive",
        });
        return;
      }
      
      // Navigate to the room
      navigate(`/room/${roomId}`);
      
      toast({
        title: "Room Joined",
        description: `You've joined room ${roomId} as black.`,
      });
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: "Error Joining Room",
        description: "Could not join the room. Please try again.",
        variant: "destructive",
      });
    }
    
    setRoomModal({ isOpen: false, type: 'join' });
  };

  // Close room modal
  const handleCloseRoomModal = () => {
    setRoomModal({ ...roomModal, isOpen: false });
  };

  // Determine the container classes based on layout
  const containerClasses = layoutType === 'horizontal'
    ? "grid grid-cols-1 md:grid-cols-3 gap-6"
    : "grid grid-cols-1 gap-6";

  // Determine the board container classes based on layout
  const boardContainerClasses = layoutType === 'horizontal'
    ? "md:col-span-2"
    : "";

  return (
    <div className={`max-w-6xl mx-auto px-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4 overflow-auto' : ''}`}>
      <LayoutControls
        isFullscreen={isFullscreen}
        layoutType={layoutType}
        showGameInfo={showGameInfo}
        onToggleFullscreen={toggleFullscreen}
        onChangeLayout={(layout) => setLayoutType(layout)}
        onToggleGameInfo={() => setShowGameInfo(!showGameInfo)}
      />
      
      <div className={containerClasses}>
        <div className={boardContainerClasses}>
          <ChessBoard 
            gameState={gameState}
            onSquareClick={handleSquareClick}
            flipped={gameState.isOnline && gameState.playerColor === 'black'}
          />
        </div>
        
        {showGameInfo && (
          <div>
            <GameInfo 
              gameState={gameState}
              onRestart={handleRestart}
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              soundEnabled={soundEnabled}
              onToggleSound={handleToggleSound}
            />
          </div>
        )}
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
