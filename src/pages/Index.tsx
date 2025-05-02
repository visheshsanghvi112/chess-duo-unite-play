
import React from 'react';
import ChessGame from '../components/ChessGame';
import { ThemeToggle } from '../components/ThemeToggle';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-4">
      <div className="container px-4 sm:px-6">
        <header className="mb-4 flex flex-col items-center">
          <div className="flex w-full justify-between items-center mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary">Chess Duo</h1>
            <ThemeToggle />
          </div>
          <p className="text-base sm:text-lg text-muted-foreground">Play chess with a friend locally or online</p>
        </header>
        
        <ChessGame />
        
        <div className="mt-8 mb-4 px-2 py-3 bg-card rounded-lg shadow">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Features:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm sm:text-base">
            <li>Play locally on the same device</li>
            <li>Create online rooms to play with friends</li>
            <li>Full chess rules including check, checkmate, and stalemate</li>
            <li>Pawn promotion</li>
            <li>Sound effects for all moves and events</li>
            <li>Proper chess notation in move history</li>
            <li>Mobile-friendly interface with fullscreen mode</li>
            <li>Adjustable layout (horizontal or vertical)</li>
            <li>Option to hide game information for more board space</li>
            <li>Dark and light theme support</li>
          </ul>
        </div>
        
        <footer className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
          <p>© 2025 Chess Duo - All rights reserved</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
