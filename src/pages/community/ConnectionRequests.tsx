
import React, { useState, useEffect } from "react";
import { PageTemplate } from "@/components/common/PageTemplate";
import { UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

type ConnectionRequestType = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  requester?: {
    first_name: string;
    last_name: string;
    profile_image_url: string | null;
    profession: string | null;
    company: string | null;
  };
  recipient?: {
    first_name: string;
    last_name: string;
    profile_image_url: string | null;
    profession: string | null;
    company: string | null;
  };
};

// Define a helper function to check and transform profile data
function createUserProfile(data: any): {
  first_name: string;
  last_name: string;
  profile_image_url: string | null;
  profession: string | null;
  company: string | null;
} {
  // If data is null, undefined, or has an error property, return default values
  if (!data || typeof data !== 'object' || 'error' in data) {
    return {
      first_name: 'Unknown',
      last_name: 'User',
      profile_image_url: null,
      profession: null,
      company: null
    };
  }

  // Return the data with proper typing
  return {
    first_name: data.first_name || 'Unknown',
    last_name: data.last_name || 'User',
    profile_image_url: data.profile_image_url || null,
    profession: data.profession || null,
    company: data.company || null
  };
}

const ConnectionRequests = () => {
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequestType[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequestType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      fetchConnectionRequests();
    }
  }, [user]);
  
  const fetchConnectionRequests = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Fetch incoming connection requests
      const { data: incomingData, error: incomingError } = await supabase
        .from('connections')
        .select('*, requester:profiles(first_name, last_name, profile_image_url, profession, company)')
        .eq('recipient_id', user.id)
        .eq('status', 'pending');
        
      if (incomingError) throw incomingError;
      
      // Fetch outgoing connection requests
      const { data: outgoingData, error: outgoingError } = await supabase
        .from('connections')
        .select('*, recipient:profiles(first_name, last_name, profile_image_url, profession, company)')
        .eq('requester_id', user.id)
        .eq('status', 'pending');
        
      if (outgoingError) throw outgoingError;
      
      // Process the incoming data with proper type handling
      const processedIncoming: ConnectionRequestType[] = (incomingData || []).map(item => {
        // Ensure status is one of the expected values
        const status = ['pending', 'accepted', 'rejected'].includes(item.status) 
          ? item.status as 'pending' | 'accepted' | 'rejected'
          : 'pending';

        return {
          id: item.id,
          requester_id: item.requester_id,
          recipient_id: item.recipient_id,
          status,
          created_at: item.created_at,
          updated_at: item.updated_at,
          requester: createUserProfile(item.requester)
        };
      });
      
      // Process the outgoing data with proper type handling
      const processedOutgoing: ConnectionRequestType[] = (outgoingData || []).map(item => {
        // Ensure status is one of the expected values
        const status = ['pending', 'accepted', 'rejected'].includes(item.status) 
          ? item.status as 'pending' | 'accepted' | 'rejected'
          : 'pending';

        return {
          id: item.id,
          requester_id: item.requester_id,
          recipient_id: item.recipient_id,
          status,
          created_at: item.created_at,
          updated_at: item.updated_at,
          recipient: createUserProfile(item.recipient)
        };
      });
      
      setIncomingRequests(processedIncoming);
      setOutgoingRequests(processedOutgoing);
    } catch (error) {
      console.error('Error fetching connection requests:', error);
      toast({
        title: "Error",
        description: "Failed to load connection requests.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAcceptConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', connectionId);
        
      if (error) throw error;
      
      toast({
        title: "Connection Accepted",
        description: "You are now connected with this member.",
      });
      
      // Refresh the connection requests
      fetchConnectionRequests();
    } catch (error) {
      console.error('Error accepting connection:', error);
      toast({
        title: "Error",
        description: "Failed to accept connection request.",
        variant: "destructive",
      });
    }
  };
  
  const handleRejectConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', connectionId);
        
      if (error) throw error;
      
      toast({
        title: "Connection Rejected",
        description: "You have rejected this connection request.",
      });
      
      // Refresh the connection requests
      fetchConnectionRequests();
    } catch (error) {
      console.error('Error rejecting connection:', error);
      toast({
        title: "Error",
        description: "Failed to reject connection request.",
        variant: "destructive",
      });
    }
  };
  
  const handleCancelRequest = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);
        
      if (error) throw error;
      
      toast({
        title: "Request Cancelled",
        description: "Your connection request has been cancelled.",
      });
      
      // Refresh the connection requests
      fetchConnectionRequests();
    } catch (error) {
      console.error('Error cancelling connection request:', error);
      toast({
        title: "Error",
        description: "Failed to cancel connection request.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <PageTemplate
      title="Connection Requests"
      description="Manage your connection requests"
      icon={UserPlus}
    >
      <Tabs defaultValue="incoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incoming">
            Incoming Requests
            {incomingRequests.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {incomingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="outgoing">
            Outgoing Requests
            {outgoingRequests.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {outgoingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="incoming" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-sm">Loading requests...</p>
            </div>
          ) : incomingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">You have no pending connection requests.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {incomingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage 
                            src={request.requester?.profile_image_url || ''} 
                            alt={`${request.requester?.first_name} ${request.requester?.last_name}`} 
                          />
                          <AvatarFallback>
                            {request.requester?.first_name?.[0] || ''}
                            {request.requester?.last_name?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {request.requester?.first_name} {request.requester?.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {request.requester?.profession}{request.requester?.company ? ` at ${request.requester.company}` : ''}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRejectConnection(request.id)}
                        >
                          Decline
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleAcceptConnection(request.id)}
                        >
                          Accept
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="outgoing" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-sm">Loading requests...</p>
            </div>
          ) : outgoingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">You haven't sent any connection requests.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {outgoingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage 
                            src={request.recipient?.profile_image_url || ''} 
                            alt={`${request.recipient?.first_name} ${request.recipient?.last_name}`} 
                          />
                          <AvatarFallback>
                            {request.recipient?.first_name?.[0] || ''}
                            {request.recipient?.last_name?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {request.recipient?.first_name} {request.recipient?.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {request.recipient?.profession}{request.recipient?.company ? ` at ${request.recipient.company}` : ''}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Sent: {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCancelRequest(request.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
};

export default ConnectionRequests;
