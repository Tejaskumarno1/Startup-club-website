
import { useState } from "react";
import { uploadSlideImage } from "@/lib/api/storageApi";
import { useToast } from "@/hooks/use-toast";

/**
 * Custom hook to handle slide image uploads
 */
export function useSlideImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const uploadImage = async (file: File | null): Promise<string | null> => {
    if (!file) {
      setError("No file selected");
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
      // First checkpoint
      setProgress(30);
      
      // The uploadSlideImage function returns a string (URL) directly, not an object with url property
      const imageUrl = await uploadSlideImage(file);
      
      // Upload completed
      setProgress(100);
      toast({
        title: "Upload complete",
        description: "Image successfully uploaded",
      });
      
      return imageUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error during upload";
      setError(errorMessage);
      toast({
        title: "Upload failed",
        description: errorMessage,
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
