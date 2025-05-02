
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChessGame from '../components/ChessGame';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    // In a real app, we would validate the room exists here via API call
    if (roomId && roomId.length === 6) {
      setIsValid(true);
    } else {
      setIsValid(false);
      toast({
        title: "Invalid Room",
        description: "The room ID is invalid or doesn't exist.",
        variant: "destructive",
      });
    }
  }, [roomId, toast]);

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-8">
      <div className="container">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-primary">Chess Duo</h1>
          <div className="flex items-center justify-center gap-4">
            <Button onClick={handleBack} variant="outline" size="sm">
              ← Back to Home
            </Button>
            <p className="text-lg text-muted-foreground">
              Room: <span className="font-semibold">{roomId}</span>
            </p>
          </div>
        </header>
        
        {isValid === true && roomId && (
          <ChessGame initialMode={{ type: 'online', roomId }} />
        )}
        
        {isValid === false && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Room Not Found</h2>
            <p className="mb-6">The room you're looking for doesn't exist or has expired.</p>
            <Button onClick={handleBack}>
              Return Home
            </Button>
          </div>
        )}
        
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>© 2025 Chess Duo - All rights reserved</p>
        </footer>
      </div>
    </div>
  );
};

export default Room;
