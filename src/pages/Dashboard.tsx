
import React, { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart as BarChartIcon, Table as TableIcon, LayoutDashboard } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2 } from "lucide-react";

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

  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
  });

  const {
    data: prices,
    isLoading: pricesLoading,
    refetch: refetchPrices,
  } = useQuery({
    queryKey: ["market_prices", selectedLocation],
    queryFn: () => fetchMarketPrices(selectedLocation),
    enabled: !!user,
  });

  useEffect(() => {
    if (user) refetchPrices();
  }, [selectedLocation, user, refetchPrices]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex flex-col items-center px-2 py-8">
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex flex-col items-center gap-2">
          <span className="inline-flex items-center gap-2 text-indigo-700 text-3xl font-extrabold tracking-tight">
            <LayoutDashboard size={30} className="stroke-2" />
            Market Prices Dashboard
          </span>
          <div className="text-base text-gray-500">View latest commodity prices by location</div>
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
                  <YAxis width={45} tickFormatter={v => (typeof v === "number" ? v.toLocaleString() : v)} stroke="#6366f1" fontSize={13} />
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
