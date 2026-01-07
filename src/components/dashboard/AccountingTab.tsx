import React, { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../context/AuthContext';
import { Task } from '../../types';
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle, AlertCircle, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ConfirmModal } from '../ui/ConfirmModal';

const getPaymentState = (task: Task, isPublisher: boolean) => {
  const confirmedAmount = isPublisher ? task.publisherConfirmedAmount : task.occupierConfirmedAmount;
  
  if (confirmedAmount === 0) {
    return { state: 'pending', label: 'Pending', color: 'text-yellow-600' };
  } else if (confirmedAmount === task.reward) {
    return { state: 'confirmed', label: 'Confirmed', color: 'text-green-600' };
  } else {
    return { 
      state: 'partially', 
      label: `Partially Paid ($${confirmedAmount.toFixed(2)})`, 
      color: 'text-orange-600' 
    };
  }
};

// Helper function to get user data including wallet address
const getUserData = (userId: string) => {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find((u: any) => u.id === userId) || { walletAddress: 'Not set' };
  } catch {
    return { walletAddress: 'Not set' };
  }
};

export const AccountingTab: React.FC = () => {
  const { tasks, confirmPayment } = useTasks();
  const { user } = useAuth();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [taskToConfirm, setTaskToConfirm] = useState<Task | null>(null);

  if (!user) return null;

  // Calculate accounting data
  const publishedTasks = tasks.filter(t => t.publisherId === user.id);
  const occupiedTasks = tasks.filter(t => t.occupiedBy?.id === user.id);

  const totalPaid = publishedTasks.reduce((sum, task) => sum + task.publisherConfirmedAmount, 0);
  const totalEarned = occupiedTasks
    .filter(task => task.status === 'completed')
    .reduce((sum, task) => sum + task.occupierConfirmedAmount, 0);
  const totalBalance = user.walletBalance;

  // Get all tasks involving the user (published or occupied)
  const userTasks = tasks.filter(
    task => task.publisherId === user.id || task.occupiedBy?.id === user.id
  );

  const handleConfirmPayment = (taskId: string) => {
    confirmPayment(taskId, user.id);
  };

  const handleConfirmClick = (task: Task) => {
    setTaskToConfirm(task);
    setShowConfirmModal(true);
  };

  const handleConfirmModal = () => {
    if (taskToConfirm) {
      handleConfirmPayment(taskToConfirm.id);
      setShowConfirmModal(false);
      setTaskToConfirm(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Accounting</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">${totalPaid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Confirmed payments for {publishedTasks.length} published tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">${totalEarned.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Confirmed earnings from {occupiedTasks.filter(t => t.status === 'completed').length} completed tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <div className="h-4 w-4 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">${totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Available in wallet
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            All tasks involving payments and earnings. Confirm payments when received.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No transactions yet
              </p>
            ) : (
              userTasks.map(task => {
                const isPublisher = task.publisherId === user.id;
                const isCompleted = task.status === 'completed';
                const paymentState = getPaymentState(task, isPublisher);
                
                // Get user data including wallet addresses
                const publisherData = getUserData(task.publisherId);
                const workerData = task.occupiedBy ? getUserData(task.occupiedBy.id) : null;
                
                // Only show completed tasks for earnings, but show all published tasks
                if (!isPublisher && !isCompleted) return null;
                
                // Check if user can confirm - completed by user and in pending state
                const canConfirm = !isPublisher && isCompleted && paymentState.state === 'pending';
                
                return (
                  <div
                    key={task.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{task.title}</h4>
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      
                      {/* Publisher Info with Wallet Address */}
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Published by:</span> {task.publisherName}
                        <div className="flex items-center gap-1 ml-2 text-xs text-gray-500">
                          <Wallet className="h-3 w-3" />
                          <span className="font-mono">{publisherData.walletAddress || 'Not set'}</span>
                        </div>
                      </div>
                      
                      {/* Worker Info with Wallet Address */}
                      {task.occupiedBy && (
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">
                            {task.status === 'completed' ? 'Completed by:' : 'Occupied by:'}
                          </span> {task.occupiedBy.name}
                          {workerData && (
                            <div className="flex items-center gap-1 ml-2 text-xs text-gray-500">
                              <Wallet className="h-3 w-3" />
                              <span className="font-mono">{workerData.walletAddress || 'Not set'}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="text-sm text-muted-foreground">
                        Status: {task.status}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-semibold ${
                        isPublisher ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {isPublisher ? '-' : '+'}${task.reward.toFixed(2)}
                      </div>
                      <div className={`text-sm flex items-center gap-1 ${paymentState.color}`}>
                        {paymentState.state === 'confirmed' && <CheckCircle className="h-3 w-3" />}
                        {paymentState.state === 'pending' && <Clock className="h-3 w-3" />}
                        {paymentState.state === 'partially' && <AlertCircle className="h-3 w-3" />}
                        {paymentState.label}
                      </div>
                      
                      {/* Confirm button for completed tasks in pending state */}
                      {canConfirm && (
                        <div className="mt-2">
                          <Button
                            size="sm"
                            onClick={() => handleConfirmClick(task)}
                            className="text-xs bg-green-600 hover:bg-green-700 text-white"
                          >
                            Confirm
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setTaskToConfirm(null);
        }}
        onConfirm={handleConfirmModal}
        title="Confirm Payment"
        message={`Are you sure you want to confirm the payment for "${taskToConfirm?.title}"? This will mark the payment as received.`}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </div>
  );
};