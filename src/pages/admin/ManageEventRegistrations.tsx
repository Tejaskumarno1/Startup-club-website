
import React, { useState, useEffect } from 'react';
import { AdminPageTemplate } from "@/components/admin/AdminPageTemplate";
import { CalendarCheck, Search, Download, Users, Clock, ChevronDown, ChevronUp, Calendar, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface User {
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface Event {
  title: string;
  start_datetime: string;
  image_url?: string | null;
  location_type?: string;
  physical_address?: string;
  virtual_meeting_url?: string;
  event_type?: string;
}

interface EventRegistration {
  id: string;
  user_id: string;
  event_id: string;
  status: string;
  role: string;
  registered_at: string;
  user?: User;
  event?: Event;
}

const ManageEventRegistrations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [events, setEvents] = useState<any[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  
  // Fetch all events for the filter dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await supabase
          .from('events')
          .select('id, title')
          .order('start_datetime', { ascending: false });
        
        if (data) setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    
    fetchEvents();
  }, []);

  // Fetch registrations with user and event data
  const { data: registrations, isLoading, error } = useQuery({
    queryKey: ['event_registrations', searchTerm, eventFilter, statusFilter],
    queryFn: async () => {
      // First step: get the registrations
      let query = supabase
        .from('event_registrations')
        .select(`
          id, 
          status, 
          role, 
          registered_at, 
          user_id, 
          event_id
        `)
        .order('registered_at', { ascending: false });

      // Apply filters
      if (eventFilter !== 'all') {
        query = query.eq('event_id', eventFilter);
      }
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: regData, error: regError } = await query;
      
      if (regError) {
        throw new Error(regError.message);
      }

      if (!regData || regData.length === 0) {
        return [];
      }

      // Second step: get user data for registrations
      const userPromises = regData.map(async (reg) => {
        const { data: userData } = await supabase
          .from('profiles')
          .select('email, first_name, last_name')
          .eq('id', reg.user_id)
          .single();
          
        return userData;
      });

      // Third step: get event data for registrations
      const eventPromises = regData.map(async (reg) => {
        const { data: eventData } = await supabase
          .from('events')
          .select('title, start_datetime, image_url, location_type, physical_address, virtual_meeting_url, event_type')
          .eq('id', reg.event_id)
          .single();
          
        return eventData;
      });

      // Wait for all promises to resolve
      const users = await Promise.all(userPromises);
      const events = await Promise.all(eventPromises);

      // Combine data
      const enrichedRegistrations = regData.map((reg, index) => ({
        ...reg,
        user: users[index],
        event: events[index]
      }));

      // Apply search filter client-side (more flexible)
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        return enrichedRegistrations.filter(reg => 
          reg.user?.email?.toLowerCase().includes(lowerSearch) || 
          reg.user?.first_name?.toLowerCase().includes(lowerSearch) || 
          reg.user?.last_name?.toLowerCase().includes(lowerSearch) ||
          reg.event?.title.toLowerCase().includes(lowerSearch)
        );
      }
      
      return enrichedRegistrations;
    }
  });

  // Export registrations to CSV
  const exportToCSV = () => {
    if (!registrations || registrations.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no registrations to export to CSV",
        variant: "destructive"
      });
      return;
    }
    
    const csvRows = [];
    // CSV Header
    const headers = ['Name', 'Email', 'Event', 'Date', 'Status', 'Role', 'Registered At'];
    csvRows.push(headers.join(','));
    
    // CSV Rows
    for (const reg of registrations) {
      const name = `${reg.user?.first_name || ''} ${reg.user?.last_name || ''}`.trim();
      const eventDate = reg.event?.start_datetime 
        ? format(new Date(reg.event.start_datetime), 'MMM d, yyyy')
        : 'N/A';
      const registeredDate = format(new Date(reg.registered_at), 'MMM d, yyyy HH:mm');
      
      const row = [
        `"${name}"`,
        `"${reg.user?.email || 'N/A'}"`,
        `"${reg.event?.title || 'N/A'}"`,
        `"${eventDate}"`,
        `"${reg.status}"`,
        `"${reg.role}"`,
        `"${registeredDate}"`
      ];
      csvRows.push(row.join(','));
    }
    
    // Create and download the CSV file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `event-registrations-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: `${registrations.length} records exported to CSV`,
    });
  };

  // Format location based on event data
  const formatLocation = (event: Event | null): string => {
    if (!event || !event.location_type) return "No location specified";
    
    switch (event.location_type) {
      case 'virtual':
        return 'Virtual Meeting';
      case 'physical':
        return event.physical_address || 'In-Person';
      case 'hybrid':
        return 'Hybrid (In-person & Online)';
      default:
        return 'Location TBD';
    }
  };

  // Get event badge color based on event type
  const getEventTypeColor = (eventType?: string) => {
    if (!eventType) return "bg-gray-100 text-gray-800";
    
    switch (eventType) {
      case 'workshop': return "bg-blue-100 text-blue-800";
      case 'networking': return "bg-purple-100 text-purple-800";
      case 'pitch': return "bg-yellow-100 text-yellow-800";
      case 'hackathon': return "bg-green-100 text-green-800";
      case 'mentorship': return "bg-indigo-100 text-indigo-800";
      case 'webinar': return "bg-teal-100 text-teal-800";
      case 'conference': return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Group registrations by event
  const groupedRegistrations = React.useMemo(() => {
    if (!registrations) return {};
    
    return registrations.reduce((acc, reg) => {
      const eventId = reg.event_id;
      if (!acc[eventId]) {
        acc[eventId] = {
          eventId: eventId,
          eventTitle: reg.event?.title || 'Unknown Event',
          eventDate: reg.event?.start_datetime ? 
            format(new Date(reg.event.start_datetime), 'EEE, MMM d, yyyy') : 'N/A',
          eventTime: reg.event?.start_datetime ?
            format(new Date(reg.event.start_datetime), 'h:mm a') : 'N/A',
          eventImage: reg.event?.image_url,
          eventType: reg.event?.event_type,
          location: formatLocation(reg.event || null),
          registrations: [],
        };
      }
      acc[eventId].registrations.push(reg);
      return acc;
    }, {} as Record<string, { 
      eventId: string;
      eventTitle: string; 
      eventDate: string; 
      eventTime: string;
      eventImage?: string | null;
      eventType?: string;
      location: string;
      registrations: EventRegistration[] 
    }>);
  }, [registrations]);

  // Toggle event expansion
  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'checked-in':
        return <Badge variant="secondary">{status}</Badge>;
      case 'canceled':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  // Default image if no event image is provided
  const getEventImage = (image?: string | null, eventId?: string) => {
    if (image) return image;
    return `https://picsum.photos/seed/${eventId || 'default'}/200/200`;
  };
  
  return (
    <AdminPageTemplate
      title="Event Registrations"
      description="Manage and track users who have registered for events"
      icon={CalendarCheck}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Filter Registrations</CardTitle>
            <CardDescription>View and manage event registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user name, email or event..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Select
                  value={eventFilter}
                  onValueChange={setEventFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    {events.map(event => (
                      <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="registered">Registered</SelectItem>
                    <SelectItem value="checked-in">Checked-in</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={exportToCSV} disabled={!registrations || registrations.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="h-16 w-16 rounded-md" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="border-destructive">
              <CardContent className="p-6 text-center text-destructive">
                <p>Error loading registrations. Please try again.</p>
                <p className="text-xs mt-2">{String(error)}</p>
              </CardContent>
            </Card>
          ) : Object.keys(groupedRegistrations).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedRegistrations).map(([eventId, { eventTitle, eventDate, eventImage, eventTime, location, eventType, registrations }]) => (
                <Card key={eventId} className="overflow-hidden">
                  <Collapsible 
                    open={expandedEvents[eventId]} 
                    onOpenChange={() => toggleEventExpansion(eventId)}
                  >
                    <CollapsibleTrigger className="w-full text-left">
                      <div className="flex items-start gap-4 p-6 cursor-pointer hover:bg-accent/10 transition-colors">
                        <div className="h-24 w-24 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                          <img
                            src={getEventImage(eventImage, eventId)}
                            alt={eventTitle}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{eventTitle}</h3>
                              <div className="flex flex-wrap gap-3 mt-2">
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  <span>{eventDate}</span>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span>{eventTime}</span>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  <span>{location}</span>
                                </div>
                              </div>
                              <div className="flex items-center mt-2">
                                <Badge className={`${getEventTypeColor(eventType)}`}>
                                  {eventType || 'General'}
                                </Badge>
                                <Badge variant="outline" className="ml-2">
                                  <Users className="h-3 w-3 mr-1" />
                                  {registrations.length} registrations
                                </Badge>
                              </div>
                            </div>
                            <div className="text-muted-foreground">
                              {expandedEvents[eventId] ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <Separator />
                      <div className="p-6">
                        <h4 className="text-sm font-medium mb-4">Registered Attendees</h4>
                        <div className="space-y-4">
                          {registrations.map((registration) => (
                            <div 
                              key={registration.id} 
                              className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg border"
                            >
                              <Avatar className="h-10 w-10">
                                <div className="flex h-full w-full items-center justify-center bg-muted">
                                  {registration.user?.first_name?.[0]}
                                  {registration.user?.last_name?.[0]}
                                </div>
                              </Avatar>
                              
                              <div className="flex-1">
                                <div className="font-medium">
                                  {registration.user?.first_name || ''} {registration.user?.last_name || ''}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {registration.user?.email}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(registration.registered_at), 'MMM d, yyyy • h:mm a')}
                                </div>
                                <div>
                                  {getStatusBadge(registration.status)}
                                </div>
                                <Badge variant="outline">{registration.role}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                  <CalendarCheck className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">No Registrations Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || eventFilter !== 'all' || statusFilter !== 'all'
                    ? "Try changing your search filters"
                    : "There are no event registrations yet"}
                </p>
              </CardContent>
            </Card>
          )}
          
          {registrations && registrations.length > 0 && (
            <div className="mt-4 text-muted-foreground text-sm text-right">
              {`Showing ${registrations.length} registration${registrations.length === 1 ? '' : 's'}`}
            </div>
          )}
        </div>
      </div>
    </AdminPageTemplate>
  );
};

export default ManageEventRegistrations;
