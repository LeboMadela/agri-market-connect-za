
import React from "react";
import { StatsCard } from "./StatsCard";
import { ArrowUp, ArrowDown, ArrowRight } from "lucide-react";

type Stats = {
  totalListings: number;
  newListings: number;
  topCrops: string[];
};

export function ProduceStats({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
      <StatsCard
        title="Total Active Listings"
        value={stats.totalListings}
        icon={<ArrowUp className="text-green-500" />}
      />
      <StatsCard
        title="New Listings This Week"
        value={stats.newListings}
        icon={<ArrowRight className="text-indigo-600" />}
      />
      <StatsCard
        title="Top 3 Most Demanded Crops"
        value={(stats.topCrops.length > 0 ? stats.topCrops.join(", ") : "—")}
        icon={<ArrowDown className="text-amber-700" />}
      />
    </div>
  );
}
