
import { Card, CardContent } from "@/components/ui/card";

export function SlidesLoadingState() {
  // Create an array of 4 items for skeleton loading
  const skeletonItems = Array.from({ length: 4 }, (_, i) => i);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {skeletonItems.map((item) => (
        <Card key={item} className="overflow-hidden">
          <div className="aspect-video bg-gray-200 animate-pulse" />
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              </div>
              <div className="flex space-x-1 ml-4">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
