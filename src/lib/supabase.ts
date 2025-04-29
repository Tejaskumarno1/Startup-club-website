
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { 
  SlideImage, 
  User, 
  UserSettings, 
  Notification, 
  Education, 
  Experience, 
  Skill, 
  Project,
  CalendarEvent,
  EventRegistration,
  Connection,
  SuccessStory,
  ForumCategory,
  ForumTopic,
  ForumReply,
  MentorProfile,
  MentorSession,
  ResourceCategory,
  Resource,
  Startup,
  StartupMember,
  IntroductionRequest
} from './types';

// Supabase configuration
const supabaseUrl = 'https://kboqhvmxppsbpemmcgmx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtib3Fodm14cHBzYnBlbW1jZ214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2Nzk1NzAsImV4cCI6MjA1ODI1NTU3MH0.8JFH16v_AEqNHQN93tFOXVMPqkz0dPmAo3StyuNsAoA';

// Create a properly configured Supabase client with robust configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    detectSessionInUrl: true,
    flowType: 'implicit'
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Create an untyped version of supabase client for accessing tables not in the types
export const supabaseUntyped = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    detectSessionInUrl: true,
    flowType: 'implicit'
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Re-export the types
export type { ChatMessage, ChatRoom } from './types';
// Export the renamed CalendarEvent
export type { CalendarEvent as Event, EventRegistration } from './types';

// Advanced admin/mentor data functions since these aren't in the generated types
export const getAdminData = async (userId: string) => {
  try {
    // Using the REST API directly with any type to bypass TypeScript restrictions
    const { data, error } = await (supabase as any)
      .from('admin_data')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching admin data:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Error in getAdminData:', err);
    return null;
  }
};

export const updateAdminData = async (userId: string, loginTime: string) => {
  try {
    // Using the REST API directly with any type to bypass TypeScript restrictions
    const { error } = await (supabase as any)
      .from('admin_data')
      .update({ last_login: loginTime })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating admin login time:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in updateAdminData:', err);
    return false;
  }
};

export const createAdminData = async (userId: string, department: string = 'Management') => {
  try {
    // Using the REST API directly with any type to bypass TypeScript restrictions
    const { error } = await (supabase as any)
      .from('admin_data')
      .insert([{ id: userId, department, last_login: new Date().toISOString() }]);
      
    if (error) {
      console.error('Error creating admin data:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in createAdminData:', err);
    return false;
  }
};

export const getMentorData = async (userId: string) => {
  try {
    // Using the REST API directly with any type to bypass TypeScript restrictions
    const { data, error } = await (supabase as any)
      .from('mentor_data')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching mentor data:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Error in getMentorData:', err);
    return null;
  }
};

export const updateMentorData = async (userId: string, loginTime: string) => {
  try {
    // Using the REST API directly with any type to bypass TypeScript restrictions
    const { error } = await (supabase as any)
      .from('mentor_data')
      .update({ last_login: loginTime })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating mentor login time:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in updateMentorData:', err);
    return false;
  }
};

export const createMentorData = async (userId: string, expertise: string[] = ['General']) => {
  try {
    // Using the REST API directly with any type to bypass TypeScript restrictions
    const { error } = await (supabase as any)
      .from('mentor_data')
      .insert([{ id: userId, expertise, last_login: new Date().toISOString() }]);
      
    if (error) {
      console.error('Error creating mentor data:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in createMentorData:', err);
    return false;
  }
};

// Get slide images from Supabase
export const getSlideImages = async () => {
  try {
    const { data: slideImages, error } = await supabase
      .from('slide_images')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    if (slideImages && slideImages.length > 0) {
      // Map the database fields to our SlideImage type
      return slideImages.map(img => ({
        id: img.id,
        title: img.title,
        description: img.description,
        image_url: img.image_url,
        display_order: img.display_order, // Using display_order consistently
        created_at: img.created_at,
        updated_at: img.updated_at,
        is_active: true // Default to true since it's not in the database type
      })) as SlideImage[];
    }
    
    // Fallback images if database fetch returns no results
    return [
      {
        id: '1',
        title: 'Welcome to Startup Club',
        description: 'Connect with founders, investors and mentors',
        image_url: '/lovable-uploads/c85d2794-e9f3-4d6a-bf35-8563a6ca4813.png',
        display_order: 1, // Changed from order to display_order
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: '2',
        title: 'Join events and workshops',
        description: 'Learn from industry experts',
        image_url: '/lovable-uploads/4e148eda-0989-4b67-ae57-33002f9825de.png',
        display_order: 2, // Changed from order to display_order
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      }
    ];
  } catch (err) {
    console.error('Error fetching slide images:', err);
    // Return fallback slides on error
    return [
      {
        id: '1',
        title: 'Welcome to Startup Club',
        description: 'Connect with founders, investors and mentors',
        image_url: '/lovable-uploads/c85d2794-e9f3-4d6a-bf35-8563a6ca4813.png',
        display_order: 1, // Changed from order to display_order
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: '2',
        title: 'Join events and workshops',
        description: 'Learn from industry experts',
        image_url: '/lovable-uploads/4e148eda-0989-4b67-ae57-33002f9825de.png',
        display_order: 2, // Changed from order to display_order
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      }
    ];
  }
};

// Get user profile and data
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    if (!data) {
      console.log("No profile found for user:", userId);
      return null;
    }
    
    return data as User;
  } catch (err) {
    console.error('Error in getUserProfile:', err);
    return null;
  }
};

