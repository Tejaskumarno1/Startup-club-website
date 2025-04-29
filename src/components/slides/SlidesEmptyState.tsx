
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface SlidesEmptyStateProps {
  onAddSlide: () => void;
  buttonText?: string; // Make buttonText optional with a default value
}

export function SlidesEmptyState({ onAddSlide, buttonText = "Add Slide" }: SlidesEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-8">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <PlusCircle className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No items found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
          Get started by creating your first item to display here.
        </p>
        <Button onClick={onAddSlide}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
