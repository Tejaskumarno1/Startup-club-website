
import { supabase } from "@/integrations/supabase/client";

// Function to ensure storage buckets exist, creating them if they don't
export const ensureStorageBuckets = async () => {
  try {
    // Check if the slides bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error checking buckets:', error);
      return { success: false, error };
    }
    
    const slidesBucketExists = buckets.some(bucket => bucket.name === 'slides');
    
    if (!slidesBucketExists) {
      // Create the slides bucket
      const { error: createError } = await supabase.storage.createBucket('slides', {
        public: true,
        fileSizeLimit: 10485760 // 10MB limit
      });
      
      if (createError) {
        console.error('Error creating slides bucket:', createError);
        return { success: false, error: createError };
      }
      
      console.log('Successfully created slides bucket');
    } else {
      // Update the bucket to ensure it's public and has appropriate size limits
      const { error: updateError } = await supabase.storage.updateBucket('slides', {
        public: true,
        fileSizeLimit: 10485760 // 10MB limit
      });
      
      if (updateError) {
        console.error('Error updating slides bucket:', updateError);
        // Non-critical error, continue anyway
      }
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error in ensureStorageBuckets:', err);
    return { success: false, error: err };
  }
};

// Function to upload a slide image
export const uploadSlideImage = async (file: File) => {
  if (!file) {
    return { success: false, error: new Error('No file provided') };
  }

  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { 
        success: false, 
        error: new Error('You must be logged in to upload images') 
      };
    }

    // Validate file size before attempting upload (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { 
        success: false, 
        error: new Error(`File size exceeds the 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`) 
      };
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { 
        success: false, 
        error: new Error(`File type not allowed. Please upload a JPEG, PNG, GIF, or WEBP image.`) 
      };
    }
    
    // Ensure the bucket exists
    const { success: bucketSuccess, error: bucketError } = await ensureStorageBuckets();
    
    if (!bucketSuccess) {
      console.error('Bucket creation/verification failed:', bucketError);
      throw bucketError || new Error('Failed to ensure storage bucket exists');
    }
    
    // Generate a unique file name to prevent collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;
    
    console.log('Uploading file to Supabase storage:', file.name, 'as', filePath);
    
    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('slides')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading slide image:', error);
      return { success: false, error };
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('slides')
      .getPublicUrl(filePath);
    
    console.log('File uploaded successfully, public URL:', publicUrl);
    return { 
      success: true, 
      filePath, 
      url: publicUrl 
    };
  } catch (err) {
    console.error('Error in uploadSlideImage:', err);
    return { success: false, error: err };
  }
};

// Function to get all slides
export const getSlides = async () => {
  try {
    const { data, error } = await supabase
      .from('slide_images')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching slides:', error);
      return [];
    }
    
    return data;
  } catch (err) {
    console.error('Error in getSlides:', err);
    return [];
  }
};

// Function to create a new slide
export const createSlide = async (slideData) => {
  try {
    const { data, error } = await supabase
      .from('slide_images')
      .insert([slideData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating slide:', error);
      return { success: false, error };
    }
    
    return { success: true, slide: data };
  } catch (err) {
    console.error('Error in createSlide:', err);
    return { success: false, error: err };
  }
};

// Function to update a slide
export const updateSlide = async (slideId, slideData) => {
  try {
    const { error } = await supabase
      .from('slide_images')
      .update(slideData)
      .eq('id', slideId);
    
    if (error) {
      console.error('Error updating slide:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error in updateSlide:', err);
    return { success: false, error: err };
  }
};

// Function to delete a slide
export const deleteSlide = async (slideId) => {
  try {
    // First, get the slide to find its image URL
    const { data: slide, error: fetchError } = await supabase
      .from('slide_images')
      .select('image_url')
      .eq('id', slideId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching slide for deletion:', fetchError);
      return { success: false, error: fetchError };
    }
    
    // Delete from the database
    const { error: deleteError } = await supabase
      .from('slide_images')
      .delete()
      .eq('id', slideId);
    
    if (deleteError) {
      console.error('Error deleting slide:', deleteError);
      return { success: false, error: deleteError };
    }
    
    // Try to delete the file from storage if it exists
    if (slide?.image_url) {
      try {
        // Extract the file path from the URL
        const fileUrl = new URL(slide.image_url);
        const filePath = fileUrl.pathname.split('/').pop();
        
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from('slides')
            .remove([filePath]);
          
          if (storageError) {
            // Log but don't fail the operation if storage deletion fails
            console.warn('Warning: Could not delete slide image file:', storageError);
          }
        }
      } catch (parseError) {
        console.warn('Could not parse image URL for deletion:', parseError);
      }
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error in deleteSlide:', err);
    return { success: false, error: err };
  }
};

// Function to reorder slides
export const reorderSlides = async (slides) => {
  try {
    // Update each slide with its new display_order
    const updates = slides.map((slide, index) => ({
      id: slide.id,
      display_order: index + 1
    }));
    
    // Use Promise.all to wait for all updates to complete
    const results = await Promise.all(
      updates.map(update => 
        supabase
          .from('slide_images')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
      )
    );
    
    // Check if any errors occurred
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Errors reordering slides:', errors);
      return { success: false, errors };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error in reorderSlides:', err);
    return { success: false, error: err };
  }
};
