
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads a member profile image to Supabase storage
 */
export const uploadMemberProfileImage = async (file: File): Promise<{ url: string }> => {
  try {
    // Create a unique file name to avoid conflicts
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `members/${fileName}`;

    // Upload the file to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('members')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw new Error(`Error uploading file: ${uploadError.message}`);
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('members')
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      throw new Error('Failed to get public URL for uploaded file');
    }

    return { url: urlData.publicUrl };
  } catch (error) {
    console.error('Error in uploadMemberProfileImage:', error);
    throw error;
  }
};

/**
 * Deletes a member profile image from Supabase storage
 */
export const deleteMemberProfileImage = async (url: string): Promise<void> => {
  try {
    // Extract path from URL
    const urlObj = new URL(url);
    const pathWithBucket = urlObj.pathname;
    // Remove the bucket name and first slash from the path
    const pathParts = pathWithBucket.split('/');
    // The file path should start from the third element (index 2) of the split array
    const filePath = pathParts.slice(2).join('/');

    if (!filePath) {
      console.error('Cannot parse file path from URL:', url);
      return;
    }

    const { error } = await supabase.storage
      .from('members')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Error deleting file: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteMemberProfileImage:', error);
    // We don't throw here to prevent blocking the member deletion process
    // if the image deletion fails
  }
};
