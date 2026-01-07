import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { formatDate } from '../../utils/dateUtils';
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';

export const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const { tasks, getPaymentHistory } = useTasks();
  const { sent, received } = getPaymentHistory(user?.id || '');

  // Calculate amounts owed and received from tasks
  const tasksIOwe = tasks.filter(task => 
    task.publisherId === user?.id && 
    task.occupiedBy && 
    task.status === 'completed'
  );

  const tasksOwedToMe = tasks.filter(task => 
    task.occupiedBy?.id === user?.id && 
    task.status === 'completed'
  );

  const totalIOwe = tasksIOwe.reduce((sum, task) => 
    sum + (task.reward - task.rewardPaid), 0
  );

  const totalOwedToMe = tasksOwedToMe.reduce((sum, task) => 
    sum + (task.reward - task.rewardPaid), 0
  );

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wallet</h1>
          <p className="text-gray-600">Manage your payments and track transaction history</p>
        </div>

        {/* Balance Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              ${user?.walletBalance.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Money I Owe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <ArrowUpRight className="h-5 w-5" />
                Money I Owe
              </CardTitle>
              <CardDescription>
                Payments to users who completed your tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasksIOwe.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No pending payments</p>
              ) : (
                <div className="space-y-4">
                  {tasksIOwe.map(task => (
                    <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{task.title}</h4>
                          <p className="text-sm text-gray-600">
                            To: {task.occupiedBy?.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            ${(task.reward - task.rewardPaid).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            of ${task.reward.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Paid: ${task.rewardPaid.toFixed(2)}</span>
                        <span>Completed: {formatDate(task.publishedAt)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Owed:</span>
                      <span className="text-red-600">${totalIOwe.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Money Owed to Me */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <ArrowDownRight className="h-5 w-5" />
                Money Owed to Me
              </CardTitle>
              <CardDescription>
                Payments from users whose tasks you completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasksOwedToMe.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No pending payments</p>
              ) : (
                <div className="space-y-4">
                  {tasksOwedToMe.map(task => (
                    <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{task.title}</h4>
                          <p className="text-sm text-gray-600">
                            From: {task.publisherName}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            ${(task.reward - task.rewardPaid).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            of ${task.reward.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Received: ${task.rewardPaid.toFixed(2)}</span>
                        <span>Completed: {formatDate(task.publishedAt)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Owed to Me:</span>
                      <span className="text-green-600">${totalOwedToMe.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Recent payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {sent.length === 0 && received.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {[...sent, ...received]
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .map(payment => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          {payment.type === 'reward_added' ? 'Reward Added' : 'Payment'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {payment.fromUserId === user?.id ? (
                            <>To: {payment.toUserName} - {payment.taskTitle}</>
                          ) : (
                            <>From: {payment.fromUserName} - {payment.taskTitle}</>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${
                          payment.fromUserId === user?.id ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {payment.fromUserId === user?.id ? '-' : '+'}${payment.amount.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(payment.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};