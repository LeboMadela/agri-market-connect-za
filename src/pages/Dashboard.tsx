import React, { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

  // When selectedLocation changes, refetch prices
  useEffect(() => {
    if (user) refetchPrices();
  }, [selectedLocation, user, refetchPrices]);

  // Responsive container for mobile
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-2 py-4">
      <div className="w-full max-w-2xl space-y-4">
        <h2 className="text-2xl font-bold text-center mt-2">Market Prices Dashboard</h2>
        {/* Location Dropdown */}
        <div className="flex justify-center">
          <div className="w-full max-w-xs">
            {locationsLoading ? (
              <div className="flex items-center justify-center h-10">
                <Loader2 className="animate-spin" />
              </div>
            ) : locations && locations.length > 0 ? (
              <Select value={selectedLocation ?? ""} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(l => (
                    <SelectItem key={l} value={l}>
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
        <div className="bg-white rounded shadow p-3 sm:p-6">
          <h3 className="text-lg font-semibold mb-3">Commodity Prices</h3>
          {pricesLoading ? (
            <div className="flex items-center justify-center h-36">
              <Loader2 className="animate-spin" />
            </div>
          ) : prices && prices.length > 0 ? (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prices}>
                  <XAxis dataKey="commodity" />
                  <YAxis width={40} tickFormatter={v => (typeof v === "number" ? v.toLocaleString() : v)} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="price_per_kg" fill="#3b82f6" name="Price per kg" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center text-gray-500">No price data found for this location.</div>
          )}
        </div>
        {/* Market Prices Table */}
        <div className="bg-white rounded shadow p-3 sm:p-6">
          <h3 className="text-lg font-semibold mb-3">Price Table</h3>
          {pricesLoading ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="animate-spin" />
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
                      <TableCell>{row.commodity}</TableCell>
                      <TableCell>{row.price_per_kg?.toLocaleString?.() ?? row.price_per_kg}</TableCell>
                      <TableCell>{row.location}</TableCell>
                      <TableCell>{row.date_updated ? new Date(row.date_updated).toLocaleString() : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-gray-500">No market prices found for this location.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
