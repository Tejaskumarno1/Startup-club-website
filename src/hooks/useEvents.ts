import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getEvents, 
  getUpcomingEvents, 
  getPastEvents, 
  getUserCalendarEvents,
  registerForEvent,
  cancelEventRegistration,
  isUserRegistered
} from "@/lib/eventHelpers";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { CalendarEvent } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

// Query keys
export const eventQueryKeys = {
  all: ["events"],
  calendar: (userId?: string, month?: string) => ["events", "calendar", userId, month],
  upcoming: ["events", "upcoming"],
  past: ["events", "past"],
  registrations: (userId?: string) => ["events", "registrations", userId],
};

export const useEvents = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Get events for the selected month
  const monthKey = format(currentMonth, "yyyy-MM");
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Fetch calendar events for a specific month
  const { 
    data: calendarEvents = [], 
    isLoading: isLoadingCalendar,
    refetch: refetchCalendar 
  } = useQuery({
    queryKey: eventQueryKeys.calendar(userId, monthKey),
    queryFn: () => getUserCalendarEvents(userId, monthStart, monthEnd),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch upcoming events
  const { 
    data: upcomingEvents = [], 
    isLoading: isLoadingUpcoming,
    refetch: refetchUpcomingEvents
  } = useQuery({
    queryKey: eventQueryKeys.upcoming,
    queryFn: getUpcomingEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch past events
  const { 
    data: pastEvents = [], 
    isLoading: isLoadingPast,
    refetch: refetchPastEvents
  } = useQuery({
    queryKey: eventQueryKeys.past,
    queryFn: getPastEvents,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Function to refetch all events
  const refetchEvents = () => {
    refetchCalendar();
    refetchUpcomingEvents();
    refetchPastEvents();
  };

  // Check registered events for logged-in user
  const [registrations, setRegistrations] = useState<string[]>([]);

  // Fetch user registrations
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!userId) return;
      
      try {
        const { data } = await supabase
          .from('event_registrations')
          .select('event_id')
          .eq('user_id', userId)
          .neq('status', 'canceled');
        
        if (data) {
          setRegistrations(data.map(reg => reg.event_id));
        }
      } catch (error) {
        console.error("Error fetching registrations:", error);
      }
    };

    fetchRegistrations();
  }, [userId]);

  // Register for event mutation
  const registerMutation = useMutation({
    mutationFn: (eventId: string) => {
      if (!userId) throw new Error("User must be logged in to register");
      return registerForEvent(userId, eventId);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "You have successfully registered for this event"
      });
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.calendar(userId, monthKey) });
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.registrations(userId) });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to register for event",
        variant: "destructive"
      });
    }
  });

  // Cancel registration mutation
  const cancelMutation = useMutation({
    mutationFn: (eventId: string) => {
      if (!userId) throw new Error("User must be logged in to cancel");
      return cancelEventRegistration(eventId, userId);
    },
    onSuccess: () => {
      toast({
        title: "Registration canceled",
        description: "You have canceled your registration for this event"
      });
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.calendar(userId, monthKey) });
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.registrations(userId) });
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation failed",
        description: error.message || "Failed to cancel registration",
        variant: "destructive"
      });
    }
  });

  // Setup realtime subscription for relevant updates
  useEffect(() => {
    const channel = supabase
      .channel('calendar-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          refetchCalendar();
          queryClient.invalidateQueries({ queryKey: eventQueryKeys.upcoming });
          queryClient.invalidateQueries({ queryKey: eventQueryKeys.past });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_registrations' },
        () => {
          refetchCalendar();
          if (userId) {
            queryClient.invalidateQueries({ queryKey: eventQueryKeys.registrations(userId) });
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, refetchCalendar, userId]);

  // Filter today's events
  const todaysEvents = calendarEvents.filter(event => {
    const eventDate = new Date(event.start_datetime);
    const today = new Date();
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  });

  // Check if user is registered for an event
  const isRegisteredForEvent = (eventId: string) => {
    return registrations.includes(eventId);
  };

  return {
    calendarEvents,
    upcomingEvents,
    pastEvents,
    todaysEvents,
    isLoadingCalendar,
    isLoadingUpcoming,
    isLoadingPast,
    currentMonth,
    setCurrentMonth,
    isRegisteredForEvent,
    registerForEvent: (eventId: string) => registerMutation.mutate(eventId),
    cancelRegistration: (eventId: string) => cancelMutation.mutate(eventId),
    refetchCalendar,
    refetchEvents
  };
};
