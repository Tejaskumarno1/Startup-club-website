
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

import { CalendarEvent } from "@/lib/types";
import { EVENT_TYPES, LOCATION_TYPES } from "@/lib/eventCategories";

// Form schema with validation
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  start_datetime: z.date({ required_error: "Start date is required" }),
  end_datetime: z.date({ required_error: "End date is required" }),
  event_type: z.string().min(1, "Event type is required"),
  location_type: z.string().min(1, "Location type is required"),
  physical_address: z.string().optional(),
  virtual_meeting_url: z.string().url().optional().or(z.literal('')),
  image_url: z.string().url().optional().or(z.literal('')),
  is_public: z.boolean().default(true),
  highlights: z.array(z.string()).optional(),
});

interface EventFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
  defaultValues?: Partial<CalendarEvent>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function EventForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading = false,
  submitLabel = "Create Event",
}: EventFormProps) {
  const [newHighlight, setNewHighlight] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      start_datetime: defaultValues?.start_datetime ? new Date(defaultValues.start_datetime) : undefined,
      end_datetime: defaultValues?.end_datetime ? new Date(defaultValues.end_datetime) : undefined,
      event_type: defaultValues?.event_type || "general",
      location_type: defaultValues?.location_type || "physical",
      physical_address: defaultValues?.physical_address || "",
      virtual_meeting_url: defaultValues?.virtual_meeting_url || "",
      image_url: defaultValues?.image_url || "",
      is_public: defaultValues?.is_public ?? true,
      highlights: defaultValues?.highlights || [],
    },
  });
  
  // Show/hide fields based on location type
  const locationType = form.watch("location_type");
  const highlights = form.watch("highlights") || [];
  
  const handleAddHighlight = () => {
    if (newHighlight.trim() && !highlights.includes(newHighlight.trim())) {
      form.setValue("highlights", [...highlights, newHighlight.trim()]);
      setNewHighlight("");
    }
  };
  
  const handleRemoveHighlight = (highlight: string) => {
    form.setValue(
      "highlights", 
      highlights.filter(h => h !== highlight)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
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
        
        {/* Description */}
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
          {/* Start Date/Time */}
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
                      onSelect={field.onChange}
                      initialFocus
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
          
          {/* End Date/Time */}
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
                      onSelect={field.onChange}
                      initialFocus
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
          {/* Event Type */}
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
          
          {/* Location Type */}
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
        
        {/* Physical Address - show only if location type is physical or hybrid */}
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
        
        {/* Virtual Meeting URL - show only if location type is virtual or hybrid */}
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
        
        {/* Image URL */}
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Event Highlights */}
        <div className="space-y-2">
          <FormLabel>Event Highlights</FormLabel>
          <div className="flex gap-2">
            <Input
              placeholder="Add a key highlight..."
              value={newHighlight}
              onChange={(e) => setNewHighlight(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="button" 
              onClick={handleAddHighlight}
              size="sm"
            >
              Add
            </Button>
          </div>
          
          {highlights.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {highlights.map((highlight, index) => (
                <Badge key={index} variant="outline" className="py-1.5">
                  {highlight}
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(highlight)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {/* Visibility */}
        <FormField
          control={form.control}
          name="is_public"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Public Event</FormLabel>
                <FormDescription>
                  Make this event visible to everyone
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
