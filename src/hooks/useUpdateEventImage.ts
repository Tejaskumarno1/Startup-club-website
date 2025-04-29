
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { updateEventImageInDb } from "@/lib/api/storageApi";

interface UpdateEventImageParams {
  eventId: string;
  imageUrl: string;
}

/**
 * Hook for updating event images in the database
 */
export function useUpdateEventImage() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ eventId, imageUrl }: UpdateEventImageParams) => {
      const success = await updateEventImageInDb(eventId, imageUrl);
      
      if (!success) {
        throw new Error("Failed to update event image in database");
      }
      
      return { eventId, imageUrl };
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating event image",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}
