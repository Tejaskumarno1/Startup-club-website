
import React from "react";
import { Sun, Moon, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const ThemeToggle = () => {
  const { theme, toggleTheme, is3DMode, toggle3DMode } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle3DMode}
              className={is3DMode ? "text-accent bg-accent/10" : ""}
              aria-label="Toggle 3D Mode"
            >
              <Box className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{is3DMode ? "Disable" : "Enable"} 3D Mode</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleTheme} 
        aria-label="Toggle theme"
      >
        {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
    </div>
  );
};
