import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { DollarSign, Plus } from 'lucide-react';
import { Task } from '../../types';

interface RewardControlProps {
  task: Task | null;
  onAddReward: (amount: number) => void;
  onPayReward: (amount: number) => void;
  userWalletBalance: number;
}

export const RewardControl: React.FC<RewardControlProps> = ({
  task,
  onAddReward,
  onPayReward,
  userWalletBalance
}) => {
  const [addAmount, setAddAmount] = useState('');
  const [payAmount, setPayAmount] = useState('');

  if (!task) {
    return (
      <div className="text-sm text-gray-500">
        Select a task to manage rewards
      </div>
    );
  }

  const remainingReward = task.reward - task.rewardPaid;
  const canAddReward = userWalletBalance > 0;
  const canPayReward = remainingReward > 0 && userWalletBalance >= remainingReward;

  const handleAddReward = () => {
    const amount = parseFloat(addAmount);
    if (amount > 0 && amount <= userWalletBalance) {
      onAddReward(amount);
      setAddAmount('');
    }
  };

  const handlePayReward = () => {
    const amount = parseFloat(payAmount);
    if (amount > 0 && amount <= remainingReward && amount <= userWalletBalance) {
      onPayReward(amount);
      setPayAmount('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Reward Status */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-sm font-medium text-gray-700 mb-2">Reward Status</div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Reward:</span>
            <span className="font-medium text-green-600">${task.reward}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Paid:</span>
            <span className="font-medium text-blue-600">${task.rewardPaid}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-700">Remaining:</span>
            <span className={remainingReward > 0 ? 'text-orange-600' : 'text-green-600'}>
              ${remainingReward}
            </span>
          </div>
        </div>
      </div>

      {/* Add Reward */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Add Extra Reward</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
            placeholder="Amount"
            min="0"
            step="0.01"
            max={userWalletBalance.toString()}
          />
          <Button
            onClick={handleAddReward}
            disabled={!canAddReward || !addAmount || parseFloat(addAmount) <= 0}
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
        <div className="text-xs text-gray-500">
          Your wallet: ${userWalletBalance}
        </div>
      </div>

      {/* Pay Reward */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Pay Reward</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            placeholder="Amount"
            min="0"
            step="0.01"
            max={remainingReward.toString()}
          />
          <Button
            onClick={handlePayReward}
            disabled={!canPayReward || !payAmount || parseFloat(payAmount) <= 0}
            size="sm"
            className="flex items-center gap-1"
          >
            <DollarSign className="h-4 w-4" />
            Pay
          </Button>
        </div>
        <div className="text-xs text-gray-500">
          Available to pay: ${remainingReward}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPayAmount(remainingReward.toString())}
          disabled={!canPayReward}
        >
          Pay Full Amount
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPayAmount((remainingReward / 2).toString())}
          disabled={!canPayReward}
        >
          Pay Half
        </Button>
      </div>
    </div>
  );
};