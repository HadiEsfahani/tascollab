import React, { useState } from 'react';
import { TaskCard } from '../ui/TaskCard';
import { TaskModal } from '../ui/TaskModal';
import { ConfirmModal } from '../ui/ConfirmModal';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../context/AuthContext';
import { Task } from '../../types';
import { Badge } from "/components/ui/badge";

export const DeckTab: React.FC = () => {
  const { tasks, updateTask, claimTask } = useTasks();
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [taskToClaim, setTaskToClaim] = useState<Task | null>(null);

  const publishedTasks = tasks.filter(t => t.status === 'published');
  const occupiedTasks = tasks.filter(t => t.status === 'occupied');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const handleClaimTask = () => {
    if (!taskToClaim || !user) return;

    claimTask(taskToClaim.id, user.id, user.name);
    setShowConfirmModal(false);
    setTaskToClaim(null);
  };

  const openTaskModal = (task: Task) => {
    setSelectedTask(task);
  };

  const openClaimModal = (task: Task) => {
    if (!user) return;
    setTaskToClaim(task);
    setShowConfirmModal(true);
  };

  const TaskColumn = ({ title, tasks, color }: { title: string; tasks: Task[]; color: string }) => (
    <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="font-semibold text-lg">{title}</h3>
        <Badge variant="secondary" className={`${color} text-white`}>
          {tasks.length}
        </Badge>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => openTaskModal(task)}
            onClaim={task.status === 'published' ? () => openClaimModal(task) : undefined}
            currentUser={user}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>No tasks in this column</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full p-6">
      <div className="flex gap-6 h-full">
        <TaskColumn 
          title="Published" 
          tasks={publishedTasks} 
          color="bg-blue-500" 
        />
        <TaskColumn 
          title="Occupied" 
          tasks={occupiedTasks} 
          color="bg-yellow-500" 
        />
        <TaskColumn 
          title="Completed" 
          tasks={completedTasks} 
          color="bg-green-500" 
        />
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          currentUser={user}
        />
      )}

      {showConfirmModal && taskToClaim && (
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setTaskToClaim(null);
          }}
          onConfirm={handleClaimTask}
          title="Claim Task"
          message={`Are you sure you want to claim "${taskToClaim.title}"? You'll be responsible for completing this task by ${new Date(taskToClaim.deadline).toLocaleDateString()}.`}
          confirmText="Claim Task"
        />
      )}
    </div>
  );
};