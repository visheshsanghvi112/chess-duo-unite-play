
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { useIsMobile } from "@/hooks/use-mobile";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  
  return (
    <Button
      variant="outline"
      size={isMobile ? "icon" : "default"}
      onClick={toggleTheme}
      className="rounded-full"
    >
      {theme === "light" ? (
        <>
          <Sun className="h-5 w-5" />
          {!isMobile && <span className="ml-2">Dark mode</span>}
          <span className="sr-only">Switch to dark mode</span>
        </>
      ) : (
        <>
          <Moon className="h-5 w-5" />
          {!isMobile && <span className="ml-2">Light mode</span>}
          <span className="sr-only">Switch to light mode</span>
        </>
      )}
    </Button>
  );
}
