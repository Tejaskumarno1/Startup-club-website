
import { ChatMessage, ChatRoom } from './types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Helper functions for chat functionality
 */

// Function to get chat rooms
export const getChatRooms = async (): Promise<ChatRoom[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data as ChatRoom[];
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return [];
  }
};

// Function to get a specific chat room
export const getChatRoom = async (roomId: string): Promise<ChatRoom | null> => {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .single();
    
    if (error) throw error;
    
    return data as ChatRoom;
  } catch (error) {
    console.error(`Error fetching chat room ${roomId}:`, error);
    return null;
  }
};

// Function to check if a chat room exists
export const checkChatRoomExists = async (roomId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('id', roomId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // Code for "no rows returned"
        return false;
      }
      throw error;
    }
    
    return !!data;
  } catch (error) {
    console.error(`Error checking if chat room ${roomId} exists:`, error);
    return false;
  }
};

// Function to create a new chat room
export const createChatRoom = async (name: string, description?: string, isPrivate: boolean = false): Promise<{ success: boolean; roomId?: string; error?: any }> => {
  try {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    
    const { data, error } = await supabase
      .from('chat_rooms')
      .insert({
        name,
        description,
        is_private: isPrivate,
        created_by: userId,
        status: 'active'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, roomId: data.id };
  } catch (error) {
    console.error('Error creating chat room:', error);
    return { success: false, error };
  }
};

// Improved function to get messages for a chat room
export const getChatMessages = async (roomId: string): Promise<ChatMessage[]> => {
  try {
    console.log('Fetching messages for room:', roomId);
    
    // Get all messages for the room
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
    
    console.log('Retrieved messages count:', messages?.length || 0);
    
    if (!messages || messages.length === 0) {
      return [];
    }
    
    // Collect unique user IDs
    const userIds = [...new Set(messages.map(msg => msg.user_id).filter(Boolean))];
    
    // Fetch all profiles in one go
    let profiles = {};
    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, photo_url')
        .in('id', userIds);
        
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      } else if (profilesData) {
        // Create a map of user_id to profile
        profiles = profilesData.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {});
      }
    }
    
    // Enhance messages with profile information
    const enhancedMessages = messages.map(message => {
      const profile = message.user_id ? profiles[message.user_id] : null;
      
      return {
        ...message,
        sender_name: profile 
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
          : 'Unknown User',
        sender_avatar: profile ? profile.photo_url : null,
        profiles: profile
      };
    });
    
    console.log('Enhanced messages with profiles complete');
    return enhancedMessages as ChatMessage[];
  } catch (error) {
    console.error(`Error fetching messages for room ${roomId}:`, error);
    return [];
  }
};

// Function to send a message to a chat room
export const sendChatMessage = async (roomId: string, content: string): Promise<{ success: boolean; message?: any; error?: any }> => {
  try {
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }
    
    console.log('Sending message to room:', roomId, 'with content:', content);
    
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        user_id: user.data.user.id,
        content
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting message:', error);
      throw error;
    }
    
    console.log('Message sent successfully:', data);
    return { success: true, message: data };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error };
  }
};

// Function to update a chat room
export const updateChatRoom = async (roomId: string, updates: Partial<ChatRoom>): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('chat_rooms')
      .update(updates)
      .eq('id', roomId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error updating chat room:', error);
    return { success: false, error };
  }
};

// Function to delete a chat room
export const deleteChatRoom = async (roomId: string): Promise<{ success: boolean; error?: any }> => {
  try {
    // First delete all messages in the room
    const { error: messagesError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('room_id', roomId);
    
    if (messagesError) throw messagesError;
    
    // Then delete the room itself
    const { error: roomError } = await supabase
      .from('chat_rooms')
      .delete()
      .eq('id', roomId);
    
    if (roomError) throw roomError;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting chat room:', error);
    return { success: false, error };
  }
};

// Get direct message chat room between two users
export const getOrCreateDirectMessageRoom = async (userId1: string, userId2: string): Promise<{ success: boolean; roomId?: string; error?: any }> => {
  try {
    // Check if a direct message room already exists between these users
    const roomName1 = `dm_${userId1}_${userId2}`;
    const roomName2 = `dm_${userId2}_${userId1}`;
    
    const { data: existingRooms, error: searchError } = await supabase
      .from('chat_rooms')
      .select('*')
      .or(`name.eq.${roomName1},name.eq.${roomName2}`)
      .eq('is_private', true);
    
    if (searchError) throw searchError;
    
    // If a room exists, return it
    if (existingRooms && existingRooms.length > 0) {
      return { success: true, roomId: existingRooms[0].id };
    }
    
    // If no room exists, create one
    const { data: user1, error: user1Error } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId1)
      .single();
      
    const { data: user2, error: user2Error } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId2)
      .single();
    
    if (user1Error || user2Error) {
      throw new Error('Error fetching user profiles');
    }
    
    const user1Name = `${user1.first_name || ''} ${user1.last_name || ''}`.trim();
    const user2Name = `${user2.first_name || ''} ${user2.last_name || ''}`.trim();
    
    const roomDescription = `Private chat between ${user1Name} and ${user2Name}`;
    
    const { data, error } = await supabase
      .from('chat_rooms')
      .insert({
        name: roomName1,
        description: roomDescription,
        is_private: true,
        created_by: userId1,
        status: 'active'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, roomId: data.id };
  } catch (error) {
    console.error('Error creating direct message room:', error);
    return { success: false, error };
  }
};

// Format chat messages with user details more effectively
export const formatChatMessagesWithUserDetails = (messages, users) => {
  if (!messages || !users) return [];
  
  return messages.map(message => {
    const user = users.find(u => u.id === message.user_id);
    
    return {
      ...message,
      sender_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Unknown User',
      sender_avatar: user ? user.photo_url : null,
      profiles: user ? {
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        photo_url: user.photo_url || "",
      } : undefined
    };
  });
};
