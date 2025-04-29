import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent, PastRecording, RecentActivity } from "@/lib/types";

// Define missing types needed by AdminAnalytics
export interface AdminStatsResult {
  success: boolean;
  data?: {
    totalUsers: number;
    newUsersCount: number;
    adminsCount: number;
    eventsCount: number;
    startupsCount: number;
    mentorsCount: number;
    pastEventsCount: number;
    recordingsCount: number;
  };
  error?: any;
}

export interface ProfilesData {
  totalProfiles: number;
  roles: { role: string; count: number }[];
  locations: { location: string; count: number }[];
  companies: { company: string; count: number }[];
  newProfiles: { date: string; count: number }[];
}

// Get admin stats
export const getAdminStats = async (): Promise<AdminStatsResult> => {
  try {
    // Get users count
    const { count: usersCount, error: usersError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });
    
    if (usersError) throw usersError;

    // Get admin users count
    const { count: adminsCount, error: adminsError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    
    if (adminsError) throw adminsError;
    
    // Get new users in the past month
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: newUsersCount, error: newUsersError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString());
    
    if (newUsersError) throw newUsersError;

    // Get events count
    const { count: eventsCount, error: eventsError } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true });
    
    if (eventsError) throw eventsError;

    // Get past events count
    const { count: pastEventsCount, error: pastEventsError } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .lt("end_datetime", new Date().toISOString());
    
    if (pastEventsError) throw pastEventsError;

    // Get startups count
    const { count: startupsCount, error: startupsError } = await supabase
      .from("startups")
      .select("*", { count: "exact", head: true });
    
    if (startupsError) throw startupsError;

    // Get mentors count
    const { count: mentorsCount, error: mentorsError } = await supabase
      .from("mentor_profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_approved", true);
    
    if (mentorsError) throw mentorsError;

    // Get recordings count
    const { count: recordingsCount, error: recordingsError } = await supabase
      .from("past_recordings")
      .select("*", { count: "exact", head: true });
    
    if (recordingsError) throw recordingsError;

    return {
      success: true,
      data: {
        totalUsers: usersCount || 0,
        newUsersCount: newUsersCount || 0,
        adminsCount: adminsCount || 0,
        eventsCount: eventsCount || 0,
        pastEventsCount: pastEventsCount || 0,
        startupsCount: startupsCount || 0,
        mentorsCount: mentorsCount || 0,
        recordingsCount: recordingsCount || 0
      }
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return { success: false, error };
  }
};

// Add the missing getRecentActivity function
export const getRecentActivity = async (limit: number = 5): Promise<RecentActivity[]> => {
  try {
    // Since we don't have a dedicated activity log table, we'll use recent events as activity
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (eventsError) throw eventsError;
    
    // Transform events into activity records
    const activities: RecentActivity[] = (events || []).map(event => ({
      id: event.id,
      created_at: event.created_at,
      date: event.created_at,
      type: 'event',
      description: `New event created: ${event.title}`,
      event_id: event.id
    }));
    
    return activities;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};

// Add missing getPastEvents function
export const getPastEvents = async (limit: number = 5): Promise<CalendarEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .lt('end_datetime', new Date().toISOString())
      .order('end_datetime', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Transform the data to match CalendarEvent type exactly
    const typedEvents: CalendarEvent[] = (data || []).map(event => ({
      id: event.id,
      title: event.title,
      description: event.description || undefined,
      start_datetime: event.start_datetime,
      end_datetime: event.end_datetime,
      location_type: event.location_type as "virtual" | "physical" | "hybrid",
      physical_address: event.physical_address || undefined,
      virtual_meeting_url: event.virtual_meeting_url || undefined,
      event_type: event.event_type,
      is_public: event.is_public,
      created_by: event.created_by || undefined,
      created_at: event.created_at || undefined,
      updated_at: event.updated_at || undefined,
      attendees_count: event.attendees_count || undefined,
      image_url: event.image_url || undefined,
      highlights: event.highlights || undefined,
    }));

    return typedEvents;
  } catch (error) {
    console.error('Error fetching past events:', error);
    return [];
  }
};

