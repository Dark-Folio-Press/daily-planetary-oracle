import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MoodTracker from './mood-tracker';
import MoodHistory from './mood-history';
import { Heart, Smile, BarChart3 } from 'lucide-react';

interface MoodTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'mood' | 'history';
}

export default function MoodTrackerModal({ 
  isOpen, 
  onClose, 
  initialTab = 'mood'
}: MoodTrackerModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Heart className="w-5 h-5 text-pink-500" />
            Mood Tracker
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'mood' | 'history')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mood" className="flex items-center gap-2">
              <Smile className="w-4 h-4" />
              Daily Mood
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Mood History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mood" className="mt-6">
            <MoodTracker onClose={onClose} />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <MoodHistory onClose={onClose} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}