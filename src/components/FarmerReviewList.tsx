
import React from "react";
import { useFarmerReviews } from "@/hooks/useFarmerReviews";
import { Star } from "lucide-react";

export function FarmerReviewList({ farmerId }: { farmerId: string }) {
  const { data: reviews, isLoading } = useFarmerReviews(farmerId);

  if (isLoading) {
    return <div className="text-center text-gray-400 py-6">Loading reviews…</div>;
  }
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center text-gray-400 py-6">No reviews yet.</div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((r: any) => (
        <div key={r.id} className="bg-green-50 rounded-lg px-4 py-3 border border-green-100">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-yellow-500" />
            <span className="font-semibold text-green-900">{r.rating}/5</span>
            {r.buyer?.first_name && (
              <span className="ml-3 text-xs text-green-700">By {r.buyer.first_name}</span>
            )}
            <span className="ml-auto text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
          </div>
          {r.review_text && (
            <div className="mt-2 text-stone-700 text-[15px]">{r.review_text}</div>
          )}
        </div>
      ))}
    </div>
  );
}
