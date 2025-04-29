
import React, { useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface ProfileAvatarProps {
  photoUrl?: string | null;
  firstName?: string;
  lastName?: string;
  onFileChange: (file: File) => void;
  isUploading: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProfileAvatar({ 
  photoUrl, 
  firstName, 
  lastName, 
  onFileChange,
  isUploading,
  size = "md"
}: ProfileAvatarProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (!file.type.startsWith('image/')) {
        return;
      }
      
      onFileChange(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxSize: 10485760, // 10MB
    multiple: false
  });

  // Update isDragging state when drag state changes
  React.useEffect(() => {
    setIsDragging(isDragActive);
  }, [isDragActive]);
  
  // Determine avatar size based on prop
  const avatarSizeClasses = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-24 w-24" // Increased size for better visibility
  };
  
  const avatarSize = avatarSizeClasses[size];
  
  // Adjust icon size based on avatar size
  const iconSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  
  // Adjust spinner size based on avatar size
  const spinnerSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className="flex flex-col items-center space-y-1">
      <div 
        {...getRootProps()} 
        className={`relative cursor-pointer hover:opacity-90 transition-all group ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
        aria-label="Upload profile picture"
      >
        <Avatar className={`${avatarSize} border-2 border-primary/20 shadow-md transition-transform group-hover:scale-105`}>
          {(preview || photoUrl) ? (
            <AvatarImage 
              src={preview || photoUrl || ""} 
              alt="Profile" 
              className="object-cover"
            />
          ) : (
            <AvatarFallback className="text-sm bg-primary/5 text-primary">
              {firstName?.[0] || ""}{lastName?.[0] || ""}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 rounded-full transition-opacity ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {isUploading ? (
            <div className={`${spinnerSize} animate-spin rounded-full border-2 border-white border-t-transparent`} />
          ) : (
            <Camera className={`${iconSize} text-white`} />
          )}
        </div>
        
        <input
          {...getInputProps()}
          id="avatar-upload"
          disabled={isUploading}
          aria-label="Upload profile image"
        />
      </div>
      
      <p className="text-[10px] text-muted-foreground text-center whitespace-nowrap">
        {isUploading ? "Uploading..." : "Change photo"}
      </p>
    </div>
  );
}
