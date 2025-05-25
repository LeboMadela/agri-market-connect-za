
import React from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export function StatsCard({ title, value, icon, className }: StatsCardProps) {
  return (
    <div className={cn("flex flex-col items-start gap-1 rounded-xl bg-white shadow p-4 min-w-[120px] w-full sm:w-auto", className)}>
      <div className="flex items-center gap-2 text-indigo-500">{icon}{title && <span className="text-xs font-medium text-gray-500">{title}</span>}</div>
      <div className="font-bold text-lg text-indigo-700">{value}</div>
    </div>
  );
}
