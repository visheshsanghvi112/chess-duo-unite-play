
import React from 'react';
import { PieceColor, PieceType, Position } from '../types/chess';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PawnPromotionModalProps {
  isOpen: boolean;
  position: Position;
  color: PieceColor;
  onPromote: (position: Position, pieceType: PieceType) => void;
}

const PawnPromotionModal: React.FC<PawnPromotionModalProps> = ({
  isOpen,
  position,
  color,
  onPromote,
}) => {
  const pieceOptions: PieceType[] = ['queen', 'rook', 'bishop', 'knight'];
  
  const handlePieceSelect = (pieceType: PieceType) => {
    onPromote(position, pieceType);
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">Promote Pawn</h3>
          <p className="text-sm text-gray-500">Select a piece to promote your pawn to:</p>
        </div>
        
        <div className="flex justify-center gap-4">
          {pieceOptions.map((pieceType) => (
            <div
              key={pieceType}
              className="bg-card p-2 rounded-md cursor-pointer hover:bg-accent flex flex-col items-center"
              onClick={() => handlePieceSelect(pieceType)}
            >
              <div className="text-4xl mb-2">
                {pieceType === 'queen' && (color === 'white' ? '♕' : '♛')}
                {pieceType === 'rook' && (color === 'white' ? '♖' : '♜')}
                {pieceType === 'bishop' && (color === 'white' ? '♗' : '♝')}
                {pieceType === 'knight' && (color === 'white' ? '♘' : '♞')}
              </div>
              <div className="text-sm capitalize">{pieceType}</div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PawnPromotionModal;
