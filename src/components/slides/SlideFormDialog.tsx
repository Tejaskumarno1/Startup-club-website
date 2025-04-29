import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { SlideImage } from "@/lib/types";
import { AlertCircle, Upload, X, ImageIcon, Eye, EyeOff } from "lucide-react";

interface SlideFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (slideData: Partial<SlideImage> & { imageFile?: File | null }) => void;
  slide?: SlideImage | null;
  isSubmitting: boolean;
}

export function SlideFormDialog({ 
  open, 
  onClose, 
  onSubmit, 
  slide,
  isSubmitting 
}: SlideFormDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    is_active: true,
    imageFile: null as File | null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  useEffect(() => {
    if (open && slide) {
      setFormData({
        title: slide.title || "",
        description: slide.description || "",
        image_url: slide.image_url || "",
        is_active: slide.is_active !== false,
        imageFile: null,
      });
      setImagePreview(null); 
      setUploadError(null);
    } else if (open && !slide) {
      setFormData({
        title: "",
        description: "",
        image_url: "",
        is_active: true,
        imageFile: null,
      });
      setImagePreview(null);
      setUploadError(null);
    }
  }, [open, slide]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_active: checked
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setUploadError("Please select a valid image file (JPEG, PNG, GIF, or WEBP)");
        return;
      }
      
      if (file.size > 15 * 1024 * 1024) {
        setUploadError("File size must be less than 15MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        image_url: "",
      }));
    }
  };
  
  const handleClearImage = () => {
    setFormData(prev => ({ 
      ...prev, 
      image_url: "", 
      imageFile: null 
    }));
    setImagePreview(null);
    setUploadError(null);
  };
  
  const validateForm = () => {
    if (!formData.title.trim()) {
      return false;
    }
    
    if (slide) {
      return true;
    }
    
    return !!(formData.imageFile || formData.image_url);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit(formData);
  };
  
  const isEditing = !!slide;
  const dialogTitle = isEditing ? "Edit Slide" : "Add New Slide";
  const dialogDescription = isEditing 
    ? "Update the details of this slide." 
    : "Create a new slide for the Year in Review section.";
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Slide Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter slide title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              placeholder="Add a brief description for this slide"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="image">Slide Image</Label>
              <div className="flex items-center gap-2">
                <Switch 
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="is_active" className="cursor-pointer text-sm flex items-center">
                  {formData.is_active ? (
                    <>
                      <Eye className="h-3.5 w-3.5 mr-1" /> Visible
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5 mr-1" /> Hidden
                    </>
                  )}
                </Label>
              </div>
            </div>
            
            {(formData.image_url || imagePreview) && (
              <div className="relative aspect-video mb-2 rounded-md overflow-hidden border border-gray-200">
                <img 
                  src={imagePreview || formData.image_url} 
                  alt={formData.title || "Slide preview"} 
                  className="object-cover w-full h-full"
                  onError={() => {
                    setFormData(prev => ({ ...prev, image_url: "" }));
                  }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleClearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {uploadError && (
              <Alert variant="destructive" className="mb-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
            
            {!imagePreview && !formData.image_url && (
              <div className="flex items-center justify-center w-full">
                <label 
                  htmlFor="image-upload" 
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 mb-3 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF or WEBP (MAX. 15MB)
                    </p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                  />
                </label>
              </div>
            )}
            
            {!formData.imageFile && !imagePreview && (
              <div className="mt-4">
                <Label htmlFor="image_url">Or enter an image URL</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
              </div>
            )}
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !validateForm()}
              className="bg-primary hover:bg-primary-dark"
            >
              {isSubmitting 
                ? "Saving..." 
                : isEditing 
                  ? "Save Changes" 
                  : "Add Slide"
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
