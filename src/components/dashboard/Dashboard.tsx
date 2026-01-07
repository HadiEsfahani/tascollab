import React from 'react';
import { TabsContainer } from './TabsContainer';

interface DashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="h-full">
      <TabsContainer activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};