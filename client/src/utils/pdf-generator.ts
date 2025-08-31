import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: any;
}

export async function generateChatPDF(sessionId: string, title: string = "Cosmic Chat Session"): Promise<string> {
  try {
    // Get chat messages from the current session
    const response = await fetch(`/api/chat/${sessionId}/messages`);
    const messages: Message[] = await response.json();
    
    // Filter out system messages and get user info
    const chatMessages = messages.filter(msg => msg.role !== 'system');
    
    // Get user info
    const userResponse = await fetch('/api/auth/user');
    const userData = userResponse.ok ? await userResponse.json() : null;
    
    // Create a temporary container for PDF content
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
      position: absolute;
      left: -9999px;
      width: 794px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 0;
      font-family: system-ui, -apple-system, sans-serif;
      color: #ffffff;
      line-height: 1.6;
      min-height: 1000px;
    `;
    
    // Build PDF content
    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
    
    const chatUrl = `${window.location.origin}/chat?session=${sessionId}`;
    
    // Create header section with cosmic styling
    const headerHTML = `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
        <h1 style="font-size: 32px; color: #ffffff; margin: 0 0 20px 0; font-weight: 600;">✨ Full Conversation</h1>
      </div>
    `;
    
    // Create messages section
    const messagesHTML = chatMessages.map((message, index) => {
      const isUser = message.role === 'user';
      const content = message.content || '';
      
      // Clean up content for PDF
      let cleanContent = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p style="margin: 12px 0;">')
        .replace(/\n/g, '<br/>');
      
      const messageDate = new Date().toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });
      
      return `
        <div style="padding: 20px 40px; background: rgba(255, 255, 255, 0.05);">
          <div style="margin-bottom: 20px;">
            <h3 style="color: #fbbf24; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">
              ${isUser ? '🌟 You asked:' : '🔮 Cosmic AI responded:'}
            </h3>
            <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 15px;">
              <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0;">
                ${cleanContent}
              </p>
            </div>
            <p style="color: #d1d5db; font-size: 14px; margin: 0; text-align: right;">
              ${messageDate}
            </p>
          </div>
        </div>
      `;
    }).join('');
    
    // Create footer section matching the shared page style
    const footerHTML = `
      <div style="padding: 40px; text-align: center; background: rgba(255, 255, 255, 0.05); margin-top: 20px;">
        <h3 style="color: #ffffff; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Ready to explore your own cosmic journey?</h3>
        <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
          <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 14px; color: #1f2937;">
            🌟 Start Your Cosmic Chat
          </div>
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: 600; font-size: 14px; color: #ffffff;">
            🎵 Generate Your Playlist
          </div>
        </div>
        <div style="margin-top: 30px; padding: 20px; background: rgba(255, 255, 255, 0.1); border-radius: 12px;">
          <p style="color: #d1d5db; margin: 0 0 10px 0; font-size: 14px;">
            Continue this conversation at:
          </p>
          <p style="margin: 0; font-weight: 600; color: #fbbf24; font-size: 14px; word-break: break-all;">
            ${chatUrl}
          </p>
        </div>
      </div>
    `;
    
    // Combine all content
    tempContainer.innerHTML = headerHTML + messagesHTML + footerHTML;
    document.body.appendChild(tempContainer);
    
    // Generate PDF using html2canvas and jsPDF
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 794,
      height: tempContainer.scrollHeight
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
    
    return fileName;
    
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  }
}

// Alternative function for direct message array input
export async function generatePDFFromMessages(
  sessionId: string,
  messages: Message[],
  title: string = "Cosmic Chat Session",
  userName?: string
): Promise<string> {
  try {
    // Filter out system messages
    const chatMessages = messages.filter(msg => msg.role !== 'system');
    
    // Create a temporary container for PDF content
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
      position: absolute;
      left: -9999px;
      width: 794px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 0;
      font-family: system-ui, -apple-system, sans-serif;
      color: #ffffff;
      line-height: 1.6;
      min-height: 1000px;
    `;
    
    // Build PDF content
    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
    
    const chatUrl = `${window.location.origin}/chat?session=${sessionId}`;
    
    const headerHTML = `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
        <h1 style="font-size: 32px; color: #ffffff; margin: 0 0 20px 0; font-weight: 600;">✨ Full Conversation</h1>
      </div>
    `;
    
    const messagesHTML = chatMessages.map((message, index) => {
      const isUser = message.role === 'user';
      const content = message.content || '';
      
      // Clean up content for PDF
      let cleanContent = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p style="margin: 12px 0;">')
        .replace(/\n/g, '<br/>');
      
      const messageDate = currentDate;
      
      return `
        <div style="padding: 20px 40px; background: rgba(255, 255, 255, 0.05);">
          <div style="margin-bottom: 20px;">
            <h3 style="color: #fbbf24; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">
              ${isUser ? '🌟 You asked:' : '🔮 Cosmic AI responded:'}
            </h3>
            <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 15px;">
              <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0;">
                ${cleanContent}
              </p>
            </div>
            <p style="color: #d1d5db; font-size: 14px; margin: 0; text-align: right;">
              ${messageDate}
            </p>
          </div>
        </div>
      `;
    }).join('');
    
    const footerHTML = `
      <div style="padding: 40px; text-align: center; background: rgba(255, 255, 255, 0.05); margin-top: 20px;">
        <h3 style="color: #ffffff; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Ready to explore your own cosmic journey?</h3>
        <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
          <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 12px 24px; border-radius: 25px; font-weight: 600; font-size: 14px; color: #1f2937;">
            🌟 Start Your Cosmic Chat
          </div>
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 12px 24px; border-radius: 25px; font-weight: 600; font-size: 14px; color: #ffffff;">
            🎵 Generate Your Playlist
          </div>
        </div>
        <div style="margin-top: 30px; padding: 20px; background: rgba(255, 255, 255, 0.1); border-radius: 12px;">
          <p style="color: #d1d5db; margin: 0 0 10px 0; font-size: 14px;">
            Continue this conversation at:
          </p>
          <p style="margin: 0; font-weight: 600; color: #fbbf24; font-size: 14px; word-break: break-all;">
            ${chatUrl}
          </p>
        </div>
      </div>
    `;
    
    tempContainer.innerHTML = headerHTML + messagesHTML + footerHTML;
    
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
    
    return fileName;
    
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  }
}