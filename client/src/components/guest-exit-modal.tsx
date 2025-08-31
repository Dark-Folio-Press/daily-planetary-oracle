import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { X, Sparkles, Heart, BookOpen, Music } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

interface GuestExitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuestExitModal({ isOpen, onClose }: GuestExitModalProps) {
  const { isAuthenticated } = useAuth();

  if (!isOpen || isAuthenticated) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-md mx-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-2xl">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="text-center pt-4">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Don't Lose Your Cosmic Journey!
            </h2>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-center text-gray-600">
            Save your conversations, charts, and playlists before you go. 
            Your cosmic insights are waiting to be preserved!
          </p>

          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-700">
              <BookOpen className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
              <span>Keep your detailed birth chart readings</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <Music className="w-5 h-5 text-pink-500 mr-3 flex-shrink-0" />
              <span>Save your personalized cosmic playlists</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <Sparkles className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
              <span>Continue your astrological conversations</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/signup" className="block">
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Sparkles className="w-4 h-4 mr-2" />
                Create Free Account
              </Button>
            </Link>
            
            <Link href="/login" className="block">
              <Button variant="outline" className="w-full border-purple-200 hover:bg-purple-50">
                Sign In Instead
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              Continue as Guest
            </Button>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              Try our demo: <strong>test@example.com</strong> / <strong>testpass</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to manage the exit modal
export function useGuestExitModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      setIsModalOpen(true);
      return e.returnValue = '';
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isAuthenticated) {
        setIsModalOpen(true);
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]);

  return {
    isModalOpen,
    closeModal: () => setIsModalOpen(false)
  };
}