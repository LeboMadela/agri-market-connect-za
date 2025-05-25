
import React from "react";
import { ProduceCard } from "./ProduceCard";

type Produce = {
  id: string;
  commodity: string;
  quantity_kg: number;
  location: string;
  price_per_kg: number;
  farmer_contact: string;
  date_posted: string;
};

export function ProduceGallery({ produce }: { produce: Produce[] }) {
  if (produce.length === 0) {
    return (
      <div className="w-full flex justify-center items-center text-muted-foreground py-16 animate-fade-in">
        No fresh produce listings found for your filters!
      </div>
    );
  }
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
      {produce.map(item => (
        <ProduceCard key={item.id} produce={item} />
      ))}
    </div>
  );
}