// Get profiles data for analytics
export const getProfilesData = async (): Promise<{ success: boolean, data?: ProfilesData, error?: any }> => {
  try {
    // Get all profiles for analysis
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*");
    
    if (profilesError) throw profilesError;
    
    // Calculate total profiles
    const totalProfiles = profiles?.length || 0;
    
    // Group profiles by role
    const roleGroups = {};
    profiles?.forEach(profile => {
      const role = profile.role || 'unassigned';
      roleGroups[role] = (roleGroups[role] || 0) + 1;
    });
    
    const roles = Object.entries(roleGroups).map(([role, count]) => ({
      role,
      count: count as number
    })).sort((a, b) => b.count - a.count);
    
    // Group profiles by location
    const locationGroups = {};
    profiles?.forEach(profile => {
      if (profile.location) {
        const location = profile.location;
        locationGroups[location] = (locationGroups[location] || 0) + 1;
      }
    });
    
    const locations = Object.entries(locationGroups).map(([location, count]) => ({
      location,
      count: count as number
    })).sort((a, b) => b.count - a.count);
    
    // Group profiles by company
    const companyGroups = {};
    profiles?.forEach(profile => {
      if (profile.company) {
        const company = profile.company;
        companyGroups[company] = (companyGroups[company] || 0) + 1;
      }
    });
    
    const companies = Object.entries(companyGroups).map(([company, count]) => ({
      company,
      count: count as number
    })).sort((a, b) => b.count - a.count);
    
    // Calculate new profiles in the past 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    // Create array with dates for the past 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    // Initialize the new profiles data structure
    const newProfilesMap = {};
    last30Days.forEach(date => {
      newProfilesMap[date] = 0;
    });
    
    // Count profiles created in each of the past 30 days
    profiles?.forEach(profile => {
      if (profile.created_at) {
        const createdDate = new Date(profile.created_at).toISOString().split('T')[0];
        if (newProfilesMap[createdDate] !== undefined) {
          newProfilesMap[createdDate] += 1;
        }
      }
    });
    
    const newProfiles = Object.entries(newProfilesMap).map(([date, count]) => ({
      date,
      count: count as number
    }));
    
    return {
      success: true,
      data: {
        totalProfiles,
        roles,
        locations,
        companies,
        newProfiles
      }
    };
  } catch (error) {
    console.error("Error fetching profiles data:", error);
    return { success: false, error };
  }
};

