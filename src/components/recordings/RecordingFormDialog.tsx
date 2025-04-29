
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createRecording, updateRecording, getEventsForRecordings } from "@/lib/recordingsHelpers";
import { useToast } from "@/hooks/use-toast";
import { PastRecording } from "@/lib/types";
import { CalendarIcon, Clock, Upload, X, Video, AlertCircle, Info } from "lucide-react";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RecordingFormDialogProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  recordingToEdit?: PastRecording | null;
  onSuccess?: () => void;
}

const VIDEO_SOURCES = [
  { id: 'youtube', name: 'YouTube' },
  { id: 'vimeo', name: 'Vimeo' },
  { id: 'google_drive', name: 'Google Drive' },
  { id: 'custom', name: 'Custom URL' }
];

const RecordingFormDialog = ({
  isOpen,
  onOpenChange,
  recordingToEdit,
  onSuccess
}: RecordingFormDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [events, setEvents] = useState<{id: string, title: string}[]>([]);
  const [videoSource, setVideoSource] = useState('youtube');
  const [googleDriveInfo, setGoogleDriveInfo] = useState({
    showInfo: false
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    event_id: "",
    recording_url: "",
    duration_hours: "1",
    duration_minutes: "0",
    presenter_name: "",
    recorded_at: format(new Date(), "yyyy-MM-dd"),
    is_public: true
  });

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventData = await getEventsForRecordings();
        setEvents(eventData);
      } catch (error) {
        console.error("Error loading events:", error);
      }
    };
    
    loadEvents();
  }, []);

  useEffect(() => {
    if (recordingToEdit) {
      const recordedDate = recordingToEdit.recorded_at 
        ? format(new Date(recordingToEdit.recorded_at), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd");
      
      const totalSeconds = recordingToEdit.duration || 0;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      
      // Detect video source
      let detectedSource = 'custom';
      if (recordingToEdit.recording_url) {
        if (recordingToEdit.recording_url.includes('youtube.com') || recordingToEdit.recording_url.includes('youtu.be')) {
          detectedSource = 'youtube';
        } else if (recordingToEdit.recording_url.includes('vimeo.com')) {
          detectedSource = 'vimeo';
        } else if (recordingToEdit.recording_url.includes('drive.google.com')) {
          detectedSource = 'google_drive';
        }
      }

      setFormValues({
        title: recordingToEdit.title,
        description: recordingToEdit.description || "",
        event_id: recordingToEdit.event_id,
        recording_url: recordingToEdit.recording_url,
        duration_hours: hours.toString(),
        duration_minutes: minutes.toString(),
        presenter_name: recordingToEdit.presenter_name || "",
        recorded_at: recordedDate,
        is_public: recordingToEdit.is_public
      });
      
      setVideoSource(detectedSource);
      
      if (recordingToEdit.thumbnail_url) {
        setThumbnailPreview(recordingToEdit.thumbnail_url);
      }
    }
  }, [recordingToEdit]);

  const resetForm = () => {
    setFormValues({
      title: "",
      description: "",
      event_id: "",
      recording_url: "",
      duration_hours: "1",
      duration_minutes: "0",
      presenter_name: "",
      recorded_at: format(new Date(), "yyyy-MM-dd"),
      is_public: true
    });
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setVideoSource('youtube');
    setErrorMessage(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormValues((prev) => ({ ...prev, is_public: checked }));
  };

  const handleVideoSourceChange = (source: string) => {
    setVideoSource(source);
    if (source === 'google_drive') {
      setGoogleDriveInfo({
        showInfo: true
      });
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setThumbnailFile(file);
        const previewUrl = URL.createObjectURL(file);
        setThumbnailPreview(previewUrl);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPG, PNG, GIF)",
          variant: "destructive"
        });
      }
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const validateGoogleDriveUrl = (url: string) => {
    // Basic validation for Google Drive URLs
    return url.includes('drive.google.com');
  };

  const formatGoogleDriveUrl = (url: string) => {
    // Extract file ID if needed and format for embedding
    if (url.includes('/file/d/')) {
      const fileIdMatch = url.match(/\/file\/d\/([^\/]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
      }
    }
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Calculate duration in seconds
      const hours = parseInt(formValues.duration_hours) || 0;
      const minutes = parseInt(formValues.duration_minutes) || 0;
      const totalSeconds = hours * 3600 + minutes * 60;
      
      // Format recording URL based on video source
      let finalUrl = formValues.recording_url;
      if (videoSource === 'google_drive' && validateGoogleDriveUrl(formValues.recording_url)) {
        finalUrl = formatGoogleDriveUrl(formValues.recording_url);
      }
      
      const recordingData = {
        title: formValues.title,
        description: formValues.description,
        event_id: formValues.event_id,
        recording_url: finalUrl,
        duration: totalSeconds,
        presenter_name: formValues.presenter_name,
        recorded_at: new Date(formValues.recorded_at).toISOString(),
        is_public: formValues.is_public,
        thumbnail_url: thumbnailPreview
      };
      
      console.log("Submitting recording data:", recordingData);
      let result;
      
      if (recordingToEdit) {
        result = await updateRecording(
          recordingToEdit.id,
          recordingData,
          thumbnailFile
        );
      } else {
        result = await createRecording(
          recordingData,
          thumbnailFile
        );
      }
      
      if (result.success) {
        toast({
          title: recordingToEdit ? "Recording updated" : "Recording created",
          description: `The recording has been successfully ${recordingToEdit ? "updated" : "created"}`
        });
        
        if (onSuccess) onSuccess();
        onOpenChange?.(false);
        resetForm();
      } else {
        console.error("Error result:", result.error);
        setErrorMessage(result.error?.message || "An unknown error occurred");
        throw new Error(result.error?.message || "An error occurred");
      }
    } catch (error: any) {
      console.error("Error saving recording:", error);
      setErrorMessage(error.message || "An error occurred while saving the recording");
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving the recording",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{recordingToEdit ? "Edit Recording" : "Add New Recording"}</DialogTitle>
        </DialogHeader>
        
        {errorMessage && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Recording Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter recording title"
              value={formValues.title}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter recording description"
              value={formValues.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="event_id">Related Event</Label>
            <Select
              value={formValues.event_id}
              onValueChange={(value) => handleSelectChange("event_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None / Independent Recording</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="video_source">Video Source</Label>
              {videoSource === 'google_drive' && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" type="button" className="h-6 px-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Make sure your Google Drive video is shared with "Anyone with the link" 
                        to make it accessible for viewing.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Select
              value={videoSource}
              onValueChange={handleVideoSourceChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select video source" />
              </SelectTrigger>
              <SelectContent>
                {VIDEO_SOURCES.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="recording_url">Video URL</Label>
              {videoSource === 'google_drive' && googleDriveInfo.showInfo && (
                <div className="text-xs text-amber-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Make sure video is shared publicly
                </div>
              )}
            </div>
            <Input
              id="recording_url"
              name="recording_url"
              placeholder={`Enter ${videoSource === 'google_drive' ? 'Google Drive' : videoSource} video URL`}
              value={formValues.recording_url}
              onChange={handleInputChange}
              required
            />
            {videoSource === 'google_drive' && (
              <p className="text-xs text-muted-foreground">
                Example: https://drive.google.com/file/d/FILEID/view
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="presenter_name">Presenter Name</Label>
              <Input
                id="presenter_name"
                name="presenter_name"
                placeholder="Enter presenter name"
                value={formValues.presenter_name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recorded_at">Recorded On</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="recorded_at"
                  name="recorded_at"
                  type="date"
                  className="pl-10"
                  value={formValues.recorded_at}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Duration</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration_hours" className="text-xs">Hours</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="duration_hours"
                    name="duration_hours"
                    type="number"
                    min="0"
                    max="10"
                    className="pl-10"
                    value={formValues.duration_hours}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_minutes" className="text-xs">Minutes</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="duration_minutes"
                    name="duration_minutes"
                    type="number"
                    min="0"
                    max="59"
                    className="pl-10"
                    value={formValues.duration_minutes}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="thumbnail" className="flex items-center gap-1 mb-2">
              Thumbnail Image
            </Label>
            <div 
              className={`border-2 border-dashed rounded-md p-6 transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}`} 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Button 
                      variant="outline" 
                      type="button" 
                      className="w-full mb-2" 
                      onClick={() => document.getElementById('thumbnail')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" /> Upload from computer
                    </Button>
                    <input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      style={{ display: 'none' }}
                    />
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF, max 5MB
                    </p>
                  </div>
                  
                  {thumbnailPreview && (
                    <div className="flex justify-end">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={removeThumbnail}
                        className="flex items-center"
                      >
                        <X className="h-4 w-4 mr-2" /> Remove Image
                      </Button>
                    </div>
                  )}
                </div>
                
                {!thumbnailPreview && (
                  <div className="text-center py-4">
                    <Video className="h-10 w-10 mx-auto mb-2 text-muted-foreground/60" />
                    <p className="text-sm text-muted-foreground font-medium">Drag and drop an image here</p>
                    <p className="text-xs text-muted-foreground">or click the upload button above</p>
                  </div>
                )}
                
                {thumbnailPreview && (
                  <div className="relative w-full h-48 overflow-hidden rounded-md border bg-muted/20">
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail preview" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="is_public" 
              checked={formValues.is_public}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="is_public" className="cursor-pointer">
              Make this recording public
            </Label>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange?.(false);
                resetForm();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : recordingToEdit ? "Update Recording" : "Create Recording"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordingFormDialog;
