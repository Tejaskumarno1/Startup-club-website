import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Resource, ForumCategory, SlideImage } from '@/lib/types';

/**
 * Admin CMS helper functions for the application
 */

// Create a new resource
export const createResource = async (
  resource: Partial<Resource>
): Promise<{ success: boolean; resourceId?: string; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('resources')
      .insert({
        title: resource.title || 'New Resource',
        description: resource.description || '',
        content: resource.content || '',
        category_id: resource.category_id,
        attachment_url: resource.attachment_url || null,
        created_by: resource.created_by,
        is_premium: resource.is_premium || false,
        view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, resourceId: data.id };
  } catch (error) {
    console.error('Error creating resource:', error);
    return { success: false, error };
  }
};

// Update an existing resource
export const updateResource = async (
  resourceId: string,
  updates: Partial<Resource>
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('resources')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', resourceId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error updating resource:', error);
    return { success: false, error };
  }
};

// Delete a resource
export const deleteResource = async (
  resourceId: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', resourceId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting resource:', error);
    return { success: false, error };
  }
};

// Create a new forum category
export const createForumCategory = async (
  category: Partial<ForumCategory>
): Promise<{ success: boolean; categoryId?: string; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('forum_categories')
      .insert({
        name: category.name || 'New Category',
        description: category.description || '',
        order_num: category.order_num || 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, categoryId: data.id };
  } catch (error) {
    console.error('Error creating forum category:', error);
    return { success: false, error };
  }
};

// Update forum category
export const updateForumCategory = async (
  categoryId: string,
  updates: Partial<ForumCategory>
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('forum_categories')
      .update(updates)
      .eq('id', categoryId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error updating forum category:', error);
    return { success: false, error };
  }
};

// Delete forum category (and all topics/replies)
export const deleteForumCategory = async (
  categoryId: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    // Get all topics in this category
    const { data: topics, error: topicsError } = await supabase
      .from('forum_topics')
      .select('id')
      .eq('category_id', categoryId);
    
    if (topicsError) throw topicsError;
    
    // Delete all replies for topics in this category
    if (topics && topics.length > 0) {
      const topicIds = topics.map(topic => topic.id);
      
      const { error: repliesError } = await supabase
        .from('forum_replies')
        .delete()
        .in('topic_id', topicIds);
      
      if (repliesError) throw repliesError;
      
      // Delete all topics in this category
      const { error: deleteTopicsError } = await supabase
        .from('forum_topics')
        .delete()
        .eq('category_id', categoryId);
      
      if (deleteTopicsError) throw deleteTopicsError;
    }
    
    // Delete the category
    const { error } = await supabase
      .from('forum_categories')
      .delete()
      .eq('id', categoryId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting forum category:', error);
    return { success: false, error };
  }
};

// Get all slide images with ordering
export const getAllSlides = async (): Promise<SlideImage[]> => {
  try {
    const { data, error } = await supabase
      .from('slide_images')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    
    // Cast to the correct SlideImage type that uses display_order
    return data as unknown as SlideImage[];
  } catch (error) {
    console.error('Error fetching slides:', error);
    toast({
      title: 'Error',
      description: 'Failed to load slides. Please try again later.',
      variant: 'destructive',
    });
    return [];
  }
};

// Update slide order
export const updateSlideOrder = async (
  slideId: string,
  newOrder: number
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('slide_images')
      .update({
        display_order: newOrder,
        updated_at: new Date().toISOString()
      })
      .eq('id', slideId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error updating slide order:', error);
    return { success: false, error };
  }
};

// Define SystemConfig type to match our expected structure
interface SystemConfig {
  id?: string;
  maintenance_mode: boolean;
  registration_open: boolean;
  allow_guest_access: boolean;
  footer_text: string;
  primary_color: string;
  contact_email?: string;
  updated_at: string;
}

// Get system configuration
export const getSystemConfig = async (): Promise<SystemConfig> => {
  try {
    // Use type assertion to bypass TypeScript's strict checking for the table name
    const { data, error } = await (supabase
      .from('system_config' as any)
      .select('*')
      .single() as any);
    
    if (error) {
      // If no config exists, create a default one
      if (error.code === 'PGRST116') {
        const defaultConfig: SystemConfig = {
          maintenance_mode: false,
          registration_open: true,
          allow_guest_access: true,
          footer_text: 'SR University Startup Club',
          primary_color: '#4f46e5',
          updated_at: new Date().toISOString()
        };
        
        // Insert with type assertion
        await (supabase
          .from('system_config' as any)
          .insert([defaultConfig] as any) as any);
        
        return defaultConfig;
      }
      throw error;
    }
    
    return data as SystemConfig;
  } catch (error) {
    console.error('Error fetching system config:', error);
    return {
      maintenance_mode: false,
      registration_open: true,
      allow_guest_access: true,
      footer_text: 'SR University Startup Club',
      primary_color: '#4f46e5',
      updated_at: new Date().toISOString()
    };
  }
};

// Update system configuration
export const updateSystemConfig = async (
  config: Partial<SystemConfig>
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await (supabase
      .from('system_config' as any)
      .update({
        ...config,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', config.id || '1') as any);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error updating system config:', error);
    return { success: false, error };
  }
};
