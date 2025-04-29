
import { supabase } from "@/integrations/supabase/client";
import { Startup } from "@/lib/types";

/**
 * Create a new startup with proper UUID generation
 */
export const createStartup = async (startupData: Omit<Startup, "id" | "created_at" | "updated_at">): Promise<{ 
  success: boolean; 
  data?: Startup; 
  error?: string;
}> => {
  try {
    // Ensure name is never undefined
    if (!startupData.name) {
      return { success: false, error: "Startup name is required" };
    }

    console.log("API createStartup called with:", startupData);

    const { data, error } = await supabase
      .from("startups")
      .insert([{
        ...startupData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating startup:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as Startup };
  } catch (error: any) {
    console.error("Exception creating startup:", error);
    return { success: false, error: error.message || "An unknown error occurred" };
  }
};

/**
 * Update an existing startup
 */
export const updateStartup = async (
  id: string,
  startupData: Partial<Omit<Startup, "id" | "created_at" | "updated_at">>
): Promise<{ 
  success: boolean; 
  data?: Startup;
  error?: string;
}> => {
  try {
    console.log("API updateStartup called with ID:", id, "and data:", startupData);

    // Prepare the update payload excluding empty URL fields
    // This prevents overwriting valid URLs with empty strings
    const updatePayload: any = {
      ...startupData,
      updated_at: new Date().toISOString(),
    };

    // Clean up empty URL fields to prevent validation errors
    const urlFields = ['website_url', 'linkedin_url', 'twitter_url', 'instagram_url', 'github_url'];
    urlFields.forEach(field => {
      if (field in updatePayload && (!updatePayload[field] || updatePayload[field] === '')) {
        delete updatePayload[field];
      }
    });

    console.log("Cleaned update payload:", updatePayload);

    const { data, error } = await supabase
      .from("startups")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating startup:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as Startup };
  } catch (error: any) {
    console.error("Exception updating startup:", error);
    return { success: false, error: error.message || "An unknown error occurred" };
  }
};

/**
 * Delete a startup
 */
export const deleteStartup = async (id: string): Promise<{ 
  success: boolean; 
  error?: string;
}> => {
  try {
    const { error } = await supabase
      .from("startups")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting startup:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception deleting startup:", error);
    return { success: false, error: error.message || "An unknown error occurred" };
  }
};

/**
 * Get all startups
 */
export const getAllStartups = async (): Promise<{ 
  success: boolean; 
  data?: Startup[]; 
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from("startups")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching startups:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as Startup[] };
  } catch (error: any) {
    console.error("Exception fetching startups:", error);
    return { success: false, error: error.message || "An unknown error occurred" };
  }
};

/**
 * Get a startup by ID
 */
export const getStartupById = async (id: string): Promise<{ 
  success: boolean; 
  data?: Startup; 
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from("startups")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      console.error("Error fetching startup:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as Startup };
  } catch (error: any) {
    console.error("Exception fetching startup:", error);
    return { success: false, error: error.message || "An unknown error occurred" };
  }
};

/**
 * Feature or unfeature a startup
 */
export const toggleStartupFeature = async (id: string, isFeatured: boolean): Promise<{ 
  success: boolean; 
  error?: string;
}> => {
  try {
    const { error } = await supabase
      .from("startups")
      .update({ 
        is_featured: isFeatured,
        updated_at: new Date().toISOString()  
      })
      .eq("id", id);
    
    if (error) {
      console.error("Error featuring startup:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Exception featuring startup:", error);
    return { success: false, error: error.message || "An unknown error occurred" };
  }
};
