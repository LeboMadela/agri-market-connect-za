
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function LogoutButton({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out",
        description: "See you again soon!",
      });
      navigate("/auth", { replace: true });
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={className}
      aria-label="Logout"
      onClick={handleLogout}
      disabled={loading}
    >
      <LogOut className="w-5 h-5" />
    </Button>
  );
}
