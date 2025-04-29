import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Clock, ExternalLink, Play, Filter, Search, Share, Heart, Star, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { getPastEvents } from "@/lib/eventHelpers";
import { getPastRecordings, incrementRecordingViews } from "@/lib/recordingsHelpers";
import { CalendarEvent, PastRecording } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const eventTypeToCategory = {
  'general': 'General',
  'workshop': 'Workshop',
  'networking': 'Networking',
  'pitch': 'Pitch',
  'hackathon': 'Hackathon',
  'mentorship': 'Mentorship'
};

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'pitch', label: 'Pitch Events' },
  { value: 'mentorship', label: 'Mentorship' },
  { value: 'networking', label: 'Networking' },
  { value: 'hackathon', label: 'Hackathons' },
  { value: 'general', label: 'General' }
];

const PastRecordings = () => {
  const [loading, setLoading] = useState(true);
  const [recordings, setRecordings] = useState<PastRecording[]>([]);
  const [pastEvents, setPastEvents] = useState<CalendarEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeVideo, setActiveVideo] = useState<PastRecording | null>(null);
  const [viewType, setViewType] = useState("grid");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const recordingsData = await getPastRecordings();
        
        if (recordingsData.length > 0) {
          setRecordings(recordingsData);
        } else {
          const eventsData = await getPastEvents();
          setPastEvents(eventsData);
        }
        
        const savedFavorites = localStorage.getItem('recordingFavorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } catch (error) {
        console.error("Error fetching past recordings:", error);
        toast({
          title: "Error",
          description: "Failed to load past recordings. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  const displayRecordings = recordings.length > 0 
    ? recordings 
    : (pastEvents.length > 0 
      ? pastEvents.map(event => ({
          id: event.id,
          event_id: event.id,
          title: event.title,
          description: event.description || '',
          recording_url: "https://www.youtube.com/watch?v=QoAOzMTLP5s",
          thumbnail_url: event.image_url || `https://picsum.photos/seed/${event.id}/800/450`,
          duration: 5400,
          presenter_name: "Club Presenter",
          recorded_at: event.end_datetime,
          is_public: event.is_public,
          view_count: 0,
          created_at: event.created_at,
          updated_at: event.updated_at,
          event_type: event.event_type
        }))
      : []);
  
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };
  
  const getEventType = (recording: PastRecording | CalendarEvent): string => {
    if ('event_type' in recording && recording.event_type) {
      return eventTypeToCategory[recording.event_type as keyof typeof eventTypeToCategory] || 'General';
    }
    
    return 'General';
  };

  const handleWatchClick = async (recording: PastRecording) => {
    setActiveVideo(recording);
    
    try {
      await incrementRecordingViews(recording.id);
      
      setRecordings(prevRecordings => 
        prevRecordings.map(r => 
          r.id === recording.id 
            ? { ...r, view_count: (r.view_count || 0) + 1 } 
            : r
        )
      );
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
  };

  const toggleFavorite = (recording: PastRecording) => {
    const newFavorites = {
      ...favorites,
      [recording.id]: !favorites[recording.id]
    };
    
    if (!newFavorites[recording.id]) {
      delete newFavorites[recording.id];
    }
    
    setFavorites(newFavorites);
    localStorage.setItem('recordingFavorites', JSON.stringify(newFavorites));
    
    toast({
      title: favorites[recording.id] ? "Removed from favorites" : "Added to favorites",
      description: `"${recording.title}" has been ${favorites[recording.id] ? "removed from" : "added to"} your favorites`,
    });
  };

  const handleShare = (recording: PastRecording) => {
    if (navigator.share) {
      navigator.share({
        title: recording.title,
        text: recording.description,
        url: window.location.href + '?id=' + recording.id
      }).then(() => {
        toast({
          title: "Shared",
          description: "Recording shared successfully!",
        });
      }).catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      navigator.clipboard.writeText(window.location.href + '?id=' + recording.id);
      toast({
        title: "Link Copied",
        description: "Recording link copied to clipboard!",
      });
    }
  };

  const filteredRecordings = displayRecordings.filter(recording => {
    const matchesSearch = recording.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (recording.description && recording.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          ('presenter_name' in recording && recording.presenter_name && 
                           recording.presenter_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
                           ('event_type' in recording && recording.event_type === selectedCategory);
    
    return matchesSearch && (matchesCategory || selectedCategory === 'all');
  });
  
  const favoriteRecordings = filteredRecordings.filter(recording => favorites[recording.id]);

  const getEmbedUrl = (url: string | undefined): string => {
    if (!url) return '';
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
      }
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    if (url.includes('vimeo.com')) {
      const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0] || '';
      if (vimeoId) {
        return `https://player.vimeo.com/video/${vimeoId}`;
      }
    }
    
    return url;
  };

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-primary/5 to-background pt-6 pb-12">
        <PageHeader
          title="Past Recordings"
          description="Access recordings of previous events, workshops, and webinars."
          icon={Video}
        />
        
        <div className="container mx-auto px-4 mt-6 max-w-6xl">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-4 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search recordings..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-shrink-0 w-full sm:w-auto">
                      <Filter className="h-4 w-4 mr-2" />
                      {selectedCategory === 'all' ? 'All Categories' : eventTypeToCategory[selectedCategory as keyof typeof eventTypeToCategory]}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {categories.map((category) => (
                      <DropdownMenuItem 
                        key={category.value}
                        onClick={() => setSelectedCategory(category.value)}
                        className={selectedCategory === category.value ? "bg-primary/10 text-primary" : ""}
                      >
                        {category.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Tabs value={viewType} onValueChange={setViewType} className="w-full sm:w-auto">
                  <TabsList className="grid grid-cols-2 h-10">
                    <TabsTrigger value="grid">
                      <Filter className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="list">
                      <Calendar className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Recordings</TabsTrigger>
              <TabsTrigger value="favorites">My Favorites</TabsTrigger>
              <TabsTrigger value="popular">Most Popular</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="overflow-hidden border-none shadow-lg">
                      <div className="aspect-video">
                        <Skeleton className="h-full w-full" />
                      </div>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredRecordings.length === 0 ? (
                <Card className="p-6 text-center border-none shadow-lg">
                  <CardTitle className="mb-2">No Recordings Available</CardTitle>
                  <CardDescription>
                    {searchTerm || selectedCategory !== 'all'
                      ? "No recordings match your search criteria. Try adjusting your filters."
                      : "There are no past event recordings available at this time. Check back later or join an upcoming event."}
                  </CardDescription>
                  
                  {(searchTerm || selectedCategory !== 'all') && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </Card>
              ) : viewType === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecordings.map((recording) => (
                    <Card key={recording.id} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="relative aspect-video group">
                        <img 
                          src={recording.thumbnail_url || `https://picsum.photos/seed/${recording.id}/800/450`} 
                          alt={recording.title} 
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                className="bg-primary/90 hover:bg-primary"
                                onClick={() => handleWatchClick(recording)}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Watch Now
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                        </div>
                        <Badge className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white">
                          {formatDuration(recording.duration || 3600)}
                        </Badge>
                        <Badge className="absolute top-3 left-3 bg-primary text-white">
                          {getEventType(recording)}
                        </Badge>
                      </div>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="line-clamp-1 text-lg">{recording.title}</CardTitle>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-8 w-8 ${favorites[recording.id] ? 'text-red-500' : 'text-gray-400'}`}
                            onClick={() => toggleFavorite(recording)}
                          >
                            <Heart className={`h-4 w-4 ${favorites[recording.id] ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                        <CardDescription>
                          {recording.presenter_name && `Presented by ${recording.presenter_name}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{recording.description}</p>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1 text-primary" />
                            <span>{format(new Date(recording.recorded_at), "MMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Star className="h-4 w-4 mr-1 text-primary" />
                            <span>{recording.view_count || 0} views</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              className="flex-grow"
                              onClick={() => handleWatchClick(recording)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Watch
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl w-full">
                            <DialogHeader>
                              <DialogTitle>{activeVideo?.title}</DialogTitle>
                              <DialogDescription>
                                {activeVideo?.presenter_name && `Presented by ${activeVideo.presenter_name}`}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                              {activeVideo?.recording_url ? (
                                <iframe
                                  className="w-full h-full"
                                  src={getEmbedUrl(activeVideo.recording_url)}
                                  title={activeVideo?.title}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                ></iframe>
                              ) : (
                                <div className="flex items-center justify-center h-full text-white">
                                  No video URL available
                                </div>
                              )}
                            </div>
                            <div className="mt-4">
                              <h4 className="font-medium">Description</h4>
                              <p className="text-sm text-gray-600 mt-1">{activeVideo?.description}</p>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="icon" onClick={() => handleShare(recording)}>
                          <Share className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                          <a 
                            href={recording.recording_url || "#"} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecordings.map((recording) => (
                    <div key={recording.id} className="bg-white rounded-xl overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-200">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 relative">
                          <div className="aspect-video md:h-full">
                            <img 
                              src={recording.thumbnail_url || `https://picsum.photos/seed/${recording.id}/800/450`} 
                              alt={recording.title} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    className="bg-primary/90 hover:bg-primary"
                                    onClick={() => handleWatchClick(recording)}
                                  >
                                    <Play className="h-4 w-4 mr-2" />
                                    Watch Now
                                  </Button>
                                </DialogTrigger>
                              </Dialog>
                            </div>
                          </div>
                          <Badge className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white">
                            {formatDuration(recording.duration || 3600)}
                          </Badge>
                          <Badge className="absolute top-3 left-3 bg-primary text-white">
                            {getEventType(recording)}
                          </Badge>
                        </div>
                        
                        <div className="md:w-2/3 p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg mb-1">{recording.title}</h3>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={`h-8 w-8 ${favorites[recording.id] ? 'text-red-500' : 'text-gray-400'}`}
                              onClick={() => toggleFavorite(recording)}
                            >
                              <Heart className={`h-4 w-4 ${favorites[recording.id] ? 'fill-current' : ''}`} />
                            </Button>
                          </div>
                          
                          {recording.presenter_name && (
                            <p className="text-sm text-gray-500 mb-2">Presented by {recording.presenter_name}</p>
                          )}
                          
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{recording.description}</p>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1 text-primary" />
                              <span>{format(new Date(recording.recorded_at), "MMMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Star className="h-4 w-4 mr-1 text-primary" />
                              <span>{recording.view_count || 0} views</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm"
                                  onClick={() => handleWatchClick(recording)}
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Watch
                                </Button>
                              </DialogTrigger>
                            </Dialog>
                            <Button variant="outline" size="sm" onClick={() => handleShare(recording)}>
                              <Share className="h-4 w-4 mr-2" />
                              Share
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <a 
                                href={recording.recording_url || "#"} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                External
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="favorites">
              {favoriteRecordings.length === 0 ? (
                <Card className="p-6 text-center border-none shadow-lg">
                  <Info className="mx-auto h-12 w-12 text-primary/50 mb-2" />
                  <CardTitle className="mb-2">No Favorites Yet</CardTitle>
                  <CardDescription>
                    You haven't added any recordings to your favorites. Click the heart icon on a recording to add it to your favorites.
                  </CardDescription>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteRecordings.map((recording) => (
                    <Card key={recording.id} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="relative aspect-video group">
                        <img 
                          src={recording.thumbnail_url || `https://picsum.photos/seed/${recording.id}/800/450`} 
                          alt={recording.title} 
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                className="bg-primary/90 hover:bg-primary"
                                onClick={() => handleWatchClick(recording)}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Watch Now
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                        </div>
                        <Badge className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white">
                          {formatDuration(recording.duration || 3600)}
                        </Badge>
                        <Badge className="absolute top-3 left-3 bg-primary text-white">
                          {getEventType(recording)}
                        </Badge>
                      </div>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="line-clamp-1 text-lg">{recording.title}</CardTitle>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500"
                            onClick={() => toggleFavorite(recording)}
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </Button>
                        </div>
                        <CardDescription>
                          {recording.presenter_name && `Presented by ${recording.presenter_name}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{recording.description}</p>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1 text-primary" />
                            <span>{format(new Date(recording.recorded_at), "MMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Star className="h-4 w-4 mr-1 text-primary" />
                            <span>{recording.view_count || 0} views</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              className="flex-grow"
                              onClick={() => handleWatchClick(recording)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Watch
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                        <Button variant="outline" size="icon" onClick={() => handleShare(recording)}>
                          <Share className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                          <a 
                            href={recording.recording_url || "#"} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="popular">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecordings
                  .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
                  .slice(0, 6)
                  .map((recording) => (
                    <Card key={recording.id} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="relative aspect-video group">
                        <img 
                          src={recording.thumbnail_url || `https://picsum.photos/seed/${recording.id}/800/450`} 
                          alt={recording.title} 
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                className="bg-primary/90 hover:bg-primary"
                                onClick={() => handleWatchClick(recording)}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Watch Now
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                        </div>
                        <Badge className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white">
                          {formatDuration(recording.duration || 3600)}
                        </Badge>
                        <Badge className="absolute top-3 left-3 bg-primary text-white">
                          {getEventType(recording)}
                        </Badge>
                        <div className="absolute bottom-3 right-3">
                          <Badge variant="secondary" className="bg-yellow-500/90 text-white border-none">
                            <Star className="h-3 w-3 mr-1 fill-white" />
                            Popular
                          </Badge>
                        </div>
                      </div>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="line-clamp-1 text-lg">{recording.title}</CardTitle>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-8 w-8 ${favorites[recording.id] ? 'text-red-500' : 'text-gray-400'}`}
                            onClick={() => toggleFavorite(recording)}
                          >
                            <Heart className={`h-4 w-4 ${favorites[recording.id] ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                        <CardDescription>
                          {recording.presenter_name && `Presented by ${recording.presenter_name}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{recording.description}</p>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1 text-primary" />
                            <span>{format(new Date(recording.recorded_at), "MMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center text-sm font-medium text-yellow-600">
                            <Star className="h-4 w-4 mr-1 fill-yellow-500" />
                            <span>{recording.view_count || 0} views</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              className="flex-grow"
                              onClick={() => handleWatchClick(recording)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Watch
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                        <Button variant="outline" size="icon" onClick={() => handleShare(recording)}>
                          <Share className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                          <a 
                            href={recording.recording_url || "#"} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            External
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <Dialog>
            <DialogContent className="max-w-4xl w-full">
              <DialogHeader>
                <DialogTitle>{activeVideo?.title}</DialogTitle>
                <DialogDescription>
                  {activeVideo?.presenter_name && `Presented by ${activeVideo.presenter_name}`}
                </DialogDescription>
              </DialogHeader>
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                {activeVideo?.recording_url ? (
                  <iframe
                    className="w-full h-full"
                    src={getEmbedUrl(activeVideo.recording_url)}
                    title={activeVideo?.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    No video URL available
                  </div>
                )}
              </div>
              <div className="mt-4">
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-gray-600 mt-1">{activeVideo?.description}</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </MainLayout>
  );
};

export default PastRecordings;
