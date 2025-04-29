
import React, { useState } from "react";
import { PageTemplate } from "@/components/common/PageTemplate";
import { UserPlus, CheckCircle, XCircle, Filter, RefreshCw, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { getMentorApplications } from "@/lib/adminMentorHelpers";
import { useApproveMentor } from "@/hooks/useAdminData";
import { useQuery } from "@tanstack/react-query";

interface MentorApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  expertise: string[];
  experience_years: number;
  is_approved: boolean;
  created_at: string;
}

const ManageMentors = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  // Fetch mentor applications using React Query
  const { 
    data: applications = [],
    isLoading,
    refetch,
    error
  } = useQuery({
    queryKey: ['mentor-applications'],
    queryFn: getMentorApplications,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Mutation hook for approving mentors
  const approveMutation = useApproveMentor();

  // Show error toast if data fetching fails
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load mentor applications.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleApprove = async (userId: string) => {
    try {
      approveMutation.mutate(userId, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Mentor application approved successfully.",
          });
          refetch(); // Refresh the data
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: "Failed to approve mentor application.",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      console.error("Error approving mentor:", error);
      toast({
        title: "Error",
        description: "Failed to approve mentor application.",
        variant: "destructive",
      });
    }
  };

  const filteredApplications = applications
    .filter(app => {
      if (filter === 'pending') return !app.is_approved;
      if (filter === 'approved') return app.is_approved;
      return true;
    })
    .filter(app => 
      searchQuery === "" || 
      app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <PageTemplate
      title="Manage Mentors"
      description="Review and manage mentor applications for the Startup Club."
      icon={UserPlus}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search mentors..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {filter === 'all' ? 'All Applications' : 
                  filter === 'pending' ? 'Pending' : 'Approved'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilter('all')}>
                All Applications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('pending')}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('approved')}>
                Approved
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mentor Applications</CardTitle>
          <CardDescription>
            Review and manage people who have applied to become mentors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || filter !== 'all' 
                ? "No applications match your filters"
                : "No mentor applications available"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Expertise</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.full_name}</TableCell>
                    <TableCell>{app.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {app.expertise.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{app.experience_years} years</TableCell>
                    <TableCell>
                      {app.is_approved ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {!app.is_approved && (
                        <Button
                          onClick={() => handleApprove(app.user_id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {approveMutation.isPending ? 'Approving...' : 'Approve'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageTemplate>
  );
};

export default ManageMentors;
