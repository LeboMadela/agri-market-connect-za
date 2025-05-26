
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ROLE_OPTIONS: { label: string; value: "buyer" | "farmer" }[] = [
  { label: "Buyer", value: "buyer" },
  { label: "Farmer", value: "farmer" },
];

export function RoleSetupDialog({
  profile,
  selectedRole,
  setSelectedRole,
  roleUpdating,
  setRoleUpdating,
  refetchProfile,
}: {
  profile: any;
  selectedRole: "buyer" | "farmer";
  setSelectedRole: (role: "buyer" | "farmer") => void;
  roleUpdating: boolean;
  setRoleUpdating: (updating: boolean) => void;
  refetchProfile: () => Promise<any>;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded shadow p-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">Set Your Role</h2>
        <div className="mb-4 w-full">
          <label className="block mb-2 font-medium">Please select your role to continue:</label>
          <select
            className="border rounded px-3 py-2 w-full"
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value as "buyer" | "farmer")}
            disabled={roleUpdating}
          >
            {ROLE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <Button
          className="w-full"
          disabled={roleUpdating}
          onClick={async () => {
            setRoleUpdating(true);
            const { error } = await supabase
              .from("profiles")
              .update({ role: selectedRole })
              .eq("id", profile.id);
            if (error) {
              toast({ title: "Failed to update role", description: error.message, variant: "destructive" });
            } else {
              toast({ title: "Role updated", description: `You've set your role to ${selectedRole}.` });
              await refetchProfile();
            }
            setRoleUpdating(false);
          }}
        >
          {roleUpdating ? "Saving..." : "Save Role"}
        </Button>
      </div>
    </div>
  );
}
