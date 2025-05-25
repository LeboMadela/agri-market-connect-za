
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function ChatDialog({
  open,
  onOpenChange,
  produceId,
  farmerId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  produceId: string;
  farmerId: string;
}) {
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const queryClient = useQueryClient();

  // Fetch chat messages for this produce with this farmer/buyer
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["chat", produceId, farmerId],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return [];
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq("produce_id", produceId)
        .order("created_at", { ascending: true });
      if (error) return [];
      return data!;
    },
    enabled: open,
  });

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      toast({ title: "Not logged in!", description: "Sign in to chat.", variant: "destructive" });
      return;
    }
    if (!msg.trim()) return;
    setSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      produce_id: produceId,
      sender_id: userId,
      receiver_id: farmerId,
      message: msg.trim(),
    });
    setSending(false);
    if (error) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
    } else {
      setMsg("");
      queryClient.invalidateQueries({ queryKey: ["chat", produceId, farmerId] });
      toast({ title: "Message sent!" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Inquiry to Farmer</DialogTitle>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto mb-4 bg-green-50 rounded p-2">
          {isLoading ? (
            <div className="text-gray-500">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-gray-400 italic">No conversation yet. Start the chat!</div>
          ) : (
            <ul className="space-y-2">
              {messages.map((m: any) => (
                <li key={m.id} className={`text-sm ${m.sender_id === farmerId ? "text-green-900 font-bold" : "text-indigo-700"}`}>
                  <span>
                    {m.sender_id === farmerId ? "Farmer: " : "You: "}
                  </span>
                  <span>{m.message}</span>
                  <span className="ml-2 text-xs text-gray-400">{m.created_at && new Date(m.created_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <form className="flex gap-2" onSubmit={sendMessage}>
          <Textarea
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder="Type your inquiry here..."
            className="flex-1"
            rows={2}
            required
          />
          <Button type="submit" disabled={sending || !msg.trim()}>
            {sending ? "Sending..." : "Send"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
