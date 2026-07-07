"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function PriceChart({
  ticker,
  timeSeries,
}: {
  ticker: string;
  timeSeries: Record<string, number>;
}) {
  const data = Object.entries(timeSeries).map(([date, close]) => ({ date, close }));

  return (
    <div className="rounded-sm border border-paper/15 bg-ledger p-4">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(238,232,214,0.08)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="rgba(238,232,214,0.4)"
            tick={{ fontFamily: "var(--font-plex-mono)", fontSize: 11 }}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            stroke="rgba(238,232,214,0.4)"
            tick={{ fontFamily: "var(--font-plex-mono)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={56}
            domain={["auto", "auto"]}
            tickFormatter={(v: number) => `$${v.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{
              background: "#12171C",
              border: "1px solid rgba(238,232,214,0.2)",
              fontFamily: "var(--font-plex-mono)",
              fontSize: 12,
            }}
            labelStyle={{ color: "#EEE8D6" }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, ticker]}
          />
          <Line type="monotone" dataKey="close" stroke="#B98A2E" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
