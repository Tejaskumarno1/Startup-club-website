
import React, { useState } from 'react';
import { useSponsorsAdmin } from '@/hooks/useSponsorsAdmin';
import { SponsorForm } from './SponsorForm';
import { Sponsor } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SlidesEmptyState } from '@/components/slides/SlidesEmptyState';
import { SlidesErrorState } from '@/components/slides/SlidesErrorState';
import { SlidesLoadingState } from '@/components/slides/SlidesLoadingState';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

export function SponsorManagement() {
  const { 
    sponsors, 
    createSponsor, 
    updateSponsor, 
    deleteSponsor, 
    toggleSponsorActive,
    isSubmitting, 
    refetch 
  } = useSponsorsAdmin();
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentSponsor, setCurrentSponsor] = useState<Sponsor | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  const filteredSponsors = sponsors.filter(sponsor => {
    if (activeTab === 'all') return true;
    return sponsor.is_active === (activeTab === 'active');
  });
  
  const handleAddSponsor = async (data: any) => {
    try {
      await createSponsor({
        ...data,
        display_order: sponsors.length > 0 ? Math.max(...sponsors.map(s => s.display_order || 0)) + 1 : 0
      });
      setAddDialogOpen(false);
      toast({
        title: "Sponsor added",
        description: `${data.company_name} has been added as a sponsor`
      });
    } catch (err) {
      console.error("Error adding sponsor:", err);
      toast({
        title: "Error adding sponsor",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  const handleEditSponsor = async (data: any) => {
    if (currentSponsor) {
      try {
        await updateSponsor(currentSponsor.id, data);
        setCurrentSponsor(null);
        setEditDialogOpen(false);
        toast({
          title: "Sponsor updated",
          description: `${data.company_name} has been updated`
        });
      } catch (err) {
        toast({
          title: "Error updating sponsor",
          description: err instanceof Error ? err.message : "An unknown error occurred",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleDeleteSponsor = async (id: string, name: string) => {
    try {
      await deleteSponsor(id);
      toast({
        title: "Sponsor deleted",
        description: `${name} has been removed from sponsors`
      });
    } catch (err) {
      toast({
        title: "Error deleting sponsor",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  const handleToggleActive = async (id: string, isActive: boolean, name: string) => {
    try {
      await toggleSponsorActive(id, isActive);
      toast({
        title: isActive ? "Sponsor activated" : "Sponsor deactivated",
        description: `${name} is now ${isActive ? 'visible' : 'hidden'} on the website`
      });
    } catch (err) {
      toast({
        title: "Error updating sponsor status",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  if (isSubmitting) {
    return <SlidesLoadingState />;
  }
  
  if (!sponsors || sponsors.length === 0) {
    return <SlidesEmptyState 
      onAddSlide={() => setAddDialogOpen(true)} 
      buttonText="Add Sponsor" 
    />;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Manage Sponsors</h2>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Sponsor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Sponsor</DialogTitle>
              <DialogDescription>
                Add a new sponsor to showcase on your website.
              </DialogDescription>
            </DialogHeader>
            <SponsorForm 
              onSubmit={handleAddSponsor}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSponsors.map((sponsor) => (
              <Card key={sponsor.id} className="overflow-hidden border">
                <CardContent className="p-0">
                  <div className="bg-muted/20 p-4 h-40 flex items-center justify-center">
                    {sponsor.logo_url ? (
                      <img
                        src={sponsor.logo_url}
                        alt={sponsor.company_name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-muted-foreground text-sm">No Logo</div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">{sponsor.company_name}</h3>
                      {sponsor.is_active ? (
                        <Badge variant="outline" className="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mt-1 mb-3 truncate">
                      {sponsor.website_url || 'No website provided'}
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={sponsor.is_active || false}
                          onCheckedChange={(checked) => handleToggleActive(sponsor.id, checked, sponsor.company_name)}
                          aria-label="Toggle active state"
                        />
                        <span className="text-xs text-muted-foreground">
                          {sponsor.is_active ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentSponsor(sponsor);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Sponsor</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {sponsor.company_name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDeleteSponsor(sponsor.id, sponsor.company_name)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredSponsors.length === 0 && (
              <div className="col-span-full">
                <p className="text-muted-foreground italic text-center py-8">No sponsors found</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Sponsor</DialogTitle>
            <DialogDescription>
              Update the sponsor details.
            </DialogDescription>
          </DialogHeader>
          {currentSponsor && (
            <SponsorForm 
              sponsor={currentSponsor}
              onSubmit={handleEditSponsor}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
