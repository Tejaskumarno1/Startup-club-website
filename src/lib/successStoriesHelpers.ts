
import { supabase } from "@/integrations/supabase/client";
import { SuccessStory } from "./types";

// Get all success stories - updated to remove user_id dependency
export const getAllSuccessStories = async () => {
  try {
    console.log("Fetching all success stories");
    const { data, error } = await supabase
      .from("success_stories")
      .select("*")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching success stories:", error);
      throw error;
    }

    // Enhanced debugging - log all data returned
    console.log("Success stories data:", JSON.stringify(data, null, 2));
    console.log(`Successfully fetched ${data?.length || 0} success stories`);
    
    // Return empty array instead of null if no data found
    return { success: true, data: (data || []) as unknown as SuccessStory[] };
  } catch (error: any) {
    console.error("Error fetching success stories:", error);
    return { success: false, error: { message: error.message } };
  }
};

// Get a single success story by ID - updated to remove user_id dependency
export const getSuccessStoryById = async (id: string) => {
  try {
    console.log(`Fetching success story with ID: ${id}`);
    const { data, error } = await supabase
      .from("success_stories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Supabase error fetching success story ${id}:`, error);
      throw error;
    }

    console.log(`Successfully fetched success story: ${id}`);
    // Explicitly cast the data to SuccessStory type to fix type errors
    return { success: true, data: data as unknown as SuccessStory };
  } catch (error: any) {
    console.error(`Error fetching success story ${id}:`, error);
    return { success: false, error: { message: error.message } };
  }
};

// Create a new success story with user_id as optional
export const createSuccessStory = async (storyData: Partial<SuccessStory>) => {
  try {
    // Ensure required fields are present
    if (!storyData.company_name || !storyData.founder || !storyData.description) {
      console.error("Missing required fields for success story creation", storyData);
      throw new Error("Missing required fields: company_name, founder, or description");
    }
    
    // Create a properly structured object for insert
    const dataToInsert = {
      company_name: storyData.company_name,
      founder: storyData.founder,
      description: storyData.description,
      year: storyData.year || null,
      industry: storyData.industry || null,
      achievements: storyData.achievements || [],
      image_url: storyData.image_url || null,
      featured: storyData.featured || false,
      // Make user_id optional, use it if provided
      ...(storyData.user_id && { user_id: storyData.user_id })
    };

    // Enhanced debugging - log the exact payload we're sending
    console.log("Inserting success story data:", JSON.stringify(dataToInsert, null, 2));

    const { data, error } = await supabase
      .from("success_stories")
      .insert(dataToInsert)
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.error("No data returned after insert");
      throw new Error("No data returned after insert");
    }

    console.log("Success story created successfully:", data[0]);
    return { success: true, data: data[0] };
  } catch (error: any) {
    console.error("Error creating success story:", error);
    return { success: false, error: { message: error.message } };
  }
};

// Update an existing success story - updated to make user_id optional
export const updateSuccessStory = async (storyData: SuccessStory) => {
  try {
    if (!storyData.id) {
      console.error("Missing story ID for update", storyData);
      throw new Error("Story ID is required for updates");
    }
    
    // Enhanced debugging - log the exact payload we're sending
    console.log("Updating success story data:", JSON.stringify(storyData, null, 2));
    
    const updateData = {
      company_name: storyData.company_name,
      founder: storyData.founder,
      year: storyData.year,
      industry: storyData.industry,
      description: storyData.description,
      achievements: storyData.achievements,
      featured: storyData.featured,
      image_url: storyData.image_url,
      updated_at: new Date().toISOString()
    };
    
    const { data: responseData, error } = await supabase
      .from("success_stories")
      .update(updateData)
      .eq("id", storyData.id)
      .select();

    if (error) {
      console.error(`Supabase update error for story ${storyData.id}:`, error);
      throw error;
    }

    if (!responseData || responseData.length === 0) {
      console.error(`No data returned after updating story ${storyData.id}`);
      throw new Error("No data returned after update");
    }

    console.log("Success story updated successfully:", responseData[0]);
    return { success: true, data: responseData[0] };
  } catch (error: any) {
    console.error(`Error updating success story ${storyData.id}:`, error);
    return { success: false, error: { message: error.message } };
  }
};

// Delete a success story with improved logging
export const deleteSuccessStory = async (id: string) => {
  try {
    console.log("Deleting success story with ID:", id);
    
    const { error } = await supabase
      .from("success_stories")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`Supabase delete error for story ${id}:`, error);
      throw error;
    }

    console.log(`Success story ${id} deleted successfully`);
    return { success: true };
  } catch (error: any) {
    console.error(`Error deleting success story ${id}:`, error);
    return { success: false, error: { message: error.message } };
  }
};

// Get featured success stories - updated to remove user_id dependency
export const getFeaturedSuccessStories = async (limit = 3) => {
  try {
    console.log(`Fetching featured success stories, limit: ${limit}`);
    const { data, error } = await supabase
      .from("success_stories")
      .select("*")
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Supabase error fetching featured success stories:", error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} featured success stories`);
    // Return empty array instead of null
    return { success: true, data: (data || []) as unknown as SuccessStory[] };
  } catch (error: any) {
    console.error("Error fetching featured success stories:", error);
    return { success: false, error: { message: error.message } };
  }
};

// Get recent success stories (excluding featured ones) - updated to remove user_id dependency
export const getRecentSuccessStories = async (limit = 6) => {
  try {
    console.log(`Fetching recent success stories, limit: ${limit}`);
    const { data, error } = await supabase
      .from("success_stories")
      .select("*")
      .eq("featured", false)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Supabase error fetching recent success stories:", error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} recent success stories`);
    // Return empty array instead of null
    return { success: true, data: (data || []) as unknown as SuccessStory[] };
  } catch (error: any) {
    console.error("Error fetching recent success stories:", error);
    return { success: false, error: { message: error.message } };
  }
};

// Upload a success story image
export const uploadSuccessStoryImage = async (file: File) => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `success-stories/${fileName}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return { success: true, url: urlData.publicUrl };
  } catch (error: any) {
    console.error("Error uploading image:", error);
    return { success: false, error: { message: error.message } };
  }
};
