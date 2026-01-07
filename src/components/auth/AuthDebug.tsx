import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export const AuthDebug: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    console.log('AuthDebug - Current user:', user);
    console.log('AuthDebug - localStorage users:', localStorage.getItem('users'));
    console.log('AuthDebug - localStorage user:', localStorage.getItem('user'));
  }, [user]);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-xs">
      <h4 className="font-semibold mb-2">Debug Info</h4>
      <div className="text-sm">
        <p>Logged in: {user ? 'Yes' : 'No'}</p>
        {user && (
          <>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            <p>Balance: ${user.walletBalance.toFixed(2)}</p>
          </>
        )}
      </div>
    </div>
  );
};