import React, { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useBuyerProfile } from "@/hooks/useBuyerProfile";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { BuyerProfileForm } from "@/components/BuyerProfileForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Add a static role list in case of future roles
const ROLE_OPTIONS: { label: string; value: "buyer" | "farmer" }[] = [
  { label: "Buyer", value: "buyer" },
  // Extend with roles in the future:
  // { label: "Farmer", value: "farmer" }
];

const Dashboard = () => {
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile();
  const { data: buyerProfile, isLoading: buyerLoading } = useBuyerProfile();
  const [open, setOpen] = useState(false);
  // Explicitly type as the allowed enum (matches Supabase type)
  const [selectedRole, setSelectedRole] = useState<"buyer" | "farmer">("buyer");
  const [roleUpdating, setRoleUpdating] = useState(false);

  // Debug logs to help diagnose dashboard rendering issues
  console.log("Dashboard - profile:", profile);
  console.log("Dashboard - profileLoading:", profileLoading);
  console.log("Dashboard - buyerProfile:", buyerProfile);
  console.log("Dashboard - buyerLoading:", buyerLoading);

  // If loading
  if (profileLoading || buyerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  // If profile exists but has no role, prompt selection
  if (profile && !profile.role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md bg-white rounded shadow p-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4">Set Your Role</h2>
          <div className="mb-4 w-full">
            <label className="block mb-2 font-medium">Please select your role to continue:</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={selectedRole}
              // onChange now infers correct type
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
              // Update the profile table via Supabase
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

  // Only handle buyer dashboard for now
  if (profile?.role === "buyer") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-xl bg-white rounded shadow p-8">
          <h2 className="text-2xl font-bold mb-4">Buyer Dashboard</h2>
          {buyerProfile ? (
            <>
              <div className="mb-4">
                <div><span className="font-semibold">Organization:</span> {buyerProfile.organization || "—"}</div>
                <div><span className="font-semibold">Contact Email:</span> {buyerProfile.contact_email || "—"}</div>
                <div><span className="font-semibold">Phone:</span> {buyerProfile.phone || "—"}</div>
                <div><span className="font-semibold">Location:</span> {buyerProfile.location || "—"}</div>
              </div>
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="mb-4">Edit Profile</Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetTitle>Edit Buyer Profile</SheetTitle>
                  <BuyerProfileForm
                    initial={buyerProfile}
                    onSuccess={() => setOpen(false)}
                  />
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <div>
              <p className="mb-4">You haven't completed your buyer profile yet.</p>
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="default">Complete Profile</Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetTitle>Complete Buyer Profile</SheetTitle>
                  <BuyerProfileForm onSuccess={() => setOpen(false)} />
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    );
  }

  // You can later add farmer dashboard and default UI here
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-xl bg-white rounded shadow p-8">
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        <div>Your dashboard will show here.</div>
      </div>
    </div>
  );
};

export default Dashboard;
