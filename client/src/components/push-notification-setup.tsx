import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface PushNotificationSetupProps {
  userTier: 'vibes' | 'stardust' | 'cosmic' | null;
}

export default function PushNotificationSetup({ userTier }: PushNotificationSetupProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if push notifications are supported
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    setPermission(Notification.permission);
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const requestPermission = async () => {
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        await subscribeToNotifications();
      } else {
        toast({
          title: 'Notifications Blocked',
          description: 'Please enable notifications in your browser settings to receive cosmic updates.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast({
        title: 'Permission Error',
        description: 'Unable to request notification permission. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToNotifications = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        // OneSignal Web SDK integration would go here
        // For now, we'll simulate the subscription
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY || ''),
        });

        // Send subscription to backend
        await apiRequest('/api/notifications/subscribe', {
          method: 'POST',
          body: JSON.stringify({
            subscription: subscription.toJSON(),
          }),
        });

        setIsSubscribed(true);
        toast({
          title: 'Notifications Enabled!',
          description: getNotificationDescription(userTier),
        });
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      toast({
        title: 'Subscription Error',
        description: 'Unable to enable notifications. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const unsubscribeFromNotifications = async () => {
    setIsLoading(true);
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await subscription.unsubscribe();
          
          // Notify backend
          await apiRequest('/api/notifications/unsubscribe', {
            method: 'POST',
          });
        }
      }
      
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

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5" />
            Notifications Not Supported
          </CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications.
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
          {permission === 'denied' ? (
            <div className="text-sm text-muted-foreground">
              Notifications are blocked. Please enable them in your browser settings and refresh the page.
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-sm">
                Status: {isSubscribed ? 'Enabled' : 'Disabled'}
              </div>
              <Button
                onClick={isSubscribed ? unsubscribeFromNotifications : requestPermission}
                disabled={isLoading}
                variant={isSubscribed ? 'outline' : 'default'}
                data-testid={`button-${isSubscribed ? 'disable' : 'enable'}-notifications`}
              >
                {isLoading ? 'Processing...' : isSubscribed ? 'Disable Notifications' : 'Enable Notifications'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function for VAPID key conversion
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}