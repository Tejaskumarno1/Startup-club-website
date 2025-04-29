
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Custom hook to handle startup logo uploads
 */
export function useStartupImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const uploadLogo = async (file: File | null): Promise<string | null> => {
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
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      const errorMessage = "Please select a valid image file (JPEG, PNG, GIF, SVG, or WEBP)";
      setError(errorMessage);
      toast({
        title: "Invalid file type",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
    
    // Validate file size (15MB max, increased from 5MB)
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
      console.log("Starting logo upload, file:", file.name, file.size, file.type);
      
      // Check if startups bucket exists
      try {
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('startups');
        
        // Create bucket if it doesn't exist
        if (bucketError && bucketError.message.includes('not found')) {
          await supabase.storage.createBucket('startups', {
            public: true,
            allowedMimeTypes: validTypes,
            fileSizeLimit: 15 * 1024 * 1024, // 15MB, increased from 5MB
          });
        }
      } catch (bucketErr) {
        console.log("Bucket check/create error:", bucketErr);
        // Continue anyway, might be permissions issue but upload can still work
      }
      
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      setProgress(30);
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from('startups')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('startups')
        .getPublicUrl(filePath);
      
      const imageUrl = publicUrlData.publicUrl;
      
      // Upload completed
      setProgress(100);
      console.log("Upload complete, URL:", imageUrl);

      toast({
        title: "Upload successful",
        description: "Logo has been successfully uploaded",
      });
      
      return imageUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error during upload";
      console.error("Upload error:", errorMessage);
      setError(errorMessage);
      
      toast({
        title: "Upload failed",
        description: `Error: ${errorMessage}. Please try again.`,
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
    uploadLogo,
    resetUpload,
    isUploading,
    progress,
    error
  };
}
