
import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    sender_name?: string;
    sender_avatar?: string;
    profiles?: {
      first_name?: string;
      last_name?: string;
      photo_url?: string;
    } | null;
  };
  isCurrentUser: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isCurrentUser }) => {
  const formattedTime = format(new Date(message.created_at), 'h:mm a');
  
  // Get the sender's name, prioritizing sender_name, then profile data
  const getSenderName = () => {
    if (message.sender_name) {
      return message.sender_name;
    } else if (message.profiles?.first_name || message.profiles?.last_name) {
      return `${message.profiles.first_name || ''} ${message.profiles.last_name || ''}`.trim();
    } else {
      return 'Unknown User';
    }
  };
  
  // Get the initial for avatar, prioritize sender_name, then profile data
  const getInitial = () => {
    if (message.sender_name) {
      return message.sender_name.charAt(0).toUpperCase();
    } else if (message.profiles?.first_name) {
      return message.profiles.first_name.charAt(0).toUpperCase();
    } else {
      return '?';
    }
  };

  // Get avatar URL, prioritize sender_avatar, then profile photo_url
  const getAvatarUrl = () => {
    return message.sender_avatar || message.profiles?.photo_url || '';
  };

  return (
    <div className={cn(
      "flex gap-2 mb-3",
      isCurrentUser ? "flex-row-reverse" : "flex-row"
    )}>
      {!isCurrentUser && (
        <div className="flex flex-col items-center">
          <Avatar className="w-8 h-8">
            <AvatarImage src={getAvatarUrl()} alt={getSenderName()} />
            <AvatarFallback>
              {getInitial()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
            {formattedTime}
          </span>
        </div>
      )}
      
      <div className="flex flex-col max-w-[75%]">
        {!isCurrentUser && (
          <span className="text-xs font-medium mb-1">{getSenderName()}</span>
        )}
        <div className={cn(
          "break-words rounded-2xl px-4 py-2",
          isCurrentUser 
            ? "bg-primary text-primary-foreground rounded-br-none self-end" 
            : "bg-muted rounded-bl-none self-start"
        )}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
      
      {isCurrentUser && (
        <div className="flex flex-col items-center justify-end">
          <span className="text-xs text-muted-foreground mb-1 whitespace-nowrap">
            {formattedTime}
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