// Get detailed user profile with stats
export const getDetailedUserProfile = async (userId: string): Promise<User | null> => {
  try {
    if (!userId) return null;
    
    // Get basic profile info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError || !profile) {
      console.error('Error fetching detailed user profile:', profileError);
      return null;
    }
    
    // Get connection count (to be implemented when connections table is created)
    const connectionsCount = 0; // Placeholder until connections table is available
    
    // Get joined events count (to be implemented when events table is created)
    const eventsCount = 0; // Placeholder until events table is available
    
    // Combine all data into a comprehensive user profile
    const enhancedProfile: User = {
      ...profile,
      connections_count: connectionsCount,
      joined_events_count: eventsCount
    };
    
    return enhancedProfile;
  } catch (err) {
    console.error('Error in getDetailedUserProfile:', err);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, profileData: Partial<User>): Promise<{ success: boolean; error?: any }> => {
  try {
    if (!userId) return { success: false, error: 'No user ID provided' };
    
    // Add updated_at timestamp
    const dataToUpdate = {
      ...profileData,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('profiles')
      .update(dataToUpdate)
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error in updateUserProfile:', err);
    return { success: false, error: err };
  }
};

// Get user settings
export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }
    
    return data as UserSettings;
  } catch (err) {
    console.error('Error in getUserSettings:', err);
    return null;
  }
};

// Update user settings
export const updateUserSettings = async (userId: string, settingsData: Partial<UserSettings>): Promise<{ success: boolean; error?: any }> => {
  try {
    if (!userId) return { success: false, error: 'No user ID provided' };
    
    // Add updated_at timestamp
    const dataToUpdate = {
      ...settingsData,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('user_settings')
      .update(dataToUpdate)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating user settings:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error in updateUserSettings:', err);
    return { success: false, error: err };
  }
};

// Get user notifications
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
    
    return data as Notification[];
  } catch (err) {
    console.error('Error in getUserNotifications:', err);
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error in markNotificationAsRead:', err);
    return { success: false, error: err };
  }
};

// Event-related functions
// Get events for current user's calendar
export const getUserCalendarEvents = async (
  userId: string, 
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> => {
  try {
    if (!userId) return [];
    
    // First get all public events
    const { data: publicEvents, error: publicError } = await supabase
      .from('events')
      .select('*')
      .gte('start_datetime', startDate.toISOString())
      .lte('end_datetime', endDate.toISOString())
      .eq('is_public', true);
    
    if (publicError) {
      console.error('Error fetching public events:', publicError);
      return [];
    }
    
    // Get events created by the user
    const { data: userEvents, error: userError } = await supabase
      .from('events')
      .select('*')
      .gte('start_datetime', startDate.toISOString())
      .lte('end_datetime', endDate.toISOString())
      .eq('created_by', userId);
      
    if (userError) {
      console.error('Error fetching user events:', userError);
      return [];
    }
    
    // Get events the user has registered for
    const { data: registrations, error: regError } = await supabase
      .from('event_registrations')
      .select('*, event:events(*)')
      .eq('user_id', userId)
      .neq('status', 'canceled');
      
    if (regError) {
      console.error('Error fetching event registrations:', regError);
      return [];
    }
    
    // Extract events from registrations and filter by date range
    const registeredEvents = registrations
      .map(reg => reg.event)
      .filter(event => 
        event && 
        new Date(event.start_datetime) >= startDate && 
        new Date(event.end_datetime) <= endDate
      );
    
    // Combine all events, removing duplicates
    const allEvents = [...publicEvents, ...userEvents, ...registeredEvents];
    const uniqueEvents = Array.from(
      new Map(allEvents.map(event => [event.id, event])).values()
    );
    
    return uniqueEvents as CalendarEvent[];
  } catch (err) {
    console.error('Error in getUserCalendarEvents:', err);
    return [];
  }
};

// Create a new event
export const createEvent = async (eventData: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: any; event?: CalendarEvent }> => {
  try {
    if (!eventData.created_by) {
      return { 
        success: false, 
        error: 'User ID is required to create an event' 
      };
    }
    
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating event:', error);
      return { success: false, error };
    }
    
    return { 
      success: true, 
      event: data as unknown as CalendarEvent
    };
  } catch (err) {
    console.error('Error in createEvent:', err);
    return { success: false, error: err };
  }
};

