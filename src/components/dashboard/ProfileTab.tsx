import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '/components/ui/input';
import { Label } from '/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '/components/ui/card';
import { ConfirmModal } from '../ui/ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { Upload, X, Camera, Save } from 'lucide-react';

export const ProfileTab: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.name || '');
  const [walletAddress, setWalletAddress] = useState(user?.walletAddress || '');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile photo from session storage on mount
  React.useEffect(() => {
    if (user?.id) {
      const storedPhoto = sessionStorage.getItem(`profilePhoto_${user.id}`);
      if (storedPhoto) {
        setProfilePhoto(storedPhoto);
      } else if (user?.profilePhoto) {
        setProfilePhoto(user.profilePhoto);
      }
    }
  }, [user?.id, user?.profilePhoto]);

  const canChangeUsername = () => {
    if (!user?.lastUsernameChange) return true;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(user.lastUsernameChange) < weekAgo;
  };

  const getNextChangeDate = () => {
    if (!user?.lastUsernameChange) return null;
    const nextChange = new Date(user.lastUsernameChange);
    nextChange.setDate(nextChange.getDate() + 7);
    return nextChange.toLocaleDateString();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      // Check file size (limit to 1MB)
      if (file.size > 1024 * 1024) {
        alert('Photo size must be less than 1MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfilePhoto(result);
        // Store in sessionStorage instead of localStorage to avoid quota issues
        sessionStorage.setItem(`profilePhoto_${user.id}`, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (user) {
      sessionStorage.removeItem(`profilePhoto_${user.id}`);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    const updates: Partial<typeof user> = {
      walletAddress
    };

    // Only update username if it's different and allowed
    if (username !== user.name && canChangeUsername()) {
      updates.name = username;
      updates.lastUsernameChange = new Date();
    }

    // Note: profilePhoto is not stored in localStorage to avoid quota issues
    // It's only kept in sessionStorage for the current session
    
    updateUser(updates);
    setIsSaving(false);
    setShowSaveConfirm(false);
  };

  const handleSaveClick = () => {
    setShowSaveConfirm(true);
  };

  if (!user) return null;

  return (
    <>
      <div className="h-full overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Settings</CardTitle>
              <CardDescription className="text-sm">
                Manage your profile information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Photo Section */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Profile Photo</Label>
                <div className="flex items-center gap-4">
                  {profilePhoto ? (
                    <div className="relative">
                      <img 
                        src={profilePhoto} 
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemovePhoto}
                        className="absolute -top-1 -right-1 h-6 w-6 p-0 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center">
                      <Camera className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Upload Photo
                    </Button>
                    {profilePhoto && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePhoto}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove Photo
                      </Button>
                    )}
                    <p className="text-xs text-gray-500">Max size: 1MB</p>
                  </div>
                </div>
              </div>

              {/* Username Section */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!canChangeUsername()}
                  className="text-sm"
                />
                {!canChangeUsername() && (
                  <p className="text-xs text-amber-600">
                    You can change your username again on {getNextChangeDate()}
                  </p>
                )}
                {canChangeUsername() && username !== user.name && (
                  <p className="text-xs text-green-600">
                    You can change your username now
                  </p>
                )}
              </div>

              {/* Email Section (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="text-sm bg-gray-50"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              {/* Wallet Address Section */}
              <div className="space-y-2">
                <Label htmlFor="wallet-address" className="text-sm font-medium">Wallet Address</Label>
                <Input
                  id="wallet-address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter your wallet address"
                  className="text-sm"
                />
                <p className="text-xs text-gray-500">
                  Add your wallet address to receive payments
                </p>
              </div>

              {/* Save Button */}
              <div className="pt-6">
                <Button
                  onClick={handleSaveClick}
                  disabled={isSaving}
                  size="lg"
                  className="w-full sm:w-auto font-semibold text-base px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleSave}
        title="Save Profile Changes"
        description="Are you sure you want to save these changes to your profile?"
        confirmText="Save Changes"
        cancelText="Cancel"
      />
    </>
  );
};