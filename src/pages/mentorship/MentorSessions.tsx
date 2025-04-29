
import React, { useState, useEffect } from "react";
import { PageTemplate } from "@/components/common/PageTemplate";
import { Calendar, Clock, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getMentorSessionsByMentee, updateMentorSession } from "@/lib/mentorshipHelpers";
import { MentorSession } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

const MentorSessions = () => {
  const [upcomingSessions, setUpcomingSessions] = useState<MentorSession[]>([]);
  const [pastSessions, setPastSessions] = useState<MentorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchSessions = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const sessions = await getMentorSessionsByMentee(user.id);
        
        const now = new Date();
        const upcoming = sessions.filter(
          session => new Date(session.scheduled_at) > now && session.status !== 'canceled'
        );
        const past = sessions.filter(
          session => new Date(session.scheduled_at) <= now || session.status === 'completed'
        );
        
        setUpcomingSessions(upcoming);
        setPastSessions(past);
      } catch (error) {
        console.error("Error fetching mentor sessions:", error);
        toast({
          title: "Error",
          description: "Failed to load your mentorship sessions. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, [user, toast]);
  
  // Fallback data for development
  const fallbackUpcomingSessions = [
    {
      id: "1",
      mentor_id: "mentor1",
      mentee_id: "user123",
      topic: "Tech Strategy Discussion",
      scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      duration: 60,
      status: "scheduled",
      meeting_link: "https://meet.google.com/abc-defg-hij",
      mentor_profiles: {
        profiles: {
          first_name: "Jennifer",
          last_name: "Lee",
          profile_image_url: ""
        }
      }
    },
    {
      id: "2",
      mentor_id: "mentor2",
      mentee_id: "user123",
      topic: "Fundraising Preparation",
      scheduled_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      duration: 60,
      status: "scheduled",
      meeting_link: "https://meet.google.com/abc-defg-hij",
      mentor_profiles: {
        profiles: {
          first_name: "Robert",
          last_name: "Chen",
          profile_image_url: ""
        }
      }
    }
  ];
  
  const fallbackPastSessions = [
    {
      id: "3",
      mentor_id: "mentor3",
      mentee_id: "user123",
      topic: "Marketing Strategy Review",
      scheduled_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      duration: 60,
      status: "completed",
      meeting_link: "https://meet.google.com/abc-defg-hij",
      has_recording: true,
      has_notes: true,
      mentor_profiles: {
        profiles: {
          first_name: "Ayesha",
          last_name: "Khan",
          profile_image_url: ""
        }
      }
    },
    {
      id: "4",
      mentor_id: "mentor4",
      mentee_id: "user123",
      topic: "Operations Optimization",
      scheduled_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      duration: 60,
      status: "completed",
      meeting_link: "https://meet.google.com/abc-defg-hij",
      has_recording: false,
      has_notes: true,
      mentor_profiles: {
        profiles: {
          first_name: "Marcus",
          last_name: "Johnson",
          profile_image_url: ""
        }
      }
    }
  ];
  
  // Use database data if available, otherwise use fallback
  const displayUpcomingSessions = upcomingSessions.length > 0 
    ? upcomingSessions 
    : fallbackUpcomingSessions;
    
  const displayPastSessions = pastSessions.length > 0 
    ? pastSessions 
    : fallbackPastSessions;
  
  const handleJoinSession = (sessionId: string, meetingLink: string) => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    } else {
      toast({
        title: "No Meeting Link",
        description: "The meeting link for this session is not available yet.",
        variant: "destructive",
      });
    }
  };
  
  const handleReschedule = (sessionId: string) => {
    toast({
      title: "Reschedule Request Sent",
      description: "Your request to reschedule this session has been sent to the mentor.",
    });
  };
  
  const handleBookFollowUp = (mentorId: string) => {
    toast({
      title: "Follow-up Session",
      description: "You'll be redirected to book a follow-up session with this mentor.",
    });
  };
  
  return (
    <PageTemplate
      title="Mentor Sessions"
      description="View your upcoming and past mentorship sessions."
      icon={Calendar}
    >
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
          <TabsTrigger value="past">Past Sessions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <p>Loading your sessions...</p>
            </div>
          ) : displayUpcomingSessions.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-600">You don't have any upcoming mentor sessions scheduled.</p>
              <Button className="mt-4" onClick={() => window.location.href = "/mentorship/find"}>
                Find a Mentor
              </Button>
            </Card>
          ) : (
            displayUpcomingSessions.map((session, index) => (
              <Card key={session.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <Avatar className="h-16 w-16">
                      <AvatarImage 
                        src={session.mentor_profiles?.profiles?.profile_image_url || ""} 
                        alt={`${session.mentor_profiles?.profiles?.first_name || ""} ${session.mentor_profiles?.profiles?.last_name || ""}`} 
                      />
                      <AvatarFallback>
                        {session.mentor_profiles?.profiles
                          ? `${session.mentor_profiles.profiles.first_name?.[0] || ''}${session.mentor_profiles.profiles.last_name?.[0] || ''}`
                          : 'M'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <h3 className="font-medium text-lg">{session.topic}</h3>
                      <p className="text-gray-600">
                        with {session.mentor_profiles?.profiles
                          ? `${session.mentor_profiles.profiles.first_name || ''} ${session.mentor_profiles.profiles.last_name || ''}`
                          : 'Unknown Mentor'}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{format(new Date(session.scheduled_at), 'MMMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{format(new Date(session.scheduled_at), 'h:mm a')} ({session.duration} min)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Video className="h-4 w-4 text-gray-500" />
                          <span>Video Call</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 justify-center">
                      <Button onClick={() => handleJoinSession(session.id, session.meeting_link || "")}>
                        Join Session
                      </Button>
                      <Button variant="outline" className="text-red-500 hover:text-red-600" onClick={() => handleReschedule(session.id)}>
                        Reschedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <p>Loading your sessions...</p>
            </div>
          ) : displayPastSessions.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-600">You don't have any past mentor sessions.</p>
            </Card>
          ) : (
            displayPastSessions.map((session, index) => (
              <Card key={session.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <Avatar className="h-16 w-16">
                      <AvatarImage 
                        src={session.mentor_profiles?.profiles?.profile_image_url || ""} 
                        alt={`${session.mentor_profiles?.profiles?.first_name || ""} ${session.mentor_profiles?.profiles?.last_name || ""}`} 
                      />
                      <AvatarFallback>
                        {session.mentor_profiles?.profiles
                          ? `${session.mentor_profiles.profiles.first_name?.[0] || ''}${session.mentor_profiles.profiles.last_name?.[0] || ''}`
                          : 'M'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <h3 className="font-medium text-lg">{session.topic}</h3>
                      <p className="text-gray-600">
                        with {session.mentor_profiles?.profiles
                          ? `${session.mentor_profiles.profiles.first_name || ''} ${session.mentor_profiles.profiles.last_name || ''}`
                          : 'Unknown Mentor'}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{format(new Date(session.scheduled_at), 'MMMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{format(new Date(session.scheduled_at), 'h:mm a')} ({session.duration} min)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Video className="h-4 w-4 text-gray-500" />
                          <span>Video Call</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 justify-center">
                      {session.has_recording && (
                        <Button variant="outline">
                          View Recording
                        </Button>
                      )}
                      {session.has_notes && (
                        <Button variant="outline">
                          Session Notes
                        </Button>
                      )}
                      <Button variant="secondary" onClick={() => handleBookFollowUp(session.mentor_id)}>
                        Book Follow-up
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 p-6 border border-dashed rounded-lg text-center">
        <div className="text-3xl mb-2">🚧</div>
        <p className="font-medium">Session management tools coming soon</p>
        <p className="text-sm text-gray-500 mt-2">
          We're adding features to help you prepare for sessions, take notes, and track your progress.
        </p>
      </div>
    </PageTemplate>
  );
};

export default MentorSessions;
