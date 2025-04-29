import React, { useRef, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Image, Upload } from "lucide-react";
import { format } from "date-fns";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createEvent } from "@/lib/eventHelpers";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { EVENT_TYPES, LOCATION_TYPES } from "@/lib/eventCategories";
import { useEventImageUpload } from "@/hooks/useEventImageUpload";
import { CalendarEvent } from "@/lib/types";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  start_datetime: z.date({ required_error: "Start date is required" }),
  end_datetime: z.date({ required_error: "End date is required" }),
  event_type: z.string().min(1, "Event type is required"),
  location_type: z.enum(["physical", "virtual", "hybrid"]),
  physical_address: z.string().optional(),
  virtual_meeting_url: z.string().url().optional().or(z.literal('')),
  image_url: z.string().url().optional().or(z.literal('')),
  is_public: z.boolean().default(true),
});

export interface CreateEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated?: () => void;
}

export function CreateEventDialog({
  isOpen,
  onOpenChange,
  onEventCreated,
}: CreateEventDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { uploadImage, isUploading, progress, error, resetUpload } = useEventImageUpload();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      event_type: "general",
      location_type: "physical" as const,
      physical_address: "",
      virtual_meeting_url: "",
      image_url: "",
      is_public: true,
    },
  });
  
  const locationType = form.watch("location_type");
  const imageUrl = form.watch("image_url");
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (!file) {
      setUploadError("No file selected");
      return;
    }
    
    try {
      console.log("File selected for upload:", file.name, file.size, file.type);
      
      const uploadedUrl = await uploadImage(file);
      
      if (uploadedUrl) {
        console.log("Image uploaded successfully:", uploadedUrl);
        form.setValue("image_url", uploadedUrl);
        toast({
          title: "Image uploaded",
          description: "Image successfully uploaded and attached to event",
        });
      } else if (error) {
        setUploadError(error);
        throw new Error(error);
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image. Please try again.";
      setUploadError(errorMessage);
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create an event",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const eventData = {
        title: values.title,
        description: values.description || "",
        start_datetime: values.start_datetime.toISOString(),
        end_datetime: values.end_datetime.toISOString(),
        event_type: values.event_type,
        location_type: values.location_type,
        physical_address: values.physical_address || "",
        virtual_meeting_url: values.virtual_meeting_url || "",
        image_url: values.image_url || "",
        is_public: values.is_public,
        created_by: user.id,
      };
      
      console.log("Creating event with data:", eventData);
      const { success, error } = await createEvent(eventData);
      
      if (!success) throw error;
      
      toast({
        title: "Event created",
        description: "Your event has been created successfully",
      });
      
      form.reset();
      resetUpload();
      setUploadError(null);
      onOpenChange(false);
      
      if (onEventCreated) {
        onEventCreated();
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Enter event details below. Required fields are marked with an asterisk (*).
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Event title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Event description" 
                      className="resize-none min-h-24" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_datetime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date/Time *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                            type="button"
                          >
                            {field.value ? (
                              format(field.value, "yyyy-MM-dd HH:mm")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              const currentDate = field.value || new Date();
                              date.setHours(currentDate.getHours());
                              date.setMinutes(currentDate.getMinutes());
                              field.onChange(date);
                            }
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                        <div className="p-3 border-t border-border">
                          <Input
                            type="time"
                            value={field.value ? format(field.value, "HH:mm") : ""}
                            onChange={(e) => {
                              const date = field.value || new Date();
                              const [hours, minutes] = e.target.value.split(':');
                              date.setHours(parseInt(hours, 10));
                              date.setMinutes(parseInt(minutes, 10));
                              field.onChange(date);
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="end_datetime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date/Time *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                            type="button"
                          >
                            {field.value ? (
                              format(field.value, "yyyy-MM-dd HH:mm")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              const currentDate = field.value || new Date();
                              date.setHours(currentDate.getHours());
                              date.setMinutes(currentDate.getMinutes());
                              field.onChange(date);
                            }
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                        <div className="p-3 border-t border-border">
                          <Input
                            type="time"
                            value={field.value ? format(field.value, "HH:mm") : ""}
                            onChange={(e) => {
                              const date = field.value || new Date();
                              const [hours, minutes] = e.target.value.split(':');
                              date.setHours(parseInt(hours, 10));
                              date.setMinutes(parseInt(minutes, 10));
                              field.onChange(date);
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="event_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EVENT_TYPES.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Type *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a location type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOCATION_TYPES.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {(locationType === "physical" || locationType === "hybrid") && (
              <FormField
                control={form.control}
                name="physical_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Physical Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {(locationType === "virtual" || locationType === "hybrid") && (
              <FormField
                control={form.control}
                name="virtual_meeting_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Virtual Meeting URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Zoom, Google Meet, or other meeting link
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Image</FormLabel>
                  <div className="space-y-2">
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      id="event-image"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    <div className="grid grid-cols-1 gap-2">
                      {imageUrl ? (
                        <div className="relative w-full h-48 rounded-md overflow-hidden border border-border">
                          <img 
                            src={imageUrl} 
                            alt="Event preview" 
                            className="w-full h-full object-cover"
                            onError={() => {
                              console.error("Image failed to load:", imageUrl);
                              form.setValue("image_url", "");
                              toast({
                                title: "Image error",
                                description: "Failed to load the selected image. Please try another one.",
                                variant: "destructive",
                              });
                            }}
                          />
                          <div className="absolute bottom-2 right-2 flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                            >
                              Change
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                form.setValue("image_url", "");
                                resetUpload();
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-48 flex flex-col items-center justify-center gap-2 border-dashed"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <>
                              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                              <span>Uploading... {progress}%</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-8 w-8 text-muted-foreground" />
                              <span>Click to upload event image</span>
                              <span className="text-xs text-muted-foreground">
                                PNG, JPG or GIF, max 15MB
                              </span>
                            </>
                          )}
                        </Button>
                      )}

                      {uploadError && (
                        <div className="text-destructive text-sm mt-1">
                          {uploadError}
                        </div>
                      )}

                      <FormControl>
                        <Input 
                          placeholder="Or enter image URL" 
                          {...field}
                          className={imageUrl ? "hidden" : ""}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="is_public"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "public")}
                    defaultValue={field.value ? "public" : "private"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