// Get all events with pagination
export const getAllEvents = async (
  page = 1,
  limit = 100,
  filters: { eventType?: string; searchTerm?: string; startDate?: string; endDate?: string } = {}
) => {
  try {
    let query = supabase
      .from("events")
      .select("*")
      .order("start_datetime", { ascending: false });
    
    // Apply filters if provided
    if (filters.eventType) {
      query = query.eq("event_type", filters.eventType);
    }
    
    if (filters.searchTerm) {
      query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
    }
    
    if (filters.startDate) {
      query = query.gte("start_datetime", filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte("start_datetime", filters.endDate);
    }
    
    if (page > 1) {
      query = query.range((page - 1) * limit, page * limit - 1);
    } else {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { success: true, data: data as CalendarEvent[] };
  } catch (error) {
    console.error("Error fetching events:", error);
    return { success: false, error };
  }
};

// Add a new event
export const addEvent = async (eventData) => {
  try {
    const { data, error } = await supabase
      .from("events")
      .insert([eventData])
      .select();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error adding event:", error);
    return { success: false, error };
  }
};

// Update an existing event
export const updateEvent = async (eventId, eventData) => {
  try {
    const { data, error } = await supabase
      .from("events")
      .update(eventData)
      .eq("id", eventId)
      .select();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error updating event:", error);
    return { success: false, error };
  }
};

// Delete an event
export const deleteEvent = async (eventId) => {
  try {
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting event:", error);
    return { success: false, error };
  }
};

// Get event registrations
export const getEventRegistrations = async (eventId) => {
  try {
    const { data, error } = await supabase
      .from("event_registrations")
      .select(`
        *,
        profiles:user_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq("event_id", eventId);
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    return { success: false, error };
  }
};

// Get event statistics
export const getEventStatistics = async () => {
  try {
    // Get total count of events
    const { count: totalEvents, error: countError } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true });
    
    if (countError) throw countError;
    
    // Get upcoming events count
    const { count: upcomingEvents, error: upcomingError } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .gte("start_datetime", new Date().toISOString());
    
    if (upcomingError) throw upcomingError;
    
    // Get total attendees
    const { data: attendeesData, error: attendeesError } = await supabase
      .from("events")
      .select("attendees_count");
    
    if (attendeesError) throw attendeesError;
    
    const totalAttendees = attendeesData.reduce((sum, event) => sum + (event.attendees_count || 0), 0);
    
    return {
      success: true,
      stats: {
        totalEvents,
        upcomingEvents,
        totalAttendees
      }
    };
  } catch (error) {
    console.error("Error fetching event statistics:", error);
    return { success: false, error };
  }
};

// Recordings Management Functions

// Get all recordings with pagination
export const getAllRecordings = async (
  page = 1,
  limit = 100,
  filters: { searchTerm?: string; eventId?: string; isPublic?: boolean } = {}
) => {
  try {
    let query = supabase
      .from("past_recordings")
      .select(`
        *,
        events:event_id (
          title,
          start_datetime
        )
      `)
      .order("recorded_at", { ascending: false });
    
    // Apply filters if provided
    if (filters.searchTerm) {
      query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
    }
    
    if (filters.eventId) {
      query = query.eq("event_id", filters.eventId);
    }
    
    if (filters.isPublic !== undefined) {
      query = query.eq("is_public", filters.isPublic);
    }
    
    if (page > 1) {
      query = query.range((page - 1) * limit, page * limit - 1);
    } else {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching recordings:", error);
    return { success: false, error };
  }
};

// Add a new recording
export const addRecording = async (recordingData) => {
  try {
    const { data, error } = await supabase
      .from("past_recordings")
      .insert([recordingData])
      .select();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error adding recording:", error);
    return { success: false, error };
  }
};

// Update an existing recording
export const updateRecording = async (recordingId, recordingData) => {
  try {
    const { data, error } = await supabase
      .from("past_recordings")
      .update(recordingData)
      .eq("id", recordingId)
      .select();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error updating recording:", error);
    return { success: false, error };
  }
};

// Delete a recording
export const deleteRecording = async (recordingId) => {
  try {
    const { error } = await supabase
      .from("past_recordings")
      .delete()
      .eq("id", recordingId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting recording:", error);
    return { success: false, error };
  }
};

// Get recording statistics
export const getRecordingStatistics = async () => {
  try {
    // Get total count of recordings
    const { count: totalRecordings, error: countError } = await supabase
      .from("past_recordings")
      .select("*", { count: "exact", head: true });
    
    if (countError) throw countError;
    
    // Get total views
    const { data: viewsData, error: viewsError } = await supabase
      .from("past_recordings")
      .select("view_count");
    
    if (viewsError) throw viewsError;
    
    const totalViews = viewsData.reduce((sum, rec) => sum + (rec.view_count || 0), 0);
    
    // Get recently added recordings
    const { data: recentRecordings, error: recentError } = await supabase
      .from("past_recordings")
      .select(`
        *,
        events:event_id (
          title
        )
      `)
      .order("created_at", { ascending: false })
      .limit(5);
    
    if (recentError) throw recentError;
    
    return {
      success: true,
      stats: {
        totalRecordings,
        totalViews,
        recentRecordings
      }
    };
  } catch (error) {
    console.error("Error fetching recording statistics:", error);
    return { success: false, error };
  }
};

// Update recording's video URL
export const updateRecordingUrl = async (recordingId, newUrl) => {
  try {
    const { error } = await supabase
      .from("past_recordings")
      .update({ recording_url: newUrl, updated_at: new Date().toISOString() })
      .eq("id", recordingId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Error updating recording URL:", error);
    return { success: false, error };
  }
};

// Toggle recording's public status
export const toggleRecordingPublicStatus = async (recordingId, isPublic) => {
  try {
    const { error } = await supabase
      .from("past_recordings")
      .update({ is_public: isPublic, updated_at: new Date().toISOString() })
      .eq("id", recordingId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Error toggling recording public status:", error);
    return { success: false, error };
  }
};

// Bulk operations for recordings and events
export const bulkDeleteRecordings = async (recordingIds) => {
  try {
    const { error } = await supabase
      .from("past_recordings")
      .delete()
      .in("id", recordingIds);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Error bulk deleting recordings:", error);
    return { success: false, error };
  }
};

export const bulkUpdateEvents = async (eventIds, updateData) => {
  // This needs to be done one by one due to Supabase limitations
  try {
    const promises = eventIds.map(id => 
      supabase
        .from("events")
        .update(updateData)
        .eq("id", id)
    );
    
    const results = await Promise.all(promises);
    const errors = results.filter(r => r.error).map(r => r.error);
    
    if (errors.length > 0) {
      console.error("Errors in bulk update:", errors);
      return { success: false, errors };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error bulk updating events:", error);
    return { success: false, error };
  }
};

// Get all startups
export const getAllStartups = async () => {
  try {
    const { data, error } = await supabase
      .from("startups")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching startups:", error);
    return { success: false, error };
  }
};

// Add a new startup
export const addStartup = async (startupData) => {
  try {
    const { data, error } = await supabase
      .from("startups")
      .insert([startupData])
      .select();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error adding startup:", error);
    return { success: false, error };
  }
};

// Update an existing startup
export const updateStartup = async (startupId, startupData) => {
  try {
    const { data, error } = await supabase
      .from("startups")
      .update(startupData)
      .eq("id", startupId)
      .select();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error updating startup:", error);
    return { success: false, error };
  }
};

// Delete a startup
export const deleteStartup = async (startupId) => {
  try {
    const { error } = await supabase
      .from("startups")
      .delete()
      .eq("id", startupId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting startup:", error);
    return { success: false, error };
  }
};

// Create a user profile as admin
export const createUserProfileAsAdmin = async (userData) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .insert([userData])
      .select();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error creating user profile:", error);
    return { success: false, error };
  }
};

// Get forum categories
export const getForumCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("forum_categories")
      .select("*")
      .order("order_num", { ascending: true });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching forum categories:", error);
    return { success: false, error };
  }
};

// Get forum topics with optional filters
export const getForumTopics = async (
  categoryId = null,
  page = 1,
  limit = 10,
  sortBy = "created_at",
  sortDirection = "desc"
) => {
  try {
    let query = supabase
      .from("forum_topics")
      .select(`
        *,
        profiles:user_id (id, first_name, last_name, photo_url),
        categories:category_id (id, name),
        replies_count:forum_replies!forum_topics_id_fkey (count)
      `);
    
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }
    
    // Handle sorting
    query = query.order(sortBy, { ascending: sortDirection === "asc" });
    
    // Handle pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Process the data to extract the replies count - fix the type error by using optional chaining
    const processedData = data?.map(topic => {
      // Check if replies_count is an array and extract the count value safely
      const repliesCount = Array.isArray(topic.replies_count) && topic.replies_count.length > 0
        ? topic.replies_count[0]?.count || 0
        : typeof topic.replies_count === 'number'
          ? topic.replies_count
          : 0;
      
      return {
        ...topic,
        replies_count: repliesCount
      };
    });
    
    return { success: true, data: processedData };
  } catch (error) {
    console.error("Error fetching forum topics:", error);
    return { success: false, error };
  }
};

// Mentor application approval function
export const approveMentorApplication = async (mentorId) => {
  try {
    const { data, error } = await supabase
      .from("mentor_profiles")
      .update({ is_approved: true })
      .eq("id", mentorId)
      .select();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error approving mentor application:", error);
    return { success: false, error };
  }
};
