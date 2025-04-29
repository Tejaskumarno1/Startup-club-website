
import { supabase } from "@/integrations/supabase/client";
import { MentorProfile, MentorSession } from "./types";

/**
 * Fetches all approved mentor profiles from the database
 */
export const getMentorProfiles = async (): Promise<MentorProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('mentor_profiles')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          email,
          profile_image_url,
          bio,
          profession
        )
      `)
      .eq('is_approved', true);
    
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

/**
 * Fetches a specific mentor profile by ID
 */
export const getMentorProfileById = async (mentorId: string): Promise<MentorProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('mentor_profiles')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          email,
          profile_image_url,
          bio,
          profession
        )
      `)
      .eq('id', mentorId)
      .single();
    
    if (error) {
      console.error('Error fetching mentor profile:', error);
      return null;
    }
    
    return data as unknown as MentorProfile;
  } catch (err) {
    console.error('Error in getMentorProfileById:', err);
    return null;
  }
};

/**
 * Fetches mentor sessions for a specific user (as mentee)
 */
export const getMentorSessionsByMentee = async (menteeId: string): Promise<MentorSession[]> => {
  try {
    const { data, error } = await supabase
      .from('mentor_sessions')
      .select(`
        *,
        mentor_profiles:mentor_id (
          *,
          profiles:user_id (
            first_name,
            last_name,
            profile_image_url
          )
        )
      `)
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

/**
 * Creates a new mentor application
 */
export const createMentorApplication = async (
  userId: string, 
  mentorData: Omit<MentorProfile, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_approved'>
): Promise<{ success: boolean; error?: any }> => {
  try {
    // Check if user already has a mentor profile
    const { data: existingProfile, error: checkError } = await supabase
      .from('mentor_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking for existing mentor profile:', checkError);
      return { success: false, error: checkError };
    }
    
    if (existingProfile) {
      return { 
        success: false, 
        error: 'User already has a mentor profile' 
      };
    }
    
    // Create new mentor profile
    const newMentorProfile = {
      user_id: userId,
      bio: mentorData.bio,
      expertise: mentorData.expertise || [],
      availability: mentorData.availability,
      hourly_rate: mentorData.hourly_rate,
      is_approved: false, // All new applications need approval
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('mentor_profiles')
      .insert([newMentorProfile]);
    
    if (error) {
      console.error('Error creating mentor application:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error in createMentorApplication:', err);
    return { success: false, error: err };
  }
};

/**
 * Creates a new mentor session
 */
export const createMentorSession = async (
  sessionData: Omit<MentorSession, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; error?: any; session?: MentorSession }> => {
  try {
    const newSession = {
      ...sessionData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('mentor_sessions')
      .insert([newSession])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating mentor session:', error);
      return { success: false, error };
    }
    
    return { 
      success: true, 
      session: data as unknown as MentorSession 
    };
  } catch (err) {
    console.error('Error in createMentorSession:', err);
    return { success: false, error: err };
  }
};

/**
 * Updates an existing mentor session
 */
export const updateMentorSession = async (
  sessionId: string,
  updates: Partial<MentorSession>
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('mentor_sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);
    
    if (error) {
      console.error('Error updating mentor session:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error in updateMentorSession:', err);
    return { success: false, error: err };
  }
};
