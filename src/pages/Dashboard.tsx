import React, { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useBuyerProfile } from "@/hooks/useBuyerProfile";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { BuyerProfileForm } from "@/components/BuyerProfileForm";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: buyerProfile, isLoading: buyerLoading } = useBuyerProfile();
  const [open, setOpen] = useState(false);

  if (profileLoading || buyerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold">Loading...</div>
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
