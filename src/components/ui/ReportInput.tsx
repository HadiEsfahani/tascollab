import React, { useState } from 'react';
import { Button } from './button';
import { Textarea } from './textarea';

interface ReportInputProps {
  onSubmit: (text: string, files: string[]) => void;
  placeholder?: string;
  buttonText?: string;
}

export const ReportInput: React.FC<ReportInputProps> = ({
  onSubmit,
  placeholder = "Enter your report...",
  buttonText = "Submit"
}) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text, files);
      setText('');
      setFiles([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="min-h-[100px]"
      />
      <div className="flex justify-between items-center">
        <input
          type="file"
          multiple
          onChange={(e) => {
            const fileNames = Array.from(e.target.files || []).map(f => f.name);
            setFiles(fileNames);
          }}
          className="text-sm text-gray-600"
        />
        <Button type="submit" disabled={!text.trim()}>
          {buttonText}
        </Button>
      </div>
    </form>
  );
};