import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "/components/ui/card";
import { Badge } from "/components/ui/badge";
import { Task } from '../../types';
import { formatDate, isDeadlineSoon } from '../../utils/dateUtils';
import { Clock, User, DollarSign, Calendar } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  showOccupiedBy?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onClick, 
  showOccupiedBy = false 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-blue-100 text-blue-800';
      case 'occupied':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const deadlineSoon = isDeadlineSoon(task.deadline);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('TaskCard clicked:', task.title);
    if (onClick) {
      onClick();
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300"
      onClick={handleClick}
    >
      <CardHeader className="pb-2 px-3 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium line-clamp-2 leading-tight">{task.title}</CardTitle>
            <CardDescription className="mt-0.5 text-xs line-clamp-2 leading-tight">
              {task.summary}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(task.status) + ' text-xs px-1.5 py-0.5'}>
            {task.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-3 pb-3">
        <div className="space-y-1">
          {/* Reward */}
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-3 w-3 text-green-600 flex-shrink-0" />
            <span className="font-semibold text-sm text-green-600">${task.reward}</span>
            {task.rewardPaid > 0 && (
              <span className="text-xs text-gray-500">
                (${task.rewardPaid} paid)
              </span>
            )}
          </div>

          {/* Deadline */}
          <div className={`flex items-center gap-1.5 ${deadlineSoon ? 'text-red-600' : 'text-gray-600'}`}>
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className="text-xs">
              {formatDate(task.deadline)}
            </span>
            {deadlineSoon && (
              <Badge variant="destructive" className="text-xs px-1 py-0">
                <Clock className="h-2.5 w-2.5 mr-0.5" />
                Soon
              </Badge>
            )}
          </div>

          {/* Publisher */}
          <div className="flex items-center gap-1.5 text-gray-600">
            <User className="h-3 w-3 flex-shrink-0" />
            <span className="text-xs truncate">{task.publisherName}</span>
          </div>

          {/* Occupied By */}
          {showOccupiedBy && task.occupiedBy && (
            <div className="flex items-center gap-1.5 text-orange-600">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="text-xs truncate">
                {task.occupiedBy.name}
              </span>
            </div>
          )}

          {/* Published Date */}
          <div className="text-xs text-gray-500">
            {formatDate(task.publishedAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};