// src/components/Reportes/Graficas/LineChartSimple.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { SimpleChartDatum } from "./BarChartSimple";

export default function LineChartSimple({ data }: { data: SimpleChartDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#9ca3af"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
        />
        <YAxis
          stroke="#9ca3af"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#020617",
            borderRadius: 8,
            border: "1px solid #1f2937",
            padding: "6px 8px",
          }}
          labelStyle={{ color: "#e5e7eb" }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ r: 4, fill: "#22c55e" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
