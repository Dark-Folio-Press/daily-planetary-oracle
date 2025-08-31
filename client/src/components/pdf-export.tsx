import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Share2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFExportProps {
  sessionId: string;
  messages: any[];
  title?: string;
  userName?: string;
}

export function PDFExport({ sessionId, messages, title = "Cosmic Chat Session", userName }: PDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Create a temporary container for PDF content
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.padding = '40px';
      tempContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      tempContainer.style.color = '#000000';
      tempContainer.style.lineHeight = '1.5';
      
      // Build PDF content
      const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const chatUrl = `${window.location.origin}/chat?session=${sessionId}`;
      
      tempContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
          <h1 style="font-size: 28px; color: #1e293b; margin: 0 0 10px 0; font-weight: 600;">✨ ${title} ✨</h1>
          <p style="font-size: 14px; color: #64748b; margin: 0;">Generated on ${currentDate}</p>
          ${userName ? `<p style="font-size: 14px; color: #64748b; margin: 5px 0 0 0;">For ${userName}</p>` : ''}
        </div>
        
        <div style="margin-bottom: 30px;">
          ${messages.filter(msg => msg.role !== 'system').map((message, index) => {
            const isUser = message.role === 'user';
            const content = message.content || '';
            
            // Clean up content for PDF
            let cleanContent = content
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/\n/g, '<br/>');
            
            return `
              <div style="margin-bottom: 20px; padding: 15px; background-color: ${isUser ? '#f8fafc' : '#ffffff'}; border-radius: 8px; border: 1px solid #e2e8f0;">
                <div style="font-weight: 600; color: ${isUser ? '#3b82f6' : '#8b5cf6'}; margin-bottom: 8px; font-size: 14px;">
                  ${isUser ? '👤 You' : '🤖 Cosmic AI'}
                </div>
                <div style="color: #374151; font-size: 14px; line-height: 1.6;">
                  ${cleanContent}
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <div style="border-top: 2px solid #e2e8f0; padding-top: 20px; text-align: center;">
          <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">🌟 Continue Your Cosmic Journey</h3>
          <p style="color: #64748b; margin: 0 0 15px 0; font-size: 14px;">
            Visit the link below to continue this conversation and explore more cosmic insights:
          </p>
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; border: 1px solid #cbd5e1;">
            <p style="margin: 0; font-weight: 600; color: #3b82f6; font-size: 14px; word-break: break-all;">
              ${chatUrl}
            </p>
          </div>
          <p style="color: #64748b; margin: 15px 0 0 0; font-size: 12px;">
            Cosmic Playlist Generator • AI-Powered Astrology & Music Curation
          </p>
        </div>
      `;
      
      document.body.appendChild(tempContainer);
      
      // Generate PDF using html2canvas and jsPDF
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      document.body.removeChild(tempContainer);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Generate filename
      const fileName = `cosmic-chat-${sessionId.slice(-8)}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Save PDF
      pdf.save(fileName);
      
      toast({
        title: "PDF Generated Successfully!",
        description: "Your cosmic chat has been exported as a PDF with a direct link back to continue the conversation.",
        duration: 5000,
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error creating your PDF. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (messages.filter(msg => msg.role !== 'system').length === 0) {
    return null; // Don't show export button if no meaningful content
  }

  return (
    <Button 
      onClick={generatePDF}
      disabled={isGenerating}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-200 transition-all duration-200"
      data-testid="button-export-pdf"
    >
      {isGenerating ? (
        <>
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          Generating...
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          Export PDF
        </>
      )}
    </Button>
  );
}

// Enhanced Share Button with PDF Option
interface EnhancedShareButtonProps {
  sessionId: string;
  messages: any[];
  title?: string;
  userName?: string;
}

export function EnhancedShareButton({ sessionId, messages, title, userName }: EnhancedShareButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const { toast } = useToast();

  const shareUrl = `${window.location.origin}/chat?session=${sessionId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied!",
      description: "The chat link has been copied to your clipboard.",
      duration: 3000,
    });
    setShowOptions(false);
  };

  const shareOnSocial = (platform: string) => {
    const text = `Check out my cosmic chat session! 🌟✨ ${title || 'Cosmic Playlist & Astrology'}`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    let socialUrl = '';
    switch (platform) {
      case 'twitter':
        socialUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'reddit':
        socialUrl = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`;
        break;
    }
    
    if (socialUrl) {
      window.open(socialUrl, '_blank', 'width=600,height=400');
    }
    setShowOptions(false);
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setShowOptions(!showOptions)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-200 transition-all duration-200"
        data-testid="button-share"
      >
        <Share2 className="w-4 h-4" />
        Share
      </Button>
      
      {showOptions && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-2 space-y-1">
            <button
              onClick={copyLink}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
              data-testid="button-copy-link"
            >
              <ExternalLink className="w-4 h-4" />
              Copy Link
            </button>
            
            <PDFExport 
              sessionId={sessionId} 
              messages={messages} 
              title={title} 
              userName={userName}
            />
            
            <hr className="my-1 border-gray-200 dark:border-gray-700" />
            
            <button
              onClick={() => shareOnSocial('twitter')}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
              data-testid="button-share-twitter"
            >
              <div className="w-4 h-4 bg-blue-400 rounded"></div>
              Twitter
            </button>
            
            <button
              onClick={() => shareOnSocial('facebook')}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
              data-testid="button-share-facebook"
            >
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              Facebook
            </button>
            
            <button
              onClick={() => shareOnSocial('reddit')}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
              data-testid="button-share-reddit"
            >
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              Reddit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}