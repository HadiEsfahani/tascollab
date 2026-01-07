import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, PaymentRecord } from '../types';

interface TaskContextType {
  tasks: Task[];
  payments: PaymentRecord[];
  createTask: (task: Omit<Task, 'id' | 'publishedAt' | 'reports' | 'challenges' | 'statusUpdates' | 'rewardPaid' | 'isCompletedByPublisher'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  getTask: (taskId: string) => Task | undefined;
  claimTask: (taskId: string, userId: string, userName: string) => void;
  addReport: (taskId: string, report: Omit<any, 'id' | 'createdAt'>) => void;
  addChallenge: (taskId: string, challenge: Omit<any, 'id' | 'createdAt'>) => void;
  addStatusUpdate: (taskId: string, update: Omit<any, 'createdAt'>) => void;
  addPayment: (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => void;
  getPaymentHistory: (userId: string) => { sent: PaymentRecord[]; received: PaymentRecord[] };
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    const storedPayments = localStorage.getItem('payments');
    
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        const tasksWithDates = parsedTasks.map((task: any) => ({
          ...task,
          publishedAt: new Date(task.publishedAt),
          deadline: new Date(task.deadline),
          reports: task.reports?.map((r: any) => ({
            ...r,
            createdAt: new Date(r.createdAt)
          })) || [],
          challenges: task.challenges?.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt)
          })) || [],
          statusUpdates: task.statusUpdates?.map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt)
          })) || []
        }));
        setTasks(tasksWithDates);
      } catch (error) {
        console.error('Error parsing tasks from localStorage:', error);
      }
    }

    if (storedPayments) {
      try {
        const parsedPayments = JSON.parse(storedPayments);
        const paymentsWithDates = parsedPayments.map((payment: any) => ({
          ...payment,
          createdAt: new Date(payment.createdAt)
        }));
        setPayments(paymentsWithDates);
      } catch (error) {
        console.error('Error parsing payments from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  useEffect(() => {
    if (payments.length > 0) {
      localStorage.setItem('payments', JSON.stringify(payments));
    }
  }, [payments]);

  const createTask = (taskData: Omit<Task, 'id' | 'publishedAt' | 'reports' | 'challenges' | 'statusUpdates' | 'rewardPaid' | 'isCompletedByPublisher'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      publishedAt: new Date(),
      reports: [],
      challenges: [],
      statusUpdates: [],
      rewardPaid: 0,
      isCompletedByPublisher: false
    };

    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates }
        : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const getTask = (taskId: string) => {
    return tasks.find(task => task.id === taskId);
  };

  const claimTask = (taskId: string, userId: string, userName: string) => {
    updateTask(taskId, {
      status: 'occupied',
      occupiedBy: { id: userId, name: userName }
    });
  };

  const addReport = (taskId: string, reportData: Omit<any, 'id' | 'createdAt'>) => {
    const newReport = {
      ...reportData,
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    const task = getTask(taskId);
    if (task) {
      updateTask(taskId, {
        reports: [...task.reports, newReport]
      });
    }
  };

  const addChallenge = (taskId: string, challengeData: Omit<any, 'id' | 'createdAt'>) => {
    const newChallenge = {
      ...challengeData,
      id: `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    const task = getTask(taskId);
    if (task) {
      updateTask(taskId, {
        challenges: [...task.challenges, newChallenge]
      });
    }
  };

  const addStatusUpdate = (taskId: string, updateData: Omit<any, 'createdAt'>) => {
    const newUpdate = {
      ...updateData,
      createdAt: new Date()
    };

    const task = getTask(taskId);
    if (task) {
      updateTask(taskId, {
        statusUpdates: [...task.statusUpdates, newUpdate]
      });
    }
  };

  const addPayment = (paymentData: Omit<PaymentRecord, 'id' | 'createdAt'>) => {
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    setPayments(prev => [...prev, newPayment]);
  };

  const getPaymentHistory = (userId: string) => {
    const sent = payments.filter(p => p.fromUserId === userId);
    const received = payments.filter(p => p.toUserId === userId);
    return { sent, received };
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      payments,
      createTask,
      updateTask,
      deleteTask,
      getTask,
      claimTask,
      addReport,
      addChallenge,
      addStatusUpdate,
      addPayment,
      getPaymentHistory
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};