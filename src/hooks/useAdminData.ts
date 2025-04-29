
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminStats, getRecentActivity, getPastEvents } from "@/lib/adminHelpers";
import { RecentActivity, CalendarEvent } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["admin", "dashboard-stats"],
    queryFn: getAdminStats,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useRecentActivity = (limit: number = 5) => {
  return useQuery({
    queryKey: ["admin", "recent-activity", limit],
    queryFn: () => getRecentActivity(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePastEvents = (limit: number = 5) => {
  return useQuery({
    queryKey: ["admin", "past-events", limit],
    queryFn: () => getPastEvents(limit),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Add useApproveMentor hook for ManageMentors.tsx
export const useApproveMentor = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (mentorId: string) => {
      const { error } = await supabase
        .from('mentor_profiles')
        .update({ is_approved: true })
        .eq('id', mentorId);
      
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'mentors'] });
      toast({
        title: "Mentor approved",
        description: "Mentor has been successfully approved",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error approving mentor",
        description: error.message || "Failed to approve mentor",
        variant: "destructive"
      });
    }
  });
};

// Generic hook for uploading images that can be used across different admin pages
export const useUploadImage = (bucketName: string = 'images') => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ file, path }: { file: File, path?: string }) => {
      try {
        if (!file) throw new Error("No file provided");
        
        // Generate a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = path ? `${path}/${fileName}` : fileName;
        
        // Upload the file
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (error) throw error;
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path);
        
        return urlData.publicUrl;
      } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error uploading image",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
    }
  });
};

// Update event image
export const useUpdateEventImage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ eventId, imageUrl }: { eventId: string; imageUrl: string }) => {
      const { error } = await supabase
        .from('events')
        .update({ image_url: imageUrl })
        .eq('id', eventId);
      
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      toast({
        title: "Success",
        description: "Event image updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating event image",
        description: error.message || "Failed to update event image",
        variant: "destructive"
      });
    }
  });
};

// Update recording image
export const useUpdateRecordingImage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ recordingId, imageUrl }: { recordingId: string; imageUrl: string }) => {
      const { error } = await supabase
        .from('past_recordings')
        .update({ thumbnail_url: imageUrl })
        .eq('id', recordingId);
      
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'recordings'] });
      toast({
        title: "Success",
        description: "Recording thumbnail updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating recording thumbnail",
        description: error.message || "Failed to update recording thumbnail",
        variant: "destructive"
      });
    }
  });
};

// Update success story image
export const useUpdateSuccessStoryImage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ storyId, imageUrl }: { storyId: string; imageUrl: string }) => {
      const { error } = await supabase
        .from('success_stories')
        .update({ image_url: imageUrl })
        .eq('id', storyId);
      
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'success-stories'] });
      toast({
        title: "Success",
        description: "Success story image updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating success story image",
        description: error.message || "Failed to update success story image",
        variant: "destructive"
      });
    }
  });
};
