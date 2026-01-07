import React from 'react';
import { Button } from './button';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../hooks/useTasks';
import { formatDate } from '../../utils/dateUtils';
import { X, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export const AccountingModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const { user } = useAuth();
  const { tasks } = useTasks();

  // Calculate money owed to user (from tasks they've occupied and are completed)
  const moneyToReceive = tasks
    .filter(t => t.status === 'completed' && t.occupiedBy?.id === user?.id)
    .reduce((sum, task) => sum + (task.reward - task.rewardPaid), 0);

  // Calculate money user owes (for tasks they've published and are completed)
  const moneyToPay = tasks
    .filter(t => t.status === 'completed' && t.publisherId === user?.id)
    .reduce((sum, task) => sum + (task.reward - task.rewardPaid), 0);

  // Calculate total earned from completed tasks
  const totalEarned = tasks
    .filter(t => t.status === 'completed' && t.occupiedBy?.id === user?.id)
    .reduce((sum, task) => sum + task.rewardPaid, 0);

  // Calculate total spent on published tasks
  const totalSpent = tasks
    .filter(t => t.publisherId === user?.id)
    .reduce((sum, task) => sum + task.rewardPaid, 0);

  const completedTasksAsWorker = tasks.filter(
    t => t.status === 'completed' && t.occupiedBy?.id === user?.id
  );

  const completedTasksAsPublisher = tasks.filter(
    t => t.status === 'completed' && t.publisherId === user?.id
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Accounting</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Balance Summary */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Current Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              ${user?.walletBalance.toFixed(2) || '0.00'}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-white rounded p-2">
                <div className="flex items-center justify-center gap-1 text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-medium">To Receive</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  ${moneyToReceive.toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded p-2">
                <div className="flex items-center justify-center gap-1 text-red-600">
                  <TrendingDown className="h-3 w-3" />
                  <span className="text-xs font-medium">To Pay</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  ${moneyToPay.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Money to Receive */}
          {moneyToReceive > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2 text-green-700">Money to Receive</h3>
              <div className="space-y-2">
                {completedTasksAsWorker.map(task => {
                  const pending = task.reward - task.rewardPaid;
                  if (pending <= 0) return null;
                  return (
                    <div key={task.id} className="border border-green-200 rounded p-2 bg-green-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          <p className="text-xs text-gray-600">
                            From: {task.publisherName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">
                            +${pending.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            ${task.rewardPaid.toFixed(2)} paid
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Money to Pay */}
          {moneyToPay > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2 text-red-700">Money to Pay</h3>
              <div className="space-y-2">
                {completedTasksAsPublisher.map(task => {
                  const pending = task.reward - task.rewardPaid;
                  if (pending <= 0) return null;
                  return (
                    <div key={task.id} className="border border-red-200 rounded p-2 bg-red-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          <p className="text-xs text-gray-600">
                            To: {task.occupiedBy?.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-red-600">
                            -${pending.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            ${task.rewardPaid.toFixed(2)} paid
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600">Total Earned</p>
                <p className="text-base font-semibold text-green-600">
                  ${totalEarned.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Spent</p>
                <p className="text-base font-semibold text-red-600">
                  ${totalSpent.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* No transactions */}
          {moneyToReceive === 0 && moneyToPay === 0 && totalEarned === 0 && totalSpent === 0 && (
            <div className="text-center py-6">
              <DollarSign className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No accounting activity yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Complete tasks to see accounting information
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="text-center text-xs text-gray-600">
            <p>Accounting is tracked locally</p>
            <p className="text-xs text-gray-400 mt-1">
              Complete tasks and manage payments through the Manage tab
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};