import React, { useState, useEffect } from "react";
import { AdminPageTemplate } from "@/components/admin/AdminPageTemplate";
import { Calendar as CalendarIcon, Plus, Upload, Image, Search, Filter, BarChart2, Check, Copy, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from "react-router-dom";
import { getAllEvents } from "@/lib/adminHelpers";
import { duplicateEvent, deleteEvent } from "@/lib/eventHelpers";
import { format, addMonths, subMonths, isSameDay, parseISO } from "date-fns";
import { CalendarEvent } from "@/lib/types";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getEventTypeColor, formatLocation } from "@/lib/eventCategories"; 
import { useUpdateEventImage } from "@/hooks/useAdminData";
import { supabase } from "@/integrations/supabase/client";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import { BatchEventActions } from "@/components/events/BatchEventActions";
import { EventStatisticsDialog } from "@/components/events/EventStatisticsDialog";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEventImageUpload } from "@/hooks/useEventImageUpload";

const AdminCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("month");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [statEvent, setStatEvent] = useState<CalendarEvent | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const updateEventImage = useUpdateEventImage();
  const eventImageUpload = useEventImageUpload();

  useEffect(() => {
    fetchEvents();
  }, [date]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { success, data, error } = await getAllEvents();
      
      if (!success) throw error;
      
      setEvents(data as CalendarEvent[] || []);
    } catch (error: any) {
      toast({
        title: "Error fetching events",
        description: error.message || "An error occurred while fetching events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    if (date) {
      setDate(subMonths(date, 1));
    }
  };

  const goToNextMonth = () => {
    if (date) {
      setDate(addMonths(date, 1));
    }
  };

  const handleAddEvent = () => {
    setIsCreateEventOpen(true);
  };

  const handleEventCreated = () => {
    fetchEvents();
    toast({
      title: "Event created",
      description: "Your event has been successfully created"
    });
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(parseISO(event.start_datetime), day));
  };

  const filteredDayEvents = getEventsForDay(selectedDate)
    .filter(event => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          event.title.toLowerCase().includes(query) || 
          (event.description || '').toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter(event => {
      if (typeFilter !== "all") {
        return event.event_type === typeFilter;
      }
      return true;
    });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedEvent) return;
    
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    try {
      const imageUrl = await eventImageUpload.uploadImage(file, selectedEvent.id);
      
      if (!imageUrl) {
        throw new Error("Failed to upload image");
      }
      
      fetchEvents();
      
      toast({
        title: "Image uploaded successfully",
        description: `Image has been added to event "${selectedEvent.title}"`,
      });
      
      setSelectedEvent(null);
    } catch (error: any) {
      toast({
        title: "Error uploading image",
        description: error.message || "An error occurred while uploading the image",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateEvent = async (eventId: string) => {
    try {
      const result = await duplicateEvent(eventId);
      
      if (result.success) {
        toast({
          title: "Event duplicated",
          description: "The event has been successfully duplicated"
        });
        fetchEvents();
      } else {
        throw result.error;
      }
    } catch (error: any) {
      toast({
        title: "Error duplicating event",
        description: error.message || "An error occurred while duplicating the event",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }
    
    try {
      const result = await deleteEvent(eventId);
      
      if (result.success) {
        toast({
          title: "Event deleted",
          description: "The event has been successfully deleted"
        });
        fetchEvents();
      } else {
        throw result.error;
      }
    } catch (error: any) {
      toast({
        title: "Error deleting event",
        description: error.message || "An error occurred while deleting the event",
        variant: "destructive",
      });
    }
  };

  const handleEventSelection = (event: CalendarEvent, isSelected: boolean) => {
    if (isSelected) {
      setSelectedEvents(prev => [...prev, event]);
    } else {
      setSelectedEvents(prev => prev.filter(e => e.id !== event.id));
    }
  };

  const clearEventSelection = () => {
    setSelectedEvents([]);
  };

  const openStatsDialog = (event: CalendarEvent) => {
    setStatEvent(event);
    setShowStatsDialog(true);
  };

  const renderEventTags = (events: CalendarEvent[], day: Date) => {
    const eventsForDay = events.filter(event => 
      isSameDay(parseISO(event.start_datetime), day)
    );

    if (eventsForDay.length === 0) return null;

    return (
      <div className="absolute bottom-1 left-1 right-1 flex justify-center">
        <div className="flex flex-wrap gap-1 justify-center">
          {eventsForDay.slice(0, 3).map((_, i) => (
            <div 
              key={i} 
              className="h-1.5 w-1.5 rounded-full bg-primary"
            />
          ))}
          {eventsForDay.length > 3 && (
            <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
          )}
        </div>
      </div>
    );
  };

  const renderDayContent = (day: Date) => {
    const eventsForThisDay = getEventsForDay(day);
    const hasEvents = eventsForThisDay.length > 0;
    
    return (
      <div className="relative h-full w-full p-2">
        <div className={`text-sm ${hasEvents ? 'font-medium text-primary' : ''}`}>
          {format(day, 'd')}
        </div>
        {renderEventTags(events, day)}
      </div>
    );
  };

  const isEventSelected = (eventId: string) => {
    return selectedEvents.some(e => e.id === eventId);
  };

  return (
    <AdminPageTemplate
      title="Event Calendar"
      description="Manage and view all scheduled events in an intuitive calendar interface"
      icon={CalendarIcon}
    >
      <CreateEventDialog
        isOpen={isCreateEventOpen}
        onOpenChange={setIsCreateEventOpen}
        onEventCreated={handleEventCreated}
      />
      
      <EventStatisticsDialog 
        isOpen={showStatsDialog}
        onOpenChange={setShowStatsDialog}
        event={statEvent}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 px-4 py-2 md:px-0">
        <div className="space-y-6">
          <Card className="shadow-md border">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold">Calendar</CardTitle>
              <div className="flex justify-between items-center pt-2">
                <Select
                  value={view}
                  onValueChange={(value) => setView(value)}
                >
                  <SelectTrigger className="w-[110px]">
                    <SelectValue placeholder="View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddEvent} variant="default">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(newDate) => {
                  if (newDate) {
                    setSelectedDate(newDate);
                  }
                }}
                month={date}
                onMonthChange={setDate}
                className="rounded-md border"
                components={{
                  Day: ({ date: dayDate, ...props }) => (
                    <button
                      {...props}
                      className={`h-9 w-9 p-0 font-normal aria-selected:opacity-100 relative ${
                        isSameDay(dayDate, new Date()) 
                          ? 'bg-accent text-accent-foreground' 
                          : isSameDay(dayDate, selectedDate)
                          ? 'bg-primary text-primary-foreground'
                          : ''
                      }`}
                    >
                      {renderDayContent(dayDate)}
                    </button>
                  )
                }}
              />
              <div className="mt-4">
                <Button 
                  onClick={handleAddEvent} 
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Event
                </Button>
              </div>

              <div className="mt-6 space-y-2">
                <h3 className="text-sm font-medium mb-2">Filters</h3>
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select
                    value={typeFilter}
                    onValueChange={(value) => setTypeFilter(value)}
                  >
                    <SelectTrigger>
                      <div className="flex items-center">
                        <Filter className="h-4 w-4 mr-2" />
                        <span>
                          {typeFilter === "all" 
                            ? "All Event Types" 
                            : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Event Types</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="networking">Networking</SelectItem>
                      <SelectItem value="pitch">Pitch</SelectItem>
                      <SelectItem value="hackathon">Hackathon</SelectItem>
                      <SelectItem value="mentorship">Mentorship</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="seminar">Seminar</SelectItem>
                      <SelectItem value="webinar">Webinar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="shadow-md h-full border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Events for {format(selectedDate, 'MMMM d, yyyy')}
              </CardTitle>
              <CardDescription>
                {filteredDayEvents.length 
                  ? `${filteredDayEvents.length} event${filteredDayEvents.length > 1 ? 's' : ''} scheduled`
                  : 'No events scheduled for this day'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BatchEventActions 
                selectedEvents={selectedEvents}
                onClearSelection={clearEventSelection}
                onEventsUpdated={fetchEvents}
              />
              
              {loading ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : filteredDayEvents.length === 0 ? (
                <div className="py-12 text-center">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No events scheduled</h3>
                  <p className="text-sm text-muted-foreground/70 mb-6">
                    {searchQuery || typeFilter !== "all" 
                      ? "No matching events found. Try changing your filters."
                      : "There are no events scheduled for this day."}
                  </p>
                  <Button onClick={handleAddEvent}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {filteredDayEvents.map((event) => (
                    <div 
                      key={event.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        isEventSelected(event.id) 
                          ? "border-primary bg-primary/5" 
                          : "border-border bg-card hover:bg-accent/10"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="pt-1">
                          <Checkbox 
                            checked={isEventSelected(event.id)}
                            onCheckedChange={(checked) => handleEventSelection(event, !!checked)}
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="space-y-1">
                              <h3 className="font-medium text-lg">{event.title}</h3>
                              
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                <span className="flex items-center">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  {format(parseISO(event.start_datetime), 'h:mm a')} - {format(parseISO(event.end_datetime), 'h:mm a')}
                                </span>
                                
                                <Badge className={getEventTypeColor(event.event_type)}>
                                  {event.event_type}
                                </Badge>
                                
                                <span className="flex items-center">
                                  <Users className="h-3.5 w-3.5 mr-1" />
                                  {event.attendees_count || 0} registered
                                </span>
                              </div>
                              
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap mt-4 gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => navigate(`/admin/events?edit=${event.id}`)}
                                  >
                                    Edit
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Edit event details</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedEvent(event)}
                                  >
                                    {event.image_url ? "Change Image" : "Add Image"}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Upload or change event image</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDuplicateEvent(event.id)}
                                  >
                                    <Copy className="h-3.5 w-3.5 mr-1" />
                                    Duplicate
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Create a copy of this event</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openStatsDialog(event)}
                                  >
                                    <BarChart2 className="h-3.5 w-3.5 mr-1" />
                                    Stats
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">View event statistics</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        
                        {event.image_url && (
                          <div className="hidden sm:block h-20 w-20 overflow-hidden rounded-md">
                            <img
                              src={event.image_url}
                              alt={event.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Event Image</DialogTitle>
                    <DialogDescription>
                      {selectedEvent && `Upload an image for the "${selectedEvent.title}" event`}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {eventImageUpload.error && (
                      <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                        {eventImageUpload.error}
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">
                        Select Image
                      </label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={eventImageUpload.isUploading}
                      />
                      
                      {eventImageUpload.isUploading && (
                        <div className="w-full mt-2">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-300 ease-in-out" 
                              style={{ width: `${eventImageUpload.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 text-right">
                            {eventImageUpload.progress}%
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {selectedEvent?.image_url && (
                      <div className="mt-4">
                        <p className="mb-2 text-sm text-muted-foreground">Current image:</p>
                        <div className="rounded-md overflow-hidden border h-32 flex items-center justify-center">
                          <img
                            src={selectedEvent.image_url}
                            alt={selectedEvent.title}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <DialogFooter className="sm:justify-start">
                    <Button type="button" variant="secondary" onClick={() => setSelectedEvent(null)}>
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <div className="mt-6 text-center">
                <Button variant="outline" onClick={() => navigate('/admin/events')}>
                  Manage All Events
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminPageTemplate>
  );
};

export default AdminCalendar;
