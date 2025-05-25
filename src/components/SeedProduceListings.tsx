
import React from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const DEMO_DATA = [
  {
    commodity: "Tomatoes",
    quantity_kg: 250,
    location: "Johannesburg",
    price_per_kg: 12.5,
    farmer_contact: "+27 71 123 4567",
  },
  {
    commodity: "Potatoes",
    quantity_kg: 500,
    location: "Cape Town",
    price_per_kg: 9.8,
    farmer_contact: "+27 82 987 6543",
  },
  {
    commodity: "Spinach",
    quantity_kg: 75,
    location: "Durban",
    price_per_kg: 15.0,
    farmer_contact: "+27 74 321 0987",
  },
  {
    commodity: "Onions",
    quantity_kg: 120,
    location: "Pretoria",
    price_per_kg: 11.9,
    farmer_contact: "+27 83 555 0011",
  },
  {
    commodity: "Butternut",
    quantity_kg: 80,
    location: "Bloemfontein",
    price_per_kg: 13.2,
    farmer_contact: "+27 76 555 2233",
  },
];

export function SeedProduceListings({ farmer_id }: { farmer_id: string }) {
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  async function seed() {
    setLoading(true);
    setDone(false);

    // Attach farmer_id to each item and add timestamp
    const rows = DEMO_DATA.map(item => ({
      ...item,
      farmer_id,
      date_posted: new Date().toISOString(),
    }));

    const { error } = await supabase.from("produce_listings").insert(rows);

    setLoading(false);
    setDone(!error);

    if (error) {
      alert("Error seeding data: " + error.message);
    }
  }

  return (
    <div className="my-4 p-4 border rounded bg-orange-50">
      <p className="mb-2 text-sm text-orange-800">Seeder for Demo Crops (Dev-only):</p>
      <Button onClick={seed} disabled={loading || done} variant="outline">
        {done ? "Seeded!" : loading ? "Seeding..." : "Insert Demo Crops"}
      </Button>
      {done && <p className="mt-2 text-green-700">Sample crops were added! Refresh your dashboard.</p>}
    </div>
  );
}
