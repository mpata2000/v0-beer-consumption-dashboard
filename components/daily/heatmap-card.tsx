"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardData } from "@/lib/types";
import { parseIsoDateToUTC } from "@/lib/utils";
import { useMemo, useState } from "react";
import * as d3 from "d3";

interface HeatmapCardProps {
  data: DashboardData | null;
}

type HeatmapData = {
  x: string;
  y: string;
  value: number;
};

type InteractionData = {
  xLabel: string;
  yLabel: string;
  xPos: number;
  yPos: number;
  value: number;
};

const MARGIN = { top: 10, right: 10, bottom: 50, left: 70 };

export function HeatmapCard({ data }: HeatmapCardProps) {
  const entries = data?.entries || [];
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [hoveredCell, setHoveredCell] = useState<InteractionData | null>(null);

  function getIsoDayIndex(dateStr: string): number {
    const d = parseIsoDateToUTC(dateStr);
    const js = d.getUTCDay(); // 0=Sun..6=Sat
    return (js + 6) % 7; // 0=Mon..6=Sun
  }

  // Get all unique time ranges
  const timeRanges = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) {
      if (e.timeRange) set.add(e.timeRange);
    }
    const list = Array.from(set);
    // Try to sort by numeric start hour if present
    list.sort((a, b) => {
      const pa = parseInt(a.trim().split(/[^0-9]+/)[0] || "0", 10);
      const pb = parseInt(b.trim().split(/[^0-9]+/)[0] || "0", 10);
      return pa - pb;
    });
    return list;
  }, [entries]);

  // Transform data to heatmap format
  const heatmapData = useMemo(() => {
    const dataMap = new Map<string, number>();

    for (const e of entries) {
      if (!e.date || !e.timeRange) continue;
      const di = getIsoDayIndex(e.date);
      const day = dayLabels[di];
      const key = `${e.timeRange}-${day}`;
      dataMap.set(key, (dataMap.get(key) || 0) + 1);
    }

    const result: HeatmapData[] = [];
    for (const timeRange of timeRanges) {
      for (const day of dayLabels) {
        const key = `${timeRange}-${day}`;
        const value = dataMap.get(key) || 0;
        result.push({ x: timeRange, y: day, value });
      }
    }

    return result;
  }, [entries, timeRanges]);

  // Get min and max values for color scale
  const { min, max } = useMemo(() => {
    const values = heatmapData.filter(d => d.value > 0).map(d => d.value);
    return {
      min: values.length > 0 ? Math.min(...values) : 0,
      max: values.length > 0 ? Math.max(...values) : 1,
    };
  }, [heatmapData]);

  // Responsive dimensions
  const width = 700;
  const height = 300;
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Scales
  const xScale = useMemo(() => {
    return d3
      .scaleBand()
      .range([0, boundsWidth])
      .domain(timeRanges)
      .padding(0.05);
  }, [timeRanges, boundsWidth]);

  const yScale = useMemo(() => {
    return d3
      .scaleBand()
      .range([0, boundsHeight])
      .domain(dayLabels)
      .padding(0.05);
  }, [boundsHeight]);

  // Color scale using custom blue gradient starting from light blue
  const colorScale = useMemo(() => {
    return d3
      .scaleLinear<string>()
      .domain([0, max])
      .range(["#e0f2fe", "#0369a1"]) // From light blue (sky-100) to dark blue (sky-700)
      .interpolate(d3.interpolateRgb);
  }, [max]);

  // Render rectangles and values
  const allShapes = heatmapData.map((d, i) => {
    const xPos = xScale(d.x);
    const yPos = yScale(d.y);

    if (xPos === undefined || yPos === undefined) {
      return null;
    }

    const cellOpacity = hoveredCell?.xLabel === d.x && hoveredCell?.yLabel === d.y
      ? 1
      : hoveredCell
      ? 0.4
      : 1;

    return (
      <g key={i}>
        <rect
          x={xPos}
          y={yPos}
          width={xScale.bandwidth()}
          height={yScale.bandwidth()}
          fill={d.value === 0 ? "rgba(59,130,246,0.08)" : colorScale(d.value)}
          opacity={cellOpacity}
          onMouseEnter={() => {
            setHoveredCell({
              xLabel: d.x,
              yLabel: d.y,
              xPos: xPos + xScale.bandwidth() / 2,
              yPos: yPos + yScale.bandwidth() / 2,
              value: d.value,
            });
          }}
          onMouseLeave={() => setHoveredCell(null)}
          rx={2}
          className="cursor-pointer transition-opacity"
        />
        {d.value > 0 && (
          <text
            x={xPos + xScale.bandwidth() / 2}
            y={yPos + yScale.bandwidth() / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fontWeight={500}
            fill={d.value > max * 0.6 ? "white" : "black"}
            opacity={cellOpacity}
            pointerEvents="none"
          >
            {d.value}
          </text>
        )}
      </g>
    );
  });

  // X axis labels
  const xLabels = timeRanges.map((name, i) => {
    const xPos = xScale(name);
    if (xPos === undefined) return null;

    return (
      <text
        key={i}
        x={xPos + xScale.bandwidth() / 2}
        y={boundsHeight + 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={14}
        className="fill-muted-foreground"
      >
        {name}
      </text>
    );
  });

  // Y axis labels
  const yLabels = dayLabels.map((name, i) => {
    const yPos = yScale(name);
    if (yPos === undefined) return null;

    return (
      <text
        key={i}
        x={-10}
        y={yPos + yScale.bandwidth() / 2}
        textAnchor="end"
        dominantBaseline="middle"
        fontSize={14}
        className="fill-muted-foreground"
      >
        {name}
      </text>
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Heatmap: Day of Week × Time Range</CardTitle>
        <CardDescription>Counts across the full dataset</CardDescription>
      </CardHeader>
      <CardContent>
        {timeRanges.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No time range data
          </div>
        ) : (
          <div className="relative">
            <div className="overflow-x-auto">
              <div className="min-w-[280px] sm:min-w-[500px] md:min-w-[600px]">
                <svg width={width} height={height}>
                  <g
                    width={boundsWidth}
                    height={boundsHeight}
                    transform={`translate(${MARGIN.left}, ${MARGIN.top})`}
                  >
                    {allShapes}
                    {xLabels}
                    {yLabels}
                  </g>
                </svg>
              </div>
            </div>

            {/* Tooltip */}
            {hoveredCell && (
              <div
                className="absolute pointer-events-none bg-background border border-border rounded px-2 py-1 text-xs shadow-lg"
                style={{
                  left: hoveredCell.xPos + MARGIN.left,
                  top: hoveredCell.yPos + MARGIN.top - 40,
                  transform: "translateX(-50%)",
                }}
              >
                <div className="font-medium">
                  {hoveredCell.yLabel} @ {hoveredCell.xLabel}
                </div>
                <div className="text-muted-foreground">
                  Count: {hoveredCell.value}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
