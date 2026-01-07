import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Trash2, Download, RefreshCw } from 'lucide-react';

export const DebugPanel: React.FC = () => {
  const [localStorageData, setLocalStorageData] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  const refreshData = () => {
    const data: any = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || 'null');
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    setLocalStorageData(data);
  };

  useEffect(() => {
    if (isVisible) {
      refreshData();
    }
  }, [isVisible]);

  const clearAll = () => {
    localStorage.clear();
    refreshData();
  };

  const exportData = () => {
    const dataStr = JSON.stringify(localStorageData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'localStorage-backup.json';
    a.click();
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-40 h-6 px-2 text-xs bg-yellow-100"
      >
        Debug
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 max-w-md max-h-96 overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold">Debug Panel</h3>
        <div className="flex gap-1">
          <Button onClick={refreshData} size="sm" variant="outline" className="h-6 px-1 text-xs">
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button onClick={exportData} size="sm" variant="outline" className="h-6 px-1 text-xs">
            <Download className="h-3 w-3" />
          </Button>
          <Button onClick={clearAll} size="sm" variant="outline" className="h-6 px-1 text-xs text-red-600">
            <Trash2 className="h-3 w-3" />
          </Button>
          <Button onClick={() => setIsVisible(false)} size="sm" variant="outline" className="h-6 px-1 text-xs">
            ×
          </Button>
        </div>
      </div>
      <div className="overflow-y-auto max-h-80 text-xs">
        <pre className="bg-gray-50 p-2 rounded whitespace-pre-wrap break-all">
          {JSON.stringify(localStorageData, null, 2)}
        </pre>
      </div>
    </div>
  );
};