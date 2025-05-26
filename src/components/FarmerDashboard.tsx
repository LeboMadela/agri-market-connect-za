
import React, { useMemo, useState, useCallback } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { BarChart2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import clsx from "clsx";
import { EditProduceDialog } from "@/components/EditProduceDialog";
import { DeleteProduceConfirm } from "@/components/DeleteProduceConfirm";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { LogoutButton } from "@/components/LogoutButton";
import { useRealtimeProduce } from "@/hooks/useRealtimeProduce";

// Helper for unique locations
function extractUniqueLocations(data: any[]) {
  const all = data.map(row => row.location || "").filter(Boolean);
  return Array.from(new Set(all));
}

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
    if (!error && data) setRows(data);
    setLoading(false);
  }, [farmer_id]);
  React.useEffect(() => { fetchListings(); }, [fetchListings]);
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

export function FarmerDashboard({ profile }: { profile: any }) {
  const { rows: produceRows, loading: produceLoading, refresh: refreshProduce } = useFarmerProduce(profile?.id);
  const { marketPrices, loading: marketLoading } = useMarketPrices();
  useRealtimeProduce();

  // Market location filter
  const uniqueLocations = useMemo(() => extractUniqueLocations(marketPrices), [marketPrices]);
  const [selectedLocation, setSelectedLocation] = useState("__all__");
  const filteredPrices = useMemo(() => {
    if (selectedLocation === "__all__") return marketPrices;
    return marketPrices.filter((row) => row.location === selectedLocation);
  }, [marketPrices, selectedLocation]);

  const barChartData = useMemo(() => {
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

  // Produce add/edit/delete state
  const [editOpen, setEditOpen] = React.useState(false);
  const [editProduce, setEditProduce] = React.useState<any | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const [form, setForm] = useState({ commodity: "", quantity_kg: "", price_per_kg: "", location: "" });
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-amber-50 via-green-100 to-stone-50 pb-16">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-6 md:py-8">
        {/* Notification bell and Logout in header */}
        <div className="flex justify-end items-center gap-2 mb-4">
          <NotificationsDropdown />
          <LogoutButton />
        </div>
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
                      value={selectedLocation}
                      onValueChange={val => setSelectedLocation(val)}
                    >
                      <SelectTrigger className="w-full md:w-72 bg-white border-stone-200 shadow text-stone-800">
                        <SelectValue placeholder="Filter by location…" />
                      </SelectTrigger>
                      <SelectContent className="z-20 bg-white">
                        <SelectItem key="all" value="__all__">
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
}

