import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

// Neon signal colors follow the active theme mode (see --neon-* in index.css)
const COLORS = {
  wpm: "var(--neon-info)",
  cpm: "var(--neon-green)",
  accuracy: "var(--neon-amber)",
}

const GLOW_FILTER_ID = "tf-chart-neon-glow"

const PracticeChart = ({ records }) => {
  const { t } = useTranslation()

  const chartData = useMemo(
    () =>
      [...records]
        .sort((a, b) => new Date(a.endedAt) - new Date(b.endedAt))
        .map((record, index) => ({
          session: index + 1,
          wpm: Math.round(record.wpm),
          cpm: record.cpm,
          accuracy: Math.round(record.accuracy * 100 * 100) / 100,
        })),
    [records]
  )

  const chartConfig = useMemo(
    () => ({
      wpm: {
        label: "WPM",
        color: COLORS.wpm,
      },
      cpm: {
        label: "CPM",
        color: COLORS.cpm,
      },
      accuracy: {
        label: t("history.accuracy"),
        color: COLORS.accuracy,
      },
    }),
    [t]
  )

  return (
    <div className="h-80 w-full font-mono">
      <ChartContainer config={chartConfig} className="h-full w-full !aspect-auto">
        <LineChart
          data={chartData}
          margin={{
            top: 8,
            left: 12,
            right: 12,
            bottom: 8,
          }}
        >
          <defs>
            <filter id={GLOW_FILTER_ID} x="-10%" y="-30%" width="120%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="2 6" className="stroke-hud-line/60" />
          <XAxis
            dataKey="session"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => String(value)}
            className="text-xs"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="text-xs text-muted-foreground"
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(label) =>
                  `${t("history.the")} ${label} ${t("history.session")}`
                }
                formatter={(value, _name, item) => {
                  const suffix = item?.dataKey === "accuracy" ? "%" : ""
                  return (
                    <div className="flex w-full flex-wrap items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{
                          backgroundColor:
                            COLORS[item?.dataKey] ?? item?.color,
                        }}
                      />
                      <div className="flex flex-1 justify-between leading-none">
                        <span className="text-muted-foreground">
                          {chartConfig[item?.dataKey]?.label ?? item?.name}
                        </span>
                        <span className="font-mono font-medium text-foreground tabular-nums">
                          {value}
                          {suffix}
                        </span>
                      </div>
                    </div>
                  )
                }}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            name="WPM"
            dataKey="wpm"
            type="monotone"
            stroke="var(--color-wpm)"
            strokeWidth={2}
            dot={false}
            filter={`url(#${GLOW_FILTER_ID})`}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
          />
          <Line
            name="CPM"
            dataKey="cpm"
            type="monotone"
            stroke="var(--color-cpm)"
            strokeWidth={2}
            dot={false}
            filter={`url(#${GLOW_FILTER_ID})`}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
          />
          <Line
            name={t("history.accuracy")}
            dataKey="accuracy"
            type="monotone"
            stroke="var(--color-accuracy)"
            strokeWidth={2}
            dot={false}
            filter={`url(#${GLOW_FILTER_ID})`}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}

export default PracticeChart
