import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Calendar, MapPin, Clock, User, Star, Share2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BirthChartGenerator } from './birth-chart-generator';
import { VisualBirthChart } from './visual-birth-chart';
import { calculateBigThree } from '@/lib/astrology';
import { CosmicEnergyMeter } from './cosmic-energy-meter';
import { MoonPhaseMoodRing } from './moon-phase-mood-ring';
import { AstrologicalWeather } from './astrological-weather';
import { AvatarSelector } from './avatar-selector';
import { HousesChart } from './houses-chart';
import { OptimizedChartSection } from '@/components/optimized-chart-section';

const profileSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  birthDate: z.string().min(1, 'Birth date is required'),
  birthTime: z.string().min(1, 'Birth time is required'),
  birthLocation: z.string().min(1, 'Birth location is required'),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function UserProfileCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  

  const queryClient = useQueryClient();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showChartGenerator, setShowChartGenerator] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      birthDate: user?.birthDate || '',
      birthTime: user?.birthTime || '',
      birthLocation: user?.birthLocation || '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const response = await apiRequest('PUT', '/api/user/profile', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been updated.',
      });
      setIsEditingProfile(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/user/account');
    },
    onSuccess: () => {
      toast({
        title: 'Account deleted',
        description: 'Your account and all data have been permanently removed.',
      });
      window.location.href = '/';
    },
    onError: (error: any) => {
      toast({
        title: 'Deletion failed',
        description: error.message || 'Failed to delete account',
        variant: 'destructive',
      });
    },
  });

  if (!user) return null;

  const handleProfileSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
    setShowDeleteDialog(false);
  };

  // Get Big Three from server for consistency
  const { data: bigThreeData } = useQuery<{sunSign: string, moonSign: string, risingSign: string}>({
    queryKey: ['/api/user/big-three'],
    enabled: !!user?.birthDate
  });
  
  const astrologyData = bigThreeData || { sunSign: '', moonSign: '', risingSign: '' };

  if (showChartGenerator && astrologyData.sunSign) {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6 min-h-[90vh] max-h-[95vh] overflow-y-scroll" style={{ scrollbarWidth: 'thin', scrollbarColor: '#8b5cf6 #374151' }}>
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/5 backdrop-blur-md pb-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-foreground">Share Your Big Three</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowChartGenerator(false)}
            className="hover:bg-red-500/20 hover:text-red-300"
          >
            ✕
          </Button>
        </div>
        
        <div className="space-y-6">
          <BirthChartGenerator 
            user={{
              username: user.username || undefined,
              birthDate: user.birthDate || undefined,
              birthTime: user.birthTime || undefined,
              birthLocation: user.birthLocation || undefined
            }}
            sunSign={astrologyData.sunSign || ''}
            moonSign={astrologyData.moonSign || ''}
            risingSign={astrologyData.risingSign || ''}
          />
          
          <div className="pt-6 border-t border-purple-500/20">
            <VisualBirthChart
              birthDate={user.birthDate || undefined}
              birthTime={user.birthTime || undefined}
              birthLocation={user.birthLocation || undefined}
              userName={user.username || user.firstName || undefined}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6 max-h-[90vh] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#8b5cf6 #374151' }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          {/* User Avatar */}
          <div className="relative">
            <div 
              className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setShowAvatarSelector(true)}
            >
              {(user as any)?.avatarType === 'upload' && (user as any)?.profileImageUrl ? (
                <img 
                  src={(user as any).profileImageUrl} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (user as any)?.avatarType === 'icon' && (user as any)?.avatarIcon ? (
                (() => {
                  const iconMap: any = {
                    'Heart': '💖', 'Star': '⭐', 'Moon': '🌙', 'Sun': '☀️',
                    'Music': '🎵', 'Sparkles': '✨', 'Crown': '👑', 'Coffee': '☕',
                    'Cat': '🐱', 'Dog': '🐶', 'Flower': '🌸', 'Leaf': '🍃',
                    'Camera': '📷', 'Gamepad': '🎮', 'Book': '📚', 'Headphones': '🎧',
                    'Palette': '🎨', 'Rocket': '🚀', 'Ghost': '👻', 'Rainbow': '🌈',
                    'Pizza': '🍕'
                  };
                  return <span className="text-xl">{iconMap[(user as any).avatarIcon] || '👤'}</span>;
                })()
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs cursor-pointer hover:bg-purple-500 transition-colors"
                 onClick={() => setShowAvatarSelector(true)}
                 title="Change avatar"
            >
              <Edit className="w-3 h-3" />
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground text-lg">
              {user.username || user.email}
            </h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {astrologyData.sunSign && (
              <div className="flex items-center mt-1">
                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                <span className="text-sm text-muted-foreground">{astrologyData.sunSign}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          {astrologyData.sunSign && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChartGenerator(true)}
              className="text-xs"
            >
              <Share2 className="w-3 h-3 mr-1" />
              Share Big Three
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingProfile(true)}
            className="text-xs"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-xs text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Birth Information */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex items-center text-sm">
          <Calendar className="w-4 h-4 text-blue-400 mr-2" />
          <span className="text-muted-foreground">{user.birthDate || 'Not set'}</span>
        </div>
        <div className="flex items-center text-sm">
          <Clock className="w-4 h-4 text-green-400 mr-2" />
          <span className="text-muted-foreground">{user.birthTime || 'Not set'}</span>
        </div>
        <div className="flex items-center text-sm">
          <MapPin className="w-4 h-4 text-purple-400 mr-2" />
          <span className="text-muted-foreground">{user.birthLocation || 'Not set'}</span>
        </div>
      </div>

      {/* Cosmic Dashboard */}
      <div className="mt-6 space-y-4">
        {/* Current Lunar Energy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-purple-200">Current Lunar Energy</div>
            <MoonPhaseMoodRing size="md" />
          </div>
          <div className="text-xs text-purple-300/80 text-center">
            {(() => {
              const now = new Date();
              const newMoon = new Date(2024, 0, 11); // Known new moon
              const lunarCycle = 29.53059; // days in lunar cycle
              const daysSinceNew = (now.getTime() - newMoon.getTime()) / (1000 * 60 * 60 * 24);
              const currentCycle = ((daysSinceNew % lunarCycle) + lunarCycle) % lunarCycle;
              const lunarDay = Math.floor(currentCycle) + 1;
              
              let phase = '';
              if (currentCycle < 1) phase = 'New Moon';
              else if (currentCycle < 7.4) phase = 'Waxing Crescent';
              else if (currentCycle < 8.4) phase = 'First Quarter';
              else if (currentCycle < 14.8) phase = 'Waxing Gibbous';
              else if (currentCycle < 15.8) phase = 'Full Moon';
              else if (currentCycle < 22.1) phase = 'Waning Gibbous';
              else if (currentCycle < 23.1) phase = 'Last Quarter';
              else phase = 'Waning Crescent';
              
              return `${phase} • Day ${lunarDay} of 29`;
            })()}
          </div>
        </div>
        
        {/* Cosmic Weather */}
        <AstrologicalWeather />
        
        {/* Cosmic Energy Field */}
        <CosmicEnergyMeter />
      </div>

      {/* Edit Form */}
      {isEditingProfile && (
        <div className="mt-6 border-t border-white/10 pt-4">
          <form onSubmit={form.handleSubmit(handleProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Username</label>
                <Input
                  type="text"
                  placeholder="Enter username"
                  {...form.register('username')}
                  className="mt-1"
                />
                {form.formState.errors.username && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.username.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Birth Date</label>
                <Input
                  type="date"
                  {...form.register('birthDate')}
                  className="mt-1"
                />
                {form.formState.errors.birthDate && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.birthDate.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Birth Time</label>
                <Input
                  type="time"
                  {...form.register('birthTime')}
                  className="mt-1"
                />
                {form.formState.errors.birthTime && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.birthTime.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Birth Location</label>
                <Input
                  type="text"
                  placeholder="City, Country"
                  {...form.register('birthLocation')}
                  className="mt-1"
                />
                {form.formState.errors.birthLocation && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.birthLocation.message}</p>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                type="submit"
                size="sm"
                disabled={updateProfileMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditingProfile(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteDialog && (
        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <h4 className="font-medium text-red-400 mb-2">Delete Account</h4>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <div className="flex space-x-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAccount}
                disabled={deleteAccountMutation.isPending}
              >
                {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Account'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Optimized Chart Section - Click to reveal */}
      {user.birthDate && user.birthTime && user.birthLocation && (
        <OptimizedChartSection
          birthDate={user.birthDate}
          birthTime={user.birthTime}
          birthLocation={user.birthLocation}
          userName={user.username || user.firstName || undefined}
        />
      )}

      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <AvatarSelector
                currentAvatarType={(user as any)?.avatarType}
                currentAvatarIcon={(user as any)?.avatarIcon}
                currentProfileImageUrl={(user as any)?.profileImageUrl}
                onClose={() => setShowAvatarSelector(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}