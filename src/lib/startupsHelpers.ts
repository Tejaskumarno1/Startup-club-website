import { supabase } from "@/integrations/supabase/client";
import {
  DatabaseTable,
  Startup,
  StartupWithFounder,
  Connection,
  IntroductionRequest,
  User
} from "./types";

// Get all startups
export const getAllStartups = async () => {
  try {
    const { data, error } = await supabase
      .from("startups")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Explicitly cast the response to Startup[] to fix type errors
    return { success: true, data: data as unknown as Startup[] };
  } catch (error: any) {
    console.error("Error fetching startups:", error);
    return { success: false, error: { message: error.message } };
  }
};

// Get a single startup by ID
export const getStartupById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("startups")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    // Explicitly cast the response to Startup to fix type errors
    return { success: true, data: data as unknown as Startup };
  } catch (error: any) {
    console.error("Error fetching startup:", error);
    return { success: false, error: { message: error.message } };
  }
};

// Create a new startup
export const createStartup = async (startupData: Partial<Startup>) => {
  try {
    const { data, error } = await supabase
      .from("startups")
      .insert([
        {
          ...startupData,
          // Ensure founder_id is not optional for database insert
          founder_id: startupData.founder_id || '', 
          // Add default values for required fields
          name: startupData.name || '',
        }
      ])
      .select();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error("Error creating startup:", error);
    return { success: false, error: { message: error.message } };
  }
};

// Get startup with founder info
export const getStartupWithFounder = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("startups")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    // Fetch founder info
    const { data: founderData, error: founderError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.founder_id)
      .single();

    if (founderError && founderError.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned"
      console.warn("Founder not found:", founderError);
    }

    // Explicitly cast the response to StartupWithFounder
    return {
      success: true,
      data: {
        ...data,
        founder: founderData || null,
      } as unknown as StartupWithFounder,
    };
  } catch (error: any) {
    console.error("Error fetching startup with founder:", error);
    return { success: false, error: { message: error.message } };
  }
};

// Get all connections for a user
export const getUserConnections = async (userId: string): Promise<Connection[]> => {
  try {
    const { data, error } = await supabase
      .from("connections")
      .select("*")
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching connections:", error);
      return [];
    }

    return data as Connection[];
  } catch (err) {
    console.error("Error in getUserConnections:", err);
    return [];
  }
};

// Create a connection request
export const createConnectionRequest = async (
  requesterId: string,
  recipientId: string
): Promise<{ success: boolean; error?: any; connection?: Connection }> => {
  try {
    // Check if connection already exists
    const { data: existingConnection, error: checkError } = await supabase
      .from("connections")
      .select("*")
      .or(`and(requester_id.eq.${requesterId},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${requesterId})`)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing connection:", checkError);
      return { success: false, error: checkError };
    }

    if (existingConnection) {
      return { 
        success: false, 
        error: 'Connection already exists between these users' 
      };
    }

    // Create new connection request
    const { data, error } = await supabase
      .from("connections")
      .insert([{
        requester_id: requesterId,
        recipient_id: recipientId,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error("Error creating connection request:", error);
      return { success: false, error };
    }

    return { 
      success: true, 
      connection: data?.[0] as Connection 
    };
  } catch (err) {
    console.error("Error in createConnectionRequest:", err);
    return { success: false, error: err };
  }
};

// Update connection status
export const updateConnectionStatus = async (
  connectionId: string,
  status: 'accepted' | 'rejected' | 'blocked'
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from("connections")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", connectionId);

    if (error) {
      console.error("Error updating connection status:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error("Error in updateConnectionStatus:", err);
    return { success: false, error: err };
  }
};

// Get connection suggestions for a user
export const getConnectionSuggestions = async (
  userId: string,
  limit: number = 5
): Promise<User[]> => {
  try {
    // Get user's existing connections
    const connections = await getUserConnections(userId);

    // Extract IDs of users already connected with
    const connectedIds = new Set<string>();
    connections.forEach(conn => {
      connectedIds.add(conn.requester_id);
      connectedIds.add(conn.recipient_id);
    });

    // Remove the user's own ID
    connectedIds.delete(userId);

    // Get suggestions (users not already connected with)
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", userId)
      .limit(limit);

    if (error) {
      console.error("Error fetching connection suggestions:", error);
      return [];
    }

    // Filter out users already connected with
    return (data as User[]).filter(user => !connectedIds.has(user.id));
  } catch (err) {
    console.error("Error in getConnectionSuggestions:", err);
    return [];
  }
};

// Get introduction requests for a user
export const getUserIntroductionRequests = async (
  userId: string,
  type: 'requester' | 'intermediary' | 'target' = 'requester'
): Promise<IntroductionRequest[]> => {
  try {
    let query = supabase
      .from("introduction_requests")
      .select("*");

    if (type === 'requester') {
      query = query.eq("requester_id", userId);
    } else if (type === 'intermediary') {
      query = query.eq("intermediary_id", userId);
    } else if (type === 'target') {
      query = query.eq("target_id", userId);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching introduction requests:", error);
      return [];
    }

    return data as IntroductionRequest[];
  } catch (err) {
    console.error("Error in getUserIntroductionRequests:", err);
    return [];
  }
};

// Create an introduction request
export const createIntroductionRequest = async (
  requesterId: string,
  intermediaryId: string,
  targetId: string,
  message: string
): Promise<{ success: boolean; error?: any; request?: IntroductionRequest }> => {
  try {
    const { data, error } = await supabase
      .from("introduction_requests")
      .insert([{
        requester_id: requesterId,
        intermediary_id: intermediaryId,
        target_id: targetId,
        message,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error("Error creating introduction request:", error);
      return { success: false, error };
    }

    return { 
      success: true, 
      request: data?.[0] as IntroductionRequest 
    };
  } catch (err) {
    console.error("Error in createIntroductionRequest:", err);
    return { success: false, error: err };
  }
};

// Update introduction request status
export const updateIntroductionStatus = async (
  requestId: string,
  status: 'accepted' | 'rejected' | 'completed'
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from("introduction_requests")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId);

    if (error) {
      console.error("Error updating introduction status:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error("Error in updateIntroductionStatus:", err);
    return { success: false, error: err };
  }
};

// Get user notifications
export const getUserNotifications = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }

    return data;
  } catch (err) {
    console.error("Error in getUserNotifications:", err);
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (
  notificationId: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error("Error in markNotificationAsRead:", err);
    return { success: false, error: err };
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (
  userId: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking all notifications as read:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error("Error in markAllNotificationsAsRead:", err);
    return { success: false, error: err };
  }
};

// Create a notification
export const createNotification = async (
  userId: string,
  content: string,
  notificationType: string,
  relatedEntityType?: string,
  relatedEntityId?: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from("notifications")
      .insert([{
        user_id: userId,
        content,
        notification_type: notificationType,
        related_entity_type: relatedEntityType,
        related_entity_id: relatedEntityId,
        is_read: false,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error("Error creating notification:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error("Error in createNotification:", err);
    return { success: false, error: err };
  }
};
