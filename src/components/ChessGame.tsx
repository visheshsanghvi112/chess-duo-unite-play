
import React, { useState, useEffect, useCallback } from 'react';
import ChessBoard from './ChessBoard';
import GameInfo from './GameInfo';
import PawnPromotionModal from './PawnPromotionModal';
import RoomModal from './RoomModal';
import LayoutControls from './LayoutControls';
import PlayerTimer from './PlayerTimer';
import { 
  GameMode, GameState, GameStatus, Move, Piece, PieceColor, PieceType, Position, PlayerTimer as PlayerTimerType,
  serializeBoard, deserializeBoard, serializeHistory, deserializeHistory, serializeTimers, deserializeTimers
} from '../types/chess';
import { cloneBoard, findKingPosition, generateRoomId, initializeChessBoard, isPawnPromotion } from '../utils/chessUtils';
import { getValidMoves, isCheckmate, isInCheck, isStalemate } from '../utils/moveValidator';
import { useToast } from "@/components/ui/use-toast";
import { playSound, setSoundMuted } from '../utils/soundUtils';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { BoardTheme } from './BoardThemeSelector';

// Default timers - 10 minutes per player
const DEFAULT_TIMERS: PlayerTimerType = {
  white: 600, // 10 minutes in seconds
  black: 600,
  startTime: Date.now()
};

// Function to generate a unique UUID for player IDs
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Define the ChessGameProps interface
interface ChessGameProps {
  initialMode?: { 
    type: 'local' | 'online';
    roomId?: string;
  };
}

