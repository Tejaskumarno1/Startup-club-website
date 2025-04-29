
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface SlidesErrorStateProps {
  errorMessage: string;
  onRetry: () => void;
}

export function SlidesErrorState({ errorMessage, onRetry }: SlidesErrorStateProps) {
  return (
    <Card className="bg-red-50 border-red-200">
      <CardContent className="flex flex-col items-center justify-center h-48 p-6">
        <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
        <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load slides</h3>
        <p className="text-center text-red-600 mb-4">
          {errorMessage || "An error occurred while loading slides. Please try again."}
        </p>
        <Button onClick={onRetry} variant="outline" className="flex items-center border-red-300 text-red-700 hover:bg-red-100">
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </CardContent>
    </Card>
  );
}
