import React, { useState, useMemo } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useBuyerProfile } from "@/hooks/useBuyerProfile";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { BuyerProfileForm } from "@/components/BuyerProfileForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProduceListings, ProduceFilters } from "@/hooks/useProduceListings";
import { ProduceSidebarFilters } from "@/components/ProduceSidebarFilters";
import { ProduceGallery } from "@/components/ProduceGallery";
import { ProduceStats } from "@/components/ProduceStats";
import { ProduceCropsChart } from "@/components/ProduceCropsChart";
import { Card } from "@/components/ui/card";

const ROLE_OPTIONS: { label: string; value: "buyer" | "farmer" }[] = [
  { label: "Buyer", value: "buyer" },
];

const Dashboard = () => {
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile();
  const { data: buyerProfile, isLoading: buyerLoading } = useBuyerProfile();
  const [open, setOpen] = useState(false);

  const [selectedRole, setSelectedRole] = useState<"buyer" | "farmer">("buyer");
  const [roleUpdating, setRoleUpdating] = useState(false);

  // Filters for produce listings
  const [filters, setFilters] = useState<ProduceFilters>({});
  const { data: produceListings = [], isLoading: produceLoading } = useProduceListings(filters);

  // Calculate stats & chart data
  const stats = useMemo(() => {
    const totalListings = produceListings.length;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newListings = produceListings.filter(p =>
      new Date(p.date_posted) >= weekAgo
    ).length;

    // Top 3 most common crops
    const counts: Record<string, number> = {};
    produceListings.forEach(p => {
      counts[p.commodity] = (counts[p.commodity] ?? 0) + 1;
    });
    const topCrops = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([c]) => c);

    return { totalListings, newListings, topCrops };
  }, [produceListings]);

  const chartData = useMemo(() => {
    // { region: string, count: number }
    const regions: Record<string, number> = {};
    produceListings.forEach(p => {
      const loc = p.location || "Unknown";
      regions[loc] = (regions[loc] ?? 0) + 1;
    });
    return Object.entries(regions).map(([region, count]) => ({ region, count }));
  }, [produceListings]);

  // Debug logs (remove later)
  // console.log("produceListings", produceListings, "filters", filters);

  if (profileLoading || buyerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

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

  // Get current user as potential farmer
  const currentUserId = profile?.id;

  if (profile?.role === "buyer") {
    // Welcome banner — magical, inspiring, marketplace-of-opportunities feel!
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-green-50 via-white to-indigo-50 transition-colors">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 py-6 md:py-8">
          {/* Dev-only Seeder - Remove/comment out before production! */}
          {currentUserId && (
            <div>
              {/* You can remove this line after seeding! */}
              <require('@/components/SeedProduceListings').SeedProduceListings farmer_id={currentUserId} />
            </div>
          )}
          {/* Welcome banner */}
          <div className="rounded-xl bg-gradient-to-br from-green-200 to-indigo-100 shadow-md mb-8 p-6 md:p-8 flex items-center justify-between animate-scale-in">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-green-900 mb-2 animate-fade-in">
                Welcome, {profile.first_name || "AgriConnect Buyer"}!
              </h1>
              <div className="text-base sm:text-lg font-medium text-indigo-700 animate-fade-in">
                {buyerProfile?.location
                  ? `Discover fresh local produce in ${buyerProfile.location}.`
                  : "Discover your region's freshest opportunities."}
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=240&q=80"
              alt="market"
              className="hidden md:block rounded-xl h-20 w-28 object-cover border border-primary shadow"
              style={{ minWidth: "100px" }}
            />
          </div>
          {/* Stats & Chart */}
          <div className="flex flex-col-reverse lg:flex-row gap-4 mb-8">
            <div className="flex-1 space-y-4">
              <ProduceStats stats={stats} />
              <ProduceCropsChart data={chartData} />
            </div>
            <div className="w-full max-w-xs flex-shrink-0 mb-6 lg:mb-0 mx-auto lg:mx-0">
              <ProduceSidebarFilters onChange={f => {
                const normalized = {
                  ...f,
                  minPrice: f.minPrice ? parseFloat(f.minPrice) : undefined,
                  maxPrice: f.maxPrice ? parseFloat(f.maxPrice) : undefined,
                };
                setFilters(normalized);
              }} />
            </div>
          </div>
          {/* Produce gallery */}
          <div className="mb-12">
            <h2 className="font-bold text-2xl text-indigo-900 mb-6 px-1">Available Crops</h2>
            {produceLoading ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground animate-fade-in">
                Fetching the latest listings...
              </div>
            ) : (
              <ProduceGallery produce={produceListings} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Can later add farmer dashboard and default UI here
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
