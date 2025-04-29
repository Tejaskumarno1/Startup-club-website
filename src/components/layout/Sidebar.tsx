import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { 
  LayoutDashboard,
  Building2, 
  Calendar, 
  Users, 
  UserPlus, 
  User, 
  ChevronDown,
  Menu as MenuIcon,
  MessageSquare,
  Home,
  Settings,
  BarChart2,
  Star,
  X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useTheme } from "@/context/ThemeContext";

// Logo
import universityLogo from "/lovable-uploads/c85d2794-e9f3-4d6a-bf35-8563a6ca4813.png";

type MenuItem = {
  icon: React.ElementType;
  label: string;
  href: string;
  submenu?: SubMenuItem[];
  expanded?: boolean;
  adminOnly?: boolean;
};

type SubMenuItem = {
  label: string;
  href: string;
  adminOnly?: boolean;
};

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggle }) => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<{[key: string]: boolean}>({});
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const { theme } = useTheme();

  const menuItems: MenuItem[] = [
    { icon: Home, label: "Home", href: "/" },
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { 
      icon: Building2, 
      label: "Startups", 
      href: "/startups",
      expanded: false,
      submenu: [
        { label: "Browse Startups", href: "/startups/browse" },
        { label: "My Connections", href: "/startups/connections" },
        { label: "Request Introductions", href: "/startups/introductions" },
      ]
    },
    { 
      icon: Calendar, 
      label: "Events", 
      href: "/events",
      expanded: false,
      submenu: [
        { label: "Upcoming Events", href: "/events/upcoming" },
        { label: "My Calendar", href: "/events/calendar" },
        { label: "Past Recordings", href: "/events/recordings" },
      ]
    },
    { 
      icon: Users, 
      label: "Community", 
      href: "/community",
      expanded: false,
      submenu: [
        { label: "Member Directory", href: "/community/directory" },
        { label: "Success Stories", href: "/community/success-stories" },
      ]
    },
    { 
      icon: UserPlus, 
      label: "Mentorship", 
      href: "/mentorship",
      expanded: false,
      submenu: [
        { label: "Find a Mentor", href: "/mentorship/find" },
        { label: "Mentor Sessions", href: "/mentorship/sessions" },
        { label: "Become a Mentor", href: "/mentorship/become" },
      ]
    },
    {
      icon: MessageSquare,
      label: "Chat",
      href: "/chat",
    },
    { 
      icon: User, 
      label: "My Profile", 
      href: "/profile",
      expanded: false,
      submenu: [
        { label: "Edit Profile", href: "/profile/edit" },
        { label: "Notifications", href: "/profile/notifications" },
        { label: "Settings", href: "/profile/settings" },
      ]
    },
    {
      icon: BarChart2,
      label: "Admin",
      href: "/admin",
      adminOnly: true,
      expanded: false,
      submenu: [
        { label: "Dashboard", href: "/admin" },
        { label: "Analytics", href: "/admin/analytics" },
        { label: "Manage Users", href: "/admin/users" },
        { label: "Manage Events", href: "/admin/events" },
        { label: "Manage Mentors", href: "/admin/mentors" },
        { label: "Manage Slides", href: "/admin/slides" },
        { label: "Important Members", href: "/admin/manage-important-members" },
        { label: "System Settings", href: "/admin/settings" },
        { label: "Site Configuration", href: "/admin/site-config" },
      ]
    }
  ];

  useEffect(() => {
    const storedExpandedMenus = localStorage.getItem('expandedMenus');
    if (storedExpandedMenus) {
      try {
        setExpandedMenus(JSON.parse(storedExpandedMenus));
      } catch (e) {
        console.error("Failed to parse expanded menus from localStorage");
      }
    }
  }, []);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  useEffect(() => {
    const pathname = location.pathname;
    setActiveItem(pathname);
    
    const activeMenu = menuItems.find(item => 
      pathname === item.href || 
      pathname.startsWith(item.href + "/") ||
      item.submenu?.some(subItem => pathname === subItem.href || pathname.startsWith(subItem.href + "/"))
    );
    
    if (activeMenu && activeMenu.submenu) {
      setExpandedMenus(prev => ({
        ...prev,
        [activeMenu.label]: true
      }));
    }
  }, [location.pathname]);

  const toggleSubmenu = useCallback((menuLabel: string) => {
    setExpandedMenus(prev => {
      const newExpandedMenus = {...prev};
      newExpandedMenus[menuLabel] = !prev[menuLabel];
      localStorage.setItem('expandedMenus', JSON.stringify(newExpandedMenus));
      return newExpandedMenus;
    });
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  const handleMenuItemClick = useCallback((href: string, hasSubmenu: boolean, label: string) => {
    setActiveItem(href);
    
    if (hasSubmenu) {
      toggleSubmenu(label);
      return;
    }
    
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile, toggleSubmenu]);

  const SidebarContent = () => (
    <>
      <div className={`flex items-center justify-between p-4 h-20 border-b ${theme === 'dark' ? 'border-gray-800 bg-[#121520]' : 'border-gray-100'}`}>
        <div className="flex items-center justify-center h-full">
          <Link to="/" className="flex items-center">
            <img 
              src={universityLogo} 
              alt="SR University Startup Club" 
              className={`h-10 ${collapsed ? 'w-12 mx-auto' : 'mr-3'}`} 
            />
            {!collapsed && (
              <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-primary'}`}>
                Startup Club
                {isAdmin && (
                  <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded">Admin</span>
                )}
              </div>
            )}
          </Link>
        </div>
        {!isMobile && onToggle && (
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
            <ChevronDown className={`h-5 w-5 transform transition-transform ${collapsed ? '' : 'rotate-180'}`} />
          </Button>
        )}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto h-[calc(100vh-180px)] ${theme === 'dark' ? 'bg-[#121520] text-gray-300' : 'bg-white text-foreground'}`}>
        <ul className="space-y-1 px-2 py-4">
          {menuItems
            .filter(item => !item.adminOnly || (item.adminOnly && isAdmin))
            .map((item) => (
              <li key={item.label}>
                <div className="flex flex-col">
                  <Link
                    to={item.href}
                    className={`flex items-center rounded-lg p-3 transition-colors justify-between px-4 ${
                      activeItem === item.href 
                        ? "bg-primary text-white"
                        : theme === 'dark'
                          ? "text-gray-200 hover:bg-blue-900/30 hover:text-blue-400"
                          : "text-foreground hover:bg-primary/10 hover:text-primary"
                    }`}
                    onClick={(e) => {
                      if (item.submenu) {
                        e.preventDefault();
                      }
                      handleMenuItemClick(item.href, !!item.submenu, item.label);
                    }}
                  >
                    <div className="flex items-center">
                      <item.icon className="h-5 w-5 mr-3" />
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                    {item.submenu && !collapsed && (
                      <ChevronDown 
                        className={`h-4 w-4 transform transition-transform ${
                          expandedMenus[item.label] ? 'rotate-180' : ''
                        }`} 
                      />
                    )}
                  </Link>
                  
                  {item.submenu && expandedMenus[item.label] && !collapsed && (
                    <ul className={`ml-9 mt-1 mb-2 border-l ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} pl-3 space-y-1`}>
                      {item.submenu
                        .filter(subItem => !subItem.adminOnly || (subItem.adminOnly && isAdmin))
                        .map((subItem) => (
                          <li key={subItem.label}>
                            <Link
                              to={subItem.href}
                              className={`block py-2 px-3 text-sm rounded-md transition-colors ${
                                activeItem === subItem.href 
                                  ? theme === 'dark'
                                    ? "bg-blue-900/30 text-blue-400 font-medium"
                                    : "bg-primary/20 text-primary font-medium"
                                  : theme === 'dark'
                                    ? "hover:bg-blue-900/20 hover:text-blue-400"
                                    : "hover:bg-primary/10 hover:text-primary"
                              }`}
                              onClick={() => handleMenuItemClick(subItem.href, false, item.label)}
                            >
                              {subItem.label}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
        </ul>
      </div>

      <div className={`p-4 ${theme === 'dark' ? 'bg-[#121520] border-t border-gray-800' : ''}`}>
        {user ? (
          <div className="flex flex-col gap-2">
            {!collapsed && (
              <Button className="w-full" onClick={() => window.location.href = "/profile"}>
                My Profile
              </Button>
            )}
          </div>
        ) : (
          !collapsed && (
            <Button className="w-full bg-primary hover:bg-primary/80" onClick={() => {
              window.location.href = "/login";
            }}>Sign In</Button>
          )
        )}
      </div>
    </>
  );

  return (
    <>
      {isMobile && (
        <button
          onClick={toggleMobileMenu}
          className="fixed top-3 right-4 z-50 p-2 rounded-full bg-primary text-white block lg:hidden shadow-md"
          aria-label="Toggle menu"
          style={{ transform: 'translateY(0)' }}
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      )}
      
      {isMobile && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className={`p-0 w-[85%] sm:w-[350px] border-r overflow-y-auto max-h-full ${theme === 'dark' ? 'bg-[#121520]' : 'bg-white'}`}>
            <div className="flex flex-col h-full overflow-y-auto">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      )}
      
      <aside
        className={`fixed top-0 left-0 h-screen ${theme === 'dark' ? 'bg-[#121520] text-gray-200' : 'bg-white text-foreground'} shadow-md z-40 transition-all duration-300 hidden lg:flex flex-col ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
};
