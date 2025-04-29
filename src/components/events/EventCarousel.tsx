
import React, { useState, useEffect } from "react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, Users, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { getUpcomingEvents } from "@/lib/eventHelpers";
import { CalendarEvent } from "@/lib/types";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const EventCarousel = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const upcomingEvents = await getUpcomingEvents();
        setEvents(upcomingEvents.slice(0, 5)); // Limit to 5 events for carousel
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleRegisterClick = (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for events",
      });
      navigate("/login", { state: { returnUrl: "/events/upcoming" } });
    } else {
      navigate(`/events/upcoming?highlight=${eventId}`);
    }
  };

  // Format event location
  const formatLocation = (event: CalendarEvent) => {
    if (event.location_type === 'virtual') {
      return 'Virtual (Online)';
    } else if (event.location_type === 'physical') {
      return event.physical_address || 'In-person';
    } else {
      return 'Hybrid (In-person & Online)';
    }
  };

  // Event type labels mapping
  const eventTypeLabels: Record<string, string> = {
    'general': 'General',
    'workshop': 'Workshop',
    'networking': 'Networking',
    'pitch': 'Pitch',
    'hackathon': 'Hackathon',
    'mentorship': 'Mentorship'
  };

  if (loading) {
    return (
      <div className="py-10">
        <h2 className="text-3xl font-bold mb-8 text-center">Upcoming Events</h2>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[300px] flex-shrink-0">
              <Card className="overflow-hidden border-none shadow-lg">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-10">
        <h2 className="text-3xl font-bold mb-8 text-center">Upcoming Events</h2>
        <Card className="p-8 text-center border-none shadow-lg bg-gradient-to-r from-gray-50 to-gray-100">
          <p className="text-gray-600">No upcoming events scheduled at this time. Check back later!</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Upcoming Events</h2>
        <Button variant="outline" onClick={() => navigate("/events/upcoming")} className="group">
          View All 
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full max-w-5xl mx-auto"
      >
        <CarouselContent>
          {events.map((event) => (
            <CarouselItem key={event.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
              <Card className="overflow-hidden h-full border-none shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={event.image_url || `https://picsum.photos/seed/${event.id}/800/600`} 
                    alt={event.title} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                  <Badge className="absolute top-2 right-2 bg-primary text-white font-semibold">
                    {eventTypeLabels[event.event_type] || 'Event'}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{format(new Date(event.start_datetime), "MMMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{format(new Date(event.start_datetime), "h:mm a")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="line-clamp-1">{formatLocation(event)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{event.attendees_count || 0}+ registered</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full group relative overflow-hidden bg-primary"
                    onClick={() => handleRegisterClick(event.id)}
                  >
                    <span className="relative z-10">Register Now</span>
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  </Button>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 bg-white/80 backdrop-blur-sm border-none shadow-md hover:bg-white" />
        <CarouselNext className="right-0 bg-white/80 backdrop-blur-sm border-none shadow-md hover:bg-white" />
      </Carousel>
    </div>
  );
};
