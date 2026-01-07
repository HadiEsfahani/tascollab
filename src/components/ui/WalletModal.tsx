import React from 'react';
import { Button } from './button';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../hooks/useTasks';
import { formatDate } from '../../utils/dateUtils';
import { X, ArrowUpRight, ArrowDownLeft, DollarSign } from 'lucide-react';

export const WalletModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const { user } = useAuth();
  const { payments } = useTasks();

  // Filter payments for current user
  const userPayments = payments.filter(
    p => p.fromUserId === user?.id || p.toUserId === user?.id
  );

  const totalReceived = userPayments
    .filter(p => p.toUserId === user?.id)
    .reduce((sum, p) => sum + p.amount, 0);

  const totalSent = userPayments
    .filter(p => p.fromUserId === user?.id)
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Wallet</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Balance Summary */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Current Balance</p>
            <p className="text-4xl font-bold text-gray-900">
              ${user?.walletBalance.toFixed(2) || '0.00'}
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <ArrowDownLeft className="h-4 w-4" />
                  <span className="text-sm font-medium">Received</span>
                </div>
                <p className="text-xl font-semibold text-gray-900 mt-1">
                  ${totalReceived.toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-sm font-medium">Sent</span>
                </div>
                <p className="text-xl font-semibold text-gray-900 mt-1">
                  ${totalSent.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
          
          {userPayments.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Complete tasks to earn rewards
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {userPayments
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((payment) => (
                  <div
                    key={payment.id}
                    className={`border rounded-lg p-4 ${
                      payment.toUserId === user?.id
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {payment.type === 'payment' ? 'Payment' : 'Reward Added'}
                          </span>
                          {payment.toUserId === user?.id ? (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Received
                            </span>
                          ) : (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                              Sent
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Task: {payment.taskTitle}
                        </p>
                        <p className="text-sm text-gray-500">
                          {payment.toUserId === user?.id ? 'From' : 'To'}:{' '}
                          {payment.toUserId === user?.id ? payment.fromUserName : payment.toUserName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${
                          payment.toUserId === user?.id ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {payment.toUserId === user?.id ? '+' : '-'}${payment.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(payment.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center text-sm text-gray-600">
            <p>Wallet balance is tracked locally</p>
            <p className="text-xs text-gray-400 mt-1">
              In production, this would connect to a real payment system
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};