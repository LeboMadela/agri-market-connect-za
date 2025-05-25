
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "./useSession";

export function useBuyerProfile() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const buyerProfileQuery = useQuery({
    queryKey: ["buyer_profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("buyer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const upsertBuyerProfile = useMutation({
    mutationFn: async (profile: {
      organization?: string | null;
      contact_email?: string | null;
      phone?: string | null;
      location?: string | null;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("buyer_profiles")
        .upsert([{ ...profile, user_id: user.id }], { onConflict: "user_id" })
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer_profile"] });
    },
  });

  return { ...buyerProfileQuery, upsertBuyerProfile };
}
