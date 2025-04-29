
import { supabase } from "@/integrations/supabase/client";
import { User, UserSettings } from "./types";

/**
 * Updates a user's profile in the database, ensuring all fields are properly updated
 * @param userId User ID to update
 * @param userData User data fields to update
 */
export async function updateUserProfile(
  userId: string,
  userData: Partial<User>
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Basic profile fields to update in profiles table
    const profileData: Record<string, any> = {};
    
    // Map user data to profile fields
    if (userData.first_name !== undefined) profileData.first_name = userData.first_name;
    if (userData.last_name !== undefined) profileData.last_name = userData.last_name;
    if (userData.bio !== undefined) profileData.bio = userData.bio;
    if (userData.photo_url !== undefined) profileData.photo_url = userData.photo_url;
    if (userData.company !== undefined) profileData.company = userData.company;
    if (userData.profession !== undefined) profileData.profession = userData.profession;
    if (userData.location !== undefined) profileData.location = userData.location;
    if (userData.interests !== undefined) profileData.interests = userData.interests;
    if (userData.industry !== undefined) profileData.industry = userData.industry;
    
    // Update basic profile data if we have any fields to update
    if (Object.keys(profileData).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId);
        
      if (profileError) throw profileError;
    }
    
    // Update user metadata in auth (for fields like username, phone, etc.)
    if (userData.username || userData.phone || userData.birthday || 
        userData.gender || userData.language) {
      const { data: { user }, error: metaError } = await supabase.auth.updateUser({
        data: {
          username: userData.username,
          phone: userData.phone,
          birthday: userData.birthday,
          gender: userData.gender,
          language: userData.language
        }
      });
      
      if (metaError) throw metaError;
    }
    
    // Update social links if provided
    if (userData.social_links) {
      // Check if we have settings for this user
      const { data: userSettingsData, error: settingsCheckError } = await supabase
        .from('user_settings')
        .select()
        .eq('user_id', userId)
        .maybeSingle();
        
      if (settingsCheckError && settingsCheckError.code !== 'PGRST116') {
        // If error is not 'no rows returned', throw it
        throw settingsCheckError;
      }
      
      // Cast to any to avoid TypeScript issues with the database schema
      const updateData: Record<string, any> = {
        social_links: userData.social_links
      };
      
      if (userSettingsData) {
        // Update existing settings
        const { error: socialError } = await supabase
          .from('user_settings')
          .update(updateData)
          .eq('user_id', userId);
          
        if (socialError) throw socialError;
      } else {
        // Create new settings with the social links
        const { error: newSocialError } = await supabase
          .from('user_settings')
          .insert({
            user_id: userId,
            ...updateData
          });
          
        if (newSocialError) throw newSocialError;
      }
    }
    
    // Update user settings if provided
    if (userData.settings) {
      // Check if user settings exist
      const { data: settingsData, error: settingsCheckError } = await supabase
        .from('user_settings')
        .select()
        .eq('user_id', userId)
        .maybeSingle();
        
      if (settingsCheckError && settingsCheckError.code !== 'PGRST116') {
        throw settingsCheckError;
      }
      
      const settingsToUpdate: Record<string, any> = {};
      
      if (userData.settings.notification_preferences) {
        settingsToUpdate.notification_preferences = userData.settings.notification_preferences;
      }
      
      if (userData.settings.privacy_settings) {
        settingsToUpdate.privacy_settings = userData.settings.privacy_settings;
      }
      
      if (userData.settings.theme_preference) {
        settingsToUpdate.theme_preference = userData.settings.theme_preference;
      }
      
      if (settingsData) {
        // Update existing settings
        const { error: updateSettingsError } = await supabase
          .from('user_settings')
          .update(settingsToUpdate)
          .eq('user_id', userId);
          
        if (updateSettingsError) throw updateSettingsError;
      } else {
        // Insert new settings with the required user_id field
        const { error: newSettingsError } = await supabase
          .from('user_settings')
          .insert({
            user_id: userId,
            ...settingsToUpdate
          });
          
        if (newSettingsError) throw newSettingsError;
      }
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

/**
 * Updates a user's password in Supabase Auth
 * @param currentPassword The current password
 * @param newPassword The new password to set
 */
export async function updateUserPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // First get the user's email to verify credentials
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.email) {
      throw new Error("User not found or email not available");
    }
    
    // Verify the current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    });
    
    if (signInError) {
      throw new Error("Current password is incorrect");
    }
    
    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (updateError) {
      throw updateError;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating password:", error);
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

/**
 * Handles file upload to Supabase storage
 * @param file File to upload
 * @param userId User ID for file naming
 */
export async function uploadProfileImage(
  file: File,
  userId: string
): Promise<{ url: string | null; error: Error | null }> {
  try {
    // Upload the file to the avatars bucket
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { url: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
}
