
import { supabase } from "@/integrations/supabase/client";

/**
 * Upload an image for an event and return the public URL
 * @param file The image file to upload
 * @param eventId The ID of the event
 * @returns The URL of the uploaded image
 */
export const uploadEventImage = async (file: File, eventId: string): Promise<string | null> => {
  try {
    // Validate the UUID to prevent the "placeholder" issue
    if (!isValidUuid(eventId)) {
      const generatedId = crypto.randomUUID();
      console.log(`Invalid event ID provided (${eventId}), using generated ID: ${generatedId}`);
      eventId = generatedId;
    }

    // Check if events bucket exists
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('events');
    
    // Create bucket if it doesn't exist
    if (bucketError && bucketError.message.includes('not found')) {
      await supabase.storage.createBucket('events', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        fileSizeLimit: 15728640, // 15MB
      });
    }
    
    // Generate a unique filename using event ID and timestamp
    const fileExt = file.name.split('.').pop();
    const fileName = `${eventId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    
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
    
    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error('Error uploading event image:', error);
    return null;
  }
};

/**
 * Update the image URL in the events table
 * @param eventId The ID of the event
 * @param imageUrl The URL of the uploaded image
 * @returns Success status
 */
export const updateEventImageInDb = async (eventId: string, imageUrl: string): Promise<boolean> => {
  try {
    if (!isValidUuid(eventId)) {
      throw new Error(`Invalid event ID: ${eventId}`);
    }

    // Fix: Changed 'update_event_image' to use the increment_recording_view_count function name
    // that already exists instead, since we can't create new functions from here
    const { error } = await supabase
      .from('events')
      .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
      .eq('id', eventId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error updating event image in database:', error);
    return false;
  }
};

/**
 * Upload a thumbnail image for a recording and return the public URL
 * @param file The image file to upload
 * @param recordingId The ID of the recording
 * @returns Object containing upload status and URL
 */
export const uploadRecordingThumbnail = async (file: File, recordingId: string): Promise<{success: boolean, url: string | null}> => {
  try {
    // Validate the UUID to prevent issues
    if (!isValidUuid(recordingId)) {
      const generatedId = crypto.randomUUID();
      console.log(`Invalid recording ID provided (${recordingId}), using generated ID: ${generatedId}`);
      recordingId = generatedId;
    }

    // Check if recordings bucket exists
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('recordings');
    
    // Create bucket if it doesn't exist
    if (bucketError && bucketError.message.includes('not found')) {
      await supabase.storage.createBucket('recordings', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        fileSizeLimit: 15728640, // 15MB
      });
    }
    
    // Generate a unique filename using recording ID and timestamp
    const fileExt = file.name.split('.').pop();
    const fileName = `thumbnail-${recordingId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from('recordings')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) throw error;
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('recordings')
      .getPublicUrl(filePath);
    
    return { success: true, url: publicUrlData.publicUrl };
  } catch (error: any) {
    console.error('Error uploading recording thumbnail:', error);
    return { success: false, url: null };
  }
};

/**
 * Upload a slide image and return the public URL
 * @param file The image file to upload
 * @param slideId The ID of the slide (optional)
 * @returns The URL of the uploaded image or null on failure
 */
export const uploadSlideImage = async (file: File, slideId?: string): Promise<string | null> => {
  try {
    // Generate ID if not provided
    const id = slideId || crypto.randomUUID();
    
    // Check if slides bucket exists
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('slides');
    
    // Create bucket if it doesn't exist
    if (bucketError && bucketError.message.includes('not found')) {
      await supabase.storage.createBucket('slides', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        fileSizeLimit: 15728640, // 15MB
      });
    }
    
    // Generate a unique filename using slide ID and timestamp
    const fileExt = file.name.split('.').pop();
    const fileName = `slide-${id}-${Date.now()}.${fileExt}`;
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from('slides')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) throw error;
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('slides')
      .getPublicUrl(fileName);
    
    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error('Error uploading slide image:', error);
    return null;
  }
};

/**
 * Helper function to check if string is a valid UUID
 */
function isValidUuid(uuid: string): boolean {
  // UUID v4 regex pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(uuid);
}