const ChessGame: React.FC<ChessGameProps> = ({ initialMode = { type: 'local' } }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Layout settings
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layoutType, setLayoutType] = useState<'horizontal' | 'vertical'>('horizontal');
  const [showGameInfo, setShowGameInfo] = useState(true);
  
  // Theme and visual settings
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('tournament');
  
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
    playerColor: initialMode.type === 'online' ? undefined : undefined, // Will be set later for online games
    players: {
      white: undefined,
      black: undefined
    },
    timers: DEFAULT_TIMERS
  });

  // Session ID for player identification
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Initialize session ID on component mount
  useEffect(() => {
    // Try to get existing session ID from localStorage or generate a new one
    const existingSessionId = localStorage.getItem('chessSessionId');
    const newSessionId = existingSessionId || `player_${Math.random().toString(36).substring(2, 15)}`;
    
    if (!existingSessionId) {
      localStorage.setItem('chessSessionId', newSessionId);
    }
    
    setSessionId(newSessionId);
  }, []);

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
              const board = deserializeBoard(newData.board_state);
              const history = deserializeHistory(newData.history);
              const timers = deserializeTimers(newData.timers || { white: 600, black: 600 });
              
              setGameState(prev => ({
                ...prev,
                board: board,
                currentPlayer: newData.current_player as PieceColor,
                history: history,
                gameStatus: newData.game_status as GameStatus,
                check: {
                  inCheck: newData.game_status === 'check',
                  kingPosition: findKingPosition(board, newData.current_player as PieceColor),
                },
                players: {
                  white: newData.player_white || prev.players?.white,
                  black: newData.player_black || prev.players?.black
                },
                timers: {
                  ...timers,
                  startTime: Date.now() // Reset timer start time when receiving move
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
                const lastMove = history[history.length - 1];
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

  // Create a new room
  const createRoom = async (customRoomId?: string) => {
    if (!sessionId) {
      toast({
        title: "Session Error",
        description: "Could not create a room. Please try refreshing the page.",
        variant: "destructive",
      });
      return;
    }
    
    const roomId = customRoomId || generateRoomId();
    const initialBoard = initializeChessBoard();
    
    try {
      // Generate a browser-compatible UUID for player IDs
      const playerUUID = generateUUID();
      
      // Save the room to Supabase
      const { error } = await supabase
        .from('chess_rooms')
        .insert({
          id: roomId,
          board_state: serializeBoard(initialBoard),
          player_white: playerUUID,
          current_player: 'white',
          game_status: 'playing',
          history: serializeHistory([]),
          timers: serializeTimers(DEFAULT_TIMERS)
        });
      
      if (error) throw error;
      
      // Store the UUID in localStorage for persistence
      localStorage.setItem('chessPlayerUUID', playerUUID);
      
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
    
    if (!sessionId) {
      toast({
        title: "Session Error",
        description: "Could not join the room. Please try refreshing the page.",
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
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Room Not Found",
          description: "The room you entered doesn't exist.",
          variant: "destructive",
        });
        return;
      }
      
      // See if we've previously joined this room
      let playerUUID = localStorage.getItem('chessPlayerUUID');
      
      // If not, generate a new UUID for this player
      if (!playerUUID) {
        playerUUID = generateUUID();
        localStorage.setItem('chessPlayerUUID', playerUUID);
      }
      
      // Navigate to the room
      navigate(`/room/${roomId}`);
      
      toast({
        title: "Room Joined",
        description: `You've joined room ${roomId}.`,
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

  // Initialize online game from Supabase if roomId is provided
  useEffect(() => {
    const loadRoom = async () => {
      if (!gameState.isOnline || !gameState.roomId) return;

      try {
        const { data, error } = await supabase
          .from('chess_rooms')
          .select('*')
          .eq('id', gameState.roomId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          // Get the player UUID from localStorage
          const playerUUID = localStorage.getItem('chessPlayerUUID');
          
          let playerColor: PieceColor | undefined = undefined;
          let updateNeeded = false;
          let updateData: any = {};
          
          // Check if this player is already registered as white or black
          if (data.player_white === playerUUID) {
            playerColor = 'white';
          } else if (data.player_black === playerUUID) {
            playerColor = 'black';
          } else if (!data.player_white) {
            // Join as white if available
            playerColor = 'white';
            updateNeeded = true;
            updateData.player_white = playerUUID;
          } else if (!data.player_black) {
            // Join as black if available
            playerColor = 'black';
            updateNeeded = true;
            updateData.player_black = playerUUID;
          } else {
            // Room is full, join as spectator
            toast({
              title: "Room Full",
              description: "You've joined as a spectator as both players are already in the game.",
            });
          }
          
          // Update the room with player info if needed
          if (updateNeeded && playerUUID) {
            await supabase
              .from('chess_rooms')
              .update(updateData)
              .eq('id', gameState.roomId);
          }
          
          const board = deserializeBoard(data.board_state);
          const history = deserializeHistory(data.history);
          const timers = deserializeTimers(data.timers || DEFAULT_TIMERS);
          
          // Update game state with room data
          setGameState(prev => ({
            ...prev,
            playerColor,
            board: board,
            currentPlayer: data.current_player as PieceColor,
            history: history,
            gameStatus: data.game_status as GameStatus,
            check: {
              inCheck: data.game_status === 'check',
              kingPosition: findKingPosition(board, data.current_player as PieceColor),
            },
            players: {
              white: data.player_white,
              black: data.player_black
            },
            timers: timers
          }));
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
  }, [gameState.isOnline, gameState.roomId, toast]);

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

  // Handle board theme change
  const handleChangeBoardTheme = (theme: BoardTheme) => {
    setBoardTheme(theme);
    // Save preference to localStorage
    localStorage.setItem('chessBoardTheme', theme);
    
    toast({
      title: "Board Theme Changed",
      description: `Theme set to ${theme.charAt(0).toUpperCase() + theme.slice(1)}`,
    });
  };

  // Load saved board theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('chessBoardTheme') as BoardTheme | null;
    if (savedTheme) {
      setBoardTheme(savedTheme);
    }
  }, []);

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
    const { board, currentPlayer, history, isOnline, roomId, timers } = gameState;
    const newBoard = cloneBoard(board);
    
    const piece = newBoard[from.y][from.x];
    const capturedPiece = newBoard[to.y][to.x];
    
    if (!piece) return;
    
    // Update timers - save current player's remaining time
    let updatedTimers = { ...timers };
    if (updatedTimers) {
      const now = Date.now();
      const elapsed = updatedTimers.startTime ? Math.floor((now - updatedTimers.startTime) / 1000) : 0;
      
      if (currentPlayer === 'white') {
        updatedTimers.white = Math.max(0, updatedTimers.white - elapsed);
      } else {
        updatedTimers.black = Math.max(0, updatedTimers.black - elapsed);
      }
      
      // Set start time for next player's turn
      updatedTimers.startTime = now;
    }
    
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
        timers: updatedTimers
      }));
      
      // If online, update the room
      if (isOnline && roomId) {
        try {
          await supabase
            .from('chess_rooms')
            .update({
              board_state: serializeBoard(newBoard),
              history: serializeHistory([...history, newMove]),
              timers: serializeTimers(updatedTimers),
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
      timers: updatedTimers
    }));
    
    // If online, update the room
    if (isOnline && roomId) {
      try {
        await supabase
          .from('chess_rooms')
          .update({
            board_state: serializeBoard(newBoard),
            current_player: nextPlayer,
            game_status: gameStatus,
            history: serializeHistory([...history, newMove]),
            timers: serializeTimers(updatedTimers),
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
    
    const { board, history, isOnline, roomId, timers } = gameState;
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
              board_state: serializeBoard(newBoard),
              game_status: gameStatus,
              history: serializeHistory(updatedHistory),
              timers: serializeTimers(timers || DEFAULT_TIMERS),
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
    const newState: GameState = {
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
      players: gameState.players,
      timers: DEFAULT_TIMERS
    };
    
    setGameState(newState);
    
    // If online, update the room
    if (gameState.isOnline && gameState.roomId) {
      try {
        await supabase
          .from('chess_rooms')
          .update({
            board_state: serializeBoard(newState.board),
            current_player: newState.currentPlayer,
            game_status: newState.gameStatus,
            history: serializeHistory(newState.history),
            timers: serializeTimers(DEFAULT_TIMERS),
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

  // Close room modal
  const handleCloseRoomModal = () => {
    setRoomModal({ ...roomModal, isOpen: false });
  };

  // Determine the container classes based on layout and fullscreen
  const containerClasses = isFullscreen
    ? "grid grid-cols-1 gap-6"
    : layoutType === 'horizontal'
    ? "grid grid-cols-1 md:grid-cols-3 gap-6"
    : "grid grid-cols-1 gap-6";

  // Determine the board container classes based on layout
  const boardContainerClasses = isFullscreen 
    ? ""
    : layoutType === 'horizontal'
    ? "md:col-span-2"
    : "";

  return (
    <div className={`max-w-6xl mx-auto px-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4 overflow-auto' : ''}`}>
      {!isFullscreen && (
        <LayoutControls
          isFullscreen={isFullscreen}
          layoutType={layoutType}
          showGameInfo={showGameInfo}
          onToggleFullscreen={toggleFullscreen}
          onChangeLayout={(layout) => setLayoutType(layout)}
          onToggleGameInfo={() => setShowGameInfo(!showGameInfo)}
        />
      )}
      
      <div className={containerClasses}>
        <div className={boardContainerClasses}>
          <ChessBoard 
            gameState={gameState}
            onSquareClick={handleSquareClick}
            flipped={gameState.isOnline && gameState.playerColor === 'black'}
            boardTheme={boardTheme}
          />
          
          {/* Timer display - Always show in fullscreen mode or when game info is hidden */}
          {(isFullscreen || !showGameInfo) && gameState.timers && (
            <div className="mt-4">
              <PlayerTimer 
                timers={gameState.timers}
                currentPlayer={gameState.currentPlayer}
                gameStatus={gameState.gameStatus}
                isPlayerTurn={gameState.playerColor === gameState.currentPlayer}
              />
            </div>
          )}
          
          {isFullscreen && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={toggleFullscreen}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Exit Fullscreen
              </button>
            </div>
          )}
        </div>
        
        {showGameInfo && !isFullscreen && (
          <div>
            <GameInfo 
              gameState={gameState}
              onRestart={handleRestart}
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              soundEnabled={soundEnabled}
              onToggleSound={handleToggleSound}
              boardTheme={boardTheme}
              onChangeBoardTheme={handleChangeBoardTheme}
            />
            
            {gameState.timers && (
              <PlayerTimer 
                timers={gameState.timers}
                currentPlayer={gameState.currentPlayer}
                gameStatus={gameState.gameStatus}
                isPlayerTurn={gameState.playerColor === gameState.currentPlayer}
              />
            )}
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
