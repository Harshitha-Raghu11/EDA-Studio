import React, { useState, useMemo } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BookmarkPlus,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  Minus,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { DQISessionPoint } from "../types";

interface DQISparklineProps {
  sessionHistory: DQISessionPoint[];
  currentScore: number;
  onAddCheckpoint?: (name?: string) => void;
  onClearHistory?: () => void;
}

export const DQISparkline: React.FC<DQISparklineProps> = ({
  sessionHistory,
  currentScore,
  onAddCheckpoint,
  onClearHistory,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<"overall" | "completeness" | "uniqueness" | "consistency">("overall");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showHistoryTable, setShowHistoryTable] = useState(false);
  const [newCheckpointName, setNewCheckpointName] = useState("");
  const [isAddingCheckpoint, setIsAddingCheckpoint] = useState(false);

  // Extract metric values
  const points = useMemo(() => {
    if (!sessionHistory || sessionHistory.length === 0) return [];
    return sessionHistory.map((s, idx) => {
      let val = s.overallScore;
      if (selectedMetric === "completeness") val = s.completenessScore;
      if (selectedMetric === "uniqueness") val = s.uniquenessScore;
      if (selectedMetric === "consistency") val = s.consistencyScore;
      return {
        session: s,
        index: idx,
        value: val,
      };
    });
  }, [sessionHistory, selectedMetric]);

  // Calculations for sparkline geometry
  const width = 360;
  const height = 80;
  const padding = { top: 12, right: 16, bottom: 16, left: 16 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const minVal = useMemo(() => {
    if (points.length === 0) return 0;
    const min = Math.min(...points.map((p) => p.value));
    return Math.max(0, Math.floor(min / 10) * 10 - 5);
  }, [points]);

  const maxVal = useMemo(() => {
    if (points.length === 0) return 100;
    const max = Math.max(...points.map((p) => p.value));
    return Math.min(100, Math.ceil(max / 10) * 10 + 5);
  }, [points]);

  const yRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const getX = (index: number, total: number) => {
    if (total <= 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (total - 1)) * innerWidth;
  };

  const getY = (value: number) => {
    const norm = (value - minVal) / yRange;
    return height - padding.bottom - norm * innerHeight;
  };

  // Sparkline coordinates
  const sparklineData = useMemo(() => {
    if (points.length === 0) return { pathD: "", areaD: "", coords: [] };
    const coords = points.map((pt, i) => ({
      x: getX(i, points.length),
      y: getY(pt.value),
      pt,
    }));

    if (coords.length === 1) {
      const c = coords[0];
      return {
        pathD: `M ${c.x - 20} ${c.y} L ${c.x + 20} ${c.y}`,
        areaD: `M ${c.x - 20} ${c.y} L ${c.x + 20} ${c.y} L ${c.x + 20} ${height - padding.bottom} L ${c.x - 20} ${height - padding.bottom} Z`,
        coords,
      };
    }

    // Bezier curve generation
    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }

    const first = coords[0];
    const last = coords[coords.length - 1];
    const baseY = height - padding.bottom;
    const areaD = `${pathD} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;

    return { pathD, areaD, coords };
  }, [points, minVal, maxVal, height, padding]);

  // Delta calculations
  const deltaStats = useMemo(() => {
    if (points.length < 2) {
      return {
        diff: 0,
        pct: 0,
        direction: "stable" as const,
        firstVal: points[0]?.value ?? currentScore,
        lastVal: points[points.length - 1]?.value ?? currentScore,
      };
    }
    const firstVal = points[0].value;
    const lastVal = points[points.length - 1].value;
    const diff = lastVal - firstVal;
    const pct = firstVal > 0 ? (diff / firstVal) * 100 : 0;
    const direction = diff > 0 ? ("up" as const) : diff < 0 ? ("down" as const) : ("stable" as const);

    return {
      diff,
      pct: Number(pct.toFixed(1)),
      direction,
      firstVal,
      lastVal,
    };
  }, [points, currentScore]);

  const activeIndex = hoveredIndex !== null ? hoveredIndex : points.length - 1;
  const activePoint = points[activeIndex];

  const handleSaveCheckpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddCheckpoint) {
      onAddCheckpoint(newCheckpointName.trim() || undefined);
      setNewCheckpointName("");
      setIsAddingCheckpoint(false);
    }
  };

  const getMetricColor = () => {
    if (selectedMetric === "completeness") return { stroke: "#3b82f6", fill: "rgba(59, 130, 246, 0.15)", text: "text-blue-400" };
    if (selectedMetric === "uniqueness") return { stroke: "#a855f7", fill: "rgba(168, 85, 247, 0.15)", text: "text-purple-400" };
    if (selectedMetric === "consistency") return { stroke: "#10b981", fill: "rgba(16, 185, 129, 0.15)", text: "text-emerald-400" };
    return { stroke: "#06b6d4", fill: "rgba(6, 182, 212, 0.15)", text: "text-cyan-400" };
  };

  const colors = getMetricColor();

  return (
    <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 space-y-3.5">
      {/* Sparkline Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold text-white tracking-wide">DQI Session Trend</h4>
              <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                {sessionHistory.length} Session{sessionHistory.length !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Quality progression across analysis runs & data pipeline stages
            </p>
          </div>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 text-[10px]">
          <button
            type="button"
            onClick={() => setSelectedMetric("overall")}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              selectedMetric === "overall" ? "bg-cyan-500 text-slate-950 font-semibold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Composite DQI
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric("completeness")}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              selectedMetric === "completeness" ? "bg-blue-500 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Completeness
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric("uniqueness")}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              selectedMetric === "uniqueness" ? "bg-purple-500 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Uniqueness
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric("consistency")}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              selectedMetric === "consistency" ? "bg-emerald-500 text-slate-950 font-semibold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Consistency
          </button>
        </div>
      </div>

      {/* Main Sparkline Canvas & Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* SVG Mini Sparkline Chart */}
        <div className="md:col-span-8 bg-slate-900/80 border border-slate-800/80 rounded-lg p-2 relative overflow-hidden">
          <div className="relative w-full h-[80px]">
            <svg
              className="w-full h-full overflow-visible"
              viewBox={`0 0 ${width} ${height}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.stroke} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={colors.stroke} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Baseline Reference Grid */}
              <line
                x1={padding.left}
                y1={getY(90)}
                x2={width - padding.right}
                y2={getY(90)}
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.3"
              />
              <line
                x1={padding.left}
                y1={getY(75)}
                x2={width - padding.right}
                y2={getY(75)}
                stroke="#3b82f6"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.3"
              />

              {/* Sparkline Area */}
              {sparklineData.areaD && (
                <path d={sparklineData.areaD} fill="url(#sparkline-grad)" />
              )}

              {/* Sparkline Path */}
              {sparklineData.pathD && (
                <path
                  d={sparklineData.pathD}
                  fill="none"
                  stroke={colors.stroke}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Nodes */}
              {sparklineData.coords.map((coord, idx) => {
                const isHovered = hoveredIndex === idx;
                const isLast = idx === sparklineData.coords.length - 1;
                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Hit target */}
                    <circle cx={coord.x} cy={coord.y} r="10" fill="transparent" />
                    
                    {/* Outer glow for active/last point */}
                    {(isHovered || isLast) && (
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r="6"
                        fill={colors.stroke}
                        opacity="0.3"
                        className={isLast ? "animate-ping" : ""}
                      />
                    )}
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={isHovered ? "4" : isLast ? "3.5" : "2.5"}
                      fill={isHovered ? "#ffffff" : colors.stroke}
                      stroke="#0f172a"
                      strokeWidth="1.5"
                      className="transition-all duration-150"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Reference Baseline Labels */}
          <div className="flex justify-between items-center text-[9px] text-slate-500 px-1 pt-1 font-mono">
            <span>S1 (Baseline): {points[0]?.value ?? currentScore}%</span>
            <span>Grade A Threshold: 90%</span>
            <span>Latest: {points[points.length - 1]?.value ?? currentScore}%</span>
          </div>
        </div>

        {/* Sparkline Stat Summary Box */}
        <div className="md:col-span-4 bg-slate-900/80 border border-slate-800/80 rounded-lg p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Session Delta (Δ)</span>
            <div
              className={`flex items-center gap-1 font-mono font-bold text-xs ${
                deltaStats.direction === "up"
                  ? "text-emerald-400"
                  : deltaStats.direction === "down"
                  ? "text-rose-400"
                  : "text-slate-400"
              }`}
            >
              {deltaStats.direction === "up" && <ArrowUpRight className="w-3.5 h-3.5" />}
              {deltaStats.direction === "down" && <ArrowDownRight className="w-3.5 h-3.5" />}
              {deltaStats.direction === "stable" && <Minus className="w-3.5 h-3.5" />}
              <span>
                {deltaStats.diff > 0 ? `+${deltaStats.diff}` : deltaStats.diff} pts
              </span>
              <span className="text-[10px] font-normal opacity-80">
                ({deltaStats.pct > 0 ? `+${deltaStats.pct}` : deltaStats.pct}%)
              </span>
            </div>
          </div>

          {/* Hovered or Active Session Card */}
          {activePoint && (
            <div className="p-2 rounded bg-slate-950/80 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-200 truncate max-w-[140px]">
                  {activePoint.session.sessionName}
                </span>
                <span className="font-mono text-cyan-400 font-bold">
                  {activePoint.value}%
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>{activePoint.session.grade}</span>
                <span>{new Date(activePoint.session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          )}

          {/* Mini Action Row */}
          <div className="flex items-center justify-between pt-1 gap-2 border-t border-slate-800/80 text-[10px]">
            <button
              type="button"
              onClick={() => setShowHistoryTable((prev) => !prev)}
              className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <History className="w-3 h-3 text-blue-400" />
              <span>{showHistoryTable ? "Hide History" : "Audit History"}</span>
              {showHistoryTable ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
            </button>

            {onAddCheckpoint && (
              <button
                type="button"
                onClick={() => setIsAddingCheckpoint(true)}
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <BookmarkPlus className="w-3 h-3" />
                <span>Log Checkpoint</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline Add Checkpoint Form */}
      {isAddingCheckpoint && (
        <form
          onSubmit={handleSaveCheckpoint}
          className="p-2.5 bg-slate-900 border border-cyan-500/30 rounded-lg flex items-center gap-2 text-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <input
            type="text"
            value={newCheckpointName}
            onChange={(e) => setNewCheckpointName(e.target.value)}
            placeholder="Checkpoint label (e.g., Post-Outlier Winsorization)..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 outline-none text-xs placeholder-slate-500"
            autoFocus
          />
          <button
            type="submit"
            className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold rounded text-xs transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsAddingCheckpoint(false)}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Expandable Session History Audit Table */}
      {showHistoryTable && (
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Analysis Sessions Log</span>
            {onClearHistory && sessionHistory.length > 1 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="text-[10px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset to Baseline</span>
              </button>
            )}
          </div>

          <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-[11px] text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-semibold sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2">Session / Stage</th>
                  <th className="px-2.5 py-2">Trigger</th>
                  <th className="px-2.5 py-2">DQI Score</th>
                  <th className="px-2.5 py-2">Completeness</th>
                  <th className="px-2.5 py-2">Uniqueness</th>
                  <th className="px-2.5 py-2">Consistency</th>
                  <th className="px-2.5 py-2 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950/60 font-mono">
                {sessionHistory.map((s, idx) => {
                  const isCurrent = idx === sessionHistory.length - 1;
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isCurrent ? "bg-cyan-500/5 font-semibold text-white" : ""
                      }`}
                    >
                      <td className="px-3 py-1.5 font-sans flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{s.sessionName}</span>
                        {isCurrent && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-2.5 py-1.5 font-sans text-slate-400 text-[10px]">
                        {s.actionTrigger || "Manual Checkpoint"}
                      </td>
                      <td className="px-2.5 py-1.5">
                        <span
                          className={`font-bold ${
                            s.overallScore >= 90
                              ? "text-emerald-400"
                              : s.overallScore >= 75
                              ? "text-blue-400"
                              : s.overallScore >= 55
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          {s.overallScore}
                        </span>
                        <span className="text-[9px] text-slate-500 ml-1 font-normal">({s.grade})</span>
                      </td>
                      <td className="px-2.5 py-1.5 text-blue-400">{s.completenessScore}%</td>
                      <td className="px-2.5 py-1.5 text-purple-400">{s.uniquenessScore}%</td>
                      <td className="px-2.5 py-1.5 text-emerald-400">{s.consistencyScore}%</td>
                      <td className="px-2.5 py-1.5 text-right text-slate-500 text-[10px]">
                        {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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
