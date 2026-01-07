import { useCallback } from 'react';
import { useStorage } from '../context/StorageContext';
import { User } from '../types';

export const useUser = () => {
  const { users, setUsers } = useStorage();

  const createUser = useCallback((userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    setUsers(prev => [...prev, newUser]);
    return newUser;
  }, [setUsers]);

  const updateUser = useCallback((userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
  }, [setUsers]);

  const deleteUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  }, [setUsers]);

  const getUserByEmail = useCallback((email: string) => {
    return users.find(user => user.email === email);
  }, [users]);

  const getUserById = useCallback((id: string) => {
    return users.find(user => user.id === id);
  }, [users]);

  return {
    users,
    createUser,
    updateUser,
    deleteUser,
    getUserByEmail,
    getUserById
  };
};