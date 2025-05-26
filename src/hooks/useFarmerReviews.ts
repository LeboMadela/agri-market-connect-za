
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fetch all reviews for a given farmer.
export function useFarmerReviews(farmerId: string | undefined) {
  return useQuery({
    queryKey: ["farmer_reviews", farmerId],
    queryFn: async () => {
      if (!farmerId) return [];
      const { data, error } = await supabase
        .from("farmer_reviews")
        .select("*, buyer:buyer_id(first_name, profile_image_url)")
        .eq("farmer_id", farmerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!farmerId,
  });
}

// Submit a review as a buyer.
export function useSubmitFarmerReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      farmer_id,
      rating,
      review_text,
    }: {
      farmer_id: string;
      rating: number;
      review_text?: string;
    }) => {
      const { error } = await supabase.from("farmer_reviews").insert({
        farmer_id,
        rating,
        review_text,
      });
      if (error) throw error;
      return true;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["farmer_reviews", variables.farmer_id] });
    }
  });
}
