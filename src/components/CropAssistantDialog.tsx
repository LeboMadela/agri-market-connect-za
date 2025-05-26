
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function CropAssistantDialog() {
  const [open, setOpen] = useState(false);
  // Skeleton: actual AI integration to be added later.
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Sparkles className="text-yellow-400" size={18} /> Crop Assistant (AI)
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Smart Crop Assistant</DialogTitle>
        <div className="py-3 text-stone-700">
          Coming soon: Ask agri-related questions, get crop recommendations, and more—powered by AI!
        </div>
      </DialogContent>
    </Dialog>
  );
}
