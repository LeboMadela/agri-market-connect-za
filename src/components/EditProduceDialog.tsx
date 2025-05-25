
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type Produce = {
  id: string;
  commodity: string;
  quantity_kg: number;
  price_per_kg: number;
  location: string;
};

export function EditProduceDialog({
  open,
  onOpenChange,
  produce,
  onUpdated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  produce: Produce | null;
  onUpdated: () => void;
}) {
  const [form, setForm] = useState<Produce | null>(produce);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setForm(produce);
  }, [produce, open]);

  if (!form) return null;

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("produce_listings")
      .update({
        commodity: form.commodity,
        quantity_kg: Number(form.quantity_kg),
        price_per_kg: Number(form.price_per_kg),
        location: form.location,
      })
      .eq("id", form.id);
    setLoading(false);
    if (error) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Produce updated!" });
      onOpenChange(false);
      onUpdated();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Produce Listing</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleUpdate}>
          <Input
            value={form.commodity}
            onChange={e => setForm(f => f && { ...f, commodity: e.target.value })}
            placeholder="Commodity"
            required
          />
          <Input
            value={form.quantity_kg}
            onChange={e => setForm(f => f && { ...f, quantity_kg: Number(e.target.value) })}
            type="number"
            placeholder="Quantity (kg)"
            min={1}
            required
          />
          <Input
            value={form.price_per_kg}
            onChange={e => setForm(f => f && { ...f, price_per_kg: Number(e.target.value) })}
            type="number"
            placeholder="Price per kg"
            min={0}
            required
          />
          <Input
            value={form.location}
            onChange={e => setForm(f => f && { ...f, location: e.target.value })}
            placeholder="Location"
            required
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
