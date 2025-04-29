
import React from 'react';
import { cn } from '@/lib/utils';

interface ChatTypingIndicatorProps {
  isTyping: boolean;
  username?: string;
}

const ChatTypingIndicator: React.FC<ChatTypingIndicatorProps> = ({ 
  isTyping, 
  username 
}) => {
  if (!isTyping) return null;
  
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-150"></div>
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-300"></div>
      </div>
      <span className="text-xs">{username || 'Someone'} is typing...</span>
    </div>
  );
};

export default ChatTypingIndicator;
