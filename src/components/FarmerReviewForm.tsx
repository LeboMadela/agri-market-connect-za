
import React, { useState } from "react";
import { useSubmitFarmerReview } from "@/hooks/useFarmerReviews";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useSession } from "@/hooks/useSession";

/** Minimal review form for buyers to rate/review farmers. */
export function FarmerReviewForm({ farmerId }: { farmerId: string }) {
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>("");
  const submitReview = useSubmitFarmerReview();
  const { user } = useSession();

  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        if (!rating || rating < 1 || rating > 5) {
          toast({ title: "Rating must be 1–5", variant: "destructive" });
          return;
        }
        if (!user?.id) {
          toast({ title: "You must be logged in to review." });
          return;
        }
        await submitReview.mutateAsync({
          farmer_id: farmerId,
          buyer_id: user.id,
          rating,
          review_text: reviewText,
        });
        setReviewText("");
        setRating(5);
        toast({ title: "Thank you for your review!" });
      }}
      className="bg-green-50 border border-green-100 rounded-lg p-4 mt-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="font-medium mr-2">Your rating:</span>
        <select
          className="border rounded px-2 py-1"
          value={rating}
          onChange={e => setRating(Number(e.target.value))}
        >
          {[5, 4, 3, 2, 1].map(r => (
            <option value={r} key={r}>{r}</option>
          ))}
        </select>
        <span className="ml-4 font-medium">Review:</span>
        <input
          className="border rounded px-2 py-1 flex-1"
          type="text"
          maxLength={140}
          placeholder="(Optional) Share your experience…"
          value={reviewText}
          onChange={e => setReviewText(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={submitReview.isPending}>
        {submitReview.isPending ? "Submitting…" : "Submit Review"}
      </Button>
    </form>
  );
}
