
import React, { useState, useRef } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { useLogoUpload } from "@/hooks/useLogoUpload";

interface LogoUploaderProps {
  onImageUploaded: (url: string) => void;
  existingImageUrl?: string;
}

export function LogoUploader({ onImageUploaded, existingImageUrl }: LogoUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl || null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadLogo, isUploading, progress, error, resetUpload } = useLogoUpload();

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview image before upload
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploadError(null);

    try {
      console.log("File selected for upload:", file.name, file.size, file.type);
      
      // Upload image
      const imageUrl = await uploadLogo(file);
      
      if (imageUrl) {
        console.log("Logo uploaded successfully:", imageUrl);
        onImageUploaded(imageUrl);
        toast({
          title: "Upload successful",
          description: "Logo has been successfully uploaded",
        });
      } else {
        setPreviewUrl(existingImageUrl || null);
        setUploadError(error || "Failed to upload logo");
        toast({
          title: "Upload failed",
          description: "Failed to upload logo. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error in file upload:", err);
      setPreviewUrl(existingImageUrl || null);
      const errorMessage = err instanceof Error ? err.message : "Unknown error during upload";
      setUploadError(errorMessage);
      toast({
        title: "Upload failed",
        description: `Error: ${errorMessage}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    onImageUploaded("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    resetUpload();
    setUploadError(null);
  };

  return (
    <div className="flex flex-col items-center">
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        className="hidden"
      />

      {previewUrl ? (
        <div className="mb-4 relative">
          <img 
            src={previewUrl} 
            alt="Logo preview" 
            className="w-32 h-32 object-contain rounded-lg border border-gray-200"
          />
          <Button 
            type="button"
            variant="destructive" 
            size="icon" 
            className="absolute -top-2 -right-2 rounded-full h-6 w-6" 
            onClick={removeImage}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div 
          onClick={triggerFileInput}
          className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 mb-4 cursor-pointer hover:border-primary transition-colors"
        >
          <Camera className="h-8 w-8 mb-2" />
          <span className="text-xs text-center">Upload logo</span>
        </div>
      )}

      {isUploading && (
        <div className="w-full max-w-xs">
          <Progress value={progress} className="h-2 mb-2" />
          <p className="text-xs text-center text-gray-500">Uploading... {progress}%</p>
        </div>
      )}

      {uploadError && !isUploading && (
        <p className="text-xs text-destructive mt-1">{uploadError}</p>
      )}

      {!previewUrl && !isUploading && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={triggerFileInput}
        >
          <Upload className="h-4 w-4 mr-2" />
          Select logo
        </Button>
      )}

      <p className="text-xs text-gray-500 mt-2">
        Supported formats: JPEG, PNG, GIF, SVG, WEBP. Max size: 15MB
      </p>
    </div>
  );
}
