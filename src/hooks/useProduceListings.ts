
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProduceFilters = {
  commodity?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  recentOnly?: boolean; // Only show past 7 days
};

export function useProduceListings(filters: ProduceFilters = {}) {
  return useQuery({
    queryKey: ["produce_listings", filters],
    queryFn: async () => {
      let query = supabase
        .from("produce_listings")
        .select("*")
        .order("date_posted", { ascending: false })
        .limit(48); // only show the freshest ones!

      if (filters.commodity) {
        query = query.eq("commodity", filters.commodity);
      }
      if (filters.location) {
        query = query.eq("location", filters.location);
      }
      if (typeof filters.minPrice === "number") {
        query = query.gte("price_per_kg", filters.minPrice);
      }
      if (typeof filters.maxPrice === "number") {
        query = query.lte("price_per_kg", filters.maxPrice);
      }
      if (filters.recentOnly) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        query = query.gte("date_posted", sevenDaysAgo.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}
