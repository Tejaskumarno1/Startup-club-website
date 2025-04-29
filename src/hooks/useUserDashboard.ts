import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

// Define types for our database data
export interface UserProfile {
  connections_count: number;
  joined_events_count: number;
  resources_downloaded: number;
  badge_level: string;
}

export interface UpcomingEvent {
  id: string;
  event_name: string;
  event_date: string;
  event_description: string;
  has_rsvp: boolean;
}

export interface UserActivity {
  id: string;
  activity_type: string;
  activity_description: string;
  related_entity: string;
  activity_date: string;
}

export function useUserDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);

  // Fetch user data from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile data:", profileError);
          toast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive",
          });
        }

        // Get connection count
        const { data: connectionData, error: connectionError } = await supabase
          .from('connections')
          .select('*', { count: 'exact', head: true })
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .eq('status', 'accepted');
          
        const connectionsCount = connectionError ? 0 : (connectionData?.length || 0);

        // Get event participation count
        const { data: eventData, error: eventError } = await supabase
          .from('event_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'attended');
          
        const eventsCount = eventError ? 0 : (eventData?.length || 0);

        // Get resource downloads (placeholder)
        const resourcesDownloaded = 0;

        // Create profile data with counts
        setProfileData({
          connections_count: connectionsCount,
          joined_events_count: eventsCount,
          resources_downloaded: resourcesDownloaded,
          badge_level: calcBadgeLevel(connectionsCount, eventsCount, resourcesDownloaded)
        });

        // Fetch upcoming events from events table
        const now = new Date().toISOString();
        const { data: upcomingEventsData, error: upcomingEventsError } = await supabase
          .from('events')
          .select(`
            id,
            title,
            start_datetime,
            description,
            event_registrations(id, status, user_id)
          `)
          .gte('start_datetime', now)
          .order('start_datetime', { ascending: true })
          .limit(5);

        if (upcomingEventsError) {
          console.error("Error fetching upcoming events:", upcomingEventsError);
        } else {
          // Transform events to match the expected UpcomingEvent format
          const formattedEvents = (upcomingEventsData || []).map(event => {
            // Check if event_registrations contains entries and if any belong to current user
            const userRegistration = Array.isArray(event.event_registrations) && 
              event.event_registrations.some(reg => 
                reg.user_id === user.id && reg.status !== 'canceled'
              );
            
            return {
              id: event.id,
              event_name: event.title,
              event_date: event.start_datetime,
              event_description: event.description || '',
              has_rsvp: !!userRegistration
            };
          });
          setUpcomingEvents(formattedEvents);
        }
        
        // Create placeholder activity data
        const placeholderActivity = [
          {
            id: '1',
            activity_type: 'view',
            activity_description: 'Viewed dashboard',
            related_entity: 'Dashboard',
            activity_date: new Date().toISOString()
          }
        ];
        setRecentActivity(placeholderActivity);

      } catch (error) {
        console.error("Error in fetchUserData:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, toast]);

  const calcBadgeLevel = (connections: number, events: number, resources: number): string => {
    const total = connections + events + resources;
    if (total >= 50) return "Platinum";
    if (total >= 25) return "Gold";
    if (total >= 10) return "Silver";
    return "Bronze";
  };

  const handleEventRSVP = async (eventId: string, eventName: string) => {
    if (!user) return;
    
    try {
      // Check if registration exists
      const { data: existingReg, error: checkError } = await supabase
        .from('event_registrations')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('event_id', eventId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingReg) {
        // Update existing registration if it was canceled
        if (existingReg.status === 'canceled') {
          await supabase
            .from('event_registrations')
            .update({ status: 'registered' })
            .eq('id', existingReg.id);
        }
      } else {
        // Create new registration
        await supabase
          .from('event_registrations')
          .insert({
            user_id: user.id,
            event_id: eventId,
            status: 'registered',
            role: 'attendee'
          });
      }

      // Update local state
      setUpcomingEvents(prev => 
        prev.map(event => 
          event.id === eventId ? { ...event, has_rsvp: true } : event
        )
      );

      toast({
        title: "RSVP Successful",
        description: `You have successfully RSVP'd for ${eventName}`,
      });
    } catch (error) {
      console.error("RSVP error:", error);
      toast({
        title: "RSVP Failed",
        description: "There was an error processing your RSVP",
        variant: "destructive",
      });
    }
  };

  const handleResourceDownload = async () => {
    if (!user) return;
    
    try {
      // Since there's no function to increment downloads yet, just update local state
      if (profileData) {
        setProfileData({
          ...profileData,
          resources_downloaded: (profileData.resources_downloaded || 0) + 1
        });
      }
      
      toast({
        title: "Resource Downloaded",
        description: "Resource has been added to your downloads",
      });
    } catch (error) {
      console.error("Resource download error:", error);
    }
  };

  // Calculate progress to next badge level
  const getBadgeProgress = () => {
    if (!profileData) return "0%";
    
    const total = profileData.connections_count + 
                  profileData.joined_events_count + 
                  profileData.resources_downloaded;
                  
    let progress = 0;
    
    if (total < 10) {
      // Bronze to Silver (need 10)
      progress = (total / 10) * 100;
    } else if (total < 25) {
      // Silver to Gold (need 25)
      progress = ((total - 10) / 15) * 100;
    } else if (total < 50) {
      // Gold to Platinum (need 50)
      progress = ((total - 25) / 25) * 100;
    } else {
      // Already Platinum
      progress = 100;
    }
    
    return `${Math.round(progress)}%`;
  };

  return {
    loading,
    profileData,
    upcomingEvents,
    recentActivity,
    handleEventRSVP,
    handleResourceDownload,
    getBadgeProgress
  };
}
