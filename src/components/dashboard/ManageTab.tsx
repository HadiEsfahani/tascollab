import React, { useState } from 'react';
import { Button } from '../ui/button';
import { TaskCard } from '../ui/TaskCard';
import { ReportInput } from '../ui/ReportInput';
import { RewardControl } from '../ui/RewardControl';
import { ConfirmModal } from '../ui/ConfirmModal';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../context/AuthContext';
import { Task, StatusUpdate } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { Plus, CheckCircle, MessageSquare, FileText, Clock, DollarSign, Calendar, User, RotateCcw } from 'lucide-react';

export const ManageTab: React.FC = () => {
  const { tasks, updateTask, createTask } = useTasks();
  const { user, updateUser } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    summary: '',
    description: '',
    deadline: '',
    reward: ''
  });

  const myPublishedTasks = tasks.filter(t => t.publisherId === user?.id);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    createTask({
      title: newTask.title,
      summary: newTask.summary,
      description: newTask.description,
      publisherId: user.id,
      publisherName: user.name,
      deadline: new Date(newTask.deadline),
      reward: parseFloat(newTask.reward),
      files: [],
      status: 'published',
      occupiedBy: null
    });

    setNewTask({ title: '', summary: '', description: '', deadline: '', reward: '' });
    setShowCreateForm(false);
  };

  const handleStatusUpdate = (text: string, files: string[]) => {
    if (!selectedTask || !user) return;

    const newUpdate: StatusUpdate = {
      text,
      files: files.map(name => ({ name, url: '#' })),
      createdAt: new Date()
    };

    updateTask(selectedTask.id, {
      statusUpdates: [...selectedTask.statusUpdates, newUpdate]
    });
  };

  const handleAddReward = (amount: number) => {
    if (!selectedTask || !user) return;

    updateUser({ walletBalance: user.walletBalance - amount });
    updateTask(selectedTask.id, {
      reward: selectedTask.reward + amount
    });
  };

  const handlePayReward = (amount: number) => {
    if (!selectedTask || !user) return;

    updateUser({ walletBalance: user.walletBalance - amount });
    updateTask(selectedTask.id, {
      rewardPaid: selectedTask.rewardPaid + amount
    });
  };

  const handleConfirmCompleted = () => {
    if (!selectedTask) return;

    console.log('Confirming task as completed:', selectedTask.id);

    updateTask(selectedTask.id, {
      status: 'completed',
      isCompletedByPublisher: true
    });

    setShowConfirmModal(false);
  };

  const handleRequestRevision = () => {
    if (!selectedTask) return;

    console.log('Requesting revision for task:', selectedTask.id);

    updateTask(selectedTask.id, {
      status: 'occupied',
      isCompletedByOccupier: false
    });

    setShowRevisionModal(false);
  };

  const handlePublisherReply = (text: string, files: string[]) => {
    if (!selectedTask || !user) return;

    const newReport = {
      userId: user.id,
      userName: user.name,
      text,
      files: files.map(name => ({ name, url: '#' })),
      createdAt: new Date(),
      isPublisherReply: true as const
    };

    updateTask(selectedTask.id, {
      reports: [...selectedTask.reports, newReport]
    });
  };

  return (
    <div className="flex h-full">
      {/* Left sidebar with task list */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Published Tasks</h3>
          <Button
            onClick={() => setShowCreateForm(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Task
          </Button>
        </div>

        {/* Create Task Form */}
        {showCreateForm && (
          <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-semibold mb-3">Create New Task</h4>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <input
                type="text"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Brief Summary"
                value={newTask.summary}
                onChange={(e) => setNewTask({ ...newTask, summary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                placeholder="Detailed Description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                required
              />
              <input
                type="datetime-local"
                value={newTask.deadline}
                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="number"
                placeholder="Reward Amount"
                value={newTask.reward}
                onChange={(e) => setNewTask({ ...newTask, reward: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                required
              />
              <div className="flex space-x-2">
                <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
                  Create
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-2">
          {myPublishedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => setSelectedTask(task)}
              isSelected={selectedTask?.id === task.id}
            />
          ))}
        </div>
      </div>

      {/* Right panel with task details */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedTask ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Task Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTask.title}</h2>
                  <p className="text-gray-600">{selectedTask.summary}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedTask.status === 'published' ? 'bg-blue-100 text-blue-800' :
                  selectedTask.status === 'occupied' ? 'bg-yellow-100 text-yellow-800' :
                  selectedTask.status === 'pending_publisher_confirmation' ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedTask.status === 'pending_publisher_confirmation' ? 'Pending Confirmation' :
                   selectedTask.status.charAt(0).toUpperCase() + selectedTask.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Assigned to</p>
                    <p className="font-medium">
                      {selectedTask.occupiedBy ? selectedTask.occupiedBy.name : 'Unassigned'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Deadline</p>
                    <p className="font-medium">{formatDate(selectedTask.deadline)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Reward</p>
                    <p className="font-medium text-green-600">${selectedTask.reward}</p>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedTask.description}</p>
              </div>

              {/* Publisher Confirmation Buttons */}
              {selectedTask.status === 'pending_publisher_confirmation' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-orange-600 mb-4">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Worker has marked this task as completed</span>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setShowConfirmModal(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm as Completed
                    </Button>
                    <Button
                      onClick={() => setShowRevisionModal(true)}
                      variant="outline"
                      className="border-orange-600 text-orange-600 hover:bg-orange-50"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Revision is Needed
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Status Updates */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Status Updates
              </h3>
              
              <ReportInput
                onSubmit={handleStatusUpdate}
                placeholder="Add a status update..."
                buttonText="Post Update"
              />

              <div className="mt-4 space-y-3">
                {selectedTask.statusUpdates.map((update, index) => (
                  <div key={index} className="border-l-2 border-blue-200 pl-4 py-2">
                    <p className="text-sm text-gray-600 mb-1">
                      {formatDate(update.createdAt)}
                    </p>
                    <p className="text-gray-800">{update.text}</p>
                    {update.files && update.files.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {update.files.map((file, fileIndex) => (
                          <div key={fileIndex} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                            📎 {file.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {selectedTask.statusUpdates.length === 0 && (
                  <p className="text-gray-500 text-sm">No status updates yet</p>
                )}
              </div>
            </div>

            {/* Reports Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Reports & Communication
              </h3>

              <div className="space-y-4">
                {selectedTask.reports.map((report, index) => (
                  <div key={index} className={`p-4 rounded-lg ${
                    report.isPublisherReply ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-50'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">
                        {report.isPublisherReply ? 'Publisher (You)' : report.userName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(report.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-800">{report.text}</p>
                    {report.files && report.files.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {report.files.map((file, fileIndex) => (
                          <div key={fileIndex} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                            📎 {file.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {selectedTask.reports.length === 0 && (
                  <p className="text-gray-500 text-sm">No reports yet</p>
                )}

                {/* Publisher Reply Input */}
                {selectedTask.status === 'occupied' && (
                  <ReportInput
                    onSubmit={handlePublisherReply}
                    placeholder="Reply to the worker..."
                    buttonText="Send Reply"
                  />
                )}
              </div>
            </div>

            {/* Reward Control */}
            {selectedTask.status === 'occupied' && (
              <RewardControl
                task={selectedTask}
                onAddReward={handleAddReward}
                onPayReward={handlePayReward}
              />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a task to manage</h3>
              <p className="text-gray-500">Choose a task from the left panel to view and manage its details</p>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Completed Modal */}
      {showConfirmModal && (
        <ConfirmModal
          isOpen={showConfirmModal}
          title="Confirm Task Completion"
          message="Are you sure you want to confirm this task as completed? This will finalize the task and mark it as done."
          onConfirm={handleConfirmCompleted}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {/* Revision Needed Modal */}
      {showRevisionModal && (
        <ConfirmModal
          isOpen={showRevisionModal}
          title="Request Revision"
          message="Are you sure you want to request a revision? The task will be sent back to the worker for additional work."
          onConfirm={handleRequestRevision}
          onCancel={() => setShowRevisionModal(false)}
        />
      )}
    </div>
  );
};