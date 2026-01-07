import React, { useEffect, useState } from 'react';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ProfileAvatarProps {
  user: User;
  onClick: () => void;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ user, onClick }) => {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    // Load profile photo from sessionStorage
    const storedPhoto = sessionStorage.getItem(`profilePhoto_${user.id}`);
    if (storedPhoto) {
      setProfilePhoto(storedPhoto);
    }
  }, [user.id]);

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div 
      className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors"
      onClick={onClick}
    >
      {profilePhoto ? (
        <img 
          src={profilePhoto} 
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover border border-gray-300"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
          {getInitial(user.name)}
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">{user.name}</span>
        <span className="text-xs text-gray-500">
          ${user.walletBalance.toFixed(2)}
        </span>
      </div>
    </div>
  );
};