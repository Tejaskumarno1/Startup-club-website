
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Plus } from "lucide-react";
import ChatRoomComponent from "@/components/chat/ChatRoomComponent";
import { checkChatRoomExists, getChatRooms, createChatRoom } from "@/lib/chatHelpers";
import { ChatRoom } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Chat = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roomExists, setRoomExists] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const chatRooms = await getChatRooms();
        setRooms(chatRooms);
        
        // If a roomId is provided, check if it exists and set it as selected
        if (roomId) {
          const roomExists = await checkChatRoomExists(roomId);
          if (roomExists) {
            const selectedRoom = chatRooms.find(room => room.id === roomId) || null;
            setSelectedRoom(selectedRoom);
            setRoomExists(true);
          } else {
            setRoomExists(false);
            toast({
              title: "Room not found",
              description: "The chat room you're looking for doesn't exist or has been removed.",
              variant: "destructive",
            });
          }
        } else if (chatRooms.length > 0) {
          // If no roomId is provided, select the first room
          setSelectedRoom(chatRooms[0]);
          navigate(`/chat/${chatRooms[0].id}`);
        }
      } catch (error) {
        console.error("Error fetching chat rooms:", error);
        toast({
          title: "Error",
          description: "Failed to load chat rooms. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatRooms();
  }, [roomId, navigate, toast]);

  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
    navigate(`/chat/${room.id}`);
  };

  const createNewRoom = () => {
    setIsCreateRoomOpen(true);
  };
  
  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      toast({
        title: "Error",
        description: "Room name is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsCreatingRoom(true);
      const result = await createChatRoom(newRoomName, newRoomDescription);
      
      if (result.success && result.roomId) {
        toast({
          title: "Success",
          description: "Chat room created successfully!",
        });
        
        // Fetch the updated list of rooms
        const chatRooms = await getChatRooms();
        setRooms(chatRooms);
        
        // Navigate to the new room
        setSelectedRoom(chatRooms.find(room => room.id === result.roomId) || null);
        navigate(`/chat/${result.roomId}`);
        
        // Reset form
        setNewRoomName("");
        setNewRoomDescription("");
        setIsCreateRoomOpen(false);
      } else {
        throw new Error(result.error || "Failed to create room");
      }
    } catch (error) {
      console.error("Error creating chat room:", error);
      toast({
        title: "Error",
        description: "Failed to create chat room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Chat"
        description="Connect with members through real-time discussions."
        icon={MessageCircle}
        actions={
          <Button onClick={createNewRoom}>
            <Plus className="mr-2 h-4 w-4" />
            New Room
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-220px)]">
        {/* Room List - Left Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Chat Rooms</CardTitle>
              <CardDescription>Select a room to start chatting</CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <p>Loading rooms...</p>
                </div>
              ) : rooms.length === 0 ? (
                <div className="flex justify-center items-center h-40">
                  <p className="text-muted-foreground text-center">
                    No chat rooms available. Create one to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {rooms.map((room) => (
                    <Button
                      key={room.id}
                      variant={selectedRoom?.id === room.id ? "default" : "outline"}
                      className="w-full justify-start text-left"
                      onClick={() => handleRoomSelect(room)}
                    >
                      <span className="truncate">{room.name}</span>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Room - Right Side */}
        <div className="flex-grow">
          {!roomExists && roomId ? (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Room Not Found</CardTitle>
                <CardDescription>
                  The chat room you're looking for doesn't exist or has been removed.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-[calc(100%-100px)]">
                <Button onClick={() => navigate("/chat")}>
                  Return to Chat Rooms
                </Button>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <Card className="h-full flex items-center justify-center">
              <p>Loading chat room...</p>
            </Card>
          ) : selectedRoom ? (
            <ChatRoomComponent roomId={selectedRoom.id} />
          ) : (
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Welcome to Chat</CardTitle>
                <CardDescription>
                  Select a room from the sidebar or create a new one to start chatting.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col items-center justify-center">
                <p className="text-muted-foreground mb-4">No chat room selected</p>
                <Button onClick={createNewRoom}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create a New Room
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Room Dialog */}
      <Dialog open={isCreateRoomOpen} onOpenChange={setIsCreateRoomOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Chat Room</DialogTitle>
            <DialogDescription>
              Create a new room for discussions with members.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="col-span-3"
                placeholder="Enter room name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newRoomDescription}
                onChange={(e) => setNewRoomDescription(e.target.value)}
                className="col-span-3"
                placeholder="Optional description"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              type="submit" 
              onClick={handleCreateRoom}
              isLoading={isCreatingRoom}
              loadingText="Creating..."
            >
              Create Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Chat;
