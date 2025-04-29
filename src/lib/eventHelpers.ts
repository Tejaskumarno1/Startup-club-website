
import { CalendarEvent, EventRegistration } from './types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Helper functions for event management
 */

// Function to get all events
export const getEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_datetime', { ascending: true });
    
    if (error) throw error;
    
    return data as CalendarEvent[];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

// Function to get a specific event
export const getEvent = async (eventId: string): Promise<CalendarEvent | null> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();
    
    if (error) throw error;
    
    return data as CalendarEvent;
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    return null;
  }
};

// Function to create a new event
export const createEvent = async (event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; eventId?: string; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, eventId: data.id };
  } catch (error) {
    console.error('Error creating event:', error);
    return { success: false, error };
  }
};

// Function to update an event
export const updateEvent = async (eventId: string, updates: Partial<CalendarEvent>): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error updating event:', error);
    return { success: false, error };
  }
};

// Function to delete an event
export const deleteEvent = async (eventId: string): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { success: false, error };
  }
};

// Function to register a user for an event (requires auth)
export const registerForEvent = async (userId: string, eventId: string): Promise<{ success: boolean; registrationId?: string; error?: any }> => {
  try {
    // Check if user is already registered
    const { data: existingReg, error: checkError } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId);
      
    if (checkError) throw checkError;
    
    if (existingReg && existingReg.length > 0) {
      return { success: true, registrationId: existingReg[0].id };
    }
    
    // Register user
    const { data, error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        user_id: userId,
        status: 'registered'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Update the events attendees_count
    await supabase.rpc('increment', {
      table_name: 'events',
      column_name: 'attendees_count',
      row_id: eventId
    });
    
    return { success: true, registrationId: data.id };
  } catch (error) {
    console.error('Error registering for event:', error);
    return { success: false, error };
  }
};

// Function to cancel a user's event registration
export const cancelEventRegistration = async (eventId: string, userId: string): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .match({
        event_id: eventId,
        user_id: userId
      });
    
    if (error) throw error;
    
    // Decrement attendees count
    await supabase.rpc('decrement', {
      table_name: 'events',
      column_name: 'attendees_count',
      row_id: eventId
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error canceling event registration:', error);
    return { success: false, error };
  }
};

// Function to get all registrations for an event
export const getEventRegistrations = async (eventId: string): Promise<EventRegistration[]> => {
  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId);
    
    if (error) throw error;
    
    return data as EventRegistration[];
  } catch (error) {
    console.error(`Error fetching registrations for event ${eventId}:`, error);
    return [];
  }
};

// Function to check if a user is registered for an event
export const isUserRegistered = async (eventId: string, userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return data?.length > 0;
  } catch (error) {
    console.error('Error checking user registration:', error);
    return false;
  }
};

// Function to get upcoming events - accessible to anyone (signed in or not)
export const getUpcomingEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const today = new Date();
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('start_datetime', today.toISOString())
      .order('start_datetime', { ascending: true });
    
    if (error) throw error;
    
    return data as CalendarEvent[];
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }
};

// Function to get past events - accessible to anyone (signed in or not)
export const getPastEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const today = new Date();
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .lt('start_datetime', today.toISOString())
      .order('start_datetime', { ascending: false });
    
    if (error) throw error;
    
    return data as CalendarEvent[];
  } catch (error) {
    console.error('Error fetching past events:', error);
    return [];
  }
};

// Get user's calendar events (combines public events with user's registrations)
export const getUserCalendarEvents = async (userId: string | undefined, startDate: Date, endDate: Date): Promise<CalendarEvent[]> => {
  try {
    // First, get all public events
    const { data: publicEvents, error: publicError } = await supabase
      .from('events')
      .select('*')
      .gte('start_datetime', startDate.toISOString())
      .lte('start_datetime', endDate.toISOString())
      .order('start_datetime', { ascending: true });
    
    if (publicError) throw publicError;
    
    // If user is logged in, get their registered events
    if (userId) {
      const { data: registrations, error: regError } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('user_id', userId);
      
      if (regError) throw regError;
      
      // Mark user-registered events
      const events = publicEvents.map(event => ({
        ...event,
        is_registered: registrations.some(reg => reg.event_id === event.id)
      }));
      
      return events as CalendarEvent[];
    }
    
    return publicEvents as CalendarEvent[];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
};

// Function to get filtered events (search, type)
export const getFilteredEvents = async (searchTerm: string = "", eventType: string = "all"): Promise<CalendarEvent[]> => {
  try {
    let query = supabase
      .from('events')
      .select('*');
    
    // Apply event type filter
    if (eventType !== "all") {
      query = query.eq('event_type', eventType);
    }
    
    // Apply search filter if provided
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }
    
    const { data, error } = await query.order('start_datetime', { ascending: true });
    
    if (error) throw error;
    
    return data as CalendarEvent[];
  } catch (error) {
    console.error('Error fetching filtered events:', error);
    return [];
  }
};

/**
 * Upload an image for an event
 * @param file The image file to upload
 * @param eventId The ID of the event
 * @returns The URL of the uploaded image
 */
