
import React from "react";
import { format, parseISO } from "date-fns";
import { Clock, MapPin, Users, X, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarEvent } from "@/lib/types";

interface EventCardProps {
  event: CalendarEvent;
  isRegistered?: boolean;
  onRegister?: () => void;
  onCancel?: () => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  onEdit?: () => void;
  onView?: () => void;
  onImageUpload?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  isRegistered = false,
  onRegister,
  onCancel,
  isLoggedIn = false,
  isAdmin = false,
  onEdit,
  onView,
  onImageUpload,
}) => {
  const startTime = format(parseISO(event.start_datetime), "h:mm a");
  const endTime = format(parseISO(event.end_datetime), "h:mm a");
  const eventDate = format(parseISO(event.start_datetime), "MMMM d, yyyy");

  const getEventTypeColor = () => {
    switch(event.event_type) {
      case 'workshop': return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case 'networking': return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case 'pitch': return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case 'hackathon': return "bg-green-100 text-green-800 hover:bg-green-200";
      case 'mentorship': return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const formatLocationText = () => {
    switch (event.location_type) {
      case "virtual":
        return "Virtual Meeting";
      case "physical":
        return event.physical_address || "In Person";
      case "hybrid":
        return "Hybrid (In-person & Online)";
      default:
        return "Location TBD";
    }
  };

  return (
    <div className="flex gap-4 p-3 border border-primary/20 rounded-lg bg-primary/5 mb-3">
      {event.image_url ? (
        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
          <img 
            src={event.image_url} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-16 h-16 flex flex-col items-center justify-center bg-primary/10 rounded-md flex-shrink-0">
          <Clock className="h-5 w-5 text-primary mb-1" />
          <div className="text-xs font-medium">{startTime}</div>
        </div>
      )}

      <div className="flex-1">
        <div className="font-medium">{event.title}</div>
        {event.description && (
          <div className="text-sm text-gray-600 line-clamp-2">{event.description}</div>
        )}
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
          <Clock className="h-3 w-3" />
          <span>{startTime} - {endTime}</span>
          <span className="ml-1">•</span>
          <span>{eventDate}</span>
        </div>
        {event.location_type && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            <span>{formatLocationText()}</span>
          </div>
        )}
        <div className="mt-2 flex justify-between items-center">
          <Badge className={getEventTypeColor()}>
            {event.event_type}
          </Badge>
          
          <div className="flex gap-2">
            {isAdmin ? (
              <>
                {onImageUpload && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={onImageUpload}
                  >
                    {event.image_url ? "Change Image" : "Add Image"}
                  </Button>
                )}
                {onEdit && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onEdit}
                  >
                    Edit
                  </Button>
                )}
                {onView && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onView}
                  >
                    View
                  </Button>
                )}
              </>
            ) : (
              isLoggedIn ? (
                isRegistered ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-500 border-red-200 hover:bg-red-50"
                    onClick={onCancel}
                  >
                    <X className="h-3 w-3 mr-1" /> Cancel
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onRegister}
                  >
                    <UserPlus className="h-3 w-3 mr-1" /> Register
                  </Button>
                )
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onRegister}
                >
                  Login to Register
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
