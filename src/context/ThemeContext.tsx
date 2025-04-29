
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type Mode3D = boolean;

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  is3DMode: Mode3D;
  toggle3DMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize theme from localStorage or system preference
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      return savedTheme;
    }
    
    // If no localStorage value, check system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    
    // Default to light mode
    return "light";
  });

  // Enable 3D mode by default
  const [is3DMode, setIs3DMode] = useState<Mode3D>(true);

  // Apply theme class to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove old theme class and add new one
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem("theme", theme);
    localStorage.setItem("userSetTheme", "true"); // User has manually set theme
  }, [theme]);

  // Check if 3D mode setting exists in localStorage
  useEffect(() => {
    const saved3DMode = localStorage.getItem("3dMode");
    if (saved3DMode !== null) {
      setIs3DMode(saved3DMode === "true");
    }
  }, []);

  // Toggle theme with one click
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === "light" ? "dark" : "light");
  };

  // Toggle 3D mode
  const toggle3DMode = () => {
    setIs3DMode(prev => {
      const newMode = !prev;
      localStorage.setItem("3dMode", String(newMode));
      return newMode;
    });
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set theme
      if (!localStorage.getItem("userSetTheme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, is3DMode, toggle3DMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
