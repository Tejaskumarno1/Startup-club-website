
import React, { useState, useEffect } from "react";
import { PageTemplate } from "@/components/common/PageTemplate";
import { 
  User, Mail, Building, MapPin, Briefcase, 
  Calendar, Link as LinkIcon, 
  Edit, Settings, Award 
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import type { User as UserType } from "@/lib/types";
import { cn } from "@/lib/utils";

const Profile = () => {
  const { user, getDetailedProfile } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetailedProfile = async () => {
      if (user) {
        try {
          setLoading(true);
          const detailedProfile = await getDetailedProfile();
          setUserData(detailedProfile);
        } catch (error) {
          console.error("Error fetching detailed profile:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchDetailedProfile();
  }, [user, getDetailedProfile]);

  if (loading) {
    return (
      <PageTemplate title="Profile" description="Your profile information" icon={User}>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </PageTemplate>
    );
  }

  if (!user) {
    return (
      <PageTemplate title="Profile" description="Your profile information" icon={User}>
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Please sign in to view your profile</h2>
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </div>
      </PageTemplate>
    );
  }

  const displayUser = userData || user;
  const firstName = displayUser.first_name || (displayUser as any).user_metadata?.first_name || "";
  const lastName = displayUser.last_name || (displayUser as any).user_metadata?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim() || "User";
  const bio = displayUser.bio || (displayUser as any).user_metadata?.bio || "No bio available";
  const email = displayUser.email || "";
  const interests = displayUser.interests || [];
  const photoUrl = displayUser.photo_url || (displayUser as any).user_metadata?.photo_url || "";
  const company = displayUser.company || (displayUser as any).user_metadata?.company || "Not specified";
  const profession = displayUser.profession || (displayUser as any).user_metadata?.profession || "Not specified";
  const location = displayUser.location || (displayUser as any).user_metadata?.location || "Not specified";
  const connectionsCount = displayUser.connections_count || 0;
  const joinedEventsCount = displayUser.joined_events_count || 0;

  return (
    <PageTemplate title="Profile" description="Your profile information" icon={User}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="dark:bg-gray-800/70 dark:border-gray-700">
            <CardContent className="p-0">
              <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-900 dark:to-indigo-900"></div>
              
              <div className="relative px-6 pb-6">
                <Avatar className="h-24 w-24 absolute -top-12 border-4 border-white dark:border-gray-700">
                  <AvatarImage src={photoUrl} alt={fullName} />
                  <AvatarFallback className="bg-primary text-white text-xl dark:bg-gray-600">
                    {firstName?.[0]}{lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="pt-16">
                  <h2 className="text-2xl font-bold dark:text-white">{fullName}</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                    <Briefcase className="h-4 w-4 mr-1" />
                    {profession}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    {company}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {location}
                  </p>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <Button 
                    onClick={() => navigate("/profile/edit")} 
                    className="w-full dark:bg-blue-700 dark:hover:bg-blue-600"
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/profile/settings")}
                    className="w-auto dark:border-gray-600 dark:text-white"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="dark:bg-gray-800/70 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg dark:text-white">Profile Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-2xl font-bold text-primary dark:text-white">{connectionsCount}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Connections</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-2xl font-bold text-primary dark:text-white">{joinedEventsCount}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="dark:bg-gray-800/70 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg dark:text-white">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium dark:text-white">Email</p>
                  <p className="text-gray-500 dark:text-gray-400 break-all">{email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="about" className="dark:text-white">
            <TabsList className="mb-4 dark:bg-gray-800 dark:border dark:border-gray-700">
              <TabsTrigger 
                value="about" 
                className="dark:data-[state=active]:bg-blue-700 dark:data-[state=active]:text-white dark:hover:bg-gray-700"
              >
                About
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="dark:data-[state=active]:bg-blue-700 dark:data-[state=active]:text-white dark:hover:bg-gray-700"
              >
                Activity
              </TabsTrigger>
              <TabsTrigger 
                value="events" 
                className="dark:data-[state=active]:bg-blue-700 dark:data-[state=active]:text-white dark:hover:bg-gray-700"
              >
                Events
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="about">
              <Card className="dark:bg-gray-800/70 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Bio</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {bio}
                  </p>
                  
                  {interests.length > 0 && (
                    <>
                      <Separator className="my-4 dark:bg-gray-700" />
                      <div>
                        <h4 className="text-sm font-medium mb-2 dark:text-white">Interests</h4>
                        <div className="flex flex-wrap gap-2">
                          {interests.map((interest, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="dark:bg-gray-700 dark:text-gray-300"
                            >
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity">
              <Card className="dark:bg-gray-800/70 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Activity</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Your recent activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                    <p className="dark:text-white">No recent activity to display</p>
                    <p className="text-sm mt-1 dark:text-gray-400">Your activity will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="events">
              <Card className="dark:bg-gray-800/70 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Events</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Events you've joined or are interested in
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                    <p className="dark:text-white">No events to display</p>
                    <p className="text-sm mt-1 dark:text-gray-400">Events you join will appear here</p>
                    <Button 
                      className="mt-4 dark:bg-blue-700 dark:hover:bg-blue-600" 
                      variant="outline"
                      onClick={() => navigate("/events")}
                    >
                      Browse Events
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTemplate>
  );
};

export default Profile;
