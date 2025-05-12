
import { BoardTheme } from "@/components/BoardThemeSelector";

export const getBoardColors = (theme: BoardTheme) => {
  switch (theme) {
    case 'classic':
      return {
        light: 'bg-[#F5F5DC] dark:bg-[#D9D9B9]', // Light beige
        dark: 'bg-[#8B4513] dark:bg-[#6A3500]',   // Dark brown
      };
    case 'wood':
      return {
        light: 'bg-[#E8C39E] dark:bg-[#C9A988]', // Light wood
        dark: 'bg-[#9E7157] dark:bg-[#7D5A46]',  // Dark wood
      };
    case 'tournament':
      return {
        light: 'bg-[#EEEED2] dark:bg-[#CFC9A8]', // Light green-beige
        dark: 'bg-[#769656] dark:bg-[#5D7945]',  // Green
      };
    case 'emerald':
      return {
        light: 'bg-[#EEEED2] dark:bg-[#CFC9A8]', // Light green-beige
        dark: 'bg-[#4A8462] dark:bg-[#3A6A4F]',  // Emerald green
      };
    case 'coral':
      return {
        light: 'bg-[#FFF8E8] dark:bg-[#DAD5C9]', // Light cream
        dark: 'bg-[#D18B47] dark:bg-[#B27639]',  // Coral brown
      };
    default:
      return {
        light: 'bg-[#F5F5DC] dark:bg-[#D9D9B9]', // Default light
        dark: 'bg-[#8B4513] dark:bg-[#6A3500]',  // Default dark
      };
  }
};

export const getSquareClassName = (isDark: boolean, theme: BoardTheme, isSelected: boolean, isValidMove: boolean, isCheck: boolean) => {
  const { light, dark } = getBoardColors(theme);
  let classes = isDark ? dark : light;
  
  if (isSelected) {
    classes += ' after:absolute after:inset-0 after:bg-primary/30 after:z-0';
  }
  
  if (isCheck) {
    classes += ' after:absolute after:inset-0 after:bg-destructive/30 after:z-0';
  }
  
  // Valid move indicators
  if (isValidMove) {
    classes += isDark 
      ? ' after:absolute after:inset-[25%] after:bg-primary/50 after:z-10 after:rounded-full' 
      : ' after:absolute after:inset-[25%] after:bg-primary/50 after:z-10 after:rounded-full';
  }
  
  return classes;
};
