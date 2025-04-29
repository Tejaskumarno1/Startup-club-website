import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Calendar, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Copy,
  Users,
  ImageIcon,
  Clock,
  CalendarIcon,
  ChevronDown,
  Upload,
  AlertCircle
} from "lucide-react";
import { format, parseISO } from "date-fns";

import { AdminPageTemplate } from "@/components/admin/AdminPageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import { EventStatisticsDialog } from "@/components/events/EventStatisticsDialog";
import { EventForm } from "@/components/events/EventForm";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { 
  getEvents, 
  getEvent, 
  updateEvent, 
  duplicateEvent, 
  deleteEvent,
  getEventsOverviewStats,
  exportEventsToCSV,
  getMostPopularEvents 
} from "@/lib/eventHelpers";

import { useEventImageUpload } from "@/hooks/useEventImageUpload";
import { useEvents } from "@/hooks/useEvents";
import { CalendarEvent } from "@/lib/types";
import { EVENT_TYPES, getEventTypeColor } from "@/lib/eventCategories";

const ManageEvents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [uploadingEvent, setUploadingEvent] = useState<CalendarEvent | null>(null);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [statEvent, setStatEvent] = useState<CalendarEvent | null>(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    totalAttendees: 0,
  });
  const [popularEvents, setPopularEvents] = useState<CalendarEvent[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const { uploadImage, isUploading, progress, error, resetUpload } = useEventImageUpload();
  const { toast } = useToast();
  
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      handleEditEvent(editId);
    }
    
    fetchEvents();
    fetchStats();
    fetchPopularEvents();
  }, [searchParams]);
  
  useEffect(() => {
    if (!events.length) return;
    
    let filtered = [...events];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(term) || 
        (event.description || '').toLowerCase().includes(term)
      );
    }
    
    if (typeFilter !== "all") {
      filtered = filtered.filter(event => event.event_type === typeFilter);
    }
    
    if (activeTab === "upcoming") {
      filtered = filtered.filter(event => 
        new Date(event.start_datetime) > new Date()
      );
    } else if (activeTab === "past") {
      filtered = filtered.filter(event => 
        new Date(event.start_datetime) <= new Date()
      );
    }
    
    setFilteredEvents(filtered);
  }, [events, searchTerm, typeFilter, activeTab]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const allEvents = await getEvents();
      setEvents(allEvents);
      setFilteredEvents(allEvents);
    } catch (error: any) {
      toast({
        title: "Error fetching events",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStats = async () => {
    try {
      const stats = await getEventsOverviewStats();
      setStats(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };
  
  const fetchPopularEvents = async () => {
    try {
      const events = await getMostPopularEvents();
      setPopularEvents(events);
    } catch (error) {
      console.error("Error fetching popular events:", error);
    }
  };

  const handleCreateEvent = () => {
    setIsCreateEventOpen(true);
  };

  const handleEditEvent = async (eventId: string) => {
    try {
      const event = await getEvent(eventId);
      if (event) {
        setEditingEvent(event);
        setIsEditEventOpen(true);
      }
    } catch (error) {
      console.error("Error fetching event for edit:", error);
      toast({
        title: "Error",
        description: "Failed to fetch event details",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEvent = async (values: any) => {
    if (!editingEvent) return;
    
    try {
      const result = await updateEvent(editingEvent.id, values);
      
      if (result.success) {
        toast({
          title: "Event updated",
          description: "The event has been successfully updated",
        });
        
        fetchEvents();
        setIsEditEventOpen(false);
        setEditingEvent(null);
        
        searchParams.delete('edit');
        setSearchParams(searchParams);
      } else {
        throw result.error;
      }
    } catch (error: any) {
      toast({
        title: "Error updating event",
        description: error.message || "An error occurred while updating the event",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }
    
    try {
      const result = await deleteEvent(eventId);
      
      if (result.success) {
        toast({
          title: "Event deleted",
          description: "The event has been successfully deleted",
        });
        fetchEvents();
        fetchStats();
      } else {
        throw result.error;
      }
    } catch (error: any) {
      toast({
        title: "Error deleting event",
        description: error.message || "An error occurred while deleting the event",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateEvent = async (eventId: string) => {
    try {
      const result = await duplicateEvent(eventId);
      
      if (result.success) {
        toast({
          title: "Event duplicated",
          description: "The event has been successfully duplicated",
        });
        fetchEvents();
      } else {
        throw result.error;
      }
    } catch (error: any) {
      toast({
        title: "Error duplicating event",
        description: error.message || "An error occurred while duplicating the event",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (file.size > 15 * 1024 * 1024) {
        setUploadError("File size must be less than 15MB");
        return;
      }
      
      setImageFile(file);
      setUploadError(null);
    }
  };

  const handleImageUpload = async () => {
    if (!uploadingEvent) {
      setUploadError("No event selected for upload");
      return;
    }
    
    if (!imageFile) {
      setUploadError("No file selected");
      return;
    }
    
    try {
      resetUpload();
      const imageUrl = await uploadImage(imageFile);
      
      if (imageUrl) {
        await updateEvent(uploadingEvent.id, { image_url: imageUrl });
        
        toast({
          title: "Image uploaded",
          description: "Event image has been updated successfully",
        });
        
        fetchEvents();
        setIsImageUploadOpen(false);
        setUploadingEvent(null);
        setImageFile(null);
      }
    } catch (err) {
      setUploadError(error || "Failed to upload image. Please try again.");
    }
  };

  const handleEventCreated = () => {
    fetchEvents();
    fetchStats();
    toast({
      title: "Event created",
      description: "Your event has been successfully created",
    });
  };

  const handleImageClick = (event: CalendarEvent) => {
    setUploadingEvent(event);
    setImageFile(null);
    setUploadError(null);
    resetUpload();
    setIsImageUploadOpen(true);
  };

  const handleEventSelection = (event: CalendarEvent, selected: boolean) => {
    if (selected) {
      setSelectedEvents(prev => [...prev, event]);
    } else {
      setSelectedEvents(prev => prev.filter(e => e.id !== event.id));
    }
  };

  const handleSelectAllEvents = (selected: boolean) => {
    if (selected) {
      setSelectedEvents([...filteredEvents]);
    } else {
      setSelectedEvents([]);
    }
  };

  const handleExportEvents = () => {
    const eventsToExport = selectedEvents.length > 0 ? selectedEvents : filteredEvents;
    const csv = exportEventsToCSV(eventsToExport);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `events-export-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: `${eventsToExport.length} events exported to CSV`,
    });
  };

  const handleBatchDeletes = async () => {
    if (selectedEvents.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedEvents.length} events? This action cannot be undone.`)) {
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const event of selectedEvents) {
      try {
        const result = await deleteEvent(event.id);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }
    
    if (successCount > 0) {
      toast({
        title: `${successCount} events deleted`,
        description: errorCount > 0 ? `${errorCount} events could not be deleted` : "All selected events were deleted successfully",
        variant: errorCount > 0 ? "destructive" : "default",
      });
      
      fetchEvents();
      fetchStats();
      setSelectedEvents([]);
    }
  };

  const handleViewStats = (event: CalendarEvent) => {
    setStatEvent(event);
    setShowStatsDialog(true);
  };

  const isAllSelected = filteredEvents.length > 0 && selectedEvents.length === filteredEvents.length;

  return (
    <AdminPageTemplate
      title="Manage Events"
      description="Add, edit, and manage events for your community"
      icon={Calendar}
    >
      <CreateEventDialog
        isOpen={isCreateEventOpen}
        onOpenChange={setIsCreateEventOpen}
        onEventCreated={handleEventCreated}
      />
      
      <EventStatisticsDialog 
        isOpen={showStatsDialog}
        onOpenChange={setShowStatsDialog}
        event={statEvent}
      />
      
      <Dialog open={isEditEventOpen} onOpenChange={(open) => {
        setIsEditEventOpen(open);
        if (!open) {
          searchParams.delete('edit');
          setSearchParams(searchParams);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update the event details below.
            </DialogDescription>
          </DialogHeader>
          
          {editingEvent && (
            <EventForm
              onSubmit={handleUpdateEvent}
              onCancel={() => {
                setIsEditEventOpen(false);
                searchParams.delete('edit');
                setSearchParams(searchParams);
              }}
              defaultValues={editingEvent}
              submitLabel="Update Event"
            />
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isImageUploadOpen} onOpenChange={setIsImageUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Event Image</DialogTitle>
            <DialogDescription>
              {uploadingEvent && `Upload an image for "${uploadingEvent.title}"`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: JPEG, PNG, GIF, WEBP (max 15MB)
              </p>
            </div>
          </div>
          
          {imageFile && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">Selected file: {imageFile.name}</p>
              <p className="text-xs text-muted-foreground">Size: {(imageFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          )}
          
          {uploadingEvent?.image_url && (
            <div className="mt-4">
              <p className="mb-2 text-sm text-muted-foreground">Current image:</p>
              <div className="rounded-md overflow-hidden border h-32 flex items-center justify-center">
                <img
                  src={uploadingEvent.image_url}
                  alt={uploadingEvent.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          )}
          
          {isUploading && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-1">Uploading...</p>
              <Progress value={progress} className="h-2" />
            </div>
          )}
          
          {uploadError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {uploadError}
              </AlertDescription>
            </Alert>
          )}
          
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsImageUploadOpen(false);
                resetUpload();
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImageUpload}
              disabled={!imageFile || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalEvents}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.upcomingEvents}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Past Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.pastEvents}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Total Attendees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalAttendees}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Events List</span>
                <Button onClick={handleCreateEvent}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add New Event
                </Button>
              </CardTitle>
              <CardDescription>
                Manage all events in one place. Use filters to find specific events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-2">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search events..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Event Types</SelectItem>
                      {EVENT_TYPES.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={handleExportEvents}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
              
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 w-full sm:w-auto">
                  <TabsTrigger value="all">All Events</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-0">
                  {selectedEvents.length > 0 && (
                    <div className="bg-muted/50 p-3 rounded-lg mb-4 flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {selectedEvents.length} events selected
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedEvents([])}
                        >
                          Clear
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={handleBatchDeletes}
                        >
                          Delete Selected
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {loading ? (
                    <div className="py-8 flex justify-center">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : filteredEvents.length === 0 ? (
                    <div className="py-12 text-center">
                      <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">No events found</h3>
                      <p className="text-sm text-muted-foreground/70 mb-6">
                        {searchTerm || typeFilter !== "all" 
                          ? "Try adjusting your filters"
                          : "Start by adding an event"}
                      </p>
                      <Button onClick={handleCreateEvent}>
                        <Plus className="mr-1 h-4 w-4" />
                        Add New Event
                      </Button>
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40px] p-0">
                              <div className="flex items-center justify-center p-2">
                                <Checkbox 
                                  checked={isAllSelected}
                                  onCheckedChange={handleSelectAllEvents}
                                />
                              </div>
                            </TableHead>
                            <TableHead>Event</TableHead>
                            <TableHead className="hidden md:table-cell">Date</TableHead>
                            <TableHead className="hidden md:table-cell">Type</TableHead>
                            <TableHead className="hidden lg:table-cell">Attendees</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEvents.map((event) => (
                            <TableRow key={event.id}>
                              <TableCell className="p-0">
                                <div className="flex items-center justify-center p-2">
                                  <Checkbox 
                                    checked={selectedEvents.some(e => e.id === event.id)}
                                    onCheckedChange={(checked) => handleEventSelection(event, !!checked)}
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-12 h-12 rounded-md bg-gray-100 overflow-hidden flex-shrink-0 cursor-pointer border border-muted"
                                    onClick={() => handleImageClick(event)}
                                  >
                                    {event.image_url ? (
                                      <img 
                                        src={event.image_url} 
                                        alt={event.title} 
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/50">
                                        <ImageIcon className="w-5 h-5" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">{event.title}</p>
                                    <div className="flex items-center text-xs text-muted-foreground lg:hidden mt-1">
                                      <Clock className="inline h-3 w-3 mr-1" />
                                      {format(parseISO(event.start_datetime), "MMM d, h:mm a")}
                                    </div>
                                    {event.description && (
                                      <p className="text-xs text-muted-foreground line-clamp-1 hidden md:block">
                                        {event.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <div className="flex flex-col">
                                  <span className="text-sm">
                                    {format(parseISO(event.start_datetime), "MMM d, yyyy")}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {format(parseISO(event.start_datetime), "h:mm a")}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Badge 
                                  className={getEventTypeColor(event.event_type)}
                                  variant="secondary"
                                >
                                  {event.event_type}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span>{event.attendees_count || 0}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditEvent(event.id)}
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleImageClick(event)}
                                  >
                                    <Upload className="h-4 w-4" />
                                    <span className="sr-only">Upload image</span>
                                  </Button>
                                  
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <ChevronDown className="h-4 w-4" />
                                        <span className="sr-only">More options</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleDuplicateEvent(event.id)}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Duplicate
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={handleCreateEvent}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Event
              </Button>
              <Button variant="outline" className="w-full" onClick={handleExportEvents}>
                <Download className="mr-2 h-4 w-4" />
                Export Events
              </Button>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/admin/calendar'}>
                <Calendar className="mr-2 h-4 w-4" />
                View Calendar
              </Button>
            </CardContent>
          </Card>
          
          {popularEvents.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Most Popular Events</CardTitle>
                <CardDescription>Based on registration count</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {popularEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-gray-100 overflow-hidden flex-shrink-0 border border-muted">
                      {event.image_url ? (
                        <img 
                          src={event.image_url} 
                          alt={event.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/50">
                          <Calendar className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {format(parseISO(event.start_datetime), "MMM d")}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Users className="h-3.5 w-3.5 mr-1" />
                          {event.attendees_count || 0}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditEvent(event.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminPageTemplate>
  );
};

export default ManageEvents;
