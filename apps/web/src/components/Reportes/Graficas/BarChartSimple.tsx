// src/components/Reportes/Graficas/BarChartSimple.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface SimpleChartDatum {
  name: string;
  value: number;
  // 👇 esto hace que cumpla con ChartDataInput
  [key: string]: string | number;
}

export default function BarChartSimple({ data }: { data: SimpleChartDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
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
        <Bar dataKey="value" fill="#22c55e" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
