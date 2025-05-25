
import React from "react";
import { Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function NotificationsDropdown() {
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(15);
      return data ?? [];
    },
  });

  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <button className="p-2 rounded-full hover:bg-green-100 transition" onClick={() => setOpen(o => !o)}>
        <Bell className="w-6 h-6 text-green-700" />
        {notifications.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3" />}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 z-50 w-80 max-w-[90vw]">
          <Card className="p-3 border border-green-100 bg-white shadow-xl animate-fade-in">
            <h4 className="font-bold text-green-900 mb-2">Notifications</h4>
            {isLoading ? (
              <div className="text-muted-foreground p-4">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="text-gray-500 italic p-4">No notifications.</div>
            ) : (
              <ul className="space-y-2">
                {notifications.map((n: any) => (
                  <li key={n.id} className="border-b last:border-b-0 pb-2">
                    <div className="font-medium">{n.title}</div>
                    <div className="text-sm text-stone-700">{n.body}</div>
                    <div className="text-xs text-stone-400">
                      {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
