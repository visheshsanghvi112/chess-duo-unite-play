
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChessGame from '../components/ChessGame';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ThemeToggle } from '../components/ThemeToggle';
import { useIsMobile } from '@/hooks/use-mobile';

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const isMobile = useIsMobile();

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-4">
      <div className="container px-4 sm:px-6">
        <header className="mb-4 flex flex-col items-center">
          <div className="flex w-full justify-between items-center mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary">Chess Duo</h1>
            <ThemeToggle />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-2">
            <Button onClick={handleBack} variant="outline" size={isMobile ? "sm" : "default"}>
              ← Back
            </Button>
            <p className="text-sm sm:text-base text-muted-foreground">
              Room: <span className="font-semibold">{roomId}</span>
            </p>
          </div>
        </header>
        
        {isValid === true && roomId && (
          <ChessGame initialMode={{ type: 'online', roomId }} />
        )}
        
        {isValid === false && (
          <div className="text-center py-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Room Not Found</h2>
            <p className="mb-6">The room you're looking for doesn't exist or has expired.</p>
            <Button onClick={handleBack}>
              Return Home
            </Button>
          </div>
        )}
        
        <footer className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
          <p>© 2025 Chess Duo - All rights reserved</p>
        </footer>
      </div>
    </div>
  );
};

export default Room;
