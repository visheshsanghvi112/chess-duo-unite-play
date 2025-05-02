
import React from 'react';
import ChessGame from '../components/ChessGame';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-8">
      <div className="container">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-primary">Chess Duo</h1>
          <p className="text-lg text-muted-foreground">Play chess with a friend locally or online</p>
        </header>
        
        <ChessGame />
        
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>© 2025 Chess Duo - All rights reserved</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
