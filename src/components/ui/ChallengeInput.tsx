import React, { useState } from 'react';
import { Button } from './button';
import { Textarea } from './textarea';

interface ChallengeInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
}

export const ChallengeInput: React.FC<ChallengeInputProps> = ({
  onSubmit,
  placeholder = "Describe the challenge..."
}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="min-h-[80px]"
      />
      <Button type="submit" disabled={!text.trim()}>
        Report Challenge
      </Button>
    </form>
  );
};