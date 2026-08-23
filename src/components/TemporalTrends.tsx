import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  CalendarRange,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Layers,
  ChevronDown,
  BarChart3,
  LineChart as LineChartIcon,
  Sparkles,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import { DatasetMetadata, TemporalTrendAnalysis } from "../types";
import { computeTemporalTrend, detectTemporalColumns } from "../utils/edaEngine";

interface TemporalTrendsProps {
  metadata: DatasetMetadata;
  rows: Record<string, any>[];
  headers: string[];
}

export const TemporalTrends: React.FC<TemporalTrendsProps> = ({
  metadata,
  rows,
  headers,
}) => {
  // Detect date columns
  const detectedDateCols = useMemo(() => {
    return detectTemporalColumns(headers, rows);
  }, [headers, rows]);

  const [selectedDateCol, setSelectedDateCol] = useState<string>(
    detectedDateCols[0] || ""
  );
  const [selectedMetricCol, setSelectedMetricCol] = useState<string>("_record_count");
  const [selectedAggregation, setSelectedAggregation] = useState<
    "count" | "mean" | "sum" | "median" | "min" | "max"
  >("mean");
  const [selectedGranularity, setSelectedGranularity] = useState<
    "auto" | "day" | "week" | "month" | "quarter" | "year"
  >("auto");
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  const [showTrendline, setShowTrendline] = useState<boolean>(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showCohortTable, setShowCohortTable] = useState<boolean>(false);

  // Update selectedDateCol if detected cols change
  useEffect(() => {
    if (detectedDateCols.length > 0 && !detectedDateCols.includes(selectedDateCol)) {
      setSelectedDateCol(detectedDateCols[0]);
    }
  }, [detectedDateCols, selectedDateCol]);

  // Compute trend analysis
  const trendAnalysis: TemporalTrendAnalysis | null = useMemo(() => {
    if (!selectedDateCol || rows.length === 0) return null;
    return computeTemporalTrend(rows, selectedDateCol, selectedMetricCol, {
      aggregation: selectedMetricCol === "_record_count" ? "count" : selectedAggregation,
      granularity: selectedGranularity,
    });
  }, [rows, selectedDateCol, selectedMetricCol, selectedAggregation, selectedGranularity]);

  const points = trendAnalysis?.points || [];
  const linearRegression = trendAnalysis?.linearRegression || { slope: 0, intercept: 0, r2: 0 };
  const peakPeriod = trendAnalysis?.peakPeriod;
  const troughPeriod = trendAnalysis?.troughPeriod;
  const overallGrowthPct = trendAnalysis?.overallGrowthPct ?? 0;
  const trendDirection = trendAnalysis?.trendDirection ?? "flat";
  const narrativeSummary = trendAnalysis?.narrativeSummary ?? "";

  // Chart dimensions and SVG mapping
  const chartHeight = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 60 };
  const minVal = points.length > 0 ? Math.min(...points.map((p) => p.metricValue)) : 0;
  const maxVal = points.length > 0 ? Math.max(...points.map((p) => p.metricValue)) : 1;
  const yRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;
  const yMin = Math.max(0, minVal - yRange * 0.1);
  const yMax = maxVal + yRange * 0.1;

  const getX = (index: number, total: number, width: number) => {
    if (total <= 1) return width / 2;
    const innerWidth = width - padding.left - padding.right;
    return padding.left + (index / (total - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    const innerHeight = chartHeight - padding.top - padding.bottom;
    const norm = (val - yMin) / (yMax - yMin || 1);
    return chartHeight - padding.bottom - norm * innerHeight;
  };

  // SVG path generation
  const svgWidth = 720;
  const pathD = useMemo(() => {
    if (points.length === 0) return "";
    return points.reduce((acc, pt, idx) => {
      const x = getX(idx, points.length, svgWidth);
      const y = getY(pt.metricValue);
      if (idx === 0) return `M ${x} ${y}`;
      // Smooth cubic bezier
      const prevX = getX(idx - 1, points.length, svgWidth);
      const prevY = getY(points[idx - 1].metricValue);
      const cp1x = prevX + (x - prevX) / 2;
      const cp2x = prevX + (x - prevX) / 2;
      return `${acc} C ${cp1x} ${prevY}, ${cp2x} ${y}, ${x} ${y}`;
    }, "");
  }, [points, yMin, yMax]);

  const areaD = useMemo(() => {
    if (!pathD || points.length === 0) return "";
    const firstX = getX(0, points.length, svgWidth);
    const lastX = getX(points.length - 1, points.length, svgWidth);
    const baseY = chartHeight - padding.bottom;
    return `${pathD} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  }, [pathD, points]);

  // Linear regression trend line path
  const trendlineD = useMemo(() => {
    if (points.length < 2 || !showTrendline) return "";
    const firstPred = linearRegression.intercept;
    const lastPred = linearRegression.slope * (points.length - 1) + linearRegression.intercept;
    const x1 = getX(0, points.length, svgWidth);
    const y1 = getY(firstPred);
    const x2 = getX(points.length - 1, points.length, svgWidth);
    const y2 = getY(lastPred);
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }, [points, linearRegression, showTrendline, yMin, yMax]);

  // Y-axis tick intervals
  const yTicks = useMemo(() => {
    const ticks = [];
    const count = 4;
    for (let i = 0; i <= count; i++) {
      const val = yMin + ((yMax - yMin) / count) * i;
      ticks.push({
        val,
        y: getY(val),
      });
    }
    return ticks;
  }, [yMin, yMax]);

  // X-axis sampled labels
  const xLabels = useMemo(() => {
    if (points.length <= 8) {
      return points.map((p, i) => ({ label: p.displayLabel, x: getX(i, points.length, svgWidth), index: i }));
    }
    const step = Math.ceil(points.length / 6);
    return points
      .map((p, i) => ({ label: p.displayLabel, x: getX(i, points.length, svgWidth), index: i }))
      .filter((_, idx) => idx % step === 0 || idx === points.length - 1);
  }, [points]);

  if (detectedDateCols.length === 0 || !trendAnalysis || trendAnalysis.points.length === 0) {
    return null;
  }

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  return (
    <div
      id="temporal-trends-section"
      className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 mb-6 relative overflow-hidden"
    >
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-100">
                Temporal Trend & Progression Telemetry
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {detectedDateCols.length} Date Column{detectedDateCols.length > 1 ? "s" : ""} Detected
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical progression, rate of change, and period-over-period patterns
            </p>
          </div>
        </div>

        {/* Dynamic Controls Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Date Column Selector */}
          {detectedDateCols.length > 1 && (
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <label htmlFor="temporal-date-col" className="text-slate-400">Date:</label>
              <select
                id="temporal-date-col"
                value={selectedDateCol}
                onChange={(e) => setSelectedDateCol(e.target.value)}
                aria-label="Select Date Column"
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                {detectedDateCols.map((col) => (
                  <option key={col} value={col} className="bg-slate-900 text-slate-200">
                    {col}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Metric Selector */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <label htmlFor="temporal-metric-col" className="text-slate-400">Metric:</label>
            <select
              id="temporal-metric-col"
              value={selectedMetricCol}
              onChange={(e) => setSelectedMetricCol(e.target.value)}
              aria-label="Select Temporal Metric Column"
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[140px] truncate"
            >
              <option value="_record_count" className="bg-slate-900 text-slate-200">
                Observation Count
              </option>
              {metadata.numericalColumns.map((col) => (
                <option key={col} value={col} className="bg-slate-900 text-slate-200">
                  {col}
                </option>
              ))}
            </select>
          </div>

          {/* Aggregation Mode (only if metric is not record count) */}
          {selectedMetricCol !== "_record_count" && (
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
              <label htmlFor="temporal-agg-select" className="text-slate-400">Agg:</label>
              <select
                id="temporal-agg-select"
                value={selectedAggregation}
                onChange={(e) => setSelectedAggregation(e.target.value as any)}
                aria-label="Select Aggregation Mode"
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="mean" className="bg-slate-900 text-slate-200">Mean / Avg</option>
                <option value="sum" className="bg-slate-900 text-slate-200">Sum</option>
                <option value="median" className="bg-slate-900 text-slate-200">Median</option>
                <option value="min" className="bg-slate-900 text-slate-200">Min</option>
                <option value="max" className="bg-slate-900 text-slate-200">Max</option>
              </select>
            </div>
          )}

          {/* Granularity Selector */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <label htmlFor="temporal-gran-select" className="text-slate-400">Bucket:</label>
            <select
              id="temporal-gran-select"
              value={selectedGranularity}
              onChange={(e) => setSelectedGranularity(e.target.value as any)}
              aria-label="Select Granularity Resolution"
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="auto" className="bg-slate-900 text-slate-200">Auto ({trendAnalysis.granularity})</option>
              <option value="day" className="bg-slate-900 text-slate-200">Daily</option>
              <option value="week" className="bg-slate-900 text-slate-200">Weekly</option>
              <option value="month" className="bg-slate-900 text-slate-200">Monthly</option>
              <option value="quarter" className="bg-slate-900 text-slate-200">Quarterly</option>
              <option value="year" className="bg-slate-900 text-slate-200">Yearly</option>
            </select>
          </div>

          {/* Chart View Mode Toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              id="temporal-chart-type-area-btn"
              onClick={() => setChartType("area")}
              title="Area Line Chart"
              className={`p-1.5 rounded ${
                chartType === "area"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              id="temporal-chart-type-bar-btn"
              onClick={() => setChartType("bar")}
              title="Period Bar Distribution"
              className={`p-1.5 rounded ${
                chartType === "bar"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Trendline toggle */}
          <button
            id="temporal-trendline-toggle-btn"
            onClick={() => setShowTrendline(!showTrendline)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              showTrendline
                ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Trendline {showTrendline ? "On" : "Off"}
          </button>
        </div>
      </div>

      {/* KPI Highlight Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 my-5">
        {/* Metric 1: Timeline Span */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Temporal Window
          </span>
          <div className="text-sm font-semibold text-slate-100 truncate">
            {trendAnalysis.startDateFormatted}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between mt-1">
            <span>to {trendAnalysis.endDateFormatted}</span>
            <span className="text-slate-300 font-medium">
              {trendAnalysis.totalDaysSpan} days ({points.length} {trendAnalysis.granularity}s)
            </span>
          </div>
        </div>

        {/* Metric 2: Net Progression Velocity */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Overall Progression
          </span>
          <div className="flex items-center gap-1.5">
            {overallGrowthPct > 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : overallGrowthPct < 0 ? (
              <TrendingDown className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Activity className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span
              className={`text-base font-bold ${
                overallGrowthPct > 0
                  ? "text-emerald-400"
                  : overallGrowthPct < 0
                  ? "text-rose-400"
                  : "text-slate-200"
              }`}
            >
              {overallGrowthPct > 0 ? `+${overallGrowthPct}%` : `${overallGrowthPct}%`}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1 capitalize">
            Trajectory: <span className="text-slate-200 font-medium">{trendDirection}</span>
          </div>
        </div>

        {/* Metric 3: Peak Activity Interval */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Peak Activity Period
          </span>
          <div className="text-sm font-semibold text-slate-100 truncate">
            {peakPeriod.period}
          </div>
          <div className="text-xs text-blue-400 font-medium mt-1">
            {peakPeriod.value.toLocaleString()}{" "}
            <span className="text-slate-400 font-normal">
              ({peakPeriod.count} row{peakPeriod.count > 1 ? "s" : ""})
            </span>
          </div>
        </div>

        {/* Metric 4: Model Regression Fit */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Linear Trend Slope & Fit
          </span>
          <div className="text-sm font-semibold text-slate-100 truncate">
            Slope: {linearRegression.slope > 0 ? `+${linearRegression.slope}` : linearRegression.slope} / bucket
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Goodness of fit:{" "}
            <span className="text-slate-200 font-medium">
              R² = {linearRegression.r2} ({linearRegression.r2 > 0.5 ? "Strong" : linearRegression.r2 > 0.2 ? "Moderate" : "Weak"})
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Canvas */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 relative">
        {/* Active Inspection Legend Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-800/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span className="font-semibold text-slate-200">
              {selectedMetricCol === "_record_count" ? "Record Volume" : selectedMetricCol}
            </span>
            <span className="text-slate-400">
              ({selectedMetricCol === "_record_count" ? "Row Count" : selectedAggregation})
            </span>
          </div>

          {activePoint && (
            <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/60 px-3 py-1 rounded-md text-xs">
              <span className="text-slate-400 font-medium">
                Period: <strong className="text-slate-100">{activePoint.displayLabel}</strong>
              </span>
              <span className="text-slate-400 font-medium">
                Value: <strong className="text-blue-400">{activePoint.metricValue.toLocaleString()}</strong>
              </span>
              <span className="text-slate-400 font-medium">
                Count: <strong className="text-slate-200">{activePoint.count}</strong>
              </span>
              {activePoint.changePctFromPrev !== undefined && (
                <span
                  className={`font-semibold ${
                    activePoint.changePctFromPrev > 0
                      ? "text-emerald-400"
                      : activePoint.changePctFromPrev < 0
                      ? "text-rose-400"
                      : "text-slate-400"
                  }`}
                >
                  {activePoint.changePctFromPrev > 0 ? `+${activePoint.changePctFromPrev}%` : `${activePoint.changePctFromPrev}%`} vs prev
                </span>
              )}
            </div>
          )}
        </div>

        {/* SVG Visualization Stage */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[640px]">
            <svg
              viewBox={`0 0 ${svgWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id="temporalAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                  <stop offset="80%" stopColor="#3b82f6" stopOpacity="0.03" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="temporalBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines & Y-Axis values */}
              {yTicks.map((tick, idx) => (
                <g key={idx} className="text-slate-600">
                  <line
                    x1={padding.left}
                    y1={tick.y}
                    x2={svgWidth - padding.right}
                    y2={tick.y}
                    stroke="currentColor"
                    strokeOpacity="0.3"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padding.left - 8}
                    y={tick.y + 4}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-mono"
                  >
                    {tick.val >= 1000 ? `${(tick.val / 1000).toFixed(1)}k` : tick.val.toFixed(1)}
                  </text>
                </g>
              ))}

              {/* Bar Chart Visualization Mode */}
              {chartType === "bar" &&
                points.map((pt, idx) => {
                  const x = getX(idx, points.length, svgWidth);
                  const y = getY(pt.metricValue);
                  const baseY = chartHeight - padding.bottom;
                  const barWidth = Math.max(
                    6,
                    Math.min(36, ((svgWidth - padding.left - padding.right) / points.length) * 0.7)
                  );
                  const isHovered = hoveredIndex === idx;

                  return (
                    <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredIndex(idx)}>
                      <rect
                        x={x - barWidth / 2}
                        y={y}
                        width={barWidth}
                        height={Math.max(2, baseY - y)}
                        rx={3}
                        fill={isHovered ? "#93c5fd" : "url(#temporalBarGrad)"}
                        className="transition-all duration-150"
                      />
                    </g>
                  );
                })}

              {/* Area Chart Mode */}
              {chartType === "area" && (
                <>
                  <path d={areaD} fill="url(#temporalAreaGrad)" />
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}

              {/* Linear Regression Overlay */}
              {showTrendline && trendlineD && (
                <path
                  d={trendlineD}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1.75"
                  strokeDasharray="5 5"
                  strokeOpacity="0.8"
                />
              )}

              {/* Data Points and Hover Crosshair Hitboxes */}
              {points.map((pt, idx) => {
                const x = getX(idx, points.length, svgWidth);
                const y = getY(pt.metricValue);
                const isHovered = hoveredIndex === idx;
                const isPeak = pt.periodKey === peakPeriod.period || pt.metricValue === peakPeriod.value;

                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Hover vertical guideline */}
                    {isHovered && (
                      <line
                        x1={x}
                        y1={padding.top}
                        x2={x}
                        y2={chartHeight - padding.bottom}
                        stroke="#60a5fa"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                        strokeOpacity="0.7"
                      />
                    )}

                    {/* Peak badge indicator */}
                    {isPeak && points.length > 2 && (
                      <circle cx={x} cy={y} r="8" fill="#3b82f6" fillOpacity="0.2" />
                    )}

                    {/* Point Circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? "5" : points.length > 30 ? "2.5" : "3.5"}
                      fill={isHovered ? "#60a5fa" : "#3b82f6"}
                      stroke="#0f172a"
                      strokeWidth="2"
                      className="transition-transform duration-150"
                    />

                    {/* Transparent hover capture zone */}
                    <rect
                      x={x - (svgWidth / points.length) / 2}
                      y={0}
                      width={svgWidth / points.length}
                      height={chartHeight}
                      fill="transparent"
                    />
                  </g>
                );
              })}

              {/* X-Axis Tick Labels */}
              {xLabels.map((lbl, idx) => (
                <text
                  key={idx}
                  x={lbl.x}
                  y={chartHeight - padding.bottom + 18}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {lbl.label}
                </text>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Narrative Synthesis & Insights */}
      <div className="mt-4 bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed flex-1">
          <strong className="text-slate-100 font-semibold">Temporal Synthesis: </strong>
          {narrativeSummary}
        </div>
        <button
          id="temporal-toggle-cohort-table-btn"
          onClick={() => setShowCohortTable(!showCohortTable)}
          className="text-xs font-medium text-blue-400 hover:text-blue-300 shrink-0 flex items-center gap-1 transition-colors"
        >
          {showCohortTable ? "Hide Breakdown" : "View Breakdown"}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCohortTable ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Expandable Breakdown Data Table */}
      {showCohortTable && (
        <div className="mt-3 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden transition-all">
          <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-between">
            <span>Period-by-Period Temporal Breakdown</span>
            <span className="text-slate-400 font-normal">
              {points.length} Periods ({trendAnalysis.granularity})
            </span>
          </div>
          <div className="max-h-56 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30 text-slate-400 font-medium">
                  <th className="py-2 px-3">Period</th>
                  <th className="py-2 px-3 text-right">Records</th>
                  <th className="py-2 px-3 text-right">
                    {selectedMetricCol === "_record_count" ? "Volume" : `${selectedMetricCol} (${selectedAggregation})`}
                  </th>
                  <th className="py-2 px-3 text-right">Sum</th>
                  <th className="py-2 px-3 text-right">Min / Max</th>
                  <th className="py-2 px-3 text-right">Δ vs Prev</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {points.map((pt, idx) => {
                  const isPeak = pt.metricValue === peakPeriod.value;
                  const isTrough = pt.metricValue === troughPeriod.value;

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-900/50 transition-colors ${
                        hoveredIndex === idx ? "bg-blue-500/10" : ""
                      }`}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <td className="py-2 px-3 font-medium text-slate-200 flex items-center gap-1.5">
                        {pt.displayLabel}
                        {isPeak && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/10 text-emerald-400 font-semibold">
                            Peak
                          </span>
                        )}
                        {isTrough && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-500/10 text-rose-400 font-semibold">
                            Trough
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-400 font-mono">{pt.count}</td>
                      <td className="py-2 px-3 text-right font-semibold text-blue-400 font-mono">
                        {pt.metricValue.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-400 font-mono">
                        {pt.metricSum.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-400 font-mono text-[11px]">
                        {pt.metricMin} - {pt.metricMax}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {pt.changePctFromPrev !== undefined ? (
                          <span
                            className={
                              pt.changePctFromPrev > 0
                                ? "text-emerald-400"
                                : pt.changePctFromPrev < 0
                                ? "text-rose-400"
                                : "text-slate-400"
                            }
                          >
                            {pt.changePctFromPrev > 0 ? `+${pt.changePctFromPrev}%` : `${pt.changePctFromPrev}%`}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
