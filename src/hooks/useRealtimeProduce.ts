
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook to enable real-time updates for produce listings.
 * Automatically invalidates React Query cache when updates occur.
 */
export function useRealtimeProduce() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('public:produce_listings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produce_listings' }, (payload) => {
        // Invalidate listings cache to trigger refresh.
        queryClient.invalidateQueries({ queryKey: ["produce_listings"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
