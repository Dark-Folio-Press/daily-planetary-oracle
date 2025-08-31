import { Star } from "lucide-react";

interface StarRatingProps {
  value?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  readonly?: boolean;
}

export function StarRating({ 
  value = 0, 
  size = 'md',
  className = '',
  readonly = true 
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <Star
          key={rating}
          className={`${sizeClasses[size]} ${
            rating <= value 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'fill-gray-200 text-gray-300'
          } transition-colors duration-200`}
        />
      ))}
    </div>
  );
}