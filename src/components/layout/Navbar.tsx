
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import the logo
import universityLogo from "/lovable-uploads/c85d2794-e9f3-4d6a-bf35-8563a6ca4813.png";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Events", href: "/events" },
  { name: "Community", href: "/community" },
  { name: "Mentorship", href: "/mentorship" },
];

export const Navbar = () => {
  const { user, signOut, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    const checkSidebarState = () => {
      const sidebarState = localStorage.getItem('sidebarCollapsed') !== 'true';
      setSidebarOpen(sidebarState);
    };
    
    window.addEventListener("scroll", handleScroll);
    window.addEventListener('resize', checkIfMobile);
    window.addEventListener('storage', checkSidebarState);
    
    // Initial checks
    checkIfMobile();
    checkSidebarState();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('resize', checkIfMobile);
      window.removeEventListener('storage', checkSidebarState);
    };
  }, []);

  const goToProfile = () => {
    navigate("/profile");
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleSidebar = () => {
    // Get current state from localStorage
    const currentState = localStorage.getItem('sidebarCollapsed') === 'true';
    // Toggle the state
    const newState = !currentState;
    // Save to localStorage
    localStorage.setItem('sidebarCollapsed', String(newState));
    // Update local state
    setSidebarOpen(!newState);
    // Trigger storage event for other components to detect
    window.dispatchEvent(new Event('storage'));
  };

  const userName = user ? `${user.first_name || user.user_metadata?.first_name || ''} ${user.last_name || user.user_metadata?.last_name || ''}` : '';
  const userInitials = user ? `${(user.first_name || user.user_metadata?.first_name || '')[0] || ''}${(user.last_name || user.user_metadata?.last_name || '')[0] || ''}` : '';

  return (
    <header
      className={cn(
        "fixed top-0 z-40 transition-all duration-300 w-full",
        scrolled
          ? "bg-background shadow-sm py-2 dark:bg-card/95 dark:backdrop-blur-md"
          : "bg-background py-2 dark:bg-card/80 dark:backdrop-blur-sm"
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* Only show sidebar toggle on desktop */}
          {!isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 hidden md:flex" 
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {/* Always show logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={universityLogo} 
              alt="SR University Startup Club" 
              className="h-10 md:h-12" 
            />
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6 lg:space-x-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                "text-base font-medium transition-colors hover:text-primary",
                location.pathname === link.href || 
                (link.href !== '/' && location.pathname.startsWith(link.href))
                  ? "text-primary font-semibold"
                  : "text-foreground/80"
              )}
            >
              {link.name}
            </Link>
          ))}
          
          {/* Add theme toggle */}
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="relative h-10 rounded-full flex items-center gap-2 cursor-pointer">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                    {userInitials}
                  </div>
                  <span className="hidden lg:inline">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={goToProfile} className="cursor-pointer">
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile/notifications">Notifications</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile/edit">Edit Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile/settings">Account Settings</Link>
                </DropdownMenuItem>
                
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Administration</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link to="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/users">Manage Users</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/events">Manage Events</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/slides">Manage Content</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/sponsors">Manage Sponsors</Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button className="bg-primary hover:bg-primary/80">Sign In</Button>
            </Link>
          )}
        </nav>

        <div className="md:hidden flex items-center gap-2">
          {/* Theme toggle */}
          <ThemeToggle />
          
          {/* User profile dropdown for mobile */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                    {userInitials}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={goToProfile} className="cursor-pointer">
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile/notifications">Notifications</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Administration</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link to="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Mobile menu toggle button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(!isOpen)} 
            className="z-50"
            aria-label="Toggle mobile menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "md:hidden fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out bg-background/95 dark:bg-background/90 backdrop-blur-md",
          isOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0 pointer-events-none"
        )}
      >
        <div className="flex flex-col pt-20 px-6 h-full">
          <div className="flex-grow">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "flex items-center text-lg font-medium py-3 border-b border-border",
                  location.pathname === link.href || 
                  (link.href !== '/' && location.pathname.startsWith(link.href))
                    ? "text-primary font-semibold"
                    : "text-foreground/80"
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            {isAdmin && (
              <>
                <div className="mt-6 mb-2 text-sm font-semibold text-muted-foreground uppercase">
                  Admin
                </div>
                <Link
                  to="/admin"
                  className="flex items-center text-lg font-medium py-3 border-b border-border"
                  onClick={() => setIsOpen(false)}
                >
                  Admin Dashboard
                </Link>
                <Link
                  to="/admin/users"
                  className="flex items-center text-lg font-medium py-3 border-b border-border"
                  onClick={() => setIsOpen(false)}
                >
                  Manage Users
                </Link>
              </>
            )}
          </div>
          
          <div className="py-6">
            {user ? (
              <Button 
                variant="outline" 
                className="w-full mb-4" 
                onClick={() => {
                  handleSignOut();
                  setIsOpen(false);
                }}
              >
                Sign Out
              </Button>
            ) : (
              <Link 
                to="/login" 
                className="w-full block" 
                onClick={() => setIsOpen(false)}
              >
                <Button className="w-full">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
