
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { LogoutButton } from "@/components/LogoutButton";
import { ProduceSidebarFilters } from "@/components/ProduceSidebarFilters";
import { CropAssistantDialog } from "@/components/CropAssistantDialog";
import { ProduceStats } from "@/components/ProduceStats";
import { ProduceGallery } from "@/components/ProduceGallery";
import { ProduceCropsChart } from "@/components/ProduceCropsChart";
import { useProduceListings, ProduceFilters } from "@/hooks/useProduceListings";
import ReactQuery from "@tanstack/react-query";

export function BuyerDashboard({
  profile,
  buyerProfile,
  stats,
  chartData,
  produceListings,
  produceLoading,
  setFilters,
}: {
  profile: any;
  buyerProfile: any;
  stats: any;
  chartData: any;
  produceListings: any[];
  produceLoading: boolean;
  setFilters: (f: ProduceFilters) => void;
}) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-green-50 via-white to-indigo-50 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 py-6 md:py-8">
        <div className="flex justify-end items-center gap-2 mb-4">
          <NotificationsDropdown />
          <LogoutButton />
        </div>
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
            <div className="mt-4"><CropAssistantDialog /></div>
          </div>
        </div>
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
