import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Twitter, Facebook, Instagram, Copy, Download, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartImageUrl: string;
  shareText: string;
  username: string;
}

export function SocialShareModal({ 
  isOpen, 
  onClose, 
  chartImageUrl, 
  shareText, 
  username 
}: SocialShareModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'Share text copied to clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.download = `${username}-birth-chart.png`;
    link.href = chartImageUrl;
    link.click();
    
    toast({
      title: 'Downloaded!',
      description: 'Your birth chart has been saved.',
    });
  };

  const shareToSocial = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    let url = '';

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?quote=${encodedText}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing, so copy text
        copyToClipboard();
        toast({
          title: 'Instagram Sharing',
          description: 'Text copied! Share the downloaded image on Instagram and paste this caption.',
        });
        return;
    }

    if (url) {
      window.open(url, '_blank', 'width=550,height=420');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Share Your Birth Chart</span>
            <div className="text-2xl">✨</div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Chart Preview */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 text-center">
            <img 
              src={chartImageUrl} 
              alt="Birth Chart" 
              className="w-32 h-32 mx-auto rounded-lg shadow-lg"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {username}'s Cosmic Chart
            </p>
          </div>

          {/* Share Text Preview */}
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              Share Text:
            </div>
            <div className="text-sm text-foreground whitespace-pre-line">
              {shareText}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={downloadImage}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="w-full"
                size="sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Text
                  </>
                )}
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => shareToSocial('twitter')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                size="sm"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => shareToSocial('facebook')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
            </motion.div>
          </div>

          <motion.div 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Button
              onClick={() => shareToSocial('instagram')}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <Instagram className="w-4 h-4 mr-2" />
              Instagram (Copy & Share)
            </Button>
          </motion.div>

          {/* Native Share API fallback */}
          {navigator.share && (
            <motion.div 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button
                onClick={async () => {
                  try {
                    await navigator.share({
                      title: `${username}'s Birth Chart`,
                      text: shareText,
                    });
                  } catch (error) {
                    // User cancelled sharing
                  }
                }}
                variant="secondary"
                className="w-full"
                size="sm"
              >
                <span className="mr-2">📱</span>
                More Share Options
              </Button>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}