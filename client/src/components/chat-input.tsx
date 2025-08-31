import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  hasPlaylist?: boolean;
  hasBirthInfo?: boolean;
}

export default function ChatInput({ onSendMessage, disabled = false, hasPlaylist = false, hasBirthInfo = false }: ChatInputProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Dynamic placeholder prompts based on user's session state
  const initialPrompts = [
    "What astrological insights are you curious about today?",
    "Ask me about your cosmic energy and planetary influences...",
    "Let's explore your astrological journey together..."
  ];

  const playlistExplorationPrompts = [
    "What do you think of the song choices for your playlist?",
    "Which day's song resonates most with your energy right now?",
    "Can you explain why Mercury's influence chose that Tuesday track?",
    "How do these songs match your current astrological mood?",
    "What's the story behind Wednesday's planetary pick?",
    "Do any of these songs surprise you for your sign?",
    "How does your rising sign influence the weekend selections?"
  ];

  const authenticatedUserPrompts = [
    "How are you connecting with this week's cosmic playlist?",
    "What planetary influences are you feeling most strongly today?",
    "Which song from your playlist matches your current mood?",
    "What cosmic themes would you like to explore this week?",
    "How do the stars influence your music taste?",
    "Ready for your weekly horoscope or chart reading?",
    "What astrological insights can I share with you today?"
  ];

  const astrologicalExplorationPrompts = [
    "What's my daily horoscope looking like today?",
    "How are the current planetary transits affecting my energy?",
    "What should I know about this week's cosmic influences?",
    "Can you explain my sun sign's musical preferences?",
    "How does my moon sign influence my emotional connection to music?",
    "What planetary aspects are strongest in my chart this week?",
    "Tell me about the astrological themes in my playlist..."
  ];

  const getRandomPrompt = (prompts: string[]) => {
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  // Update placeholder based on session state
  useEffect(() => {
    let prompts = initialPrompts;
    
    // For authenticated users with existing data, show engaging prompts
    if (user && hasPlaylist && hasBirthInfo) {
      prompts = authenticatedUserPrompts;
    } else if (hasPlaylist && hasBirthInfo) {
      // Mix playlist exploration and astrological prompts
      prompts = [...playlistExplorationPrompts, ...astrologicalExplorationPrompts];
    } else if (hasBirthInfo) {
      prompts = astrologicalExplorationPrompts;
    }
    
    setCurrentPlaceholder(getRandomPrompt(prompts));
    
    // Change placeholder every 4 seconds when user hasn't typed
    const interval = setInterval(() => {
      if (!message.trim()) {
        setCurrentPlaceholder(getRandomPrompt(prompts));
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [hasPlaylist, hasBirthInfo, message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    // Tab functionality - convert text to query
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const currentText = textarea.value;
      if (currentText.trim()) {
        // Convert to query format by adding question mark if not present
        const queryText = currentText.trim().endsWith('?') ? currentText : currentText + '?';
        setMessage(queryText);
      }
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [message]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={currentPlaceholder}
              className="min-h-[60px] max-h-32 resize-none pr-12 bg-background border-border focus:border-ring"
              disabled={disabled}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!message.trim() || disabled}
              className="absolute right-2 bottom-2 cosmic-gradient hover:opacity-90 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Cosmic Playlist AI can make mistakes. Consider checking important astrological information.
        </p>
      </div>
    </div>
  );
}
