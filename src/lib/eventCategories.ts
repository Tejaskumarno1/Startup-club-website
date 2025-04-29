
import { CalendarEvent } from './types';
import { Globe, Users, Link, ExternalLink, Tag, Building, Video } from 'lucide-react';

/**
 * Event types with icons and descriptions
 */
export const EVENT_TYPES = [
  { id: 'general', label: 'General', icon: Globe, description: 'Regular event with no specific category' },
  { id: 'workshop', label: 'Workshop', icon: Users, description: 'Hands-on learning session' },
  { id: 'networking', label: 'Networking', icon: Link, description: 'Connect with others in the community' },
  { id: 'pitch', label: 'Pitch', icon: ExternalLink, description: 'Startup or project presentation' },
  { id: 'hackathon', label: 'Hackathon', icon: Tag, description: 'Collaborative coding event' },
  { id: 'mentorship', label: 'Mentorship', icon: Users, description: 'Guidance and advice session' },
  { id: 'conference', label: 'Conference', icon: Users, description: 'Large-scale organized meeting' },
  { id: 'seminar', label: 'Seminar', icon: Building, description: 'Educational presentation' },
  { id: 'webinar', label: 'Webinar', icon: Video, description: 'Online seminar or workshop' }
];

/**
 * Location types with icons
 */
export const LOCATION_TYPES = [
  { id: 'virtual', label: 'Virtual', icon: Video },
  { id: 'physical', label: 'Physical', icon: Building },
  { id: 'hybrid', label: 'Hybrid', icon: Globe }
];

/**
 * Get color class for event type
 */
export const getEventTypeColor = (eventType: string): string => {
  switch (eventType) {
    case 'workshop':
      return 'bg-blue-100 text-blue-800';
    case 'networking':
      return 'bg-purple-100 text-purple-800';
    case 'pitch':
      return 'bg-yellow-100 text-yellow-800';
    case 'hackathon':
      return 'bg-green-100 text-green-800';
    case 'mentorship':
      return 'bg-indigo-100 text-indigo-800';
    case 'conference':
      return 'bg-red-100 text-red-800';
    case 'seminar':
      return 'bg-teal-100 text-teal-800';
    case 'webinar':
      return 'bg-cyan-100 text-cyan-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Format event location for display
 */
export const formatLocation = (event: CalendarEvent): string => {
  if (event.location_type === 'virtual') {
    return 'Virtual Event';
  } else if (event.location_type === 'physical') {
    return event.physical_address || 'In-person Event';
  } else {
    return 'Hybrid Event';
  }
};
