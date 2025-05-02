
import React from 'react';
import { Button } from "@/components/ui/button";
import { Fullscreen, Minimize, LayoutGrid, LayoutList } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

type LayoutType = 'horizontal' | 'vertical';

interface LayoutControlsProps {
  isFullscreen: boolean;
  layoutType: LayoutType;
  showGameInfo: boolean;
  onToggleFullscreen: () => void;
  onChangeLayout: (layout: LayoutType) => void;
  onToggleGameInfo: () => void;
}

const LayoutControls: React.FC<LayoutControlsProps> = ({
  isFullscreen,
  layoutType,
  showGameInfo,
  onToggleFullscreen,
  onChangeLayout,
  onToggleGameInfo,
}) => {
  const { toast } = useToast();

  const handleToggleFullscreen = () => {
    onToggleFullscreen();
    toast({
      title: isFullscreen ? "Exiting fullscreen" : "Entering fullscreen",
      duration: 2000,
    });
  };

  const handleChangeLayout = (layout: LayoutType) => {
    if (layout === layoutType) return;
    onChangeLayout(layout);
    toast({
      title: `Switched to ${layout} layout`,
      duration: 2000,
    });
  };

  const handleToggleGameInfo = () => {
    onToggleGameInfo();
    toast({
      title: showGameInfo ? "Game info hidden" : "Game info shown",
      duration: 2000,
    });
  };

  return (
    <div className="flex items-center justify-center gap-2 mb-4 max-w-xs mx-auto">
      <Button 
        variant="outline" 
        size="icon" 
        className="h-9 w-9" 
        onClick={handleToggleFullscreen}
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? <Minimize size={18} /> : <Fullscreen size={18} />}
      </Button>
      
      <Button 
        variant={layoutType === 'horizontal' ? "secondary" : "outline"}
        size="icon" 
        className="h-9 w-9" 
        onClick={() => handleChangeLayout('horizontal')}
        title="Horizontal layout"
      >
        <LayoutGrid size={18} />
      </Button>
      
      <Button 
        variant={layoutType === 'vertical' ? "secondary" : "outline"} 
        size="icon" 
        className="h-9 w-9" 
        onClick={() => handleChangeLayout('vertical')}
        title="Vertical layout"
      >
        <LayoutList size={18} />
      </Button>
      
      <Button 
        variant={showGameInfo ? "secondary" : "outline"} 
        onClick={handleToggleGameInfo}
        className="text-xs h-9"
        title={showGameInfo ? "Hide game info" : "Show game info"}
      >
        {showGameInfo ? "Hide Info" : "Show Info"}
      </Button>
    </div>
  );
};

export default LayoutControls;