export const uploadEventImage = async (file: File, eventId: string): Promise<{ success: boolean; url?: string; error?: any }> => {
  try {
    // Check if events bucket exists
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('events');
    
    // Create bucket if it doesn't exist
    if (bucketError && bucketError.message.includes('not found')) {
      await supabase.storage.createBucket('events', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880, // 5MB
      });
    }
    
    // Generate a unique filename using event ID and timestamp
    const fileExt = file.name.split('.').pop();
    const fileName = `${eventId}-${Date.now()}.${fileExt}`;
    const filePath = `events/${fileName}`;
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from('events')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) throw error;
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('events')
      .getPublicUrl(filePath);
    
    return { success: true, url: publicUrlData.publicUrl };
  } catch (error) {
    console.error('Error uploading event image:', error);
    return { success: false, error };
  }
};

/**
 * Function to duplicate an event (clone an existing event)
 * @param eventId The ID of the event to duplicate
 * @returns Result object with success status and new event ID
 */
export const duplicateEvent = async (eventId: string): Promise<{ success: boolean; eventId?: string; error?: any }> => {
  try {
    // Get the original event
    const originalEvent = await getEvent(eventId);
    
    if (!originalEvent) {
      throw new Error("Event not found");
    }
    
    // Create a new event with the same details but a different ID
    const newEventData = {
      ...originalEvent,
      title: `Copy of ${originalEvent.title}`,
      attendees_count: 0,
    };
    
    // Remove fields that should not be duplicated
    delete newEventData.id;
    delete newEventData.created_at;
    delete newEventData.updated_at;
    
    // Create the new event
    const result = await createEvent(newEventData);
    
    return result;
  } catch (error) {
    console.error('Error duplicating event:', error);
    return { success: false, error };
  }
};

/**
 * Function to get event statistics
 * @param eventId The ID of the event
 * @returns Statistics for the event
 */
export const getEventStatistics = async (eventId: string): Promise<any> => {
  try {
    const event = await getEvent(eventId);
    const registrations = await getEventRegistrations(eventId);
    
    // Calculate statistics
    const totalRegistered = registrations.length;
    
    // Filter out registrations without user_company before counting unique companies
    const uniqueCompanies = new Set(
      registrations
        .filter(reg => reg.user_company) // Only include registrations with user_company
        .map(reg => reg.user_company)
    ).size;
    
    const registrationsByDate = {};
    
    registrations.forEach(reg => {
      const date = new Date(reg.registered_at).toISOString().split('T')[0];
      registrationsByDate[date] = (registrationsByDate[date] || 0) + 1;
    });
    
    return {
      event,
      totalRegistered,
      uniqueCompanies,
      registrationsByDate
    };
  } catch (error) {
    console.error('Error getting event statistics:', error);
    throw error;
  }
};

/**
 * Function to get event attendance stats 
 * @returns Statistics object with event counts and attendees
 */
export const getEventsOverviewStats = async (): Promise<{ 
  totalEvents: number; 
  upcomingEvents: number;
  pastEvents: number;
  totalAttendees: number;
}> => {
  try {
    // Get current date in ISO format for comparison
    const now = new Date().toISOString();
    
    // Get total events count
    const { count: totalEvents, error: countError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });
      
    if (countError) throw countError;
    
    // Get upcoming events count
    const { count: upcomingEvents, error: upcomingError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('start_datetime', now);
      
    if (upcomingError) throw upcomingError;
    
    // Get past events count
    const { count: pastEvents, error: pastError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .lt('start_datetime', now);
      
    if (pastError) throw pastError;
    
    // Get total attendees (sum of attendees_count)
    const { data: attendeesData, error: attendeesError } = await supabase
      .from('events')
      .select('attendees_count');
      
    if (attendeesError) throw attendeesError;
    
    const totalAttendees = attendeesData.reduce((sum, event) => {
      return sum + (event.attendees_count || 0);
    }, 0);
    
    return {
      totalEvents: totalEvents || 0,
      upcomingEvents: upcomingEvents || 0,
      pastEvents: pastEvents || 0,
      totalAttendees,
    };
  } catch (error) {
    console.error('Error getting events overview stats:', error);
    return {
      totalEvents: 0,
      upcomingEvents: 0,
      pastEvents: 0,
      totalAttendees: 0,
    };
  }
};

/**
 * Function to get most popular events based on attendee count
 * @param limit Number of events to return
 * @returns Array of events sorted by attendee count
 */
export const getMostPopularEvents = async (limit: number = 5): Promise<CalendarEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('attendees_count', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return data as CalendarEvent[];
  } catch (error) {
    console.error('Error getting popular events:', error);
    return [];
  }
};

/**
 * Export event data to CSV format
 * @param events Array of events to export
 * @returns CSV string
 */
export const exportEventsToCSV = (events: CalendarEvent[]): string => {
  if (!events || events.length === 0) return '';
  
  // Define CSV headers
  const headers = [
    'Title',
    'Description',
    'Start Date',
    'End Date',
    'Event Type',
    'Location Type',
    'Physical Address',
    'Virtual URL',
    'Attendees Count',
    'Is Public'
  ];
  
  // Convert events to CSV rows
  const rows = events.map(event => {
    return [
      `"${event.title?.replace(/"/g, '""') || ''}"`,
      `"${event.description?.replace(/"/g, '""') || ''}"`,
      event.start_datetime,
      event.end_datetime,
      event.event_type,
      event.location_type,
      `"${event.physical_address?.replace(/"/g, '""') || ''}"`,
      event.virtual_meeting_url || '',
      event.attendees_count || 0,
      event.is_public ? 'Yes' : 'No'
    ];
  });
  
  // Combine headers and rows
  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
};
