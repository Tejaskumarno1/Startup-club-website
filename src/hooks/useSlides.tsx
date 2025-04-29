
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SlideImage } from "@/lib/types";
import { 
  fetchSlides, 
  createSlide, 
  updateSlide, 
  deleteSlide, 
  updateSlidesOrder,
  toggleSlideActive
} from "@/lib/api/slideApi";
import { useToast } from "@/hooks/use-toast";

/**
 * Custom hook for managing slides operations with React Query
 */
export function useSlides() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch all slides
  const { 
    data: slides = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['slides'],
    queryFn: fetchSlides,
  });
  
  // Create slide mutation
  const createSlideMutation = useMutation({
    mutationFn: createSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slides'] });
      toast({
        title: "Success",
        description: "Slide created successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Error creating slide:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create slide",
        variant: "destructive",
      });
    },
  });
  
  // Update slide mutation
  const updateSlideMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SlideImage> }) => 
      updateSlide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slides'] });
      toast({
        title: "Success",
        description: "Slide updated successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Error updating slide:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update slide",
        variant: "destructive",
      });
    },
  });
  
  // Toggle slide active status mutation
  const toggleSlideActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleSlideActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slides'] });
      toast({
        title: "Success",
        description: "Slide visibility updated successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Error toggling slide visibility:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update slide visibility",
        variant: "destructive",
      });
    },
  });
  
  // Delete slide mutation
  const deleteSlideMutation = useMutation({
    mutationFn: deleteSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slides'] });
      toast({
        title: "Success",
        description: "Slide deleted successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting slide:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete slide",
        variant: "destructive",
      });
    },
  });
  
  // Reorder slides mutation
  const reorderSlidesMutation = useMutation({
    mutationFn: (reorderedSlides: SlideImage[]) => {
      const updates = reorderedSlides.map((slide, index) => ({
        id: slide.id,
        display_order: index + 1
      }));
      return updateSlidesOrder(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slides'] });
      toast({
        title: "Success",
        description: "Slides reordered successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Error reordering slides:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reorder slides",
        variant: "destructive",
      });
    },
  });
  
  return {
    slides,
    isLoading,
    error,
    refetch,
    createSlide: createSlideMutation.mutate,
    updateSlide: updateSlideMutation.mutate,
    toggleSlideActive: toggleSlideActiveMutation.mutate,
    deleteSlide: deleteSlideMutation.mutate,
    reorderSlides: reorderSlidesMutation.mutate,
    isCreating: createSlideMutation.isPending,
    isUpdating: updateSlideMutation.isPending,
    isDeleting: deleteSlideMutation.isPending,
    isReordering: reorderSlidesMutation.isPending,
    isTogglingActive: toggleSlideActiveMutation.isPending
  };
}
