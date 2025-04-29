
import React, { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";
import { ThreeDBackground } from "@/components/theme/ThreeDBackground";
import { useTheme } from "@/context/ThemeContext";

interface MainLayoutProps {
  children: React.ReactNode;
  withoutPadding?: boolean;
  fullWidth?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  withoutPadding = false,
  fullWidth = false
}) => {
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { theme, is3DMode } = useTheme();
  
  useEffect(() => {
    // Check localStorage for sidebar state
    const checkSidebarState = () => {
      const storedState = localStorage.getItem('sidebarCollapsed');
      setSidebarCollapsed(storedState === 'true');
    };
    
    window.addEventListener('storage', checkSidebarState);
    
    checkSidebarState();
    
    return () => {
      window.removeEventListener('storage', checkSidebarState);
    };
  }, []);

  // Reset scroll position on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleSidebarToggle = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-[#0c1015]' : 'bg-background'} relative transition-colors duration-300`}>
      {/* Dot pattern background overlay - respect dark/light mode */}
      <div className="absolute inset-0 bg-dot-pattern bg-dot-md text-gray-200 dark:text-gray-800 opacity-20 pointer-events-none" />
      
      {/* 3D background when enabled */}
      <ThreeDBackground />
      
      {/* Navigation */}
      <Navbar />
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      
      {/* Main Content - adjust margin based on sidebar width */}
      <main className={`flex-grow ${!isMobile ? (sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64') : ''} transition-all duration-300 pt-16 relative z-10`}>
        <div className={`${fullWidth ? 'w-full' : 'container mx-auto'} ${withoutPadding ? '' : 'px-4 py-8'}`}>
          {children}
        </div>
      </main>
      
      {/* Footer - should stretch full width */}
      <div className={`${!isMobile ? (sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64') : ''} transition-all duration-300 relative z-10`}>
        <Footer />
      </div>
    </div>
  );
};
