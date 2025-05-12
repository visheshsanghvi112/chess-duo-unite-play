
import React from 'react';
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type BoardTheme = 'classic' | 'wood' | 'tournament' | 'emerald' | 'coral';

interface BoardThemeSelectorProps {
  currentTheme: BoardTheme;
  onChange: (theme: BoardTheme) => void;
}

const BoardThemeSelector: React.FC<BoardThemeSelectorProps> = ({ 
  currentTheme, 
  onChange 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
        >
          <Palette size={16} />
          Theme
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Board Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={currentTheme} onValueChange={(value) => onChange(value as BoardTheme)}>
          <DropdownMenuRadioItem value="classic" className="gap-2">
            <div className="flex gap-1 items-center">
              <div className="w-4 h-4 bg-[#F5F5DC]"></div>
              <div className="w-4 h-4 bg-[#8B4513]"></div>
            </div>
            Classic
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="wood" className="gap-2">
            <div className="flex gap-1 items-center">
              <div className="w-4 h-4 bg-[#E8C39E]"></div>
              <div className="w-4 h-4 bg-[#9E7157]"></div>
            </div>
            Wooden
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="tournament" className="gap-2">
            <div className="flex gap-1 items-center">
              <div className="w-4 h-4 bg-[#EEEED2]"></div>
              <div className="w-4 h-4 bg-[#769656]"></div>
            </div>
            Tournament
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="emerald" className="gap-2">
            <div className="flex gap-1 items-center">
              <div className="w-4 h-4 bg-[#EEEED2]"></div>
              <div className="w-4 h-4 bg-[#4A8462]"></div>
            </div>
            Emerald
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="coral" className="gap-2">
            <div className="flex gap-1 items-center">
              <div className="w-4 h-4 bg-[#FFF8E8]"></div>
              <div className="w-4 h-4 bg-[#D18B47]"></div>
            </div>
            Coral
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BoardThemeSelector;
