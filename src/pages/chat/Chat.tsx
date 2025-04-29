
import React, { useState, useEffect, useRef } from "react";
import { PageTemplate } from "@/components/common/PageTemplate";
import { MessageSquare, Send, UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { supabase, ChatMessage, ChatRoom } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const Chat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [showRooms, setShowRooms] = useState(!isMobile);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching rooms:', error);
        toast({
          title: "Error",
          description: "Could not load chat rooms.",
          variant: "destructive",
        });
        return;
      }
      
      if (data && data.length > 0) {
        setRooms(data as ChatRoom[]);
        if (!currentRoom) {
          setCurrentRoom(data[0].id);
        }
      }
    };

    fetchRooms();
  }, [toast, currentRoom]);

  // Fetch messages for the current room
  useEffect(() => {
    if (!currentRoom) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles:sender_id (first_name, last_name)
        `)
        .eq('chat_room_id', currentRoom)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Could not load messages.",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        setMessages(data as any[]);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel(`room-${currentRoom}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages',
        filter: `chat_room_id=eq.${currentRoom}`
      }, (payload) => {
        // Add the new message to our messages state
        const newMessage = payload.new as ChatMessage;
        
        // Fetch the user's name for the message
        const fetchUser = async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', newMessage.sender_id)
            .single();
          
          if (!error && data) {
            setMessages(prev => [...prev, {
              ...newMessage,
              profiles: data
            } as any]);
          }
        };
        
        fetchUser();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentRoom, toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle mobile view side panel toggle
  useEffect(() => {
    setShowRooms(!isMobile);
  }, [isMobile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user || !currentRoom) return;
    
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([
          {
            sender_id: user.id,
            content: message,
            chat_room_id: currentRoom,
            created_at: new Date().toISOString(),
          }
        ]);
      
      if (error) {
        throw error;
      }
      
      setMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      console.error('Error sending message:', error);
    }
  };

  if (!user) {
    return (
      <PageTemplate
        title="Chat"
        description="Connect with other members in real-time."
        icon={MessageSquare}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Please Sign In</h3>
              <p className="text-gray-500 mb-4">
                You need to be signed in to access the chat features.
              </p>
              <Button onClick={() => window.location.href = "/login"}>
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Chat"
      description="Connect with other members in real-time."
      icon={MessageSquare}
    >
      {isMobile && (
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => setShowRooms(!showRooms)}
            className="w-full mb-2"
          >
            {showRooms ? "Hide Channels" : "Show Channels"}
          </Button>
        </div>
      )}

      <div className={`grid ${!isMobile ? 'md:grid-cols-4' : ''} gap-6 h-[calc(80vh-100px)]`}>
        {/* Room List - conditionally shown on mobile */}
        {(showRooms || !isMobile) && (
          <Card className={`${!isMobile ? 'md:col-span-1' : ''} overflow-hidden`}>
            <CardHeader className="pb-4">
              <CardTitle>Chat Rooms</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className={`h-[calc(${isMobile ? '40vh' : '80vh'}-220px)]`}>
                <div className="px-4 py-2">
                  {rooms.length > 0 ? (
                    rooms.map((room) => (
                      <Button
                        key={room.id}
                        variant={currentRoom === room.id ? "default" : "ghost"}
                        className="w-full justify-start mb-1"
                        onClick={() => {
                          setCurrentRoom(room.id);
                          if (isMobile) setShowRooms(false);
                        }}
                      >
                        # {room.name}
                      </Button>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">No rooms available</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Chat Area - conditionally shown on mobile */}
        {(!showRooms || !isMobile) && (
          <Card className={`${!isMobile ? 'md:col-span-3' : ''} flex flex-col`}>
            <CardHeader className="pb-4">
              <CardTitle>
                {currentRoom && rooms.find(r => r.id === currentRoom)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col p-0">
              <ScrollArea className="flex-grow px-4 h-[calc(80vh-220px)]">
                <div className="space-y-4 py-4">
                  {messages.length > 0 ? (
                    messages.map((msg, index) => {
                      const isCurrentUser = user?.id === msg.sender_id;
                      return (
                        <div 
                          key={index}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[85%] sm:max-w-[75%] rounded-lg p-3 ${
                              isCurrentUser 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-secondary'
                            }`}
                          >
                            {!isCurrentUser && (
                              <div className="flex items-center gap-2 mb-1">
                                <UserCircle className="h-4 w-4" />
                                <span className="text-xs font-medium">
                                  {(msg as any).profiles?.first_name} {(msg as any).profiles?.last_name}
                                </span>
                              </div>
                            )}
                            <p className="text-sm break-words">{msg.content}</p>
                            <p className="text-xs opacity-70 text-right mt-1">
                              {new Date(msg.created_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No messages yet. Start the conversation!
                    </p>
                  )}
                  <div ref={messageEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex w-full gap-2">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-grow"
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        )}
      </div>
    </PageTemplate>
  );
};

export default Chat;
