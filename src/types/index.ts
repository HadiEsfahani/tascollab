export interface User {
  id: string;
  name: string;
  email: string;
  walletBalance: number;
  createdAt: Date;
}

export interface FileAttachment {
  name: string;
  url: string;
}

export interface Report {
  userId: string;
  userName: string;
  text: string;
  files: FileAttachment[];
  createdAt: Date;
  isPublisherReply?: boolean;
}

export interface Challenge {
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}

export interface StatusUpdate {
  text: string;
  files: FileAttachment[];
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  summary: string;
  publisherId: string;
  publisherName: string;
  publishedAt: Date;
  deadline: Date;
  reward: number;
  files: FileAttachment[];
  status: 'published' | 'occupied' | 'completed' | 'pending_publisher_confirmation';
  occupiedBy: { id: string; name: string } | null;
  reports: Report[];
  challenges: Challenge[];
  statusUpdates: StatusUpdate[];
  rewardPaid: number;
  isCompletedByPublisher: boolean;
  isCompletedByOccupier?: boolean;
}