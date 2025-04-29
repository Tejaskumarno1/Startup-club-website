
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminPageTemplate } from "@/components/admin/AdminPageTemplate";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Image, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useSlides } from "@/hooks/useSlides";
import { useSlideImageUpload } from "@/hooks/useSlideImageUpload";
import { SlideFormDialog } from "@/components/slides/SlideFormDialog";
import { SortableSlideCard } from "@/components/slides/SortableSlideCard";
import { SlidesEmptyState } from "@/components/slides/SlidesEmptyState";
import { SlideImage } from "@/lib/types";

const ManageSlides = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const { 
    slides, 
    isLoading, 
    error, 
    refetch, 
    createSlide, 
    updateSlide, 
    deleteSlide, 
    reorderSlides,
    toggleSlideActive,
    isCreating,
    isUpdating,
    isDeleting,
    isReordering,
    isTogglingActive
  } = useSlides();
  
  const { uploadImage } = useSlideImageUpload();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<SlideImage | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Check admin status with a debug log
    console.log("Current admin status:", isAdmin);
    
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [isAdmin, navigate, toast]);

  const handleAddSlide = () => {
    setSelectedSlide(null);
    setDialogOpen(true);
  };

  const handleEditSlide = (slide: SlideImage) => {
    setSelectedSlide(slide);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSlide(null);
  };

  const handleDeleteSlide = async (slideId: string) => {
    try {
      await deleteSlide(slideId);
      toast({
        title: "Success",
        description: "Slide deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting slide:", error);
      toast({
        title: "Error",
        description: "Failed to delete slide. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleSlideActive = async (slideId: string, isActive: boolean) => {
    try {
      // Fix: Pass object with id and isActive properties instead of just slideId
      await toggleSlideActive({ 
        id: slideId, 
        isActive: isActive 
      });
      
      // Display feedback to user
      toast({
        title: "Success",
        description: isActive ? "Slide activated" : "Slide deactivated",
      });
    } catch (error) {
      console.error("Error toggling slide visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update slide visibility. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex(slide => slide.id === active.id);
      const newIndex = slides.findIndex(slide => slide.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedSlides = arrayMove(slides, oldIndex, newIndex);
        
        const updatedSlides = reorderedSlides.map((slide, index) => ({
          ...slide,
          display_order: index + 1
        }));
        
        reorderSlides(updatedSlides);
      }
    }
  };

  const handleFormSubmit = async (formData: Partial<SlideImage> & { imageFile?: File | null }) => {
    try {
      let imageUrl = formData.image_url;
      
      if (formData.imageFile) {
        const uploadedUrl = await uploadImage(formData.imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
      
      if (selectedSlide) {
        updateSlide({
          id: selectedSlide.id,
          data: {
            title: formData.title,
            description: formData.description,
            image_url: imageUrl,
            is_active: formData.is_active
          }
        });
        
        toast({
          title: "Success",
          description: "Slide updated successfully",
        });
      } else {
        const newOrder = slides.length > 0 
          ? Math.max(...slides.map(slide => slide.display_order || 0)) + 1 
          : 1;
        
        createSlide({
          title: formData.title || "",
          description: formData.description,
          image_url: imageUrl || "",
          display_order: newOrder,
          is_active: true,
        });
        
        toast({
          title: "Success",
          description: "New slide created successfully",
        });
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving slide:", error);
      toast({
        title: "Error",
        description: "Failed to save slide. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AdminPageTemplate
        title="Manage Slides"
        description="Add, edit, and arrange slides for the Year in Review section on the homepage."
        icon={Image}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminPageTemplate>
    );
  }

  if (error) {
    return (
      <AdminPageTemplate
        title="Manage Slides"
        description="Add, edit, and arrange slides for the Year in Review section on the homepage."
        icon={Image}
      >
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load slides"}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={() => refetch()} variant="outline">Retry</Button>
        </div>
      </AdminPageTemplate>
    );
  }

  return (
    <AdminPageTemplate
      title="Manage Slides"
      description="Add, edit, and arrange slides for the Year in Review section on the homepage."
      icon={Image}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Year in Review Slides</h2>
          <Button 
            onClick={handleAddSlide}
            className="bg-primary hover:bg-primary-dark transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Slide
          </Button>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-600 mb-2">
            <span className="font-medium">Tip:</span> Drag and drop slides to reorder them. Changes are saved automatically.
          </p>
        </div>
        
        {slides.length === 0 ? (
          <SlidesEmptyState onAddSlide={handleAddSlide} />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={slides.map(slide => slide.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {slides.map((slide) => (
                  <SortableSlideCard
                    key={slide.id}
                    slide={slide}
                    onEdit={() => handleEditSlide(slide)}
                    onDelete={() => handleDeleteSlide(slide.id)}
                    onToggleActive={handleToggleSlideActive}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        
        <SlideFormDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          onSubmit={handleFormSubmit}
          slide={selectedSlide}
          isSubmitting={isCreating || isUpdating}
        />
      </div>
    </AdminPageTemplate>
  );
};

export default ManageSlides;
