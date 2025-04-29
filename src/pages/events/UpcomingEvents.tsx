
import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Calendar, Filter, MapPin, Clock, Users, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isAfter } from "date-fns";
import { getFilteredEvents, registerForEvent, isUserRegistered } from "@/lib/eventHelpers";
import { useAuth } from "@/context/AuthContext";
import { CalendarEvent } from "@/lib/types";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";

const UpcomingEvents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [registrations, setRegistrations] = useState<Record<string, boolean>>({});
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Apply filters whenever filters change
  useEffect(() => {
    fetchFilteredEvents();
  }, [searchTerm, typeFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const allEvents = await getFilteredEvents();
      
      // Filter to only upcoming events
      const upcomingEvents = allEvents.filter(event => {
        const eventDate = new Date(event.start_datetime);
        return isAfter(eventDate, new Date());
      });
      
      // Sort events by date
      upcomingEvents.sort((a, b) => {
        const dateA = new Date(a.start_datetime);
        const dateB = new Date(b.start_datetime);
        return dateA.getTime() - dateB.getTime();
      });
      
      setEvents(upcomingEvents);
      setFilteredEvents(upcomingEvents);
      
      if (user) {
        // Check which events user is registered for
        const registrationStatus: Record<string, boolean> = {};
        for (const event of upcomingEvents) {
          registrationStatus[event.id] = await isUserRegistered(event.id, user.id);
        }
        setRegistrations(registrationStatus);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error fetching events",
        description: "Unable to load upcoming events. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredEvents = async () => {
    setLoading(true);
    try {
      const filteredEvents = await getFilteredEvents(searchTerm, typeFilter);
      
      // Filter to only upcoming events
      const upcomingEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.start_datetime);
        return isAfter(eventDate, new Date());
      });
      
      // Sort events by date
      upcomingEvents.sort((a, b) => {
        const dateA = new Date(a.start_datetime);
        const dateB = new Date(b.start_datetime);
        return dateA.getTime() - dateB.getTime();
      });
      
      setFilteredEvents(upcomingEvents);
      
      if (user) {
        // Check which events user is registered for
        const registrationStatus: Record<string, boolean> = {};
        for (const event of upcomingEvents) {
          registrationStatus[event.id] = await isUserRegistered(event.id, user.id);
        }
        setRegistrations(registrationStatus);
      }
    } catch (error) {
      console.error("Error fetching filtered events:", error);
      toast({
        title: "Error filtering events",
        description: "Unable to filter events. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to register for events",
      });
      return;
    }
    
    try {
      const { success, error } = await registerForEvent(user.id, eventId);
      
      if (!success) throw error;
      
      setRegistrations(prev => ({
        ...prev,
        [eventId]: true
      }));
      
      toast({
        title: "Registration successful",
        description: "You have been registered for this event",
      });
    } catch (error) {
      console.error("Error registering for event:", error);
      toast({
        title: "Registration failed",
        description: "Unable to register for this event. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'workshop':
        return 'bg-blue-100 text-blue-800';
      case 'networking':
        return 'bg-purple-100 text-purple-800';
      case 'pitch':
        return 'bg-yellow-100 text-yellow-800';
      case 'hackathon':
        return 'bg-green-100 text-green-800';
      case 'mentorship':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLocation = (event: CalendarEvent) => {
    if (event.location_type === 'virtual') {
      return 'Virtual Event';
    } else if (event.location_type === 'physical') {
      return event.physical_address || 'In-person Event';
    } else {
      return 'Hybrid Event';
    }
  };

  // Group events by month
  const groupEventsByMonth = (events: CalendarEvent[]): Record<string, CalendarEvent[]> => {
    const grouped: Record<string, CalendarEvent[]> = {};
    
    events.forEach(event => {
      const monthYear = format(parseISO(event.start_datetime), 'MMMM yyyy');
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(event);
    });
    
    return grouped;
  };

  const handleEventCreated = () => {
    fetchEvents();
    toast({
      title: "Event created",
      description: "Your event has been successfully created and will appear in the list"
    });
  };

  const groupedEvents = groupEventsByMonth(filteredEvents);

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <PageHeader 
          title="Upcoming Events" 
          description="Browse and register for upcoming events, workshops, and networking opportunities"
          icon={Calendar}
        />
        
        <div className="mt-8 flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:max-w-xs"
              />
            </div>
            
            <Select
              value={typeFilter}
              onValueChange={setTypeFilter}
            >
              <SelectTrigger className="sm:max-w-xs">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Event Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="pitch">Pitch</SelectItem>
                <SelectItem value="hackathon">Hackathon</SelectItem>
                <SelectItem value="mentorship">Mentorship</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            {user && (
              <Button onClick={() => setIsCreateEventOpen(true)} className="w-full md:w-auto">
                Create Event
              </Button>
            )}
            
            <Button variant="outline" className="w-full md:w-auto" onClick={() => window.location.href = '/events/calendar'}>
              <Calendar className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="my-8">
            <CardContent className="py-12 text-center">
              <div className="flex flex-col items-center">
                <Calendar className="h-16 w-16 text-primary/40 mb-4" />
                <h3 className="text-xl font-medium mb-2">No events found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || typeFilter !== "all" 
                    ? "Try changing your filters or search criteria."
                    : "There are no upcoming events scheduled at this time. Check back later."}
                </p>
                
                {user && (
                  <Button className="mt-6" onClick={() => setIsCreateEventOpen(true)}>
                    Create an Event
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
              <div key={monthYear}>
                <h2 className="text-2xl font-bold mb-6">{monthYear}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {monthEvents.map((event) => (
                    <Card 
                      key={event.id} 
                      className="overflow-hidden transition-all duration-200 hover:shadow-lg"
                    >
                      <div className="h-48 overflow-hidden relative">
                        <img 
                          src={event.image_url || `https://picsum.photos/seed/${event.id}/800/600`}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <Badge className={`absolute top-3 right-3 ${getEventTypeColor(event.event_type)}`}>
                          {event.event_type}
                        </Badge>
                      </div>
                      
                      <CardHeader className="pb-0">
                        <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>{format(parseISO(event.start_datetime), "EEEE, MMMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>
                              {format(parseISO(event.start_datetime), "h:mm a")} - {format(parseISO(event.end_datetime), "h:mm a")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="line-clamp-1">{formatLocation(event)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <span>{event.attendees_count || 0} registered</span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full"
                          disabled={registrations[event.id]}
                          variant={registrations[event.id] ? "outline" : "default"}
                          onClick={() => !registrations[event.id] && handleRegister(event.id)}
                        >
                          {registrations[event.id] ? "Already Registered" : "Register Now"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <CreateEventDialog 
        isOpen={isCreateEventOpen}
        onOpenChange={setIsCreateEventOpen}
        onEventCreated={handleEventCreated}
      />
    </MainLayout>
  );
};

export default UpcomingEvents;
