
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { LayoutDashboard, Calendar, Users, BookText, Trophy, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useUserDashboard } from "@/hooks/useUserDashboard";
import { usePastEvents } from "@/hooks/useAdminData";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { 
    loading, 
    profileData, 
    upcomingEvents, 
    handleEventRSVP,
    handleResourceDownload,
    getBadgeProgress 
  } = useUserDashboard();

  const { data: pastEvents, isLoading: pastEventsLoading } = usePastEvents(3);

  return (
    <MainLayout>
      <PageHeader
        title="Dashboard"
        description="Welcome to your Startup Club dashboard. View your personal stats, upcoming events, and quick access to key resources."
        icon={LayoutDashboard}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : profileData?.connections_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Build your network
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : profileData?.joined_events_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Participate in community events
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resources Downloaded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : profileData?.resources_downloaded || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Expand your knowledge
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Badge Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "Loading..." : profileData?.badge_level || "Bronze"}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "Loading..." : getBadgeProgress()} to next level
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Your next scheduled events and meetings</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <div className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
                <div className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
                <div className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start justify-between border-b pb-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">{event.event_name}</h4>
                        <p className="text-sm text-gray-600">
                          {format(new Date(event.event_date), "MMM d, yyyy • h:mm a")}
                        </p>
                        {event.event_description && (
                          <p className="text-xs text-gray-500 mt-1">{event.event_description}</p>
                        )}
                      </div>
                    </div>
                    {event.has_rsvp ? (
                      <Button size="sm" variant="outline" disabled>RSVP'd</Button>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => handleEventRSVP(event.id, event.event_name)}
                      >
                        RSVP
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-muted-foreground">No upcoming events found</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/startups/browse">
                  <Users className="mr-2 h-4 w-4" />
                  Connect with Startups
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/events/calendar">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Calendar
                </Link>
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline" 
                onClick={handleResourceDownload}
              >
                <BookText className="mr-2 h-4 w-4" />
                Download Resource
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/community/success-stories">
                  <Trophy className="mr-2 h-4 w-4" />
                  Success Stories
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Past Events</CardTitle>
            <CardDescription>Recent events you might have missed</CardDescription>
          </CardHeader>
          <CardContent>
            {pastEventsLoading ? (
              <div className="space-y-4">
                <div className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
                <div className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
              </div>
            ) : pastEvents && pastEvents.length > 0 ? (
              <div className="space-y-4">
                {pastEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-4 border-b pb-3 last:border-0 last:pb-0">
                    {event.image_url ? (
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                        <img 
                          src={event.image_url} 
                          alt={event.title} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{event.title}</h4>
                      <div className="flex flex-wrap gap-2 my-1">
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(event.start_datetime), 'MMM d, yyyy')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(event.start_datetime), 'h:mm a')} - {format(new Date(event.end_datetime), 'h:mm a')}
                        </Badge>
                      </div>
                      <div className="flex justify-end mt-2">
                        <Button variant="link" size="sm" asChild className="h-5 p-0">
                          <Link to={`/events/past/${event.id}`}>
                            View details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-muted-foreground">No past events found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
