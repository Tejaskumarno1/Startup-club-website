
import React, { useState, useEffect, useCallback } from "react";
import { PageTemplate } from "@/components/common/PageTemplate";
import { 
  Users, 
  Search, 
  MessageSquare,
  BarChart3,
  Filter,
  ChevronDown
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { getOrCreateDirectMessageRoom } from "@/lib/chatHelpers";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

// Connection stats component
const ConnectionStats = ({ activeCount }) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Connection Statistics</h3>
              <p className="text-sm text-gray-500">Overview of your professional network</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg text-center w-full md:w-auto">
            <p className="text-2xl font-bold text-primary">{activeCount}</p>
            <p className="text-xs text-gray-500">Connected Members</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Message Dialog component
const MessageDialog = ({ user, onSendMessage }) => {
  const [message, setMessage] = useState("");
  
  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(user.id, message);
      setMessage("");
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex gap-1 items-center">
          <MessageSquare className="h-4 w-4" />
          Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Message {user.first_name} {user.last_name}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-4 py-2">
          <Avatar>
            <AvatarImage src={user.photo_url || ""} />
            <AvatarFallback>
              {user.first_name?.[0] || ""}{user.last_name?.[0] || ""}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.first_name} {user.last_name}</p>
            <p className="text-sm text-gray-500">{user.profession || "Member"}</p>
          </div>
        </div>
        <Textarea 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          className="min-h-[120px]"
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" onClick={handleSend} disabled={!message.trim()}>
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const MyConnections = () => {
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<string>("name");
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Fetch all profiles as connections - simulating all users are connected
  const fetchConnections = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Get all profiles except the current user
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id);
      
      if (error) throw error;
      
      setConnections(data as User[]);
    } catch (error) {
      console.error("Error fetching connections:", error);
      toast({
        title: "Error",
        description: "Failed to load connections. Please try again later.",
        variant: "destructive",
      });
      
      setConnections([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);
  
  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);
  
  const handleSendMessage = async (recipientId: string, message: string) => {
    if (!user?.id) return;
    
    try {
      // Create or get direct message room
      const result = await getOrCreateDirectMessageRoom(user.id, recipientId);
      
      if (!result.success || !result.roomId) {
        throw new Error(result.error || "Failed to create chat room");
      }
      
      // Navigate to the chat room
      navigate(`/chat/${result.roomId}`);
      
      toast({
        title: "Chat Room Created",
        description: "You can now start messaging.",
      });
    } catch (error) {
      console.error("Error creating chat room:", error);
      toast({
        title: "Error",
        description: "Failed to create chat room. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };
  
  // Filter connections based on search term
  const filteredConnections = connections.filter(connection => {
    if (!searchTerm.trim()) return true;
    
    const fullName = `${connection.first_name || ''} ${connection.last_name || ''}`.toLowerCase();
    const companyName = (connection.company || '').toLowerCase();
    const profession = (connection.profession || '').toLowerCase();
    
    return fullName.includes(searchTerm.toLowerCase()) || 
      companyName.includes(searchTerm.toLowerCase()) ||
      profession.includes(searchTerm.toLowerCase());
  });
  
  // Sort connections based on sort option
  const sortedConnections = [...filteredConnections].sort((a, b) => {
    switch (sortOption) {
      case 'name':
        return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      case 'company':
        return (a.company || '').localeCompare(b.company || '');
      case 'profession':
        return (a.profession || '').localeCompare(b.profession || '');
      default:
        return 0;
    }
  });
  
  return (
    <PageTemplate
      title="My Connections"
      description="Connect with founders, mentors, and collaborators."
      icon={Users}
    >
      <div className="space-y-6">
        {/* Connection Statistics */}
        <ConnectionStats activeCount={connections.length} />
        
        {/* Search and filter controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-center mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input 
              placeholder="Search connections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter size={16} />
                Sort by
                <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortOption("name")}>
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("company")}>
                Company
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("profession")}>
                Profession
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Connections List with ScrollArea */}
        <ScrollArea className="h-[calc(100vh-350px)]">
          <div className="space-y-4 pr-4">
            {loading ? (
              <div className="flex justify-center py-10">
                <p>Loading connections...</p>
              </div>
            ) : sortedConnections.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-gray-600 mb-4">No connections found matching your search.</p>
              </Card>
            ) : (
              sortedConnections.map(connection => (
                <Card key={connection.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={connection.photo_url || ""} />
                        <AvatarFallback>
                          {connection.first_name?.[0] || ""}{connection.last_name?.[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {connection.first_name} {connection.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">{connection.profession || "Member"}</p>
                        {connection.company && (
                          <p className="text-xs text-gray-400">{connection.company}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <MessageDialog 
                          user={connection} 
                          onSendMessage={handleSendMessage} 
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewProfile(connection.id)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </PageTemplate>
  );
};

export default MyConnections;
