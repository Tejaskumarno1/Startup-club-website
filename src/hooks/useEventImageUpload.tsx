import { useState } from "react";
import { uploadEventImage, updateEventImageInDb } from "@/lib/api/storageApi";
import { useToast } from "@/hooks/use-toast";

/**
 * Custom hook to handle event image uploads
 */
export function useEventImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const uploadImage = async (file: File | null, eventId?: string): Promise<string | null> => {
    if (!file) {
      setError("No file selected");
      toast({
        title: "Upload error",
        description: "No file selected",
        variant: "destructive",
      });
      return null;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      const errorMessage = "Please select a valid image file (JPEG, PNG, GIF, or WEBP)";
      setError(errorMessage);
      toast({
        title: "Invalid file type",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
    
    // Validate file size (15MB max)
    if (file.size > 15 * 1024 * 1024) {
      const errorMessage = "File size must be less than 15MB";
      setError(errorMessage);
      toast({
        title: "File too large",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);
    setProgress(10);
    setError(null);

    try {
      console.log("Starting file upload, file:", file.name, file.size, file.type);
      
      // Generate a valid UUID for the event instead of using a placeholder
      // This ensures we have a valid UUID even for temporary uploads
      const uploadEventId = eventId || crypto.randomUUID();
      console.log("Using event ID for upload:", uploadEventId);
      
      setProgress(30);

      // Wrap upload in retry logic
      let attempts = 0;
      let imageUrl = null;
      
      while (attempts < 3 && !imageUrl) {
        attempts++;
        try {
          setProgress(30 + (attempts - 1) * 20); // Increments for better feedback
          imageUrl = await uploadEventImage(file, uploadEventId);
          if (!imageUrl) throw new Error("Upload failed - no URL returned");
        } catch (retryErr) {
          console.error(`Upload attempt ${attempts} failed:`, retryErr);
          if (attempts >= 3) throw retryErr;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
        }
      }
      
      if (!imageUrl) {
        throw new Error("Failed to upload image after multiple attempts");
      }
      
      // If we have an actual event ID, update the database record
      if (eventId) {
        console.log("Updating event record with image URL:", imageUrl);
        const updateSuccess = await updateEventImageInDb(eventId, imageUrl);
        
        if (!updateSuccess) {
          console.warn("Image uploaded but database update failed");
        }
      }
      
      // Upload completed
      setProgress(100);
      console.log("Upload complete, URL:", imageUrl);

      toast({
        title: "Upload successful",
        description: "Image has been successfully uploaded",
      });
      
      return imageUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error during upload";
      console.error("Upload error:", errorMessage);
      setError(errorMessage);
      
      toast({
        title: "Upload failed",
        description: `Error: ${errorMessage}. Please check your connection and try again.`,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setProgress(0);
    setError(null);
  };

  return {
    uploadImage,
    resetUpload,
    isUploading,
    progress,
    error
  };
}
