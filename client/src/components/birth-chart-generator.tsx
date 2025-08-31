import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, Twitter, Facebook, Instagram, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { ZODIAC_SYMBOLS, ZODIAC_COLORS } from '@/lib/astrology';

interface BirthChartGeneratorProps {
  user: {
    username?: string;
    birthDate?: string;
    birthTime?: string;
    birthLocation?: string;
  };
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
}



export function BirthChartGenerator({ user, sunSign, moonSign, risingSign }: BirthChartGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const generateChart = async (): Promise<string> => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error('Canvas not available');

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    // Set canvas size
    canvas.width = 800;
    canvas.height = 800;

    // Clear canvas with cosmic background
    const gradient = ctx.createRadialGradient(400, 400, 0, 400, 400, 400);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f0f23');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 800);

    // Add stars background
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 800;
      const y = Math.random() * 800;
      const size = Math.random() * 2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw main circle
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(400, 400, 300, 0, Math.PI * 2);
    ctx.stroke();

    // Draw zodiac wheel
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    signs.forEach((sign, index) => {
      const angle = (index * 30 - 90) * (Math.PI / 180);
      const x = 400 + Math.cos(angle) * 320;
      const y = 400 + Math.sin(angle) * 320;
      
      ctx.fillStyle = ZODIAC_COLORS[sign] || '#ffffff';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(ZODIAC_SYMBOLS[sign] || sign.slice(0, 3), x, y + 8);
    });

    // Draw center information
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(user.username || 'Birth Chart', 400, 350);

    ctx.font = '18px Arial';
    ctx.fillText(`${user.birthDate} • ${user.birthTime}`, 400, 380);
    ctx.fillText(user.birthLocation || '', 400, 405);

    // Draw big three
    const bigThree = [
      { label: 'Sun', sign: sunSign, y: 450 },
      { label: 'Moon', sign: moonSign, y: 475 },
      { label: 'Rising', sign: risingSign, y: 500 }
    ];

    bigThree.forEach(({ label, sign, y }) => {
      if (sign) {
        ctx.font = '20px Arial';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`${label}: ${sign} ${ZODIAC_SYMBOLS[sign] || ''}`, 400, y);
      }
    });

    // Add cosmic playlist branding
    ctx.font = '16px Arial';
    ctx.fillStyle = '#8b5cf6';
    ctx.fillText('Cosmic Playlist Generator', 400, 750);

    return canvas.toDataURL('image/png');
  };

  const downloadChart = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateChart();
      const link = document.createElement('a');
      link.download = `${user.username || 'birth'}-chart.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: 'Chart Downloaded',
        description: 'Your birth chart has been saved to your device.',
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Unable to generate chart. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const shareToSocial = async (platform: string) => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateChart();
      
      // Convert to blob for sharing
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      const shareData = {
        title: `${user.username}'s Birth Chart`,
        text: `Check out my cosmic birth chart! ✨ Sun: ${sunSign} | Moon: ${moonSign} | Rising: ${risingSign}`,
        files: [new File([blob], 'birth-chart.png', { type: 'image/png' })]
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to social media URLs
        const text = encodeURIComponent(shareData.text);
        let url = '';
        
        switch (platform) {
          case 'twitter':
            url = `https://twitter.com/intent/tweet?text=${text}`;
            break;
          case 'facebook':
            url = `https://www.facebook.com/sharer/sharer.php?quote=${text}`;
            break;
          case 'instagram':
            // Instagram doesn't support direct sharing, copy text instead
            await copyToClipboard(shareData.text);
            return;
          default:
            await copyToClipboard(shareData.text);
            return;
        }
        
        window.open(url, '_blank', 'width=550,height=420');
      }
      
      toast({
        title: 'Shared Successfully',
        description: 'Your birth chart has been shared.',
      });
    } catch (error) {
      toast({
        title: 'Sharing Failed',
        description: 'Unable to share chart. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
      
      toast({
        title: 'Copied to Clipboard',
        description: 'Share text has been copied. You can paste it anywhere!',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Unable to copy to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const shareText = `✨ My Big Three ✨\n☀️ Sun: ${sunSign} ${ZODIAC_SYMBOLS[sunSign || '']}\n🌙 Moon: ${moonSign} ${ZODIAC_SYMBOLS[moonSign || '']}\n⬆️ Rising: ${risingSign} ${ZODIAC_SYMBOLS[risingSign || '']}\n\nGenerated with Cosmic Playlist Generator`;

  return (
    <div className="space-y-6">
      {/* Hidden canvas for chart generation */}
      <canvas
        ref={canvasRef}
        className="hidden"
        width={800}
        height={800}
      />

      {/* Preview Section */}
      <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-xl p-6 text-center">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Share Your Big Three</h3>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 mb-4 max-w-md mx-auto">
          <div className="text-4xl mb-2">
            {ZODIAC_SYMBOLS[sunSign || ''] || '✨'}
          </div>
          <div className="text-lg font-medium text-foreground mb-3">
            {user.username}'s Big Three
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>☀️ Sun:</span>
              <span className="font-medium" style={{ color: ZODIAC_COLORS[sunSign || ''] }}>
                {sunSign} {ZODIAC_SYMBOLS[sunSign || '']}
              </span>
            </div>
            <div className="flex justify-between">
              <span>🌙 Moon:</span>
              <span className="font-medium" style={{ color: ZODIAC_COLORS[moonSign || ''] }}>
                {moonSign} {ZODIAC_SYMBOLS[moonSign || '']}
              </span>
            </div>
            <div className="flex justify-between">
              <span>⬆️ Rising:</span>
              <span className="font-medium" style={{ color: ZODIAC_COLORS[risingSign || ''] }}>
                {risingSign} {ZODIAC_SYMBOLS[risingSign || '']}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={downloadChart}
              disabled={isGenerating}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => shareToSocial('twitter')}
              disabled={isGenerating}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => shareToSocial('facebook')}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Facebook className="w-4 h-4 mr-2" />
              Facebook
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => copyToClipboard(shareText)}
              disabled={isGenerating}
              variant="outline"
              className="w-full"
            >
              {copiedText ? (
                <Check className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copiedText ? 'Copied!' : 'Copy Text'}
            </Button>
          </motion.div>
        </div>

        {/* Share Text Preview */}
        <div className="mt-4 p-3 bg-white/5 rounded-lg text-left text-sm text-muted-foreground border border-white/10">
          <div className="font-medium mb-1">Share Text:</div>
          <div className="whitespace-pre-line">{shareText}</div>
        </div>
      </div>
    </div>
  );
}