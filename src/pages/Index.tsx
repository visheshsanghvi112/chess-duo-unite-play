
import React from 'react';
import ChessGame from '../components/ChessGame';
import { ThemeToggle } from '../components/ThemeToggle';
import { useIsMobile } from '@/hooks/use-mobile';

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
        
        <footer className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
          <p>© 2025 Chess Duo - Created by <a href="https://visheshsanghvi.me/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Vishesh Sanghvi</a></p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
