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

// -- HELPER HOOKS --
function useFarmerProduce(farmer_id: string | undefined) {
  const [rows, setRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const fetchListings = React.useCallback(async () => {
    if (!farmer_id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("produce_listings")
      .select("*")
      .eq("farmer_id", farmer_id)
      .order("date_posted", { ascending: false });
    if (!error && data) {
      setRows(data);
    }
    setLoading(false);
  }, [farmer_id]);
  React.useEffect(() => {
    fetchListings();
  }, [fetchListings]);
  return { rows, loading, refresh: fetchListings };
}

function useMarketPrices() {
  const [marketPrices, setMarketPrices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data, error } = await supabase
        .from("market_prices")
        .select("*")
        .order("date_updated", { ascending: false });
      if (!error && data) setMarketPrices(data);
      setLoading(false);
    }
    fetchData();
  }, []);
  return { marketPrices, loading };
}

function extractUniqueLocations(data: any[]) {
  const all = data.map(row => row.location || "").filter(Boolean);
  return Array.from(new Set(all));
}

// -- FARMER DASHBOARD COMPONENT --
const FarmerDashboard = ({
  profile,
  produceRows,
  produceLoading,
  refreshProduce,
  marketPrices,
  marketLoading,
}: {
  profile: any;
  produceRows: any[];
  produceLoading: boolean;
  refreshProduce: () => void;
  marketPrices: any[];
  marketLoading: boolean;
}) => {
  // Price tracker -- location filter
  const uniqueLocations = useMemo(() => extractUniqueLocations(marketPrices), [marketPrices]);
  const [selectedLocation, setSelectedLocation] = useState(uniqueLocations[0] || "");

  // Filtered prices for selected location (or all)
  const filteredPrices = useMemo(() => {
    if (!selectedLocation) return marketPrices;
    return marketPrices.filter((row) => row.location === selectedLocation);
  }, [marketPrices, selectedLocation]);

  // Bar chart data: one bar per commodity in this region
  const barChartData = useMemo(() => {
    // Take latest price for each commodity in the region
    const latestPerCommodity: { [c: string]: any } = {};
    filteredPrices.forEach(row => {
      if (
        !latestPerCommodity[row.commodity] ||
        new Date(row.date_updated) > new Date(latestPerCommodity[row.commodity].date_updated)
      ) {
        latestPerCommodity[row.commodity] = row;
      }
    });
    return Object.values(latestPerCommodity).map(row => ({
      commodity: row.commodity,
      price: row.price_per_kg,
    }));
  }, [filteredPrices]);

  // Edit/Delete dialog state management
  const [editOpen, setEditOpen] = React.useState(false);
  const [editProduce, setEditProduce] = React.useState<any | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  // -- Add New Produce --
  const [form, setForm] = useState({
    commodity: "",
    quantity_kg: "",
    price_per_kg: "",
    location: "",
  });
  const [adding, setAdding] = useState(false);

  const handleAddProduce = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.commodity || !form.quantity_kg || !form.price_per_kg || !form.location) {
      toast({ title: "Please fill all fields.", variant: "destructive" });
      return;
    }
    if (isNaN(Number(form.quantity_kg)) || isNaN(Number(form.price_per_kg))) {
      toast({ title: "Quantity and price must be numbers.", variant: "destructive" });
      return;
    }
    setAdding(true);
    const { error } = await supabase.from("produce_listings").insert({
      commodity: form.commodity,
      quantity_kg: Number(form.quantity_kg),
      price_per_kg: Number(form.price_per_kg),
      location: form.location,
      farmer_id: profile.id,
      farmer_contact: profile.first_name || "",
    });
    setAdding(false);
    if (error) {
      toast({ title: "Failed to add produce listing.", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Produce listing created!" });
      setForm({ commodity: "", quantity_kg: "", price_per_kg: "", location: "" });
      refreshProduce();
    }
  };

  // -- Responsive styling helpers --
  // earth/pastel colors used: green-100, green-200, amber-100, amber-50, stone-50, orange-50

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-amber-50 via-green-100 to-stone-50 pb-16">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-6 md:py-8">
        {/* Notification bell in Farmer dashboard header */}
        <div className="flex justify-end mb-4">
          <NotificationsDropdown />
        </div>
        {/* Greeting */}
        <div className="rounded-xl bg-gradient-to-br from-green-200 to-amber-100 shadow-md mb-8 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-green-900 mb-2">
              Welcome, {profile.first_name || "Farmer"}!
            </h1>
            <div className="text-base sm:text-lg text-stone-700">
              <span>
                {profile.location
                  ? `from ${profile.location}`
                  : "to your AgriConnect Dashboard"}
              </span>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=facearea&w=240&q=80"
            alt="Farm"
            className="rounded-xl h-20 w-28 object-cover border border-green-400 shadow mt-6 sm:mt-0"
            style={{ minWidth: "100px" }}
          />
        </div>

        {/* Price Tracker */}
        <Card className="mb-8 bg-amber-50/80 shadow hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-green-900">
              <BarChart2 className="text-stone-600" /> Market Price Tracker
            </CardTitle>
          </CardHeader>
          <CardContent>
            {marketLoading ? (
              <div className="flex h-24 items-center justify-center text-muted-foreground animate-pulse">
                Fetching latest prices…
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:items-center gap-5 mb-5">
                  <div className="flex-1">
                    <Select
                      value={selectedLocation || ""}
                      onValueChange={val => setSelectedLocation(val)}
                    >
                      <SelectTrigger className="w-full md:w-72 bg-white border-stone-200 shadow text-stone-800">
                        <SelectValue placeholder="Filter by location…" />
                      </SelectTrigger>
                      <SelectContent className="z-20 bg-white">
                        <SelectItem key="all" value="">
                          All regions
                        </SelectItem>
                        {uniqueLocations.map((loc) => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Table */}
                <div className="overflow-x-auto">
                  <Table className="bg-white rounded-lg shadow min-w-full border">
                    <TableHeader>
                      <TableRow className="bg-green-100/80 text-stone-600">
                        <TableHead>Commodity</TableHead>
                        <TableHead>Price per kg</TableHead>
                        <TableHead>Date Updated</TableHead>
                        <TableHead>Region</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrices.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-stone-400 italic">No prices available.</TableCell>
                        </TableRow>
                      )}
                      {filteredPrices.map((row, i) => (
                        <TableRow
                          key={i}
                          className="hover:bg-amber-100/80 transition-colors duration-150"
                        >
                          <TableCell className="font-medium">{row.commodity}</TableCell>
                          <TableCell>R{row.price_per_kg ?? "-"} / kg</TableCell>
                          <TableCell>
                            {row.date_updated
                              ? new Date(row.date_updated).toLocaleDateString()
                              : "-"}
                          </TableCell>
                          <TableCell>{row.location}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Chart: price per commodity */}
                <div className="mt-6 bg-white rounded-lg p-3 shadow">
                  <h3 className="font-semibold mb-2 text-green-800 text-base">Market Prices Chart {selectedLocation ? `(${selectedLocation})` : "(All regions)"}</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="commodity" stroke="#7c6f50" />
                      <YAxis stroke="#7c6f50" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="price" fill="#bbd7a3" className="transition-all duration-200" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* My Produce Listings */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-7">
          {/* Add New Produce FORM */}
          <Card className="md:col-span-2 bg-white/90 shadow hover:shadow-xl p-0 md:h-fit transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-green-900 text-base sm:text-lg">
                Add New Produce
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleAddProduce} autoComplete="off">
                <div>
                  <label className="block font-medium mb-1 text-sm text-stone-700">
                    Commodity
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Maize"
                    value={form.commodity}
                    onChange={e =>
                      setForm(form => ({ ...form, commodity: e.target.value }))
                    }
                    className="bg-neutral-50 border-stone-200"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-sm text-stone-700">
                    Quantity (kg)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={form.quantity_kg}
                    onChange={e =>
                      setForm(form => ({ ...form, quantity_kg: e.target.value }))
                    }
                    className="bg-neutral-50 border-stone-200"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-sm text-stone-700">
                    Ask price per kg (R)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={form.price_per_kg}
                    onChange={e =>
                      setForm(form => ({ ...form, price_per_kg: e.target.value }))
                    }
                    className="bg-neutral-50 border-stone-200"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-sm text-stone-700">
                    Location
                  </label>
                  <Input
                    type="text"
                    value={form.location}
                    onChange={e =>
                      setForm(form => ({ ...form, location: e.target.value }))
                    }
                    className="bg-neutral-50 border-stone-200"
                    autoComplete="off"
                  />
                </div>
                <Button
                  className={clsx("w-full rounded hover:scale-105 transition-transform duration-150")}
                  type="submit"
                  disabled={adding}
                >
                  {adding ? "Adding..." : "Add Produce"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Produce Listings TABLE */}
          <Card className="md:col-span-3 bg-white/90 shadow hover:shadow-xl transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-green-900 text-base sm:text-lg">
                My Produce Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {produceLoading ? (
                <div className="flex h-20 items-center justify-center text-muted-foreground animate-pulse">
                  Fetching your produce...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="bg-white rounded-lg min-w-full border">
                    <TableHeader>
                      <TableRow className="bg-green-100/60 text-stone-700">
                        <TableHead>Commodity</TableHead>
                        <TableHead>Quantity (kg)</TableHead>
                        <TableHead>Price/kg</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Date Posted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {produceRows.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-stone-400 italic">No produce posted yet.</TableCell>
                        </TableRow>
                      )}
                      {produceRows.map((row) => (
                        <TableRow
                          key={row.id}
                          className="hover:bg-amber-100/70 cursor-pointer transition-colors duration-150"
                        >
                          <TableCell className="font-medium">{row.commodity}</TableCell>
                          <TableCell>{row.quantity_kg}</TableCell>
                          <TableCell>R{row.price_per_kg}</TableCell>
                          <TableCell>{row.location}</TableCell>
                          <TableCell>
                            {row.date_posted
                              ? new Date(row.date_posted).toLocaleDateString()
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setEditProduce(row); setEditOpen(true); }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="ml-2"
                              onClick={() => { setDeleteId(row.id); setDeleteOpen(true); }}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {/* Edit/Delete dialogs */}
                  <EditProduceDialog 
                    open={editOpen} 
                    onOpenChange={setEditOpen} 
                    produce={editProduce}
                    onUpdated={refreshProduce}
                  />
                  <DeleteProduceConfirm 
                    open={deleteOpen}
                    onOpenChange={setDeleteOpen}
                    produceId={deleteId}
                    onDeleted={refreshProduce}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alerts/Notifications Placeholder */}
        <Card className="mt-10 bg-white/80 shadow border border-dashed border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <span className="font-semibold">📢 Alerts & Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div>
                <span className="italic text-stone-500">Coming soon: Subscribe to price alerts (eg. “Notify me when Maize price goes above R10/kg”).</span>
              </div>
              <Button disabled variant="outline" className="ml-auto cursor-not-allowed">
                Enable Alerts (soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ROLE_OPTIONS: { label: string; value: "buyer" | "farmer" }[] = [
  { label: "Buyer", value: "buyer" },
  { label: "Farmer", value: "farmer" },
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

  // Loading state
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

  // FARMER DASHBOARD
  if (profile?.role === "farmer") {
    // Farmer's own produce listings and market prices
    const { rows: produceRows, loading: produceLoading, refresh: refreshProduce } = useFarmerProduce(profile.id);
    const { marketPrices, loading: marketLoading } = useMarketPrices();

    return (
      <FarmerDashboard
        profile={profile}
        produceRows={produceRows}
        produceLoading={produceLoading}
        refreshProduce={refreshProduce}
        marketPrices={marketPrices}
        marketLoading={marketLoading}
      />
    );
  }

  // BUYER DASHBOARD
  if (profile?.role === "buyer") {
    // Welcome banner — magical, inspiring, marketplace-of-opportunities feel!
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-green-50 via-white to-indigo-50 transition-colors">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 py-6 md:py-8">
          {/* Dev-only Seeder - Remove/comment out before production! */}
          {profile?.id && (
            <div>
              {/* You can remove this line after seeding! */}
              <SeedProduceListings farmer_id={profile.id} />
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

  // Default UI
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
