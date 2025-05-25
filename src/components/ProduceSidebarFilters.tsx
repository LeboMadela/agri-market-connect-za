
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowDown } from "lucide-react";

type Filters = {
  commodity?: string;
  minPrice?: string;
  maxPrice?: string;
  location?: string;
  recentOnly?: boolean;
};

type Props = {
  onChange: (filters: Filters) => void;
};

export function ProduceSidebarFilters({ onChange }: Props) {
  const [filters, setFilters] = useState<Filters>({
    commodity: "",
    minPrice: "",
    maxPrice: "",
    location: "",
    recentOnly: false,
  });

  function handleUpdate(name: keyof Filters, value: string | boolean) {
    const updated = { ...filters, [name]: value };
    setFilters(updated);
    onChange(updated);
  }

  return (
    <aside className="bg-white/80 rounded-xl shadow p-5 flex flex-col gap-4 min-w-[220px] max-w-xs w-full md:w-60 animate-slide-in-right">
      <h3 className="font-bold text-xl text-indigo-900 mb-2">Filters</h3>
      <div>
        <label className="block font-medium text-sm mb-1">Commodity</label>
        <Input
          placeholder="e.g. Tomatoes"
          value={filters.commodity}
          onChange={e => handleUpdate("commodity", e.target.value)}
        />
      </div>
      <div>
        <label className="block font-medium text-sm mb-1">Location</label>
        <Input
          placeholder="City or province"
          value={filters.location}
          onChange={e => handleUpdate("location", e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <div>
          <label className="block font-medium text-xs">Min Price</label>
          <Input
            type="number"
            className="w-full"
            value={filters.minPrice}
            onChange={e => handleUpdate("minPrice", e.target.value)}
            min={0}
          />
        </div>
        <div>
          <label className="block font-medium text-xs">Max Price</label>
          <Input
            type="number"
            className="w-full"
            value={filters.maxPrice}
            onChange={e => handleUpdate("maxPrice", e.target.value)}
            min={0}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={!!filters.recentOnly}
          onChange={e => handleUpdate("recentOnly", e.target.checked)}
          className="accent-indigo-500 h-4 w-4"
          id="recentOnly"
        />
        <label htmlFor="recentOnly" className="text-sm font-medium">Recently Posted (7d)</label>
      </div>
    </aside>
  );
}
