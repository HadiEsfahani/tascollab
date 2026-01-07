import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from './auth/LoginForm';
import { SignupForm } from './auth/SignupForm';
import { TabsContainer } from './dashboard/TabsContainer';

export const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'login' | 'signup'>('login');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {currentView === 'login' ? (
            <LoginForm
              onSwitchToSignup={() => setCurrentView('signup')}
            />
          ) : (
            <SignupForm
              onSwitchToLogin={() => setCurrentView('login')}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <TabsContainer user={user} />
    </div>
  );
};