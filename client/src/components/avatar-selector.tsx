import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  User, Heart, Star, Moon, Sun, Music, Sparkles, Crown, 
  Coffee, Cat, Dog, Flower, Leaf, Camera, Gamepad2, Book,
  Headphones, Palette, Rocket, Ghost, Rainbow, Pizza
} from 'lucide-react';

const PREDEFINED_ICONS = [
  { name: 'User', icon: User },
  { name: 'Heart', icon: Heart },
  { name: 'Star', icon: Star },
  { name: 'Moon', icon: Moon },
  { name: 'Sun', icon: Sun },
  { name: 'Music', icon: Music },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Crown', icon: Crown },
  { name: 'Coffee', icon: Coffee },
  { name: 'Cat', icon: Cat },
  { name: 'Dog', icon: Dog },
  { name: 'Flower', icon: Flower },
  { name: 'Leaf', icon: Leaf },
  { name: 'Camera', icon: Camera },
  { name: 'Gamepad', icon: Gamepad2 },
  { name: 'Book', icon: Book },
  { name: 'Headphones', icon: Headphones },
  { name: 'Palette', icon: Palette },
  { name: 'Rocket', icon: Rocket },
  { name: 'Ghost', icon: Ghost },
  { name: 'Rainbow', icon: Rainbow },
  { name: 'Pizza', icon: Pizza },
];

interface AvatarSelectorProps {
  currentAvatarType?: string;
  currentAvatarIcon?: string;
  currentProfileImageUrl?: string;
  onClose: () => void;
}

export function AvatarSelector({ 
  currentAvatarType = 'default', 
  currentAvatarIcon, 
  currentProfileImageUrl,
  onClose 
}: AvatarSelectorProps) {
  const [selectedType, setSelectedType] = useState<'default' | 'icon' | 'upload'>(currentAvatarType as any || 'default');
  const [selectedIcon, setSelectedIcon] = useState(currentAvatarIcon || 'User');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateAvatarMutation = useMutation({
    mutationFn: async (avatarData: any) => {
      if (selectedType === 'upload' && uploadedFile) {
        // For uploaded files, we'd typically upload to object storage first
        // For now, using base64 data URL (note: this is not ideal for production)
        const reader = new FileReader();
        return new Promise((resolve) => {
          reader.onload = async () => {
            const response = await apiRequest('PUT', '/api/user/avatar', {
              avatarType: 'upload',
              avatarIcon: null,
              profileImageUrl: reader.result as string
            });
            resolve(response.json());
          };
          reader.readAsDataURL(uploadedFile);
        });
      } else {
        const response = await apiRequest('PUT', '/api/user/avatar', avatarData);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: 'Avatar updated',
        description: 'Your avatar has been updated successfully.',
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update avatar',
        variant: 'destructive',
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File too large',
          description: 'Please choose an image smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }
      
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSelectedType('upload');
    }
  };

  const handleSave = () => {
    if (selectedType === 'default') {
      updateAvatarMutation.mutate({
        avatarType: 'default',
        avatarIcon: null,
        profileImageUrl: null
      });
    } else if (selectedType === 'icon') {
      updateAvatarMutation.mutate({
        avatarType: 'icon',
        avatarIcon: selectedIcon,
        profileImageUrl: null
      });
    } else if (selectedType === 'upload' && uploadedFile) {
      updateAvatarMutation.mutate({});
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconData = PREDEFINED_ICONS.find(i => i.name === iconName);
    return iconData ? iconData.icon : User;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Choose Your Avatar</h3>
      
      {/* Avatar Type Selection */}
      <div className="space-y-4">
        {/* Default Option */}
        <div 
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            selectedType === 'default' ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20' : 'border-border hover:border-purple-300'
          }`}
          onClick={() => setSelectedType('default')}
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Default Avatar</p>
              <p className="text-sm text-muted-foreground">Use a simple default icon</p>
            </div>
          </div>
        </div>

        {/* Predefined Icons */}
        <div 
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            selectedType === 'icon' ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20' : 'border-border hover:border-purple-300'
          }`}
          onClick={() => setSelectedType('icon')}
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 cosmic-gradient rounded-full flex items-center justify-center">
                {(() => {
                  const IconComponent = getIconComponent(selectedIcon);
                  return <IconComponent className="w-6 h-6 text-white" />;
                })()}
              </div>
              <div>
                <p className="font-medium">Predefined Icons</p>
                <p className="text-sm text-muted-foreground">Choose from our cosmic collection</p>
              </div>
            </div>
            
            {selectedType === 'icon' && (
              <div className="grid grid-cols-6 gap-2">
                {PREDEFINED_ICONS.map((iconData) => {
                  const IconComponent = iconData.icon;
                  return (
                    <button
                      key={iconData.name}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        selectedIcon === iconData.name 
                          ? 'cosmic-gradient text-white' 
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setSelectedIcon(iconData.name)}
                      title={iconData.name}
                    >
                      <IconComponent className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Upload Custom Image */}
        <div 
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            selectedType === 'upload' ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20' : 'border-border hover:border-purple-300'
          }`}
          onClick={() => setSelectedType('upload')}
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : currentProfileImageUrl && selectedType === 'upload' ? (
                  <img src={currentProfileImageUrl} alt="Current" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-medium">Upload Custom Image</p>
                <p className="text-sm text-muted-foreground">Use your own photo or image</p>
              </div>
            </div>
            
            {selectedType === 'upload' && (
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">Maximum file size: 5MB</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button onClick={handleSave} disabled={updateAvatarMutation.isPending} className="flex-1">
          {updateAvatarMutation.isPending ? 'Saving...' : 'Save Avatar'}
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}