import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// OneSignal Web SDK types
declare global {
  interface Window {
    OneSignal: {
      init: (config: any) => Promise<void>;
      setExternalUserId: (userId: string) => Promise<void>;
      removeExternalUserId: () => Promise<void>;
      isPushNotificationsEnabled: () => Promise<boolean>;
      showSlidedownPrompt: () => Promise<void>;
      setSubscription: (subscribe: boolean) => Promise<void>;
      getUserId: () => Promise<string | null>;
      getPlayerId?: () => Promise<string | null>;
      on: (event: string, callback: (data: any) => void) => void;
    };
  }
}

interface PushNotificationSetupProps {
  userTier: 'vibes' | 'stardust' | 'cosmic' | null;
  userId: string;
}

export default function PushNotificationSetup({ userTier, userId }: PushNotificationSetupProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oneSignalReady, setOneSignalReady] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeOneSignal();
  }, [userId]);

  const initializeOneSignal = async () => {
    try {
      // Load OneSignal SDK
      if (!window.OneSignal) {
        const script = document.createElement('script');
        script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
        script.async = true;
        document.head.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Initialize OneSignal
      await window.OneSignal.init({
        appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
      });

      // Set external user ID for targeting
      if (userId) {
        await window.OneSignal.setExternalUserId(userId);
      }

      // Check if notifications are supported and enabled
      const isEnabled = await window.OneSignal.isPushNotificationsEnabled();
      setIsSubscribed(isEnabled);
      setIsSupported(true);
      setOneSignalReady(true);

    } catch (error) {
      console.error('OneSignal initialization failed:', error);
      setIsSupported(false);
    }
  };

  const subscribeToNotifications = async () => {
    setIsLoading(true);
    try {
      if (!oneSignalReady) {
        throw new Error('OneSignal not ready');
      }

      // Show OneSignal permission prompt
      await window.OneSignal.showSlidedownPrompt();
      
      // Enable subscription
      await window.OneSignal.setSubscription(true);

      // Get OneSignal player ID and user timezone - with fallback for SDK compatibility
      let playerId: string | null = null;
      try {
        // Try modern method first
        playerId = await window.OneSignal.getUserId();
        // Fallback to legacy method if available
        if (!playerId && window.OneSignal.getPlayerId) {
          playerId = await window.OneSignal.getPlayerId();
        }
      } catch (error) {
        console.warn('Could not get OneSignal player ID:', error);
      }

      if (!playerId) {
        throw new Error('Unable to get OneSignal player ID');
      }

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Register OneSignal player ID and timezone with backend
      await apiRequest('/api/notifications/onesignal/register', {
        method: 'POST',
        body: JSON.stringify({
          oneSignalPlayerId: playerId,
          timezone: timezone
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Also call original subscribe endpoint for backward compatibility
      await apiRequest('/api/notifications/subscribe', {
        method: 'POST',
      });

      setIsSubscribed(true);
      toast({
        title: 'Notifications Enabled!',
        description: getNotificationDescription(userTier),
      });

    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      toast({
        title: 'Subscription Error',
        description: 'Unable to enable notifications. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromNotifications = async () => {
    setIsLoading(true);
    try {
      if (!oneSignalReady) {
        throw new Error('OneSignal not ready');
      }

      // Disable OneSignal subscription
      await window.OneSignal.setSubscription(false);
      
      // Notify backend
      await apiRequest('/api/notifications/unsubscribe', {
            method: 'POST',
          });
      
      setIsSubscribed(false);
      toast({
        title: 'Notifications Disabled',
        description: 'You will no longer receive cosmic updates.',
      });
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      toast({
        title: 'Unsubscribe Error',
        description: 'Unable to disable notifications. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationDescription = (tier: string | null): string => {
    switch (tier) {
      case 'stardust':
        return 'You\'ll receive daily transits, weekly horoscopes, and playlist alerts.';
      case 'cosmic':
        return 'You\'ll receive all notifications plus monthly cosmic reports.';
      default:
        return 'Upgrade to Stardust to receive cosmic notifications.';
    }
  };

  // Don't show for free tier users
  if (!userTier || userTier === 'vibes') {
    return null;
  }

  if (!isSupported || !oneSignalReady) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5" />
            {!isSupported ? 'Notifications Not Supported' : 'Loading Notifications...'}
          </CardTitle>
          <CardDescription>
            {!isSupported 
              ? 'Your browser doesn\'t support push notifications.' 
              : 'Setting up push notification system...'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Cosmic Notifications
        </CardTitle>
        <CardDescription>
          {getNotificationDescription(userTier)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              Status: {isSubscribed ? 'Enabled' : 'Disabled'}
            </div>
            <Button
              onClick={isSubscribed ? unsubscribeFromNotifications : subscribeToNotifications}
              disabled={isLoading}
              variant={isSubscribed ? 'outline' : 'default'}
              data-testid={`button-${isSubscribed ? 'disable' : 'enable'}-notifications`}
            >
              {isLoading ? 'Processing...' : isSubscribed ? 'Disable Notifications' : 'Enable Notifications'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}