import { useState, useEffect } from 'react';
import { Task } from '../types';

const TASKS_KEY = 'tasks';
const TRANSACTIONS_KEY = 'transactions';

interface Transaction {
  id: string;
  taskId: string;
  taskTitle: string;
  publisherId: string;
  publisherName: string;
  occupierId: string;
  occupierName: string;
  amount: number;
  createdAt: Date;
  status: 'pending' | 'confirmed';
  confirmedBy?: 'publisher' | 'occupier' | 'both';
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    loadDataFromStorage();
  }, []);

  // Also listen for storage changes to sync across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TASKS_KEY || e.key === TRANSACTIONS_KEY) {
        loadDataFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadDataFromStorage = () => {
    const savedTasks = localStorage.getItem(TASKS_KEY);
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Error parsing saved tasks:', error);
        setTasks([]);
      }
    }

    const savedTransactions = localStorage.getItem(TRANSACTIONS_KEY);
    if (savedTransactions) {
      try {
        const parsedTransactions = JSON.parse(savedTransactions);
        setTransactions(parsedTransactions);
      } catch (error) {
        console.error('Error parsing saved transactions:', error);
        setTransactions([]);
      }
    }
  };

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem(TASKS_KEY, JSON.stringify(newTasks));
  };

  const saveTransactions = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(newTransactions));
    // Force storage event to notify other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: TRANSACTIONS_KEY,
      newValue: JSON.stringify(newTransactions)
    }));
  };

  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'status' | 'occupiedBy' | 'reports' | 'challenges' | 'statusUpdates' | 'rewardPaid' | 'isCompletedByPublisher' | 'publisherConfirmedAmount' | 'occupierConfirmedAmount'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      status: 'published',
      occupiedBy: null,
      reports: [],
      challenges: [],
      statusUpdates: [],
      rewardPaid: 0,
      isCompletedByPublisher: false,
      publisherConfirmedAmount: 0,
      occupierConfirmedAmount: 0
    };

    const updatedTasks = [...tasks, newTask];
    saveTasks(updatedTasks);
    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    saveTasks(updatedTasks);
  };

  const claimTask = (taskId: string, userId: string, userName: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId && task.status === 'published') {
        return {
          ...task,
          status: 'occupied' as const,
          occupiedBy: { id: userId, name: userName }
        };
      }
      return task;
    });
    saveTasks(updatedTasks);
  };

  const addReport = (taskId: string, report: Omit<Task['reports'][0], 'createdAt'>) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          reports: [...task.reports, { ...report, createdAt: new Date() }]
        };
      }
      return task;
    });
    saveTasks(updatedTasks);
  };

  const addChallenge = (taskId: string, challenge: Omit<Task['challenges'][0], 'createdAt'>) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          challenges: [...task.challenges, { ...challenge, createdAt: new Date() }]
        };
      }
      return task;
    });
    saveTasks(updatedTasks);
  };

  const confirmPayment = (taskId: string, userId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.occupiedBy) return;

    // First, reload the latest transactions from localStorage to ensure we have the latest state
    const currentTransactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    
    // Check if transaction already exists
    let existingTransaction = currentTransactions.find(
      (t: Transaction) => t.taskId === taskId && t.publisherId === task.publisherId && t.occupierId === task.occupiedBy.id
    );

    let updatedTransactions: Transaction[];

    if (existingTransaction) {
      // Update existing transaction to confirmed
      updatedTransactions = currentTransactions.map((t: Transaction) => {
        if (t.id === existingTransaction.id) {
          return {
            ...t,
            status: 'confirmed' as const,
            confirmedBy: 'both' as const
          };
        }
        return t;
      });
    } else {
      // Create new confirmed transaction
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        taskId,
        taskTitle: task.title,
        publisherId: task.publisherId,
        publisherName: task.publisherName,
        occupierId: task.occupiedBy.id,
        occupierName: task.occupiedBy.name,
        amount: task.reward,
        createdAt: new Date(),
        status: 'confirmed',
        confirmedBy: 'both'
      };
      updatedTransactions = [...currentTransactions, newTransaction];
    }

    // Save transactions immediately
    saveTransactions(updatedTransactions);

    // Update task confirmation amounts
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          publisherConfirmedAmount: task.reward,
          occupierConfirmedAmount: task.reward,
          rewardPaid: task.reward
        };
      }
      return t;
    });
    saveTasks(updatedTasks);

    // Force a reload of transactions from storage to ensure sync
    setTimeout(() => {
      const reloadedTransactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
      setTransactions(reloadedTransactions);
    }, 100);
  };

  const getTransactions = () => {
    // Always get fresh data from localStorage
    const freshTransactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    return freshTransactions;
  };

  return {
    tasks,
    transactions,
    createTask,
    updateTask,
    claimTask,
    addReport,
    addChallenge,
    confirmPayment,
    getTransactions
  };
};