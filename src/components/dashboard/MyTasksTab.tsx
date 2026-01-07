import React, { useState } from 'react';
import { Button } from '../ui/button';
import { TaskCard } from '../ui/TaskCard';
import { ReportInput } from '../ui/ReportInput';
import { ChallengeInput } from '../ui/ChallengeInput';
import { ConfirmModal } from '../ui/ConfirmModal';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../context/AuthContext';
import { Task } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { CheckCircle, FileText, Clock, DollarSign, User, AlertTriangle } from 'lucide-react';

export const MyTasksTab: React.FC = () => {
  const { tasks, updateTask } = useTasks();
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  const myOccupiedTasks = tasks.filter(t => t.occupiedBy?.id === user?.id);

  const handleMarkCompleted = () => {
    if (!selectedTask || !user) return;

    console.log('Marking task as completed by user:', selectedTask.id);

    updateTask(selectedTask.id, {
      status: 'pending_publisher_confirmation',
      isCompletedByOccupier: true
    });

    setShowCompleteConfirm(false);
  };

  const handleReport = (text: string, files: string[]) => {
    if (!selectedTask || !user) return;

    const newReport = {
      userId: user.id,
      userName: user.name,
      text,
      files: files.map(name => ({ name, url: '#' })),
      createdAt: new Date(),
      isPublisherReply: false as const
    };

    updateTask(selectedTask.id, {
      reports: [...selectedTask.reports, newReport]
    });
  };

  const handleChallenge = (text: string) => {
    if (!selectedTask || !user) return;

    const newChallenge = {
      userId: user.id,
      userName: user.name,
      text,
      createdAt: new Date()
    };

    updateTask(selectedTask.id, {
      challenges: [...selectedTask.challenges, newChallenge]
    });
  };

  return (
    <div className="flex h-full">
      {/* Left sidebar with task list */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
        <h3 className="font-semibold text-lg mb-4">My Tasks</h3>
        
        <div className="space-y-2">
          {myOccupiedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => setSelectedTask(task)}
              isSelected={selectedTask?.id === task.id}
            />
          ))}
        </div>

        {myOccupiedTasks.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
            <p>No tasks claimed yet</p>
            <p className="text-sm">Go to the Deck tab to claim tasks</p>
          </div>
        )}
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
                    <p className="text-xs text-gray-500">Published by</p>
                    <p className="font-medium">{selectedTask.publisherName}</p>
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

              {/* Mark as Completed Button */}
              {selectedTask.status === 'occupied' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Button
                    onClick={() => setShowCompleteConfirm(true)}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={selectedTask.isCompletedByOccupier}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {selectedTask.isCompletedByOccupier ? 'Already Marked as Completed' : 'Mark as Completed'}
                  </Button>
                </div>
              )}

              {/* Pending Confirmation Status */}
              {selectedTask.status === 'pending_publisher_confirmation' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-orange-600">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">Waiting for publisher confirmation</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    You have marked this task as completed. The publisher will review and confirm or request revisions.
                  </p>
                </div>
              )}
            </div>

            {/* Reports Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Reports & Communication
              </h3>

              <ReportInput
                onSubmit={handleReport}
                placeholder="Submit a progress report..."
                buttonText="Send Report"
              />

              <div className="mt-4 space-y-4">
                {selectedTask.reports.map((report, index) => (
                  <div key={index} className={`p-4 rounded-lg ${
                    report.isPublisherReply ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-50'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">
                        {report.isPublisherReply ? 'Publisher' : 'You'}
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
              </div>
            </div>

            {/* Challenges Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-lg mb-4">Challenges</h3>
              
              <ChallengeInput
                onSubmit={handleChallenge}
                placeholder="Report any challenges or issues..."
              />

              <div className="mt-4 space-y-3">
                {selectedTask.challenges.map((challenge, index) => (
                  <div key={index} className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">You</span>
                      <span className="text-xs text-gray-500">
                        {formatDate(challenge.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-800">{challenge.text}</p>
                  </div>
                ))}

                {selectedTask.challenges.length === 0 && (
                  <p className="text-gray-500 text-sm">No challenges reported</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a task to work on</h3>
              <p className="text-gray-500">Choose a task from the left panel to view and manage your work</p>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showCompleteConfirm && (
        <ConfirmModal
          isOpen={showCompleteConfirm}
          title="Mark Task as Completed"
          message="Are you sure you want to mark this task as completed? The publisher will need to confirm your work."
          onConfirm={handleMarkCompleted}
          onCancel={() => setShowCompleteConfirm(false)}
        />
      )}
    </div>
  );
};