// src/components/Reportes/Graficas/PieChartSimple.tsx
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { SimpleChartDatum } from "./BarChartSimple";

const COLORS = ["#22c55e", "#65a30d", "#4ade80", "#16a34a", "#a3e635"];

export default function PieChartSimple({ data }: { data: SimpleChartDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip
          contentStyle={{
            backgroundColor: "#020617",
            borderRadius: 8,
            border: "1px solid #1f2937",
            padding: "6px 8px",
          }}
          labelStyle={{ color: "#e5e7eb" }}
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
