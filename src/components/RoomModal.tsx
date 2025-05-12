
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Users, User, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

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

  const handleCopyExample = () => {
    const exampleId = 'ABC123';
    navigator.clipboard.writeText(exampleId).then(() => {
      setCopied(true);
      setRoomId(exampleId);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: `Room ID ${exampleId} copied to clipboard`,
      });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {type === 'create' ? 
              <Users className="h-6 w-6 text-primary" /> : 
              <User className="h-6 w-6 text-primary" />
            }
            <DialogTitle className="text-xl">
              {type === 'create' ? 'Create a New Game Room' : 'Join Existing Game Room'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {type === 'create' 
              ? 'Create a new game room and invite a friend to play chess together.'
              : 'Enter the room ID shared with you to join your friend\'s game.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {type === 'join' ? (
              <div className="space-y-2">
                <Label htmlFor="roomId" className="text-sm font-medium">Room ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="roomId"
                    placeholder="Enter 6-character room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="font-mono text-lg text-center uppercase tracking-wider"
                  />
                  <Button 
                    type="button" 
                    size="icon" 
                    variant="outline" 
                    onClick={handleCopyExample}
                    title="Copy example room ID"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </Button>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="roomId" className="text-sm font-medium">Custom Room ID (Optional)</Label>
                <Input
                  id="roomId"
                  placeholder="Enter a custom room ID or leave blank"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="font-mono text-lg text-center uppercase tracking-wider"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to generate a random room ID
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit"
                className="gap-2"
              >
                {type === 'create' ? (
                  <>
                    <Users size={16} />
                    Create Room
                  </>
                ) : (
                  <>
                    <User size={16} />
                    Join Room
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoomModal;
