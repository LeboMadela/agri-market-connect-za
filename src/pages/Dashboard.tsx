import React, { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart as BarChartIcon, Table as TableIcon, LayoutDashboard, ArrowUp, MapPin, CalendarDays, FileText } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { StatsCard } from "@/components/StatsCard";

const fetchLocations = async () => {
  const { data, error } = await supabase
    .from("market_prices")
    .select("location")
    .neq("location", null);
  if (error) throw error;
  // Filter unique locations
  return Array.from(new Set(data.map(row => row.location))).filter(Boolean);
};

const fetchMarketPrices = async (location?: string) => {
  let query = supabase.from("market_prices").select("*").order("date_updated", { ascending: false });
  if (location) {
    query = query.eq("location", location);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

const Dashboard = () => {
  const { user } = useSession();
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);

  // Get user profile (name, location) for welcome header
  const {
    data: profile,
    isLoading: profileLoading,
  } = useProfile();

  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
  });

  const {
    data: prices,
    isLoading: pricesLoading,
  } = useQuery({
    queryKey: ["market_prices", selectedLocation],
    queryFn: () => fetchMarketPrices(selectedLocation),
    enabled: !!user,
  });

  useEffect(() => {
    if (user) refetchPrices();
  }, [selectedLocation, user, refetchPrices]);

  // --- Stats Card Values ---
  // Highest price today
  const today = new Date();
  const todayStr = today.toISOString().slice(0,10); // 'YYYY-MM-DD'
  const pricesToday = (prices || []).filter(r => r.date_updated?.slice(0,10) === todayStr && typeof r.price_per_kg === "number");
  const highestPrice = pricesToday.length
    ? Math.max(...pricesToday.map(r => r.price_per_kg || 0))
    : null;

  // Most common crop (commodity with max number of price records for selected location)
  const commodityCounts: Record<string, number> = {};
  (prices || []).forEach(r => {
    if (r.commodity) commodityCounts[r.commodity] = (commodityCounts[r.commodity] || 0) + 1;
  });
  const mostCommonCrop = Object.entries(commodityCounts).sort((a,b) => b[1]-a[1])[0]?.[0] ?? "-";

  // Latest update date
  const latestUpdate = (prices || [])
    .map(row => row.date_updated)
    .filter(Boolean)
    .sort()
    .reverse()[0];

  // Welcome text helpers
  const fullName = profile ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") : "";
  const userLocation = profile?.location ?? selectedLocation ?? "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex flex-col items-center px-2 py-6">
      <div className="w-full max-w-3xl space-y-6">
        {/* Welcome Header */}
        <div className="text-center flex flex-col items-center gap-2 mb-3">
          <span className="flex items-center gap-3 text-indigo-700 text-2xl font-extrabold tracking-tight">
            <LayoutDashboard size={30} className="stroke-2" />
            Welcome{fullName ? `, ${fullName}` : ""}!
          </span>
          <span className="flex items-center gap-2 justify-center text-base text-gray-600 font-medium">
            <MapPin size={18} className="text-indigo-500" />
            {userLocation ? userLocation : "No location set"}
          </span>
        </div>
        {/* Stats Cards Row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <StatsCard
            title="Highest Price Today"
            value={
              highestPrice != null
                ? `₦${Number(highestPrice).toLocaleString()}`
                : "N/A"
            }
            icon={<ArrowUp size={18} />}
          />
          <StatsCard
            title="Most Common Crop"
            value={mostCommonCrop}
            icon={<FileText size={18} />}
          />
          <StatsCard
            title="Latest Update"
            value={
              latestUpdate
                ? new Date(latestUpdate).toLocaleDateString()
                : "-"
            }
            icon={<CalendarDays size={18} />}
          />
        </div>
        {/* Location Dropdown */}
        <div className="flex justify-center">
          <div className="w-full max-w-xs">
            {locationsLoading ? (
              <div className="flex items-center justify-center h-10">
                <Loader2 className="animate-spin text-indigo-500" />
              </div>
            ) : locations && locations.length > 0 ? (
              <Select value={selectedLocation ?? ""} onValueChange={setSelectedLocation}>
                <SelectTrigger className="bg-white border-2 border-indigo-200 rounded-lg shadow focus:ring-2 focus:ring-indigo-400/20 transition">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {locations.map((l) => (
                    <SelectItem key={l} value={l} className="py-2 px-3 text-base hover:bg-indigo-50 cursor-pointer">
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center justify-center h-10 text-muted-foreground text-sm">
                No locations found
              </div>
            )}
          </div>
        </div>
        {/* Bar Chart */}
        <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-4 sm:p-8 flex flex-col gap-3 border border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <BarChartIcon size={22} className="text-indigo-600" />
            <h3 className="text-lg font-bold text-indigo-800 tracking-tight">Commodity Prices</h3>
          </div>
          {pricesLoading ? (
            <div className="flex items-center justify-center h-36">
              <Loader2 className="animate-spin text-indigo-300" />
            </div>
          ) : prices && prices.length > 0 ? (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prices}>
                  <XAxis dataKey="commodity" stroke="#6366f1" fontSize={13} />
                  <YAxis width={40} tickFormatter={v => (typeof v === "number" ? v.toLocaleString() : v)} stroke="#6366f1" fontSize={13} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="price_per_kg" fill="#6366f1" name="Price per kg" radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center text-gray-400 italic">No price data found for this location.</div>
          )}
        </div>
        {/* Market Prices Table */}
        <div className="bg-white bg-opacity-95 rounded-xl shadow-lg p-4 sm:p-8 border border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <TableIcon size={20} className="text-indigo-600" />
            <h3 className="text-lg font-bold text-indigo-800 tracking-tight">Price Table</h3>
          </div>
          {pricesLoading ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="animate-spin text-indigo-300" />
            </div>
          ) : prices && prices.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commodity</TableHead>
                    <TableHead>Price per kg</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prices.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-semibold">{row.commodity}</TableCell>
                      <TableCell>
                        <span className="bg-indigo-50 text-indigo-800 px-2 py-1 rounded-md font-mono">{row.price_per_kg?.toLocaleString?.() ?? row.price_per_kg}</span>
                      </TableCell>
                      <TableCell>{row.location}</TableCell>
                      <TableCell>
                        <span className="bg-gray-50 rounded-md px-2 py-1 text-xs">
                          {row.date_updated ? new Date(row.date_updated).toLocaleString() : "-"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-gray-400 italic">No market prices found for this location.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
