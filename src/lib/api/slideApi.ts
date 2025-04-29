
import { supabase } from "@/integrations/supabase/client";
import { SlideImage } from "@/lib/types";

/**
 * Fetch all slides from the database, sorted by display_order
 */
export const fetchSlides = async (): Promise<SlideImage[]> => {
  try {
    const { data, error } = await supabase
      .from('slide_images')
      .select('*')
      .order('display_order', { ascending: true });
      
    if (error) {
      console.error("Supabase error fetching slides:", error);
      throw new Error(error.message);
    }
    
    // Log for debugging purposes
    console.log("API fetchSlides result:", data);
    
    return data.map((slide: any) => ({
      id: slide.id,
      title: slide.title,
      description: slide.description || "",
      image_url: slide.image_url,
      display_order: slide.display_order,
      created_at: slide.created_at,
      updated_at: slide.updated_at,
      is_active: slide.is_active !== false // Default to true if is_active is null
    })) as SlideImage[];
  } catch (error) {
    console.error("Error fetching slides:", error);
    throw error;
  }
};

/**
 * Create a new slide
 */
export const createSlide = async (slideData: Omit<SlideImage, "id">): Promise<SlideImage> => {
  try {
    console.log("Creating slide with data:", slideData);
    
    const { data, error } = await supabase
      .from('slide_images')
      .insert([slideData])
      .select()
      .single();
      
    if (error) {
      console.error("Supabase error creating slide:", error);
      throw new Error(error.message);
    }
    
    // Log for debugging purposes
    console.log("API createSlide result:", data);
    
    return data as SlideImage;
  } catch (error) {
    console.error("Error creating slide:", error);
    throw error;
  }
};

/**
 * Update an existing slide
 */
export const updateSlide = async (id: string, slideData: Partial<SlideImage>): Promise<SlideImage> => {
  try {
    console.log(`Updating slide ${id} with data:`, slideData);
    
    // Create an update object explicitly defining properties to ensure TypeScript compatibility
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
    // Only include properties that are defined in slideData
    if (slideData.title !== undefined) updateData.title = slideData.title;
    if (slideData.description !== undefined) updateData.description = slideData.description;
    if (slideData.image_url !== undefined) updateData.image_url = slideData.image_url;
    if (slideData.display_order !== undefined) updateData.display_order = slideData.display_order;
    if ('is_active' in slideData) updateData.is_active = slideData.is_active;
    
    const { data, error } = await supabase
      .from('slide_images')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error(`Supabase error updating slide with ID ${id}:`, error);
      throw new Error(error.message);
    }
    
    // Log for debugging purposes
    console.log("API updateSlide result:", data);
    
    return data as SlideImage;
  } catch (error) {
    console.error(`Error updating slide with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Toggle slide active status
 */
export const toggleSlideActive = async (id: string, isActive: boolean): Promise<SlideImage> => {
  try {
    console.log(`Toggling slide ${id} active status to ${isActive}`);
    
    const { data, error } = await supabase
      .from('slide_images')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error(`Supabase error toggling slide ${id} active status:`, error);
      throw new Error(error.message);
    }
    
    console.log("API toggleSlideActive result:", data);
    
    return data as SlideImage;
  } catch (error) {
    console.error(`Error toggling slide ${id} active status:`, error);
    throw error;
  }
};

/**
 * Delete a slide
 */
export const deleteSlide = async (id: string): Promise<void> => {
  try {
    console.log(`Deleting slide with ID ${id}`);
    
    const { error } = await supabase
      .from('slide_images')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error(`Supabase error deleting slide with ID ${id}:`, error);
      throw new Error(error.message);
    }
    
    console.log(`Slide ${id} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting slide with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Update the order of multiple slides
 */
export const updateSlidesOrder = async (slidesUpdateData: { id: string; display_order: number }[]): Promise<void> => {
  try {
    console.log("Updating slides order:", slidesUpdateData);
    
    // Use the database function to update all slides at once
    const { error } = await supabase.rpc('update_slides_order', {
      slides_data: JSON.stringify(slidesUpdateData)
    });
    
    if (error) {
      console.error("Supabase error updating slides order:", error);
      throw new Error(error.message);
    }
    
    console.log("Slides reordered successfully");
  } catch (error) {
    console.error("Error updating slides order:", error);
    throw error;
  }
};
