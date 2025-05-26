import React, { useState, useMemo, useCallback } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useBuyerProfile } from "@/hooks/useBuyerProfile";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProduceListings, ProduceFilters } from "@/hooks/useProduceListings";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { SeedProduceListings } from "@/components/SeedProduceListings";
import { BarChart2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import clsx from "clsx";
import { ProduceStats } from "@/components/ProduceStats";
import { ProduceCropsChart } from "@/components/ProduceCropsChart";
import { ProduceSidebarFilters } from "@/components/ProduceSidebarFilters";
import { ProduceGallery } from "@/components/ProduceGallery";
import { EditProduceDialog } from "@/components/EditProduceDialog";
import { DeleteProduceConfirm } from "@/components/DeleteProduceConfirm";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { LogoutButton } from "@/components/LogoutButton";
import { CropAssistantDialog } from "@/components/CropAssistantDialog";
import { useRealtimeProduce } from "@/hooks/useRealtimeProduce";
import { FarmerDashboard } from "@/components/FarmerDashboard";
import { BuyerDashboard } from "@/components/BuyerDashboard";
import { RoleSetupDialog } from "@/components/RoleSetupDialog";

const Dashboard = () => {
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile();
  const { data: buyerProfile, isLoading: buyerLoading } = useBuyerProfile();
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"buyer" | "farmer">("buyer");
  const [roleUpdating, setRoleUpdating] = useState(false);
  const [filters, setFilters] = useState<ProduceFilters>({});
  const { data: produceListings = [], isLoading: produceLoading } = useProduceListings(filters);

  // Calculate stats & chart data for buyer
  const stats = React.useMemo(() => {
    const totalListings = produceListings.length;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newListings = produceListings.filter(p =>
      new Date(p.date_posted) >= weekAgo
    ).length;
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

  const chartData = React.useMemo(() => {
    const regions: Record<string, number> = {};
    produceListings.forEach(p => {
      const loc = p.location || "Unknown";
      regions[loc] = (regions[loc] ?? 0) + 1;
    });
    return Object.entries(regions).map(([region, count]) => ({ region, count }));
  }, [produceListings]);

  if (profileLoading || buyerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (profile && !profile.role) {
    return (
      <RoleSetupDialog
        profile={profile}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        roleUpdating={roleUpdating}
        setRoleUpdating={setRoleUpdating}
        refetchProfile={refetchProfile}
      />
    );
  }

  if (profile?.role === "farmer") {
    return (
      <FarmerDashboard profile={profile} />
    );
  }

  if (profile?.role === "buyer") {
    return (
      <BuyerDashboard
        profile={profile}
        buyerProfile={buyerProfile}
        stats={stats}
        chartData={chartData}
        produceListings={produceListings}
        produceLoading={produceLoading}
        setFilters={setFilters}
      />
    );
  }

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
