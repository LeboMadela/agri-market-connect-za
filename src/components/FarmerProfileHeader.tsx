
import React from "react";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

/**
 * Farmer profile header with their name, photo, and verified badge.
 * @param profile Farmer profile object with at least first_name and is_verified.
 */
export function FarmerProfileHeader({
  profile,
}: {
  profile: { first_name?: string | null; profile_image_url?: string | null; is_verified?: boolean | null };
}) {
  return (
    <div className="flex items-center gap-4 mb-2">
      {profile.profile_image_url && (
        <img
          src={profile.profile_image_url}
          className="h-12 w-12 rounded-full object-cover border border-green-200"
          alt={`${profile.first_name || "Farmer"} profile`}
        />
      )}
      <span className="font-bold text-lg text-green-900">
        {profile.first_name ?? "Farmer"}
        {profile.is_verified && <VerifiedBadge />}
      </span>
    </div>
  );
}
