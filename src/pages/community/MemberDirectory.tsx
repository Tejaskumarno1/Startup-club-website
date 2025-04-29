
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PageTemplate } from "@/components/common/PageTemplate";
import { UserSearch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/lib/types";

const MemberDirectory = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [connectionStatus, setConnectionStatus] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    fetchMembers();
  }, []);
  
  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'admin');
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        setMembers(data as User[]);
        
        if (user) {
          fetchConnectionStatus(data as User[]);
        }
      } else {
        setMembers(getFallbackMembers());
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Error",
        description: "Failed to load members. Using fallback data.",
        variant: "destructive",
      });
      
      setMembers(getFallbackMembers());
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchConnectionStatus = async (members: User[]) => {
    if (!user) return;
    
    try {
      const memberIds = members.map(member => member.id);
      
      // Get connections where user is either requester or recipient
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .in('requester_id', [...memberIds, user.id])
        .in('recipient_id', [...memberIds, user.id]);
        
      if (error) throw error;
      
      const statusMap: Record<string, string> = {};
      
      if (data) {
        data.forEach(connection => {
          let otherUserId;
          
          if (connection.requester_id === user.id) {
            otherUserId = connection.recipient_id;
          } else if (connection.recipient_id === user.id) {
            otherUserId = connection.requester_id;
          }
          
          if (otherUserId) {
            if (connection.status === 'pending') {
              statusMap[otherUserId] = connection.requester_id === user.id 
                ? 'request-sent' 
                : 'request-received';
            } else if (connection.status === 'accepted') {
              statusMap[otherUserId] = 'connected';
            } else if (connection.status === 'rejected') {
              statusMap[otherUserId] = 'rejected';
            }
          }
        });
      }
      
      setConnectionStatus(statusMap);
    } catch (error) {
      console.error('Error fetching connection status:', error);
    }
  };
  
  const getFallbackMembers = (): User[] => {
    return [
      {
        id: 'mem1',
        first_name: 'Emma',
        last_name: 'Wilson',
        email: 'emma.wilson@example.com',
        role: 'founder',
        profession: 'CEO & Founder',
        company: 'FutureLearn',
        industry: 'tech',
        location: 'San Francisco, CA',
        profile_image_url: '',
        interests: ['AI', 'EdTech', 'Product Development'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'mem2',
        first_name: 'Marco',
        last_name: 'Rossi',
        email: 'marco.rossi@example.com',
        role: 'member',
        profession: 'Product Manager',
        company: 'InnovateCorp',
        industry: 'tech',
        location: 'Boston, MA',
        profile_image_url: '',
        interests: ['Product Strategy', 'UX Design', 'Growth'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'mem3',
        first_name: 'Priya',
        last_name: 'Sharma',
        email: 'priya.sharma@example.com',
        role: 'mentor',
        profession: 'Investment Advisor',
        company: 'Capital Ventures',
        industry: 'finance',
        location: 'New York, NY',
        profile_image_url: '',
        interests: ['Venture Capital', 'Startups', 'Finance'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'mem4',
        first_name: 'James',
        last_name: 'Clark',
        email: 'james.clark@example.com',
        role: 'member',
        profession: 'Marketing Director',
        company: 'GrowthMakers',
        industry: 'marketing',
        location: 'Chicago, IL',
        profile_image_url: '',
        interests: ['Digital Marketing', 'Brand Strategy', 'Content'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'mem5',
        first_name: 'Sophia',
        last_name: 'Lee',
        email: 'sophia.lee@example.com',
        role: 'founder',
        profession: 'CTO',
        company: 'TechFlow',
        industry: 'tech',
        location: 'Seattle, WA',
        profile_image_url: '',
        interests: ['Software Development', 'Cloud Architecture', 'AI'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'mem6',
        first_name: 'Daniel',
        last_name: 'Kim',
        email: 'daniel.kim@example.com',
        role: 'mentor',
        profession: 'Angel Investor',
        company: 'DK Ventures',
        industry: 'finance',
        location: 'Austin, TX',
        profile_image_url: '',
        interests: ['Seed Funding', 'Startups', 'Mentoring'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  };
  
  const handleSearch = () => {
    console.log("Searching for:", searchTerm, "in industry:", industryFilter);
  };
  
  const filteredMembers = members.filter(member => {
    const matchesSearch = searchTerm 
      ? (member.first_name + ' ' + member.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.profession || '').toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    const matchesIndustry = industryFilter === 'all' || member.industry === industryFilter;
    
    return matchesSearch && matchesIndustry;
  });
  
  const handleConnect = async (memberId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to connect with members",
        variant: "destructive",
      });
      return;
    }
    
    // Don't allow connecting to yourself
    if (user.id === memberId) {
      toast({
        title: "Cannot Connect",
        description: "You cannot send a connection request to yourself.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if there's already a connection request
    if (connectionStatus[memberId]) {
      if (connectionStatus[memberId] === 'connected') {
        toast({
          title: "Already Connected",
          description: "You are already connected with this member.",
        });
      } else if (connectionStatus[memberId] === 'request-sent') {
        toast({
          title: "Request Already Sent",
          description: "You've already sent a connection request to this member.",
        });
      } else if (connectionStatus[memberId] === 'request-received') {
        toast({
          title: "Request Pending",
          description: "This member has sent you a connection request. Check your requests page.",
        });
      }
      return;
    }
    
    try {
      // Create a new connection request
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: memberId,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast({
        title: "Connection Request Sent",
        description: "Your connection request has been sent successfully.",
      });
      
      // Update local state
      setConnectionStatus(prevState => ({
        ...prevState,
        [memberId]: 'request-sent'
      }));
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Request Failed",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleViewProfile = (memberId: string) => {
    toast({
      title: "Feature Coming Soon",
      description: "Member profile view will be available soon.",
    });
  };
  
  const getConnectionButtonText = (memberId: string) => {
    if (!user) return "Connect";
    if (user.id === memberId) return "You";
    
    const status = connectionStatus[memberId];
    
    if (!status) return "Connect";
    if (status === 'connected') return "Connected";
    if (status === 'request-sent') return "Request Sent";
    if (status === 'request-received') return "Respond";
    
    return "Connect";
  };
  
  const getConnectionButtonVariant = (memberId: string): "default" | "outline" | "secondary" => {
    if (!user || user.id === memberId) return "outline";
    
    const status = connectionStatus[memberId];
    
    if (!status) return "default";
    if (status === 'connected') return "secondary";
    if (status === 'request-sent') return "outline";
    if (status === 'request-received') return "default";
    
    return "default";
  };
  
  return (
    <PageTemplate
      title="Member Directory"
      description="Browse and search for members of the Startup Club community."
      icon={UserSearch}
    >
      <div className="space-y-4 sm:space-y-6 w-full overflow-x-hidden">
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <Input 
                placeholder="Search members by name, company, or profession" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-full sm:w-[180px] text-sm">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="health">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} className="text-sm">Search</Button>
            </div>
          </div>
        </Card>
        
        {!user && (
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="text-amber-500 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              </div>
              <div className="text-center sm:text-left">
                <h4 className="font-medium text-amber-700">Sign in to connect with members</h4>
                <p className="text-sm text-amber-600">Create an account or sign in to send connection requests</p>
              </div>
              <div className="mt-2 sm:mt-0 sm:ml-auto">
                <Button asChild variant="outline" size="sm">
                  <Link to="/auth/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </Card>
        )}
        
        {user && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <h3 className="text-lg font-medium">Members</h3>
            <Button asChild variant="outline" size="sm">
              <Link to="/community/connection-requests">
                View Connection Requests
              </Link>
            </Button>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-sm">Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-sm">No members found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                      <AvatarImage src={member.profile_image_url} alt={`${member.first_name} ${member.last_name}`} />
                      <AvatarFallback>
                        {member.first_name?.charAt(0) || ''}
                        {member.last_name?.charAt(0) || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 min-w-0 flex-1">
                      <h3 className="font-medium text-base sm:text-lg truncate">
                        {member.first_name} {member.last_name}
                        {user && user.id === member.id && (
                          <Badge className="ml-2 text-xs" variant="outline">You</Badge>
                        )}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{member.profession || 'Member'} {member.company ? `at ${member.company}` : ''}</p>
                      <p className="text-xs text-gray-500 truncate">{member.location || 'Location not specified'}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(member.interests || []).slice(0, 3).map((interest, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewProfile(member.id)}
                      className="text-xs h-8"
                    >
                      View Profile
                    </Button>
                    <Button 
                      variant={getConnectionButtonVariant(member.id)}
                      size="sm"
                      onClick={() => handleConnect(member.id)}
                      className="text-xs h-8"
                      disabled={user?.id === member.id || connectionStatus[member.id] === 'connected' || connectionStatus[member.id] === 'request-sent'}
                    >
                      {getConnectionButtonText(member.id)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="mt-6 p-4 sm:p-6 border border-dashed rounded-lg text-center">
          <div className="text-2xl sm:text-3xl mb-2">🚧</div>
          <p className="font-medium text-sm sm:text-base">Enhanced directory features coming soon</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            We're working on adding advanced search filters, connection requests, 
            and direct messaging between members.
          </p>
        </div>
      </div>
    </PageTemplate>
  );
};

export default MemberDirectory;
