
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  BookText,
  MessageSquare,
  Building2,
  UserPlus,
  Settings,
  BarChart2,
  List,
  Video,
  Trophy,
  Star,
  Award,
  CalendarCheck
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminNavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
}

interface AdminNavGroupProps {
  title: string;
  items: AdminNavItem[];
}

const AdminNavGroup: React.FC<AdminNavGroupProps> = ({ title, items }) => {
  const location = useLocation();
  
  return (
    <div className="mb-6">
      <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">{title}</h3>
      <div className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              location.pathname === item.href
                ? "bg-primary text-white"
                : "hover:bg-primary/10 hover:text-primary"
            )}
          >
            {item.icon}
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export const AdminNavigation: React.FC = () => {
  const dashboardItems: AdminNavItem[] = [
    {
      title: "Overview",
      href: "/admin",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: <BarChart2 className="h-4 w-4" />,
    },
  ];

  const userItems: AdminNavItem[] = [
    {
      title: "Manage Users",
      href: "/admin/users",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Manage Mentors",
      href: "/admin/mentors",
      icon: <UserPlus className="h-4 w-4" />,
    }
  ];

  const startupItems: AdminNavItem[] = [
    {
      title: "Manage Startups",
      href: "/admin/startups",
      icon: <Building2 className="h-4 w-4" />,
    }
  ];

  const eventsItems: AdminNavItem[] = [
    {
      title: "Manage Events",
      href: "/admin/events",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      title: "Event Registrations",
      href: "/admin/event-registrations",
      icon: <CalendarCheck className="h-4 w-4" />,
    },
    {
      title: "Calendar",
      href: "/admin/calendar",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      title: "Recordings",
      href: "/admin/recordings",
      icon: <Video className="h-4 w-4" />,
    },
  ];

  const contentItems: AdminNavItem[] = [
    {
      title: "Success Stories",
      href: "/admin/manage-success-stories",
      icon: <Trophy className="h-4 w-4" />,
    },
    {
      title: "Slides",
      href: "/admin/slides",
      icon: <List className="h-4 w-4" />,
    },
    {
      title: "Sponsors",
      href: "/admin/sponsors",
      icon: <Award className="h-4 w-4" />,
    },
    {
      title: "Important Members",
      href: "/admin/manage-important-members",
      icon: <Star className="h-4 w-4" />,
    },
  ];

  const configItems: AdminNavItem[] = [
    {
      title: "Site Configuration",
      href: "/admin/site-config",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      title: "System Settings",
      href: "/admin/settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <ScrollArea className="h-[calc(100vh-120px)]">
      <div className="pr-3">
        <AdminNavGroup title="Dashboard" items={dashboardItems} />
        <AdminNavGroup title="User Management" items={userItems} />
        <AdminNavGroup title="Startup Management" items={startupItems} />
        <AdminNavGroup title="Event Management" items={eventsItems} />
        <AdminNavGroup title="Content Management" items={contentItems} />
        <AdminNavGroup title="Configuration" items={configItems} />
      </div>
    </ScrollArea>
  );
};
