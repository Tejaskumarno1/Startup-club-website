
import { supabase } from '@/integrations/supabase/client';
import { 
  CalendarEvent, 
  PastRecording,
  AdminStatsResult,
  ProfilesData
} from '@/lib/types';

// Define types for the return values of the service functions
export interface AdminDashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalStartups: number;
  totalMentors: number;
  totalRecordings: number;
  // Add missing properties needed by the AdminDashboard component
  usersCount: number;
  newUsersCount: number;
  adminsCount: number;
  mentorsCount: number;
  eventsCount: number;
  startupsCount: number;
  pastEventsCount: number;
}

export interface RecentActivity {
  id: string;
  created_at: string;
  date: string; // Add the date property to match what's used in AdminDashboard
  type: string;
  description: string;
  user_id?: string;
  event_id?: string;
  recording_id?: string;
}

export interface AdminProfileResult {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

/**
 * Fetches dashboard statistics for the admin panel.
 * @returns {Promise<AdminDashboardStats>} - An object containing the statistics.
 */
export const fetchDashboardStats = async (): Promise<AdminDashboardStats> => {
  try {
    // Fetch total counts from different tables
    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact' });
    const { count: totalEvents } = await supabase.from('events').select('*', { count: 'exact' });
    const { count: totalStartups } = await supabase.from('startups').select('*', { count: 'exact' });
    const { count: totalMentors } = await supabase.from('mentor_profiles').select('*', { count: 'exact' });
    const { count: totalRecordings } = await supabase.from('past_recordings').select('*', { count: 'exact' });
    
    // Count admin users
    const { count: adminsCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('role', 'admin');
    
    // Count past events (events with end_datetime before now)
    const { count: pastEventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact' })
      .lt('end_datetime', new Date().toISOString());
    
    // Get new users in the last month
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { count: newUsersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .gte('created_at', thirtyDaysAgo.toISOString());

    return {
      totalUsers: totalUsers || 0,
      totalEvents: totalEvents || 0,
      totalStartups: totalStartups || 0,
      totalMentors: totalMentors || 0,
      totalRecordings: totalRecordings || 0,
      // Map the values to the properties used in AdminDashboard
      usersCount: totalUsers || 0,
      newUsersCount: newUsersCount || 0,
      adminsCount: adminsCount || 0,
      mentorsCount: totalMentors || 0,
      eventsCount: totalEvents || 0,
      startupsCount: totalStartups || 0,
      pastEventsCount: pastEventsCount || 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Fetches recent activity logs for the admin panel.
 * @param {number} limit - The number of recent activities to fetch.
 * @returns {Promise<RecentActivity[]>} - An array of recent activity objects.
 */
export const fetchRecentActivity = async (limit: number = 5): Promise<RecentActivity[]> => {
  try {
    // Instead of querying admin_activity_log directly which doesn't exist in the schema
    // Let's create mock activity data or use a different table
    
    // This is a fallback solution since admin_activity_log doesn't exist in the DB schema
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (eventsError) {
      console.error('Error fetching events for activity:', eventsError);
      throw eventsError;
    }
    
    // Transform events into activity records
    const activities: RecentActivity[] = (events || []).map(event => ({
      id: event.id,
      created_at: event.created_at,
      date: event.created_at, // Add the date property to match what's used in the component
      type: 'event',
      description: `New event created: ${event.title}`,
      event_id: event.id,
    }));
    
    return activities;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
};

/**
 * Fetches a list of admin profiles.
 * @returns {Promise<AdminProfileResult[]>} - An array of admin profile objects.
 */
export const fetchAdminProfiles = async (): Promise<AdminProfileResult[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role')
      .eq('role', 'admin');

    if (error) {
      console.error('Error fetching admin profiles:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching admin profiles:', error);
    throw error;
  }
};

/**
 * Fetches profiles data for analytics.
 * @returns {Promise<ProfilesData>} - An object containing the profiles data.
 */
export const fetchProfilesData = async (): Promise<ProfilesData> => {
  try {
    // Fetch all profiles for analysis
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
      totalProfiles,
      roles,
      locations,
      companies,
      newProfiles
    };
  } catch (error) {
    console.error("Error fetching profiles data:", error);
    throw error;
  }
};

/**
 * Approves a mentor application.
 * @param {string} mentorId - The ID of the mentor to approve.
 * @returns {Promise<void>}
 */
export const approveMentorApplication = async (mentorId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('mentor_profiles')
      .update({ is_approved: true })
      .eq('id', mentorId);

    if (error) {
      console.error('Error approving mentor application:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error approving mentor application:', error);
    throw error;
  }
};

/**
 * Fetches community impact statistics.
 * @returns {Promise<any>} - An object containing the community impact statistics.
 */
export const fetchCommunityImpactStats = async (): Promise<any> => {
  try {
    // Fetch total events
    const { count: totalEvents } = await supabase.from('events').select('*', { count: 'exact' });

    // Fetch total mentors
    const { count: totalMentors } = await supabase.from('mentor_profiles').select('*', { count: 'exact' });

    // Fetch total startups
    const { count: totalStartups } = await supabase.from('startups').select('*', { count: 'exact' });

    return {
      totalEvents: totalEvents || 0,
      totalMentors: totalMentors || 0,
      totalStartups: totalStartups || 0,
    };
  } catch (error) {
    console.error('Error fetching community impact stats:', error);
    throw error;
  }
};

/**
 * Fetches past events.
 * @param {number} limit - The number of past events to fetch.
 * @returns {Promise<CalendarEvent[]>} - An array of past event objects.
 */
export const fetchPastEvents = async (limit: number = 5): Promise<CalendarEvent[]> => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .lt('end_datetime', new Date().toISOString())
      .order('end_datetime', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching past events:', error);
      throw error;
    }

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
    throw error;
  }
};

/**
 * Updates an event with an image URL.
 * @param {string} eventId - The ID of the event to update.
 * @param {string} imageUrl - The URL of the image to set for the event.
 * @returns {Promise<void>}
 */
export const updateEventWithImage = async (eventId: string, imageUrl: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('events')
      .update({ image_url: imageUrl })
      .eq('id', eventId);

    if (error) {
      console.error('Error updating event with image:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error updating event with image:', error);
    throw error;
  }
};
