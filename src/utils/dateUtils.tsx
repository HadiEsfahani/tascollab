import { format, differenceInHours } from 'date-fns';

export const formatDate = (date: Date | string): string => {
  try {
    let dateObj: Date;
    
    if (typeof date === 'string') {
      // Handle different string formats
      if (date.includes('T')) {
        // ISO format or datetime-local format
        dateObj = new Date(date);
      } else {
        // Try parsing as is
        dateObj = new Date(date);
      }
    } else {
      dateObj = date;
    }
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date object:', date);
      return 'Invalid date';
    }
    
    return format(dateObj, 'MMM d, yyyy h:mm a');
  } catch (error) {
    console.error('Date formatting error:', error, 'Input:', date);
    return 'Invalid date';
  }
};

export const isDeadlineSoon = (deadline: Date | string): boolean => {
  try {
    let deadlineDate: Date;
    
    if (typeof deadline === 'string') {
      deadlineDate = new Date(deadline);
    } else {
      deadlineDate = deadline;
    }
    
    // Check if the date is valid
    if (isNaN(deadlineDate.getTime())) {
      return false;
    }
    
    const now = new Date();
    const hoursUntilDeadline = differenceInHours(deadlineDate, now);
    
    return hoursUntilDeadline > 0 && hoursUntilDeadline <= 48;
  } catch (error) {
    console.error('Deadline check error:', error);
    return false;
  }
};