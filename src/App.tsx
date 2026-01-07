import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { LogOut, User } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'dashboard'>('login');
  const [activeTab, setActiveTab] = useState('deck'); // Add state for active tab

  useEffect(() => {
    if (user) {
      setCurrentView('dashboard');
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    setCurrentView('login');
  };

  if (currentView === 'dashboard' && user) {
    return (
      <div className="h-screen flex flex-col bg-white">
        {/* Header with Profile Info */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Task Collaboration</h1>
          <div className="flex items-center gap-4">
            {/* Make profile info clickable */}
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profilePhoto} alt={user.name} />
                <AvatarFallback className="bg-blue-500 text-white text-sm">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
              <span className="text-xs text-gray-500">${user.walletBalance.toFixed(2)}</span>
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <Dashboard activeTab={activeTab} onTabChange={setActiveTab} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {currentView === 'login' ? (
          <div>
            <LoginForm onLogin={() => setCurrentView('dashboard')} />
            <div className="mt-4 text-center">
              <button
                onClick={() => setCurrentView('signup')}
                className="text-sm text-blue-600 hover:underline"
              >
                Don't have an account? Sign up
              </button>
            </div>
          </div>
        ) : (
          <div>
            <SignupForm onSignup={() => setCurrentView('dashboard')} />
            <div className="mt-4 text-center">
              <button
                onClick={() => setCurrentView('login')}
                className="text-sm text-blue-600 hover:underline"
              >
                Already have an account? Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;