
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Entry = {
  region: string;
  count: number;
};

export function ProduceCropsChart({ data }: { data: Entry[] }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 my-6 animate-scale-in">
      <h4 className="font-semibold text-lg text-gray-800 mb-4">Most Listed Crops by Region</h4>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <XAxis dataKey="region" stroke="#6366f1" fontSize={13}/>
          <YAxis allowDecimals={false}/>
          <Tooltip />
          <Bar dataKey="count" fill="#22c55e" radius={[8,8,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
