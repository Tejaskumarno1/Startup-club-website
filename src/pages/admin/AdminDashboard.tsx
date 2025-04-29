
import React from "react";
import { LayoutDashboard, Users, CalendarDays, Briefcase, Clock, Trophy } from "lucide-react";
import { AdminPageTemplate } from "@/components/admin/AdminPageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useDashboardStats, useRecentActivity, usePastEvents } from "@/hooks/useAdminData";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

const AdminDashboard = () => {
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  
  const { 
    data: stats,
    isLoading: statsLoading,
    error: statsError
  } = useDashboardStats();
  
  const {
    data: recentActivity,
    isLoading: activityLoading,
    error: activityError
  } = useRecentActivity(5);
  
  const {
    data: pastEvents,
    isLoading: pastEventsLoading,
    error: pastEventsError
  } = usePastEvents(3);
  
  React.useEffect(() => {
    if (statsError) {
      toast({
        title: "Error loading dashboard data",
        description: "Failed to load statistics",
        variant: "destructive",
      });
    }
    
    if (activityError) {
      toast({
        title: "Error loading activity data",
        description: "Failed to load recent activity",
        variant: "destructive",
      });
    }
    
    if (pastEventsError) {
      toast({
        title: "Error loading past events",
        description: "Failed to load past events data",
        variant: "destructive",
      });
    }
  }, [statsError, activityError, pastEventsError, toast]);
  
  const loading = statsLoading || activityLoading || pastEventsLoading;

  return (
    <AdminPageTemplate
      title="Admin Dashboard"
      description="Manage and monitor all aspects of the Startup Club platform."
      icon={LayoutDashboard}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className={isDarkMode ? "bg-gray-800/50 border-gray-700" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${isDarkMode ? "text-white" : ""}`}>Total Users</CardTitle>
            <Users className={`h-4 w-4 ${isDarkMode ? "text-gray-400" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : ""}`}>
              {statsLoading ? "..." : stats?.data?.totalUsers || 0}
            </div>
            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-muted-foreground"}`}>
              +{statsLoading ? "..." : stats?.data?.newUsersCount || 0} new this month
            </p>
          </CardContent>
        </Card>
        
        <Card className={isDarkMode ? "bg-gray-800/50 border-gray-700" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${isDarkMode ? "text-white" : ""}`}>Admin Users</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : ""}`}>
              {statsLoading ? "..." : stats?.data?.adminsCount || 0}
            </div>
            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-muted-foreground"}`}>
              From profiles with admin role
            </p>
          </CardContent>
        </Card>
        
        <Card className={isDarkMode ? "bg-gray-800/50 border-gray-700" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${isDarkMode ? "text-white" : ""}`}>Active Mentors</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : ""}`}>
              {statsLoading ? "..." : stats?.data?.mentorsCount || 0}
            </div>
            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-muted-foreground"}`}>
              Available for mentoring
            </p>
          </CardContent>
        </Card>
        
        <Card className={isDarkMode ? "bg-gray-800/50 border-gray-700" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${isDarkMode ? "text-white" : ""}`}>Upcoming Events</CardTitle>
            <CalendarDays className={`h-4 w-4 ${isDarkMode ? "text-gray-400" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : ""}`}>
              {statsLoading ? "..." : stats?.data?.eventsCount || 0}
            </div>
            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-muted-foreground"}`}>
              Scheduled in the future
            </p>
          </CardContent>
        </Card>
        
        <Card className={isDarkMode ? "bg-gray-800/50 border-gray-700" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${isDarkMode ? "text-white" : ""}`}>Active Startups</CardTitle>
            <Briefcase className={`h-4 w-4 ${isDarkMode ? "text-gray-400" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : ""}`}>
              {statsLoading ? "..." : stats?.data?.startupsCount || 0}
            </div>
            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-muted-foreground"}`}>
              Registered in the platform
            </p>
          </CardContent>
        </Card>
        
        <Card className={isDarkMode ? "bg-gray-800/50 border-gray-700" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${isDarkMode ? "text-white" : ""}`}>Past Events</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : ""}`}>
              {statsLoading ? "..." : stats?.data?.pastEventsCount || 0}
            </div>
            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-muted-foreground"}`}>
              Completed events
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <Card className={isDarkMode ? "bg-gray-800/50 border-gray-700" : ""}>
          <CardHeader>
            <CardTitle className={`flex justify-between items-center ${isDarkMode ? "text-white" : ""}`}>
              <span>Success Stories</span>
              <Trophy className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-muted-foreground"}`}>
              Manage featured success stories that appear on the homepage in the "Startups Born in Our Club" section.
            </p>
            <Button className={`w-full ${isDarkMode ? "border-gray-600 hover:bg-gray-700" : ""}`} variant="outline" asChild>
              <Link to="/admin/manage-success-stories">
                Manage Success Stories
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className={isDarkMode ? "bg-gray-800/50 border-gray-700" : ""}>
          <CardHeader>
            <CardTitle className={isDarkMode ? "text-white" : ""}>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id || index} className={`flex items-start border-b pb-3 last:border-0 last:pb-0 ${isDarkMode ? "border-gray-700" : ""}`}>
                    <div className="w-full">
                      <p className={`text-sm font-medium ${isDarkMode ? "text-white" : ""}`}>{activity.description}</p>
                      <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-muted-foreground"}`}>
                        {format(new Date(activity.date || activity.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-center ${isDarkMode ? "text-gray-400" : "text-muted-foreground"}`}>No recent activity found</p>
            )}
          </CardContent>
        </Card>
        
        <Card className={isDarkMode ? "bg-gray-800/50 border-gray-700" : ""}>
          <CardHeader>
            <CardTitle className={isDarkMode ? "text-white" : ""}>Past Events</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : pastEvents && pastEvents.length > 0 ? (
              <div className="space-y-4">
                {pastEvents.map((event) => (
                  <div key={event.id} className={`flex items-start space-x-4 border-b pb-3 last:border-0 last:pb-0 ${isDarkMode ? "border-gray-700" : ""}`}>
                    {event.image_url ? (
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                        <img 
                          src={event.image_url} 
                          alt={event.title} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md ${isDarkMode ? "bg-primary/20" : "bg-primary/10"}`}>
                        <CalendarDays className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${isDarkMode ? "text-white" : ""}`}>{event.title}</h4>
                      <div className="flex flex-wrap gap-2 my-1">
                        <Badge variant="outline" className={`text-xs ${isDarkMode ? "border-gray-600 text-gray-300" : ""}`}>
                          {format(new Date(event.start_datetime), 'MMM d, yyyy')}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${isDarkMode ? "border-gray-600 text-gray-300" : ""}`}>
                          {format(new Date(event.start_datetime), 'h:mm a')} - {format(new Date(event.end_datetime), 'h:mm a')}
                        </Badge>
                      </div>
                      <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-muted-foreground"}`}>
                        {event.attendees_count || 0} attendees
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-center ${isDarkMode ? "text-gray-400" : "text-muted-foreground"}`}>No past events found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPageTemplate>
  );
};

export default AdminDashboard;
