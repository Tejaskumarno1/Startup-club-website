
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sponsor } from '@/lib/types';

export const useSponsors = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSponsors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch sponsors with their order
      const { data: sponsorData, error: sponsorError } = await supabase
        .from('sponsors')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (sponsorError) throw sponsorError;
      setSponsors(sponsorData || []);
    } catch (err) {
      console.error("Error fetching sponsors:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchSponsors();
  }, [fetchSponsors]);

  useEffect(() => {
    fetchSponsors();
  }, [fetchSponsors]);

  return { sponsors, loading, error, refetch };
};
