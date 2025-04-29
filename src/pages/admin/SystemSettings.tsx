import React, { useState, useEffect } from "react";
import { PageTemplate } from "@/components/common/PageTemplate";
import { 
  Settings, Save, RefreshCw, AlertTriangle, 
  LayoutDashboard, Users, Calendar, Building2, 
  MessageSquare, FileText, GraduationCap, BarChart2,
  Globe, Home, Star, User, Shield, BookOpen,
  Bell, LogOut, Lock, Cog, Mail, HelpCircle,
  FileQuestion, Landmark, Heart, Award, Briefcase,
  PenTool, Edit, UserCog, Key, Video, LogIn, 
  Search, Library, School, Layers, FolderPlus, 
  FileArchive, PieChart, FileIcon, Book, Contact,
  Clock, Settings2, Menu, Database, Code, Phone,
  CheckCircle, ListTodo, Link, Map, Share2, Info,
  Lightbulb, Zap, FileCheck, UserCheck, Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { getSystemConfig, updateSystemConfig } from "@/lib/adminCms";
import { useNavigate } from "react-router-dom";
import { NavigationButtonCard } from "@/components/admin/NavigationButtonCard";
import { LucideIcon } from "lucide-react";

interface SystemConfigState {
  id?: string;
  maintenance_mode: boolean;
  registration_open: boolean;
  allow_guest_access: boolean;
  footer_text: string;
  primary_color: string;
  contact_email?: string;
}

interface NavButton {
  icon: LucideIcon;
  label: string;
  href: string;
  color?: string;
  description?: string;
}

interface NavCategory {
  title: string;
  description: string;
  buttons: NavButton[];
  columns?: number;
}

const SystemSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SystemConfigState>({
    maintenance_mode: false,
    registration_open: true,
    allow_guest_access: true,
    footer_text: 'SR University Startup Club',
    primary_color: '#4f46e5',
  });
  
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const navigationCategories: NavCategory[] = [
    {
      title: "Main Navigation",
      description: "Core pages of the platform",
      buttons: [
        { icon: Home, label: "Home", href: "/", color: "#4f46e5", description: "Landing page" },
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", color: "#0ea5e9", description: "User dashboard" },
        { icon: User, label: "Profile", href: "/profile", color: "#8b5cf6", description: "User profile" },
        { icon: LogIn, label: "Login", href: "/login", color: "#06b6d4", description: "Login page" },
        { icon: UserCheck, label: "Signup", href: "/signup", color: "#10b981", description: "Sign up page" },
        { icon: HelpCircle, label: "Help", href: "/help", color: "#f59e0b", description: "Help center" }
      ]
    },
    {
      title: "Profile & Settings",
      description: "User profile and settings pages",
      buttons: [
        { icon: User, label: "View Profile", href: "/profile", color: "#8b5cf6", description: "View profile" },
        { icon: Edit, label: "Edit Profile", href: "/profile/edit", color: "#ec4899", description: "Edit profile information" },
        { icon: Bell, label: "Notifications", href: "/profile/notifications", color: "#f97316", description: "Notification settings" },
        { icon: Cog, label: "Settings", href: "/profile/settings", color: "#64748b", description: "User settings" }
      ]
    },
    {
      title: "Community",
      description: "Connect with the Startup Club community",
      buttons: [
        { icon: Users, label: "Community Home", href: "/community", color: "#ec4899", description: "Community landing page" },
        { icon: Users, label: "Member Directory", href: "/community/directory", color: "#f97316", description: "Browse all members" },
        { icon: Star, label: "Success Stories", href: "/community/success-stories", color: "#f59e0b", description: "Success stories" },
        { icon: UserCheck, label: "Connection Requests", href: "/community/connection-requests", color: "#eab308", description: "Manage connection requests" },
        { icon: Copy, label: "Forums", href: "/forum", color: "#84cc16", description: "Discussion forums" }
      ]
    },
    {
      title: "Events & Calendar",
      description: "Manage events and schedule",
      buttons: [
        { icon: Calendar, label: "Events Home", href: "/events", color: "#22c55e", description: "Events landing page" },
        { icon: Calendar, label: "Upcoming Events", href: "/events/upcoming", color: "#16a34a", description: "View upcoming events" },
        { icon: Calendar, label: "My Calendar", href: "/events/calendar", color: "#10b981", description: "Personal calendar" },
        { icon: Video, label: "Past Recordings", href: "/events/recordings", color: "#14b8a6", description: "Event recordings" },
        { icon: Clock, label: "Past Events", href: "/past-events", color: "#0d9488", description: "Browse past events" }
      ]
    },
    {
      title: "Startups & Innovation",
      description: "Explore startup opportunities",
      buttons: [
        { icon: Building2, label: "Startups Home", href: "/startups", color: "#0891b2", description: "Startups landing page" },
        { icon: Building2, label: "Browse Startups", href: "/startups/browse", color: "#0ea5e9", description: "Browse all startups" },
        { icon: Link, label: "My Connections", href: "/startups/connections", color: "#2563eb", description: "Your startup connections" },
        { icon: Share2, label: "Introductions", href: "/startups/introductions", color: "#4f46e5", description: "Request introductions" }
      ]
    },
    {
      title: "Mentorship",
      description: "Connect with mentors and experts",
      buttons: [
        { icon: GraduationCap, label: "Mentorship Home", href: "/mentorship", color: "#8b5cf6", description: "Mentorship landing page" },
        { icon: Search, label: "Find Mentor", href: "/mentorship/find", color: "#a855f7", description: "Find a mentor" },
        { icon: Calendar, label: "Mentor Sessions", href: "/mentorship/sessions", color: "#d946ef", description: "Your mentorship sessions" },
        { icon: Award, label: "Become Mentor", href: "/mentorship/become", color: "#ec4899", description: "Apply to become a mentor" }
      ]
    },
    {
      title: "Resources",
      description: "Learn from our resource library",
      buttons: [
        { icon: Library, label: "Resources Home", href: "/resources", color: "#f43f5e", description: "Resource library" },
        { icon: FileCheck, label: "Startup Guides", href: "/resources/startup-guides", color: "#ef4444", description: "Guides for startups" },
        { icon: FileIcon, label: "Templates", href: "/resources/templates", color: "#f97316", description: "Useful templates" },
        { icon: Briefcase, label: "Funding", href: "/resources/funding", color: "#f59e0b", description: "Funding resources" },
        { icon: Landmark, label: "Legal Toolkit", href: "/resources/legal", color: "#eab308", description: "Legal resources" }
      ]
    },
    {
      title: "Membership",
      description: "Membership information and benefits",
      buttons: [
        { icon: Star, label: "Membership Home", href: "/membership", color: "#84cc16", description: "Membership information" },
        { icon: CheckCircle, label: "Benefits", href: "/membership/benefits", color: "#22c55e", description: "Membership benefits" },
        { icon: FileQuestion, label: "FAQ", href: "/membership/faq", color: "#10b981", description: "Frequently asked questions" },
        { icon: Phone, label: "Contact", href: "/membership/contact", color: "#14b8a6", description: "Contact about membership" },
        { icon: Shield, label: "Terms", href: "/membership/terms", color: "#0d9488", description: "Membership terms" },
        { icon: Lock, label: "Privacy", href: "/membership/privacy", color: "#0891b2", description: "Privacy policy" }
      ]
    },
    {
      title: "Administration",
      description: "Admin only access",
      columns: 3,
      buttons: [
        { icon: LayoutDashboard, label: "Admin Dashboard", href: "/admin", color: "#3730a3", description: "Admin overview" },
        { icon: BarChart2, label: "Analytics", href: "/admin/analytics", color: "#4f46e5", description: "Site analytics" },
        { icon: Users, label: "Manage Users", href: "/admin/users", color: "#4338ca", description: "User management" },
        { icon: Calendar, label: "Manage Events", href: "/admin/events", color: "#3b82f6", description: "Event management" },
        { icon: Building2, label: "Manage Startups", href: "/admin/startups", color: "#2563eb", description: "Startup management" },
        { icon: GraduationCap, label: "Manage Mentors", href: "/admin/mentors", color: "#1d4ed8", description: "Mentor management" },
        { icon: GraduationCap, label: "Mentorship Program", href: "/admin/mentorship", color: "#3b82f6", description: "Mentorship program" },
        { icon: Book, label: "Manage Resources", href: "/admin/resources", color: "#2563eb", description: "Resource management" },
        { icon: Star, label: "Success Stories", href: "/admin/success-stories", color: "#1d4ed8", description: "Manage success stories" },
        { icon: Layers, label: "Manage Slides", href: "/admin/slides", color: "#1e40af", description: "Manage content slides" },
        { icon: Video, label: "Manage Recordings", href: "/admin/recordings", color: "#1e3a8a", description: "Manage recordings" },
        { icon: Settings, label: "System Settings", href: "/admin/settings", color: "#0f172a", description: "System configuration" },
        { icon: Calendar, label: "Admin Calendar", href: "/admin/calendar", color: "#3b82f6", description: "Admin calendar view" },
        { icon: Star, label: "Important Members", href: "/admin/manage-important-members", color: "#64748b", description: "Manage VIP members" }
      ]
    },
    {
      title: "Other Pages",
      description: "Miscellaneous pages",
      buttons: [
        { icon: MessageSquare, label: "Chat", href: "/chat", color: "#06b6d4", description: "Chat system" },
        { icon: Phone, label: "Contact Us", href: "/contact", color: "#0284c7", description: "Contact page" },
        { icon: Shield, label: "Terms of Service", href: "/terms", color: "#0369a1", description: "Terms of service" },
        { icon: Lock, label: "Privacy Policy", href: "/privacy", color: "#075985", description: "Privacy policy" },
        { icon: Info, label: "About", href: "/about", color: "#0c4a6e", description: "About us" },
        { icon: Heart, label: "Join Club", href: "/join", color: "#f43f5e", description: "Join the club" },
        { icon: Lightbulb, label: "Introduction", href: "/introduction", color: "#f97316", description: "Introduction page" },
        { icon: Star, label: "Important Members", href: "/important-members", color: "#f59e0b", description: "VIP members" }
      ]
    }
  ];
  
  useEffect(() => {
    loadConfig();
  }, []);
  
  const loadConfig = async () => {
    setLoading(true);
    try {
      const configData = await getSystemConfig();
      setConfig(configData);
    } catch (error) {
      console.error("Error loading configuration:", error);
      toast({
        title: "Error",
        description: "Failed to load system configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const { success, error } = await updateSystemConfig(config);
      
      if (!success || error) {
        throw new Error(error?.message || "Failed to update configuration");
      }
      
      toast({
        title: "Success",
        description: "System configuration updated successfully",
      });
    } catch (error: any) {
      console.error("Error saving configuration:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save system configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleChange = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleNavigate = (href: string) => {
    navigate(href);
    toast({
      title: "Navigating",
      description: `Redirecting to ${href}`,
    });
  };
  
  if (!isAdmin) {
    return (
      <PageTemplate
        title="Access Denied"
        description="You don't have permission to access this page."
        icon={Settings}
      >
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            This page is restricted to administrators only.
          </AlertDescription>
        </Alert>
      </PageTemplate>
    );
  }
  
  return (
    <PageTemplate
      title="System Settings"
      description="Manage global system configuration and settings."
      icon={Settings}
    >
      <Tabs defaultValue="navigation" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="navigation">Quick Navigation</TabsTrigger>
        </TabsList>
        
        {loading ? (
          <Card>
            <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <p>Loading system configuration...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <TabsContent value="general" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Configure general system settings and behavior.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="footer_text">Footer Text</Label>
                    <Input
                      id="footer_text"
                      value={config.footer_text}
                      onChange={(e) => handleChange("footer_text", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={config.contact_email || ""}
                      onChange={(e) => handleChange("contact_email", e.target.value)}
                      placeholder="admin@example.com"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="access" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Access Control</CardTitle>
                  <CardDescription>
                    Manage who can access the system and registration settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Put the entire site in maintenance mode
                      </p>
                    </div>
                    <Switch
                      id="maintenance_mode"
                      checked={config.maintenance_mode}
                      onCheckedChange={(checked) => handleChange("maintenance_mode", checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="registration_open">Open Registration</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow new users to register accounts
                      </p>
                    </div>
                    <Switch
                      id="registration_open"
                      checked={config.registration_open}
                      onCheckedChange={(checked) => handleChange("registration_open", checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allow_guest_access">Guest Access</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow guests to view public content without logging in
                      </p>
                    </div>
                    <Switch
                      id="allow_guest_access"
                      checked={config.allow_guest_access}
                      onCheckedChange={(checked) => handleChange("allow_guest_access", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize the look and feel of your platform.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Primary Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="primary_color"
                        type="color"
                        value={config.primary_color || "#4f46e5"}
                        onChange={(e) => handleChange("primary_color", e.target.value)}
                        className="w-20 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={config.primary_color || "#4f46e5"}
                        onChange={(e) => handleChange("primary_color", e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="navigation" className="mt-0">
              <div className="space-y-6">
                {navigationCategories.map((category, index) => (
                  <NavigationButtonCard
                    key={index}
                    title={category.title}
                    description={category.description}
                    buttons={category.buttons}
                    onNavigate={handleNavigate}
                    columns={category.columns}
                  />
                ))}
              </div>
            </TabsContent>
          </>
        )}
        
        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            onClick={loadConfig}
            className="mr-2"
            disabled={loading || saving}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button 
            onClick={handleSaveConfig}
            disabled={loading || saving}
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </Tabs>
    </PageTemplate>
  );
};

export default SystemSettings;
