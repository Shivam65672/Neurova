'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function BPTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis
          dataKey="x"
          stroke="#a1a1aa"
          style={{ fontSize: "12px" }}
          tickFormatter={(value) => {
            const item = data.find((d) => d.x === value);
            return item ? item.date : "";
          }}
        />
        <YAxis
        width={25}
          stroke="#a1a1aa"
          style={{ fontSize: '12px' }}
          domain={[40, 180]}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null;

            const p = payload[0].payload;

            return (
              <div
                style={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                  padding: "10px",
                  color: "#fff",
                }}
              >
                <div>{p.fullDate}</div>
                <div>{p.time}</div>

                <div style={{ color: "#14b8a6", marginTop: "6px" }}>
                  Diastolic : {p.diastolic}
                </div>

                <div style={{ color: "#06b6d4", marginTop: "6px" }}>
                  Systolic : {p.systolic}
                </div>
              </div>
            );
          }}
        />
        <Legend
          wrapperStyle={{ color: '#a1a1aa' }}
        />
        <Line
          type="monotone"
          dataKey="systolic"
          stroke="#06b6d4"
          strokeWidth={2}
          dot={{ fill: '#06b6d4', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="diastolic"
          stroke="#14b8a6"
          strokeWidth={2}
          dot={{ fill: '#14b8a6', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
