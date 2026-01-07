import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Task } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../hooks/useTasks';
import { formatDate, isDeadlineSoon } from '../../utils/dateUtils';
import { User, Clock, DollarSign, FileText, Calendar } from 'lucide-react';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose }) => {
  const { user } = useAuth();
  const { claimTask } = useTasks();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!task) return null;

  const handleClaimTask = () => {
    if (!user) return;
    
    console.log('Claiming task:', task.id, 'for user:', user.id);
    
    claimTask(task.id, user.id, user.name);
    setShowConfirmModal(false);
    onClose();
  };

  const canClaim = user && task.status === 'published' && task.publisherId !== user.id;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{task.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Summary */}
            <div>
              <h4 className="font-semibold text-sm text-gray-600 mb-1">Summary</h4>
              <p className="text-gray-800">{task.summary}</p>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-semibold text-sm text-gray-600 mb-1">Description</h4>
              <p className="text-gray-800 whitespace-pre-wrap">{task.description}</p>
            </div>

            {/* Task Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Published by</p>
                  <p className="font-medium">{task.publisherName}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Published on</p>
                  <p className="font-medium">{formatDate(task.publishedAt)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className={`w-4 h-4 ${isDeadlineSoon(task.deadline) ? 'text-red-500' : 'text-gray-500'}`} />
                <div>
                  <p className="text-sm text-gray-600">Deadline</p>
                  <p className={`font-medium ${isDeadlineSoon(task.deadline) ? 'text-red-500' : ''}`}>
                    {formatDate(task.deadline)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Reward</p>
                  <p className="font-medium text-green-600">${task.reward}</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <h4 className="font-semibold text-sm text-gray-600 mb-1">Status</h4>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.status === 'published' ? 'bg-blue-100 text-blue-800' :
                  task.status === 'occupied' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
                {task.occupiedBy && (
                  <span className="text-sm text-gray-600">
                    by {task.occupiedBy.name}
                  </span>
                )}
              </div>
            </div>

            {/* Files */}
            {task.files && task.files.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  Attached Files
                </h4>
                <div className="space-y-1">
                  {task.files.map((file, index) => (
                    <div key={index} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                      📎 {file.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {canClaim && (
                <Button 
                  onClick={() => setShowConfirmModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  I'll do it
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Task Claim</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to claim this task? Once claimed, you'll be responsible for completing it by the deadline.
            </p>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleClaimTask}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Yes, Claim Task
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};