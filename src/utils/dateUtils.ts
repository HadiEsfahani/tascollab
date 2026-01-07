import { format } from 'date-fns';

export const formatDate = (date: Date | string | undefined | null): string => {
  if (!date) return 'No date set';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  
  return format(d, 'MMM dd, yyyy HH:mm');
};

export const isDeadlineSoon = (deadline: Date | string | undefined | null): boolean => {
  if (!deadline) return false;
  
  const d = typeof deadline === 'string' ? new Date(deadline) : deadline;
  
  // Check if date is valid
  if (isNaN(d.getTime())) {
    return false;
  }
  
  const now = new Date();
  const diffInHours = (d.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return diffInHours > 0 && diffInHours < 48;
};