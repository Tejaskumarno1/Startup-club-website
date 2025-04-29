
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SlideImage } from "@/lib/types";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, GripVertical, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface SortableSlideCardProps {
  slide: SlideImage;
  onEdit: (slide: SlideImage) => void;
  onDelete: (slideId: string) => void;
  onToggleActive?: (slideId: string, isActive: boolean) => void;
}

export function SortableSlideCard({ 
  slide, 
  onEdit, 
  onDelete,
  onToggleActive
}: SortableSlideCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isActive = slide.is_active !== false;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: slide.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };
  
  return (
    <>
      <Card 
        ref={setNodeRef} 
        style={style} 
        className={`overflow-hidden ${isDragging ? 'shadow-lg' : ''} transition-shadow duration-200 hover:shadow-md`}
      >
        <div className="aspect-video relative">
          <img 
            src={slide.image_url} 
            alt={slide.title} 
            className="object-cover w-full h-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
          
          <div className="absolute top-2 right-2 flex gap-1">
            {!isActive && (
              <Badge variant="outline" className="bg-gray-800/70 text-white border-0">
                <EyeOff className="h-3 w-3 mr-1" /> Hidden
              </Badge>
            )}
            <Badge variant="outline" className="bg-primary/70 text-white border-0">
              #{slide.display_order}
            </Badge>
          </div>
          
          <div 
            className="absolute top-2 left-2 p-1 rounded bg-black/60 text-white cursor-grab active:cursor-grabbing" 
            {...attributes} 
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg truncate">{slide.title}</h3>
            <div className="flex items-center ml-2">
              {onToggleActive && (
                <Switch 
                  checked={isActive}
                  onCheckedChange={(checked) => onToggleActive(slide.id, checked)}
                  aria-label={isActive ? "Visible" : "Hidden"}
                />
              )}
            </div>
          </div>
          
          {slide.description && (
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{slide.description}</p>
          )}
          
          <div className="flex justify-end gap-2 mt-2">
            <Button 
              size="sm" 
              variant="outline"
              className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => onEdit(slide)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Slide</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{slide.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => onDelete(slide.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
