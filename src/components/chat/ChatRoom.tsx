
import React from 'react';
import { useParams } from 'react-router-dom';
import ChatRoomComponent from './ChatRoomComponent';
import { PageTemplate } from '@/components/common/PageTemplate';
import { MessageCircle } from 'lucide-react';

export default function ChatRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  
  if (!roomId) {
    return (
      <PageTemplate 
        title="Chat" 
        description="No chat room selected" 
        icon={MessageCircle}
      >
        <div className="container py-6">
          <p>Please select a chat room to start messaging</p>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title="Chat Room" 
      description="Real-time messaging with members" 
      icon={MessageCircle}
    >
      <div className="container py-6">
        <div className="h-[70vh]">
          <ChatRoomComponent roomId={roomId} />
        </div>
      </div>
    </PageTemplate>
  );
}
