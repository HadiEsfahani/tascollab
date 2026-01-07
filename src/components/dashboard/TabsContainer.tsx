import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DeckTab } from './DeckTab';
import { MyTasksTab } from './MyTasksTab';
import { ManageTab } from './ManageTab';
import { AccountingTab } from './AccountingTab';
import { ProfileTab } from './ProfileTab';

interface TabsContainerProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TabsContainer: React.FC<TabsContainerProps> = ({ activeTab, onTabChange }) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-5 mx-6 mt-4">
        <TabsTrigger value="deck">Deck</TabsTrigger>
        <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
        <TabsTrigger value="manage">Manage</TabsTrigger>
        <TabsTrigger value="accounting">Accounting</TabsTrigger>
        <TabsTrigger value="profile">Profile</TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-hidden">
        <TabsContent value="deck" className="h-full m-0">
          <DeckTab />
        </TabsContent>
        <TabsContent value="my-tasks" className="h-full m-0">
          <MyTasksTab />
        </TabsContent>
        <TabsContent value="manage" className="h-full m-0">
          <ManageTab />
        </TabsContent>
        <TabsContent value="accounting" className="h-full m-0 overflow-y-auto">
          <AccountingTab />
        </TabsContent>
        <TabsContent value="profile" className="h-full m-0">
          <ProfileTab />
        </TabsContent>
      </div>
    </Tabs>
  );
};