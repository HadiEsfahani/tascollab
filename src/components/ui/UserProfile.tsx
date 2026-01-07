import React from 'react';
import { User } from 'lucide-react';

interface UserProfileProps {
  userId: string;
  userName: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  userName,
  size = 'sm',
  showName = true,
  className = ''
}) => {
  const [profilePhoto, setProfilePhoto] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Try to load profile photo from sessionStorage
    const storedPhoto = sessionStorage.getItem(`profilePhoto_${userId}`);
    if (storedPhoto) {
      setProfilePhoto(storedPhoto);
    }
  }, [userId]);

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {profilePhoto ? (
        <img
          src={profilePhoto}
          alt={userName}
          className={`${sizeClasses[size]} rounded-full object-cover border border-gray-300`}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-600 font-medium`}>
          {getInitials(userName)}
        </div>
      )}
      {showName && (
        <span className="text-sm font-medium text-gray-900">{userName}</span>
      )}
    </div>
  );
};