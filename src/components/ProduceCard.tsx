import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatDialog } from "./ChatDialog";
import { supabase } from "@/integrations/supabase/client";
import { useCropViewLogger } from "@/hooks/useCropViewLogger";
import { useProfile } from "@/hooks/useProfile";
import { FarmerProfileHeader } from "./FarmerProfileHeader";
import { FarmerReviewList } from "./FarmerReviewList";
import { FarmerReviewForm } from "./FarmerReviewForm";

type Produce = {
  id: string;
  commodity: string;
  quantity_kg: number;
  location: string;
  price_per_kg: number;
  farmer_contact: string;
  date_posted: string;
  farmer_id?: string;
};

export function ProduceCard({ produce }: { produce: Produce }) {
  const [showContact, setShowContact] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Real-time view tracking
  useCropViewLogger(produce.id);

  // Use profile of farmer (id or fallback to contact)
  const { data: farmerProfile } = useProfile();

  // Get current user for review logic
  const [userId, setUserId] = React.useState<string | null>(null);
  const [isFarmer, setIsFarmer] = React.useState(false);

  React.useEffect(() => {
    supabase.auth.getUser().then(res => {
      setUserId(res.data.user?.id || null);
      setIsFarmer(res.data.user?.id === produce.farmer_contact);
    });
  }, [produce.farmer_contact]);

  return (
    <div className={cn(
      "relative bg-white/90 rounded-xl shadow-lg hover:shadow-2xl ring-2 ring-indigo-50 hover:scale-105 transition-transform duration-200 cursor-pointer flex flex-col justify-between",
      "group animate-fade-in"
    )}>
      <div className="p-5 space-y-2">
        <FarmerProfileHeader profile={farmerProfile || { first_name: produce.farmer_contact }} />
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-green-900">{produce.commodity}</h3>
        </div>
        <div className="text-sm text-gray-500">
          {new Date(produce.date_posted).toLocaleDateString("en-ZA", { month: "short", day: "numeric", year: "numeric" })}
        </div>
        <div className="flex gap-2 items-end mt-2">
          <span className="text-xl font-semibold text-indigo-700">
            R{Number(produce.price_per_kg).toFixed(2)}<span className="text-xs text-gray-400">/kg</span>
          </span>
          <span className="ml-2 text-sm text-green-700">
            {Number(produce.quantity_kg).toLocaleString()} kg
          </span>
        </div>
        <div className="text-xs text-gray-600">
          <span role="img" aria-label="Location">📍</span> {produce.location}
        </div>
      </div>
      <div className="p-5 pt-0">
        {!showContact ? (
          <Button
            variant="secondary"
            className="w-full group-hover:bg-green-200 transition-colors"
            onClick={() => setShowContact(true)}
          >
            Contact Farmer <ArrowRight size={16} />
          </Button>
        ) : (
          <div>
            <div className="text-center text-green-900 font-medium bg-green-50 p-2 rounded-md animate-fade-in">
              Contact: {produce.farmer_contact}
            </div>
            {/* Show inquire/chat button for buyers */}
            {!isFarmer && (
              <>
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => setChatOpen(true)}
                >
                  Send Inquiry / Chat
                </Button>
                <ChatDialog open={chatOpen} onOpenChange={setChatOpen} produceId={produce.id} farmerId={produce.farmer_contact} />
                {/* Reviews and review form */}
                <div className="my-2">
                  <FarmerReviewList farmerId={produce.farmer_id || ""} />
                  <FarmerReviewForm farmerId={produce.farmer_id || ""} />
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <div className="absolute inset-0 rounded-xl ring-2 ring-primary pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
}
