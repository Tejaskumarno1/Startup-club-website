import React, { useState, useEffect } from 'react';
import { AdminPageTemplate } from "@/components/admin/AdminPageTemplate";
import { BarChart, PieChart, LineChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RePieChart, Pie, LineChart as ReLineChart, Line, Cell } from 'recharts';
import { getAdminStats, AdminStatsResult, getProfilesData, ProfilesData } from "@/lib/adminHelpers";
import { useToast } from "@/hooks/use-toast";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const AdminAnalytics = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStatsResult['data']>();
  const [profilesData, setProfilesData] = useState<ProfilesData>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching admin analytics data...");
        
        // Fetch admin stats using the fixed getAdminStats function
        const { success, data, error } = await getAdminStats();
        if (!success) {
          console.error("Error fetching admin stats:", error);
          throw error;
        }
        
        console.log("Admin stats successfully fetched:", data);
        setStats(data);
        
        // Fetch profiles data using the updated getProfilesData function
        const { success: profileSuccess, data: profileData, error: profileError } = await getProfilesData();
        if (!profileSuccess) {
          console.error("Error fetching profile data:", profileError);
          throw profileError;
        }
        
        console.log("Profile data successfully fetched:", profileData);
        setProfilesData(profileData);
      } catch (error: any) {
        console.error('Error fetching analytics data:', error);
        toast({
          title: "Error loading analytics",
          description: error?.message || "Failed to load analytics data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <AdminPageTemplate title="Analytics" description="View club performance metrics and insights" icon={BarChart}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminPageTemplate>
    );
  }

  return (
    <AdminPageTemplate title="Analytics" description="View club performance metrics and insights" icon={BarChart}>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profilesData?.totalProfiles || stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Registered members in the system
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.eventsCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                Events organized by the club
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Startups</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.startupsCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                Startups connected to the club
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Mentors</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.mentorsCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active mentors in the system
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">
              <BarChart className="h-4 w-4 mr-2" />
              Member Analytics
            </TabsTrigger>
            <TabsTrigger value="events">
              <LineChart className="h-4 w-4 mr-2" />
              Event Analytics
            </TabsTrigger>
            <TabsTrigger value="startups">
              <PieChart className="h-4 w-4 mr-2" />
              Startup Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent value="members" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Roles Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of club members by role
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {profilesData?.roles && profilesData.roles.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={profilesData.roles}
                          dataKey="count"
                          nameKey="role"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          label={({ role, count }) => `${role}: ${count}`}
                        >
                          {profilesData.roles.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RePieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No role data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Member Locations</CardTitle>
                  <CardDescription>
                    Geographic distribution of members
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {profilesData?.locations && profilesData.locations.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={profilesData.locations.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="location" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Members" fill="#8884d8" />
                      </ReBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No location data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>New Member Registrations</CardTitle>
                  <CardDescription>
                    Member sign-ups in the past 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {profilesData?.newProfiles && profilesData.newProfiles.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ReLineChart data={profilesData.newProfiles}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          name="New Members" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                        />
                      </ReLineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No new member data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Company Distribution</CardTitle>
                  <CardDescription>
                    Members grouped by company/organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {profilesData?.companies && profilesData.companies.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={profilesData.companies.slice(0, 10)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="company" type="category" width={100} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Members" fill="#82ca9d" />
                      </ReBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No company data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Event Analytics</CardTitle>
                <CardDescription>
                  Event metrics will be implemented soon
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <p className="text-muted-foreground">Event analytics coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="startups">
            <Card>
              <CardHeader>
                <CardTitle>Startup Analytics</CardTitle>
                <CardDescription>
                  Startup metrics will be implemented soon
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <p className="text-muted-foreground">Startup analytics coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageTemplate>
  );
};

export default AdminAnalytics;
