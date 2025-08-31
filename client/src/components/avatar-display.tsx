import { User } from 'lucide-react';

interface AvatarDisplayProps {
  avatarType?: string;
  avatarIcon?: string;
  profileImageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarDisplay({ 
  avatarType = 'default', 
  avatarIcon, 
  profileImageUrl, 
  size = 'md',
  className = '' 
}: AvatarDisplayProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: any = {
      'Heart': '💖', 'Star': '⭐', 'Moon': '🌙', 'Sun': '☀️',
      'Music': '🎵', 'Sparkles': '✨', 'Crown': '👑', 'Coffee': '☕',
      'Cat': '🐱', 'Dog': '🐶', 'Flower': '🌸', 'Leaf': '🍃',
      'Camera': '📷', 'Gamepad': '🎮', 'Book': '📚', 'Headphones': '🎧',
      'Palette': '🎨', 'Rocket': '🚀', 'Ghost': '👻', 'Rainbow': '🌈',
      'Pizza': '🍕'
    };
    return iconMap[iconName] || '👤';
  };

  return (
    <div className={`${sizeClasses[size]} cosmic-gradient rounded-full flex items-center justify-center ${className}`}>
      {avatarType === 'upload' && profileImageUrl ? (
        <img 
          src={profileImageUrl} 
          alt="Avatar" 
          className="w-full h-full rounded-full object-cover"
        />
      ) : avatarType === 'icon' && avatarIcon ? (
        <span className={size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-xl'}>
          {getIconComponent(avatarIcon)}
        </span>
      ) : (
        <User className={`${iconSizes[size]} text-white`} />
      )}
    </div>
  );
}