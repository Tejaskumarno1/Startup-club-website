
import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock, RefreshCw, Plus, Info } from "lucide-react";
import { PageTemplate } from "@/components/common/PageTemplate";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CalendarEvent } from "@/lib/types";
import { useEvents } from "@/hooks/useEvents";
import { EventCard } from "@/components/events/EventCard";
import { CalendarCore } from "@/components/events/CalendarCore";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useTheme } from "@/context/ThemeContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import { Badge } from "@/components/ui/badge";

const MyCalendar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [selectedDaySheet, setSelectedDaySheet] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  
  const isDarkMode = theme === "dark";
  
  const {
    calendarEvents,
    todaysEvents,
    upcomingEvents,
    isLoadingCalendar,
    currentMonth,
    setCurrentMonth,
    isRegisteredForEvent,
    registerForEvent,
    cancelRegistration,
    refetchCalendar,
  } = useEvents(user?.id);

  const filteredUpcomingEvents = upcomingEvents.filter(event => {
    const eventDate = new Date(event.start_datetime);
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return (
      eventDate > today && 
      eventDate <= nextWeek &&
      !(eventDate.getDate() === today.getDate() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getFullYear() === today.getFullYear())
    );
  }).sort((a, b) => {
    return new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime();
  }).slice(0, 5);

  const handleRefresh = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    refetchCalendar();
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    
    // Find events for the selected date
    const eventsForDay = calendarEvents.filter(event => {
      const eventDate = new Date(event.start_datetime);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
    
    setSelectedDayEvents(eventsForDay);
    setSelectedDaySheet(true);
  };

  const headerActions = (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        onClick={handleRefresh}
        className={isDarkMode ? "border-gray-700 hover:bg-gray-800" : ""}
      >
        <RefreshCw className="h-4 w-4 mr-2" /> 
        Refresh
      </Button>
      
      {user && (
        <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="bg-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className={`sm:max-w-[600px] ${isDarkMode ? "bg-gray-900 border-gray-700" : ""}`}>
            <DialogHeader>
              <DialogTitle className={isDarkMode ? "text-white" : ""}>Create New Event</DialogTitle>
              <DialogDescription className={isDarkMode ? "text-gray-400" : ""}>
                Fill in the details to create a new event on your calendar
              </DialogDescription>
            </DialogHeader>
            
            <CreateEventDialog 
              isOpen={isCreateEventOpen}
              onOpenChange={setIsCreateEventOpen}
              onEventCreated={() => {
                refetchCalendar();
                toast({
                  title: "Event created",
                  description: "Your event has been successfully created and will appear in your calendar"
                });
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );

  const handleRegister = async (eventId: string) => {
    if (!user?.id) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to register for events',
        variant: 'destructive'
      });
      return;
    }
    
    registerForEvent(eventId);
  };
  
  const handleCancel = async (eventId: string) => {
    if (!user?.id) return;
    cancelRegistration(eventId);
  };

  return (
    <PageTemplate
      title="My Calendar"
      description="View and manage your schedule of upcoming events, workshops, and meetings."
      icon={CalendarIcon}
    >
      {headerActions}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className={`md:col-span-2 ${isDarkMode ? "bg-gray-800/50 border-gray-700" : ""}`}>
          <CardHeader>
            <CardTitle className={isDarkMode ? "text-white" : ""}>
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingCalendar ? (
              <div className="space-y-2">
                <Skeleton className={`h-[400px] w-full ${isDarkMode ? "bg-gray-700" : ""}`} />
              </div>
            ) : (
              <CalendarCore
                currentDate={currentMonth}
                events={calendarEvents}
                onDateChange={setCurrentMonth}
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
                onEventClick={(event) => {
                  if (isRegisteredForEvent(event.id)) {
                    handleCancel(event.id);
                  } else {
                    handleRegister(event.id);
                  }
                }}
                onAddEvent={user ? (date) => {
                  setSelectedDate(date);
                  setIsCreateEventOpen(true);
                } : undefined}
              />
            )}
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card className={isDarkMode ? "bg-gray-800/50 border-gray-700" : ""}>
            <CardHeader>
              <CardTitle className={`text-lg ${isDarkMode ? "text-white" : ""}`}>Today's Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"} mb-4`}>
                {format(new Date(), 'MMMM d, yyyy')}
              </p>
              
              {isLoadingCalendar ? (
                <div className="space-y-3">
                  <Skeleton className={`h-20 w-full ${isDarkMode ? "bg-gray-700" : ""}`} />
                  <Skeleton className={`h-20 w-full ${isDarkMode ? "bg-gray-700" : ""}`} />
                </div>
              ) : todaysEvents.length > 0 ? (
                <div className="space-y-1">
                  {todaysEvents.map((event) => (
                    <EventCard 
                      key={event.id}
                      event={event}
                      isRegistered={isRegisteredForEvent(event.id)}
                      onRegister={() => handleRegister(event.id)}
                      onCancel={() => handleCancel(event.id)}
                      isLoggedIn={!!user?.id}
                    />
                  ))}
                </div>
              ) : (
                <div className={`text-center py-8 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  <div className="flex justify-center mb-2">
                    <Info className="h-12 w-12 text-gray-400" />
                  </div>
                  <p>No events scheduled for today</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className={isDarkMode ? "bg-gray-800/50 border-gray-700" : ""}>
            <CardHeader>
              <CardTitle className={`text-lg ${isDarkMode ? "text-white" : ""}`}>Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingCalendar ? (
                <div className="space-y-2">
                  <Skeleton className={`h-12 w-full ${isDarkMode ? "bg-gray-700" : ""}`} />
                  <Skeleton className={`h-12 w-full ${isDarkMode ? "bg-gray-700" : ""}`} />
                  <Skeleton className={`h-12 w-full ${isDarkMode ? "bg-gray-700" : ""}`} />
                </div>
              ) : filteredUpcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {filteredUpcomingEvents.map((event) => (
                    <EventCard 
                      key={event.id}
                      event={event}
                      isRegistered={isRegisteredForEvent(event.id)}
                      onRegister={() => handleRegister(event.id)}
                      onCancel={() => handleCancel(event.id)}
                      isLoggedIn={!!user?.id}
                    />
                  ))}
                </div>
              ) : (
                <div className={`text-center py-8 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  <div className="flex justify-center mb-2">
                    <Info className="h-12 w-12 text-gray-400" />
                  </div>
                  <p>No upcoming events in the next 7 days</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Day Detail Sheet */}
      <Sheet open={selectedDaySheet} onOpenChange={setSelectedDaySheet}>
        <SheetContent className={isDarkMode ? "bg-gray-900 border-gray-700 text-white" : ""}>
          <SheetHeader>
            <SheetTitle className={isDarkMode ? "text-white" : ""}>
              Events for {format(selectedDate, 'MMMM d, yyyy')}
            </SheetTitle>
            <SheetDescription className={isDarkMode ? "text-gray-400" : ""}>
              {selectedDayEvents.length 
                ? `${selectedDayEvents.length} event${selectedDayEvents.length > 1 ? 's' : ''} scheduled`
                : 'No events scheduled for this day'}
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-3">
                  <Info className={`h-12 w-12 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                </div>
                <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                  No events scheduled for this day
                </p>
                
                {user && (
                  <Button className="mt-4" onClick={() => {
                    setSelectedDaySheet(false);
                    setIsCreateEventOpen(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                )}
              </div>
            ) : (
              <>
                {selectedDayEvents.map((event) => (
                  <Card key={event.id} className={`overflow-hidden ${isDarkMode ? "bg-gray-800 border-gray-700" : ""}`}>
                    <CardContent className="p-0">
                      {event.image_url && (
                        <div className="w-full h-40">
                          <img 
                            src={event.image_url} 
                            alt={event.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-semibold text-lg ${isDarkMode ? "text-white" : ""}`}>{event.title}</h3>
                          <Badge>{event.event_type}</Badge>
                        </div>
                        
                        <div className="flex items-center text-sm mb-3">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                            {format(new Date(event.start_datetime), 'h:mm a')} - {format(new Date(event.end_datetime), 'h:mm a')}
                          </span>
                        </div>
                        
                        {event.description && (
                          <p className={`text-sm mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            {event.description}
                          </p>
                        )}
                        
                        <div className="flex justify-end">
                          {isRegisteredForEvent(event.id) ? (
                            <Button 
                              variant="outline" 
                              onClick={() => handleCancel(event.id)}
                              className={isDarkMode ? "border-gray-700" : ""}
                            >
                              Cancel Registration
                            </Button>
                          ) : (
                            <Button onClick={() => handleRegister(event.id)}>
                              Register
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </PageTemplate>
  );
};

export default MyCalendar;