// Update an existing event
export const updateEvent = async (eventId: string, eventData: Partial<CalendarEvent>): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('events')
      .update(eventData as any)
      .eq('id', eventId);
    
    if (error) {
      console.error('Error updating event:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error in updateEvent:', err);
    return { success: false, error: err };
  }
};

// Delete an event
export const deleteEvent = async (eventId: string): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
    
    if (error) {
      console.error('Error deleting event:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error in deleteEvent:', err);
    return { success: false, error: err };
  }
};

// Register user for an event
export const registerForEvent = async (
  userId: string,
  eventId: string,
  role: 'attendee' | 'speaker' | 'host' | 'mentor' = 'attendee'
): Promise<{ success: boolean; error?: any }> => {
  try {
    if (!userId || !eventId) {
      return { 
        success: false, 
        error: 'User ID and Event ID are required' 
      };
    }
    
    const registration = {
      user_id: userId,
      event_id: eventId,
      status: 'registered',
      role
    };
    
    const { error } = await supabase
      .from('event_registrations')
      .insert([registration]);
    
    if (error) {
      console.error('Error registering for event:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error in registerForEvent:', err);
    return { success: false, error: err };
  }
};

// Cancel event registration
export const cancelEventRegistration = async (
  userId: string,
  eventId: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    if (!userId || !eventId) {
      return { 
        success: false, 
        error: 'User ID and Event ID are required' 
      };
    }
    
    const { error } = await supabase
      .from('event_registrations')
      .update({ status: 'canceled' })
      .eq('user_id', userId)
      .eq('event_id', eventId);
    
    if (error) {
      console.error('Error canceling event registration:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error in cancelEventRegistration:', err);
    return { success: false, error: err };
  }
};

// Get user's event registrations
export const getUserEventRegistrations = async (
  userId: string
): Promise<EventRegistration[]> => {
  try {
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*, event:events(*)')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user event registrations:', error);
      return [];
    }
    
    return data as unknown as EventRegistration[];
  } catch (err) {
    console.error('Error in getUserEventRegistrations:', err);
    return [];
  }
};

// Connection methods
export const getConnections = async (userId: string): Promise<Connection[]> => {
  try {
    if (!userId) return [];
    
    const { data, error } = await supabaseUntyped
      .from('connections')
      .select('*')
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching connections:', error);
      return [];
    }
    
    return data as unknown as Connection[];
  } catch (err) {
    console.error('Error in getConnections:', err);
    return [];
  }
};

export const createConnectionRequest = async (requesterId: string, recipientId: string): Promise<{ success: boolean; error?: any; connection?: Connection }> => {
  try {
    // Check if connection already exists
    const { data: existingConnection, error: checkError } = await supabaseUntyped
      .from('connections')
      .select('*')
      .or(`and(requester_id.eq.${requesterId},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${requesterId})`)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing connection:', checkError);
      return { success: false, error: checkError };
    }
    
    if (existingConnection) {
      return { 
        success: false, 
        error: 'Connection already exists between these users' 
      };
    }
    
    // Create new connection request
    const newConnection = {
      requester_id: requesterId,
      recipient_id: recipientId,
      status: 'pending'
    };
    
    const { data, error } = await supabaseUntyped
      .from('connections')
      .insert([newConnection])
      .select();
    
    if (error) {
      console.error('Error creating connection request:', error);
      return { success: false, error };
    }
    
    return { 
      success: true, 
      connection: data?.[0] as unknown as Connection 
    };
  } catch (err) {
    console.error('Error in createConnectionRequest:', err);
    return { success: false, error: err };
  }
};

export const updateConnectionStatus = async (connectionId: string, status: 'accepted' | 'rejected' | 'blocked'): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabaseUntyped
      .from('connections')
      .update({ status })
      .eq('id', connectionId);
    
    if (error) {
      console.error('Error updating connection status:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error in updateConnectionStatus:', err);
    return { success: false, error: err };
  }
};

// Success Stories methods
export const getSuccessStories = async (): Promise<SuccessStory[]> => {
  try {
    const { data, error } = await supabaseUntyped
      .from('success_stories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching success stories:', error);
      return [];
    }
    
    return data as unknown as SuccessStory[];
  } catch (err) {
    console.error('Error in getSuccessStories:', err);
    return [];
  }
};

