const twilio = require('twilio');

export interface EmailService {
  sendInviteEmail(to: string, inviteToken: string): Promise<boolean>;
  sendBulkInviteEmails(invitations: { email: string; inviteToken: string }[]): Promise<{ sent: number; failed: number }>;
}

export class TwilioEmailService implements EmailService {
  private client: any;
  private fromEmail: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromEmail = process.env.TWILIO_FROM_EMAIL || 'beta@example.com';

    if (!accountSid || !authToken) {
      throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be provided');
    }

    this.client = twilio(accountSid, authToken);
  }

  async sendInviteEmail(to: string, inviteToken: string): Promise<boolean> {
    try {
      const baseUrl = process.env.REPLIT_DOMAIN 
        ? `https://${process.env.REPLIT_DOMAIN}` 
        : 'https://your-app-domain.replit.app';

      const acceptUrl = `${baseUrl}/waitlist/accept/${inviteToken}`;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; margin-bottom: 10px;">🌟 You're Invited to Cosmic Music Curator Beta!</h1>
            <p style="color: #666; font-size: 16px;">Your cosmic journey awaits</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; color: white; text-align: center; margin-bottom: 25px;">
            <h2 style="margin: 0 0 15px 0;">Welcome to the Stars! ⭐</h2>
            <p style="margin: 0; opacity: 0.9; line-height: 1.5;">
              You've been selected from our waitlist to experience AI-powered astrological music curation. 
              Get ready for personalized playlists that align with the cosmos!
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptUrl}" 
               style="display: inline-block; background: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Accept Your Beta Invitation
            </a>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #374151; margin: 0 0 15px 0;">What awaits you:</h3>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
              <li>AI-powered weekly playlists based on astrological transits</li>
              <li>Personalized daily horoscopes with music recommendations</li>
              <li>Birth chart analysis with cosmic soundtracks</li>
              <li>Push notifications for planetary movements and music drops</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;">
              This invitation expires in 7 days. Questions? Reply to this email.
            </p>
          </div>
        </div>
      `;

      const textContent = `
🌟 You're Invited to Cosmic Music Curator Beta!

Congratulations! You've been selected from our waitlist to experience AI-powered astrological music curation.

Accept your invitation here: ${acceptUrl}

What awaits you:
• AI-powered weekly playlists based on astrological transits
• Personalized daily horoscopes with music recommendations  
• Birth chart analysis with cosmic soundtracks
• Push notifications for planetary movements and music drops

This invitation expires in 7 days. Questions? Reply to this email.

Welcome to the stars!
      `;

      await this.client.messages.create({
        from: this.fromEmail,
        to: to,
        subject: '🌟 Your Cosmic Music Curator Beta Invitation',
        html: htmlContent,
        text: textContent,
      });

      console.log(`Beta invitation sent to ${to}`);
      return true;
    } catch (error) {
      console.error(`Failed to send invitation to ${to}:`, error);
      return false;
    }
  }

  async sendBulkInviteEmails(invitations: { email: string; inviteToken: string }[]): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const invitation of invitations) {
      const success = await this.sendInviteEmail(invitation.email, invitation.inviteToken);
      if (success) {
        sent++;
      } else {
        failed++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { sent, failed };
  }
}

export const emailService = new TwilioEmailService();