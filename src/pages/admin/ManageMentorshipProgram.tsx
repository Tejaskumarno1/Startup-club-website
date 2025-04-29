
import React, { useState, useEffect } from "react";
import { AdminPageTemplate } from "@/components/admin/AdminPageTemplate";
import { UserPlus, Search, FileText, CheckCircle, XCircle, Edit, Eye, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getMentorApplications } from "@/lib/adminMentorHelpers";
import { approveMentorApplication } from "@/lib/adminHelpers";

interface MentorApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  expertise: string[];
  experience_years: number;
  is_approved: boolean;
  created_at: string;
}

interface MentorshipSession {
  id: string;
  mentor_name: string;
  mentee_name: string;
  scheduled_at: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
}

const ManageMentorshipProgram = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("applications");
  const [applications, setApplications] = useState<MentorApplication[]>([]);
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (activeTab === "applications") {
      fetchMentorApplications();
    } else if (activeTab === "sessions") {
      fetchMentorSessions();
    }
  }, [activeTab]);

  const fetchMentorApplications = async () => {
    setLoading(true);
    try {
      const data = await getMentorApplications();
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching mentor applications:", error);
      toast({
        title: "Error",
        description: "Failed to load mentor applications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMentorSessions = async () => {
    setLoading(true);
    try {
      // Fetch mentorship sessions
      const { data, error } = await supabase
        .from('mentor_sessions')
        .select(`
          id,
          scheduled_at,
          duration_minutes,
          status,
          created_at,
          mentor_profiles!inner (
            profiles:user_id (
              first_name,
              last_name
            )
          ),
          profiles:mentee_id (
            first_name,
            last_name
          )
        `)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      // Process the data into the format we need
      const formattedSessions: MentorshipSession[] = data.map((session: any) => ({
        id: session.id,
        mentor_name: `${session.mentor_profiles.profiles.first_name || ''} ${session.mentor_profiles.profiles.last_name || ''}`.trim(),
        mentee_name: `${session.profiles.first_name || ''} ${session.profiles.last_name || ''}`.trim(),
        scheduled_at: session.scheduled_at,
        duration: session.duration_minutes,
        status: session.status,
        created_at: session.created_at
      }));

      setSessions(formattedSessions);
    } catch (error) {
      console.error("Error fetching mentorship sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load mentorship sessions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const success = await approveMentorApplication(userId);
      
      if (success) {
        setApplications(prev => 
          prev.map(app => 
            app.user_id === userId ? { ...app, is_approved: true } : app
          )
        );
        
        toast({
          title: "Success",
          description: "Mentor application approved successfully.",
        });
      } else {
        throw new Error("Failed to approve application");
      }
    } catch (error) {
      console.error("Error approving mentor:", error);
      toast({
        title: "Error",
        description: "Failed to approve mentor application.",
        variant: "destructive",
      });
    }
  };

  const filteredApplications = applications
    .filter(app => {
      if (filter === 'pending') return !app.is_approved;
      if (filter === 'approved') return app.is_approved;
      return true;
    })
    .filter(app => 
      searchQuery === "" || 
      app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredSessions = sessions.filter(session => 
    searchQuery === "" || 
    session.mentor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.mentee_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <AdminPageTemplate
      title="Manage Mentorship Program"
      description="Oversee mentors, applications, and mentorship sessions across the platform."
      icon={UserPlus}
    >
      <Tabs defaultValue="applications" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="applications">Mentor Applications</TabsTrigger>
            <TabsTrigger value="sessions">Mentorship Sessions</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={activeTab === "applications" ? "Search applications..." : "Search sessions..."}
                className="pl-8 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {activeTab === "applications" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    {filter === 'all' ? 'All Applications' : 
                      filter === 'pending' ? 'Pending' : 'Approved'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilter('all')}>
                    All Applications
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('pending')}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('approved')}>
                    Approved
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={activeTab === "applications" ? fetchMentorApplications : fetchMentorSessions}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Mentor Applications</CardTitle>
              <CardDescription>
                Review and manage people who have applied to become mentors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-60">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery || filter !== 'all' 
                    ? "No applications match your filters"
                    : "No mentor applications available"}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Expertise</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Applied</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.full_name}</TableCell>
                        <TableCell>{app.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {app.expertise.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{app.experience_years} years</TableCell>
                        <TableCell>
                          {app.is_approved ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approved
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          {!app.is_approved && (
                            <Button
                              onClick={() => handleApprove(app.user_id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Mentorship Sessions</CardTitle>
              <CardDescription>
                View and manage all mentorship sessions across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-60">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery 
                    ? "No sessions match your search"
                    : "No mentorship sessions available"}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mentor</TableHead>
                      <TableHead>Mentee</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.mentor_name}</TableCell>
                        <TableCell>{session.mentee_name}</TableCell>
                        <TableCell>{formatDateTime(session.scheduled_at)}</TableCell>
                        <TableCell>{session.duration} minutes</TableCell>
                        <TableCell>
                          {session.status === 'completed' ? (
                            <Badge className="bg-green-100 text-green-800">Completed</Badge>
                          ) : session.status === 'cancelled' ? (
                            <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">Scheduled</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Session
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                View Notes
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageTemplate>
  );
};

export default ManageMentorshipProgram;
44