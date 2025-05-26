
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "./useSession";

/**
 * Call this hook in each ProduceCard to log a view (for recommendations).
 */
export function useCropViewLogger(produceId: string) {
  const { user } = useSession();

  useEffect(() => {
    if (!user?.id || !produceId) return;
    // Log the view
    supabase.from("crop_view_history").insert({
      user_id: user.id,
      produce_id: produceId,
    });
  }, [user?.id, produceId]);
}