export const createSuccessStory = async (storyData: Omit<SuccessStory, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: any; story?: SuccessStory }> => {
  try {
    const { data, error } = await supabaseUntyped
      .from('success_stories')
      .insert([storyData])
      .select();
    
    if (error) {
      console.error('Error creating success story:', error);
      return { success: false, error };
    }
    
    return { 
      success: true, 
      story: data?.[0] as unknown as SuccessStory 
    };
  } catch (err) {
    console.error('Error in createSuccessStory:', err);
    return { success: false, error: err };
  }
};

// Forum methods
export const getForumCategories = async (): Promise<ForumCategory[]> => {
  try {
    const { data, error } = await supabaseUntyped
      .from('forum_categories')
      .select('*')
      .order('order_num', { ascending: true });
    
    if (error) {
      console.error('Error fetching forum categories:', error);
      return [];
    }
    
    return data as unknown as ForumCategory[];
  } catch (err) {
    console.error('Error in getForumCategories:', err);
    return [];
  }
};

export const getForumTopics = async (categoryId?: string): Promise<ForumTopic[]> => {
  try {
    let query = supabaseUntyped
      .from('forum_topics')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching forum topics:', error);
      return [];
    }
    
    return data as unknown as ForumTopic[];
  } catch (err) {
    console.error('Error in getForumTopics:', err);
    return [];
  }
};

export const getForumReplies = async (topicId: string): Promise<ForumReply[]> => {
  try {
    const { data, error } = await supabaseUntyped
      .from('forum_replies')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching forum replies:', error);
      return [];
    }
    
    return data as unknown as ForumReply[];
  } catch (err) {
    console.error('Error in getForumReplies:', err);
    return [];
  }
};

export const createForumTopic = async (topicData: Omit<ForumTopic, 'id' | 'created_at' | 'updated_at' | 'view_count'>): Promise<{ success: boolean; error?: any; topic?: ForumTopic }> => {
  try {
    const { data, error } = await supabaseUntyped
      .from('forum_topics')
      .insert([topicData])
      .select();
    
    if (error) {
      console.error('Error creating forum topic:', error);
      return { success: false, error };
    }
    
    return { 
      success: true, 
      topic: data?.[0] as unknown as ForumTopic 
    };
  } catch (err) {
    console.error('Error in createForumTopic:', err);
    return { success: false, error: err };
  }
};

export const createForumReply = async (replyData: Omit<ForumReply, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: any; reply?: ForumReply }> => {
  try {
    const { data, error } = await supabaseUntyped
      .from('forum_replies')
      .insert([replyData])
      .select();
    
    if (error) {
      console.error('Error creating forum reply:', error);
      return { success: false, error };
    }
    
    return { 
      success: true, 
      reply: data?.[0] as unknown as ForumReply 
    };
  } catch (err) {
    console.error('Error in createForumReply:', err);
    return { success: false, error: err };
  }
};

// Mentor methods
export const getMentorProfiles = async (): Promise<MentorProfile[]> => {
  try {
    const { data, error } = await supabaseUntyped
      .from('mentor_profiles')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching mentor profiles:', error);
      return [];
    }
    
    return data as unknown as MentorProfile[];
  } catch (err) {
    console.error('Error in getMentorProfiles:', err);
    return [];
  }
};

export const getMentorSessionsByMentee = async (menteeId: string): Promise<MentorSession[]> => {
  try {
    const { data, error } = await supabaseUntyped
      .from('mentor_sessions')
      .select('*')
      .eq('mentee_id', menteeId)
      .order('scheduled_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching mentor sessions:', error);
      return [];
    }
    
    return data as unknown as MentorSession[];
  } catch (err) {
    console.error('Error in getMentorSessionsByMentee:', err);
    return [];
  }
};

export const createMentorSession = async (sessionData: Omit<MentorSession, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: any; session?: MentorSession }> => {
  try {
    const { data, error } = await supabaseUntyped
      .from('mentor_sessions')
      .insert([sessionData])
      .select();
    
    if (error) {
      console.error('Error creating mentor session:', error);
      return { success: false, error };
    }
    
    return { 
      success: true, 
      session: data?.[0] as unknown as MentorSession 
    };
  } catch (err) {
    console.error('Error in createMentorSession:', err);
    return { success: false, error: err };
  }
};

// Resource methods
export const getResourceCategories = async (type?: 'guide' | 'template' | 'funding' | 'legal'): Promise<ResourceCategory[]> => {
  try {
    let query = supabaseUntyped
      .from('resource_categories')
      .select('*');
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching resource categories:', error);
      return [];
    }
    
    return data as unknown as ResourceCategory[];
  } catch (err) {
    console.error('Error in getResourceCategories:', err);
    return [];
  }
};

export const getResources = async (categoryId?: string): Promise<Resource[]> => {
  try {
    let query = supabaseUntyped
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching resources:', error);
      return [];
    }
    
    return data as unknown as Resource[];
  } catch (err) {
    console.error('Error in getResources:', err);
    return [];
  }
};

