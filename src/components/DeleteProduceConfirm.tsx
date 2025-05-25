
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function DeleteProduceConfirm({
  open,
  onOpenChange,
  produceId,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  produceId: string | null;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!produceId) return;
    setLoading(true);
    const { error } = await supabase.from("produce_listings").delete().eq("id", produceId);
    setLoading(false);
    if (error) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted successfully!" });
      onOpenChange(false);
      onDeleted();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Produce Listing?</DialogTitle>
        </DialogHeader>
        <div className="my-4 text-stone-700">Are you sure you want to delete this produce listing? This cannot be undone.</div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
