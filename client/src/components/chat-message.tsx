import { Sparkles, User, Loader2, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PlaylistCard from "./playlist-card";
import ContentFeedback from "./content-feedback";

interface ChatMessageProps {
  message: {
    id?: number;
    role: string;
    content: string;
    metadata?: any;
    createdAt?: Date;
    sessionId?: string;
  };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isLoading = message.metadata?.type === 'loading';
  const [userFeedback, setUserFeedback] = useState<'like' | 'dislike' | null>(null);
  const [showContentFeedback, setShowContentFeedback] = useState(false);
  
  // Detect horoscope content (contains weekly horoscope, daily predictions, etc.)
  const isHoroscopeContent = !isUser && !isLoading && (
    message.content.toLowerCase().includes('horoscope') ||
    message.content.toLowerCase().includes('weekly predictions') ||
    message.content.toLowerCase().includes('celestial guidance') ||
    message.content.toLowerCase().includes('astrological forecast') ||
    message.metadata?.type === 'horoscope'
  );

  const feedbackMutation = useMutation({
    mutationFn: async ({ feedback }: { feedback: 'like' | 'dislike' }) => {
      const response = await apiRequest('POST', '/api/chat/feedback', {
        messageId: message.id,
        sessionId: message.sessionId,
        feedback
      });
      return response.json();
    },
    onSuccess: (_, { feedback }) => {
      setUserFeedback(feedback);
    }
  });

  const handleFeedback = (feedback: 'like' | 'dislike') => {
    if (userFeedback === feedback) {
      // Toggle off if clicking the same button
      setUserFeedback(null);
      return;
    }
    feedbackMutation.mutate({ feedback });
  };

  const formatContent = (content: string) => {
    // Convert **text** to bold
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert ### headers to paragraphs with proper spacing
    formatted = formatted.replace(/^### (.*$)/gim, '<p class="font-semibold text-lg mt-4 mb-2">$1</p>');
    
    // Convert double line breaks to paragraph breaks
    formatted = formatted.replace(/\n\n/g, '</p><p class="mb-3">');
    
    // Convert single line breaks to br tags
    formatted = formatted.replace(/\n/g, '<br/>');
    
    // Wrap the content in a paragraph if it doesn't start with one
    if (!formatted.startsWith('<p')) {
      formatted = '<p class="mb-3">' + formatted + '</p>';
    }
    
    return { __html: formatted };
  };

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 cosmic-gradient rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className="flex-1">
        <div className={`rounded-2xl p-4 max-w-3xl ${
          isUser 
            ? 'chat-message-user ml-auto shadow-sm rounded-tr-sm' 
            : 'chat-message-assistant rounded-tl-sm'
        }`}>
          {isLoading ? (
            <div className="flex items-center space-x-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div>
                <p className="text-sm font-medium text-primary">Channeling cosmic energies...</p>
                <p className="text-xs text-muted-foreground">Analyzing planetary transits and curating your weekly soundtrack</p>
              </div>
            </div>
          ) : (
            <>
              <div 
                className="text-foreground leading-relaxed"
                dangerouslySetInnerHTML={formatContent(message.content)}
              />
              
              {/* Render playlist if metadata contains playlist data */}
              {message.metadata?.type === 'playlist' && message.metadata.playlist && (
                <div className="mt-4">
                  <PlaylistCard 
                    playlist={message.metadata.playlist} 
                    sessionId={message.sessionId} 
                  />
                </div>
              )}
            </>
          )}
        </div>
        
        {!isLoading && (
          <div className={`flex items-center justify-between mt-1 ${isUser ? 'flex-row-reverse mr-4' : 'ml-4'}`}>
            <div className="text-xs text-muted-foreground">
              {message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : 'Just now'}
            </div>
            
            {/* Feedback buttons for assistant messages only */}
            {!isUser && message.id && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('like')}
                  className={`h-7 w-7 p-0 hover:bg-green-100 dark:hover:bg-green-900/30 ${
                    userFeedback === 'like' ? 'bg-green-100 dark:bg-green-900/50 text-green-600' : 'text-muted-foreground'
                  }`}
                  disabled={feedbackMutation.isPending}
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('dislike')}
                  className={`h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 ${
                    userFeedback === 'dislike' ? 'bg-red-100 dark:bg-red-900/50 text-red-600' : 'text-muted-foreground'
                  }`}
                  disabled={feedbackMutation.isPending}
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>
                
                {/* Content feedback button for horoscope content */}
                {isHoroscopeContent && (
                  <Dialog open={showContentFeedback} onOpenChange={setShowContentFeedback}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600"
                        data-testid="button-feedback-horoscope"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        <span className="text-xs">Rate</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Rate this horoscope reading</DialogTitle>
                      </DialogHeader>
                      <ContentFeedback 
                        contentType="horoscope"
                        contentId={message.sessionId}
                        onClose={() => setShowContentFeedback(false)}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}
