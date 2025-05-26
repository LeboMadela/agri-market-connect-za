
import React from "react";
import { BadgeCheck } from "lucide-react";

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-green-200 text-green-900 rounded ml-1" title="Verified Farmer">
      <BadgeCheck className="h-3 w-3 text-green-600 mr-1" />
      Verified
    </span>
  );
}
