
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface RoomModalProps {
  isOpen: boolean;
  type: 'create' | 'join';
  onClose: () => void;
  onCreateRoom: (roomId?: string) => void;
  onJoinRoom: (roomId: string) => void;
}

const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  type,
  onClose,
  onCreateRoom,
  onJoinRoom,
}) => {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (type === 'join') {
      if (!roomId.trim()) {
        setError('Please enter a room ID');
        return;
      }
      onJoinRoom(roomId.trim().toUpperCase());
    } else {
      onCreateRoom(roomId.trim() ? roomId.trim().toUpperCase() : undefined);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'create' ? 'Create a New Room' : 'Join Existing Room'}
          </DialogTitle>
          <DialogDescription>
            {type === 'create' 
              ? 'Create a new game room and invite a friend to play.'
              : 'Enter the room ID shared with you to join the game.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {type === 'join' ? (
              <div className="space-y-2">
                <Label htmlFor="roomId">Room ID</Label>
                <Input
                  id="roomId"
                  placeholder="Enter the 6-character room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="roomId">Room ID (Optional)</Label>
                <Input
                  id="roomId"
                  placeholder="Enter a custom room ID or leave blank for random"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to generate a random room ID
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {type === 'create' ? 'Create Room' : 'Join Room'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoomModal;
