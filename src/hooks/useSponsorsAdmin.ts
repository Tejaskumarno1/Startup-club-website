
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sponsor } from '@/lib/types';

export const useSponsorsAdmin = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: sponsorData, error: sponsorError } = await supabase
        .from('sponsors')
        .select('*')
        .order('display_order');

      if (sponsorError) throw sponsorError;
      setSponsors(sponsorData || []);
    } catch (err) {
      console.error("Error fetching sponsors:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const createSponsor = async (sponsorData: Omit<Sponsor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsSubmitting(true);
      
      // Add timestamp for debugging
      console.log("Creating sponsor:", new Date().toISOString(), sponsorData);
      
      const { data, error: insertError } = await supabase
        .from('sponsors')
        .insert([sponsorData])
        .select();
      
      if (insertError) throw insertError;
      
      console.log("Sponsor created successfully:", data);
      
      toast({
        title: "Sponsor added",
        description: "The sponsor has been successfully added."
      });
      
      await fetchSponsors();
      return true;
    } catch (err) {
      console.error("Error creating sponsor:", err);
      toast({
        title: "Error adding sponsor",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSponsor = async (id: string, sponsorData: Partial<Sponsor>) => {
    try {
      setIsSubmitting(true);
      
      const { error: updateError } = await supabase
        .from('sponsors')
        .update({
          ...sponsorData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Sponsor updated",
        description: "The sponsor has been successfully updated."
      });
      
      await fetchSponsors();
      return true;
    } catch (err) {
      console.error("Error updating sponsor:", err);
      toast({
        title: "Error updating sponsor",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteSponsor = async (id: string) => {
    try {
      setIsSubmitting(true);
      
      const { error: deleteError } = await supabase
        .from('sponsors')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      toast({
        title: "Sponsor deleted",
        description: "The sponsor has been successfully deleted."
      });
      
      await fetchSponsors();
      return true;
    } catch (err) {
      console.error("Error deleting sponsor:", err);
      toast({
        title: "Error deleting sponsor",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSponsorActive = async (id: string, isActive: boolean) => {
    return updateSponsor(id, { is_active: isActive });
  };

  const updateSponsorsOrder = async (updatedSponsors: Sponsor[]) => {
    try {
      setIsSubmitting(true);
      
      for (const update of updatedSponsors) {
        const { error } = await supabase
          .from('sponsors')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
          
        if (error) throw error;
      }
      
      toast({
        title: "Order updated",
        description: "The sponsors order has been successfully updated."
      });
      
      await fetchSponsors();
      return true;
    } catch (err) {
      console.error("Error updating order:", err);
      toast({
        title: "Error updating order",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    sponsors,
    loading,
    error,
    isSubmitting,
    createSponsor,
    updateSponsor,
    deleteSponsor,
    toggleSponsorActive,
    updateSponsorsOrder,
    refetch: fetchSponsors
  };
};
