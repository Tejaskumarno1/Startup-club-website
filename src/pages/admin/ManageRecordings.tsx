
import React, { useState, useEffect } from "react";
import { AdminPageTemplate } from "@/components/admin/AdminPageTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, Edit, Trash, ExternalLink, Eye } from "lucide-react";
import { getPastRecordings, deleteRecording } from "@/lib/recordingsHelpers";
import { PastRecording } from "@/lib/types";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import RecordingFormDialog from "@/components/recordings/RecordingFormDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ManageRecordings = () => {
  const { toast } = useToast();
  const [recordings, setRecordings] = useState<PastRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState<PastRecording | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordingToDelete, setRecordingToDelete] = useState<PastRecording | null>(null);
  
  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const data = await getPastRecordings();
      setRecordings(data);
    } catch (error) {
      console.error("Error fetching recordings:", error);
      toast({
        title: "Failed to load recordings",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRecordings();
  }, []);
  
  const handleCreateClick = () => {
    setSelectedRecording(null);
    setFormDialogOpen(true);
  };
  
  const handleEditClick = (recording: PastRecording) => {
    setSelectedRecording(recording);
    setFormDialogOpen(true);
  };
  
  const handleDeleteClick = (recording: PastRecording) => {
    setRecordingToDelete(recording);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!recordingToDelete) return;
    
    try {
      const result = await deleteRecording(recordingToDelete.id);
      
      if (result.success) {
        toast({
          title: "Recording deleted",
          description: "The recording has been successfully deleted",
        });
        
        fetchRecordings();
      } else {
        throw new Error(result.error || "Failed to delete recording");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting the recording",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setRecordingToDelete(null);
    }
  };
  
  // Format duration as hours:minutes
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  };
  
  // Filter recordings by search term
  const filteredRecordings = recordings.filter(recording => {
    return (
      recording.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recording.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recording.presenter_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <AdminPageTemplate 
      title="Manage Recordings" 
      description="View, create, edit, and manage past event recordings" 
      icon={Eye}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recordings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Button onClick={handleCreateClick} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add New Recording
          </Button>
        </div>
        
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <CardTitle>Recordings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Recorded On</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading recordings...
                      </TableCell>
                    </TableRow>
                  ) : filteredRecordings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {searchTerm ? (
                          <>
                            No recordings found matching "
                            <span className="font-medium">{searchTerm}</span>"
                          </>
                        ) : (
                          "No recordings available. Add your first recording!"
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecordings.map((recording) => (
                      <TableRow key={recording.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            {recording.thumbnail_url && (
                              <img 
                                src={recording.thumbnail_url} 
                                alt={recording.title}
                                className="h-8 w-12 object-cover rounded"
                              />
                            )}
                            <span className="line-clamp-1">{recording.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {recording.events?.title || "-"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(recording.recorded_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{formatDuration(recording.duration || 0)}</TableCell>
                        <TableCell>{recording.view_count || 0}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${recording.is_public ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                            {recording.is_public ? "Public" : "Private"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditClick(recording)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a 
                                  href={recording.recording_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center"
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Recording
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(recording)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <RecordingFormDialog 
        isOpen={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        recordingToEdit={selectedRecording}
        onSuccess={fetchRecordings}
      />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the recording "{recordingToDelete?.title}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Recording
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPageTemplate>
  );
};

export default ManageRecordings;
