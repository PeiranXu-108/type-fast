import React from "react";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PracticeChart = ({ records }) => {
  const { t } = useTranslation();
  // Prepare chart data, sorted by time
  const chartData = records
    .sort((a, b) => new Date(a.endedAt) - new Date(b.endedAt))
    .map((record, index) => ({
      session: index + 1,
      date: new Date(record.endedAt).toLocaleDateString(),
      wpm: Math.round(record.wpm),
      cpm: record.cpm,
      accuracy: Math.round(record.accuracy * 100 * 100) / 100, 
    }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {t("history.the")} {label} {t("history.session")}
          </p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value}
              {entry.dataKey === "accuracy" ? "%" : ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            className="opacity-30"
            stroke="currentColor"
          />
          <XAxis 
            dataKey="session"
            stroke="currentColor"
            className="text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="currentColor"
            className="text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="wpm"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
            name="WPM"
          />
          <Line
            type="monotone"
            dataKey="cpm"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
            name="CPM"
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#f59e0b", strokeWidth: 2 }}
            name={t("history.accuracy")}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PracticeChart;
