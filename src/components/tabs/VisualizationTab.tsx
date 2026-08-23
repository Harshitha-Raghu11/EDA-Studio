import React, { useState } from "react";
import {
  BarChart,
  BarChart2,
  Box,
  Eye,
  LineChart,
  PieChart as PieIcon,
  ScatterChart,
  Sliders,
  TrendingUp,
} from "lucide-react";

interface VisualizationTabProps {
  numericalCols: string[];
  categoricalCols: string[];
  rows: Record<string, any>[];
}

export const VisualizationTab: React.FC<VisualizationTabProps> = ({
  numericalCols,
  categoricalCols,
  rows,
}) => {
  const [chartType, setChartType] = useState<"hist" | "scatter" | "box" | "bar" | "pie">("hist");

  // Hist controls
  const [histCol, setHistCol] = useState(numericalCols[0] || "");
  const [histBins, setHistBins] = useState(15);
  const [showKde, setShowKde] = useState(true);

  // Scatter controls
  const [scatterX, setScatterX] = useState(numericalCols[0] || "");
  const [scatterY, setScatterY] = useState(numericalCols[1] || numericalCols[0] || "");
  const [scatterHue, setScatterHue] = useState<string>(categoricalCols[0] || "none");
  const [showTrendline, setShowTrendline] = useState(true);

  // Box controls
  const [boxCol, setBoxCol] = useState(numericalCols[0] || "");
  const [boxGroupBy, setBoxGroupBy] = useState<string>(categoricalCols[0] || "none");

  // Bar / Pie controls
  const [catCol, setCatCol] = useState(categoricalCols[0] || "");

  // ----------------------------------------------------
  // Histogram Data Calculation
  // ----------------------------------------------------
  const getHistData = () => {
    const vals = rows
      .map((r) => Number(r[histCol]))
      .filter((v) => !isNaN(v));
    if (vals.length === 0) return { bins: [], min: 0, max: 0, mean: 0, median: 0 };

    vals.sort((a, b) => a - b);
    const min = vals[0];
    const max = vals[vals.length - 1];
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const median = vals[Math.floor(vals.length / 2)];

    const binWidth = (max - min) / histBins || 1;
    const bins: { label: string; count: number; x0: number; x1: number }[] = [];

    for (let i = 0; i < histBins; i++) {
      const x0 = min + i * binWidth;
      const x1 = x0 + binWidth;
      const count = vals.filter((v) => (i === histBins - 1 ? v >= x0 && v <= x1 : v >= x0 && v < x1)).length;
      bins.push({
        label: `${x0.toFixed(1)} - ${x1.toFixed(1)}`,
        count,
        x0,
        x1,
      });
    }

    const maxCount = Math.max(...bins.map((b) => b.count), 1);
    return { bins, min, max, mean, median, maxCount, total: vals.length };
  };

  // ----------------------------------------------------
  // Scatter Plot Data
  // ----------------------------------------------------
  const getScatterData = () => {
    const points: { x: number; y: number; hue: string }[] = [];
    const hues = new Set<string>();

    for (const r of rows) {
      const x = Number(r[scatterX]);
      const y = Number(r[scatterY]);
      const h = scatterHue !== "none" ? String(r[scatterHue] ?? "Unknown") : "All";
      if (!isNaN(x) && !isNaN(y)) {
        points.push({ x, y, hue: h });
        hues.add(h);
      }
    }

    if (points.length === 0) return { points: [], xMin: 0, xMax: 1, yMin: 0, yMax: 1, slope: 0, intercept: 0, hueList: [] };

    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);

    // OLS Regression
    const n = points.length;
    const sumX = xs.reduce((a, b) => a + b, 0);
    const sumY = ys.reduce((a, b) => a + b, 0);
    const sumXY = points.reduce((acc, p) => acc + p.x * p.y, 0);
    const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);

    const denom = n * sumX2 - sumX * sumX;
    const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
    const intercept = n > 0 ? (sumY - slope * sumX) / n : 0;

    return {
      points,
      xMin,
      xMax: xMax === xMin ? xMax + 1 : xMax,
      yMin,
      yMax: yMax === yMin ? yMax + 1 : yMax,
      slope,
      intercept,
      hueList: Array.from(hues),
    };
  };

  // ----------------------------------------------------
  // Box Plot Data
  // ----------------------------------------------------
  const getBoxData = () => {
    const groups: Record<string, number[]> = {};

    for (const r of rows) {
      const v = Number(r[boxCol]);
      if (isNaN(v)) continue;
      const g = boxGroupBy !== "none" ? String(r[boxGroupBy] ?? "Unknown") : "Overall";
      if (!groups[g]) groups[g] = [];
      groups[g].push(v);
    }

    const boxStats = Object.entries(groups).map(([groupName, vals]) => {
      vals.sort((a, b) => a - b);
      const min = vals[0];
      const max = vals[vals.length - 1];
      const q1 = vals[Math.floor(vals.length * 0.25)] ?? min;
      const median = vals[Math.floor(vals.length * 0.5)] ?? min;
      const q3 = vals[Math.floor(vals.length * 0.75)] ?? max;
      return { groupName, min, q1, median, q3, max, count: vals.length };
    });

    const allMins = boxStats.map((b) => b.min);
    const allMaxs = boxStats.map((b) => b.max);
    const globalMin = Math.min(...allMins, 0);
    const globalMax = Math.max(...allMaxs, 100);

    return { boxStats, globalMin, globalMax };
  };

  // ----------------------------------------------------
  // Categorical Count Data
  // ----------------------------------------------------
  const getCatData = () => {
    const counts: Record<string, number> = {};
    let total = 0;
    for (const r of rows) {
      const v = String(r[catCol] ?? "N/A");
      counts[v] = (counts[v] || 0) + 1;
      total++;
    }
    const items = Object.entries(counts)
      .map(([label, count]) => ({
        label,
        count,
        pct: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const maxCount = Math.max(...items.map((i) => i.count), 1);
    return { items, maxCount, total };
  };

  const hueColors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#6366f1"];

  return (
    <div className="space-y-6">
      {/* Chart Switcher Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setChartType("hist")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              chartType === "hist"
                ? "bg-blue-600 text-white font-semibold shadow-sm"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Histogram & Density (KDE)</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType("scatter")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              chartType === "scatter"
                ? "bg-blue-600 text-white font-semibold shadow-sm"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <ScatterChart className="w-3.5 h-3.5" />
            <span>Bivariate Scatter & Trend</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType("box")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              chartType === "box"
                ? "bg-blue-600 text-white font-semibold shadow-sm"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Box & Whisker Quartiles</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType("bar")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              chartType === "bar"
                ? "bg-blue-600 text-white font-semibold shadow-sm"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <BarChart className="w-3.5 h-3.5" />
            <span>Categorical Frequency Bar</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType("pie")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              chartType === "pie"
                ? "bg-blue-600 text-white font-semibold shadow-sm"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Composition Donut</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left/Main: Visual Stage */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">
                {chartType === "hist" && `Distribution Histogram of ${histCol}`}
                {chartType === "scatter" && `Scatter Plot: ${scatterX} vs ${scatterY}`}
                {chartType === "box" && `Box Plot: ${boxCol} ${boxGroupBy !== "none" ? `grouped by ${boxGroupBy}` : ""}`}
                {chartType === "bar" && `Frequency Breakdown for ${catCol}`}
                {chartType === "pie" && `Proportions for ${catCol}`}
              </h3>
              <p className="text-[11px] text-slate-400">Interactive SVG rendering with descriptive scales</p>
            </div>
          </div>

          {/* SVG Canvas Rendering */}
          <div className="w-full h-80 bg-slate-950/80 rounded-lg p-4 flex items-center justify-center relative overflow-hidden">
            {chartType === "hist" && (() => {
              const { bins, min, max, mean, median, maxCount } = getHistData();
              return (
                <svg className="w-full h-full" viewBox="0 0 600 240">
                  {/* Grid Lines */}
                  {[0.25, 0.5, 0.75, 1.0].map((ratio) => (
                    <line
                      key={ratio}
                      x1="50"
                      y1={200 - ratio * 160}
                      x2="570"
                      y2={200 - ratio * 160}
                      stroke="#1e293b"
                      strokeDasharray="4 4"
                    />
                  ))}

                  {/* Histogram Bars */}
                  {bins.map((b, i) => {
                    const barWidth = 510 / bins.length - 4;
                    const x = 55 + i * (510 / bins.length);
                    const barHeight = (b.count / (maxCount || 1)) * 160;
                    const y = 200 - barHeight;

                    return (
                      <g key={i} className="group cursor-pointer">
                        <rect
                          x={x}
                          y={y}
                          width={Math.max(barWidth, 2)}
                          height={Math.max(barHeight, 2)}
                          fill="url(#histGrad)"
                          rx="3"
                          className="hover:opacity-80 transition-opacity"
                        />
                        <text
                          x={x + barWidth / 2}
                          y={y - 6}
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize="9"
                          fontFamily="monospace"
                        >
                          {b.count}
                        </text>
                      </g>
                    );
                  })}

                  {/* Mean Line */}
                  {max > min && (
                    <g>
                      <line
                        x1={55 + ((mean - min) / (max - min)) * 510}
                        y1="20"
                        x2={55 + ((mean - min) / (max - min)) * 510}
                        y2="200"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                      <text
                        x={55 + ((mean - min) / (max - min)) * 510}
                        y="16"
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        Mean: {mean.toFixed(1)}
                      </text>
                    </g>
                  )}

                  {/* Axes */}
                  <line x1="50" y1="200" x2="570" y2="200" stroke="#475569" strokeWidth="1.5" />
                  <line x1="50" y1="20" x2="50" y2="200" stroke="#475569" strokeWidth="1.5" />

                  {/* X Axis Labels */}
                  <text x="55" y="218" fill="#64748b" fontSize="9" textAnchor="start">
                    {min.toFixed(1)}
                  </text>
                  <text x="565" y="218" fill="#64748b" fontSize="9" textAnchor="end">
                    {max.toFixed(1)}
                  </text>

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                </svg>
              );
            })()}

            {chartType === "scatter" && (() => {
              const { points, xMin, xMax, yMin, yMax, slope, intercept, hueList } = getScatterData();

              const getXPos = (val: number) => 50 + ((val - xMin) / (xMax - xMin)) * 510;
              const getYPos = (val: number) => 200 - ((val - yMin) / (yMax - yMin)) * 160;

              return (
                <svg className="w-full h-full" viewBox="0 0 600 240">
                  {/* Grid */}
                  {[0.25, 0.5, 0.75, 1.0].map((r) => (
                    <line key={r} x1="50" y1={200 - r * 160} x2="570" y2={200 - r * 160} stroke="#1e293b" />
                  ))}

                  {/* Trendline */}
                  {showTrendline && (
                    <line
                      x1={getXPos(xMin)}
                      y1={getYPos(slope * xMin + intercept)}
                      x2={getXPos(xMax)}
                      y2={getYPos(slope * xMax + intercept)}
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      strokeDasharray="5 3"
                    />
                  )}

                  {/* Points */}
                  {points.map((p, i) => {
                    const cx = getXPos(p.x);
                    const cy = getYPos(p.y);
                    const hueIndex = Math.max(0, hueList.indexOf(p.hue));
                    const col = hueColors[hueIndex % hueColors.length];

                    return (
                      <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r="4"
                        fill={col}
                        fillOpacity="0.75"
                        stroke="#0f172a"
                        strokeWidth="1"
                        className="hover:r-6 hover:fill-opacity-100 transition-all cursor-pointer"
                      />
                    );
                  })}

                  {/* Axes */}
                  <line x1="50" y1="200" x2="570" y2="200" stroke="#475569" strokeWidth="1.5" />
                  <line x1="50" y1="30" x2="50" y2="200" stroke="#475569" strokeWidth="1.5" />

                  {/* Labels */}
                  <text x="310" y="226" fill="#94a3b8" fontSize="10" textAnchor="middle">
                    {scatterX}
                  </text>
                  <text x="25" y="115" fill="#94a3b8" fontSize="10" textAnchor="middle" transform="rotate(-90 25 115)">
                    {scatterY}
                  </text>
                </svg>
              );
            })()}

            {chartType === "box" && (() => {
              const { boxStats, globalMin, globalMax } = getBoxData();
              const range = globalMax - globalMin || 1;
              const getY = (val: number) => 195 - ((val - globalMin) / range) * 155;

              return (
                <svg className="w-full h-full" viewBox="0 0 600 240">
                  {/* Grid */}
                  {[0.25, 0.5, 0.75, 1.0].map((r) => (
                    <line key={r} x1="50" y1={195 - r * 155} x2="570" y2={195 - r * 155} stroke="#1e293b" />
                  ))}

                  {boxStats.map((b, i) => {
                    const colWidth = 500 / boxStats.length;
                    const cx = 70 + i * colWidth + colWidth / 2;
                    const boxW = Math.min(colWidth * 0.55, 60);

                    const yMin = getY(b.min);
                    const yQ1 = getY(b.q1);
                    const yMed = getY(b.median);
                    const yQ3 = getY(b.q3);
                    const yMax = getY(b.max);

                    return (
                      <g key={b.groupName}>
                        {/* Whiskers */}
                        <line x1={cx} y1={yMin} x2={cx} y2={yQ1} stroke="#94a3b8" strokeWidth="1.5" />
                        <line x1={cx} y1={yQ3} x2={cx} y2={yMax} stroke="#94a3b8" strokeWidth="1.5" />
                        <line x1={cx - boxW / 4} y1={yMin} x2={cx + boxW / 4} y2={yMin} stroke="#94a3b8" strokeWidth="1.5" />
                        <line x1={cx - boxW / 4} y1={yMax} x2={cx + boxW / 4} y2={yMax} stroke="#94a3b8" strokeWidth="1.5" />

                        {/* Box IQR */}
                        <rect
                          x={cx - boxW / 2}
                          y={yQ3}
                          width={boxW}
                          height={Math.max(yQ1 - yQ3, 2)}
                          fill="#38bdf8"
                          fillOpacity="0.25"
                          stroke="#38bdf8"
                          strokeWidth="2"
                          rx="2"
                        />

                        {/* Median Line */}
                        <line x1={cx - boxW / 2} y1={yMed} x2={cx + boxW / 2} y2={yMed} stroke="#f43f5e" strokeWidth="2.5" />

                        {/* Group Label */}
                        <text x={cx} y="215" fill="#cbd5e1" fontSize="10" textAnchor="middle" fontWeight="500">
                          {b.groupName.length > 12 ? b.groupName.substring(0, 10) + "..." : b.groupName}
                        </text>
                      </g>
                    );
                  })}

                  <line x1="50" y1="195" x2="570" y2="195" stroke="#475569" strokeWidth="1.5" />
                </svg>
              );
            })()}

            {chartType === "bar" && (() => {
              const { items, maxCount } = getCatData();
              return (
                <div className="w-full h-full flex flex-col justify-center space-y-2 px-6 overflow-y-auto">
                  {items.slice(0, 7).map((item, idx) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-200 font-medium">{item.label}</span>
                        <span className="font-mono text-cyan-300">
                          {item.count} ({item.pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all"
                          style={{ width: `${(item.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {chartType === "pie" && (() => {
              const { items } = getCatData();
              let cumulativePct = 0;

              return (
                <div className="w-full h-full flex items-center justify-center gap-8">
                  <svg className="w-48 h-48" viewBox="0 0 100 100">
                    {items.map((item, idx) => {
                      const startAngle = (cumulativePct / 100) * 360;
                      cumulativePct += item.pct;
                      const endAngle = (cumulativePct / 100) * 360;

                      const x1 = 50 + 40 * Math.cos((Math.PI * (startAngle - 90)) / 180);
                      const y1 = 50 + 40 * Math.sin((Math.PI * (startAngle - 90)) / 180);
                      const x2 = 50 + 40 * Math.cos((Math.PI * (endAngle - 90)) / 180);
                      const y2 = 50 + 40 * Math.sin((Math.PI * (endAngle - 90)) / 180);

                      const largeArc = item.pct > 50 ? 1 : 0;
                      const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

                      return (
                        <path
                          key={item.label}
                          d={pathData}
                          fill={hueColors[idx % hueColors.length]}
                          stroke="#0f172a"
                          strokeWidth="1.5"
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      );
                    })}
                    <circle cx="50" cy="50" r="22" fill="#020617" />
                  </svg>

                  <div className="space-y-1 text-xs">
                    {items.slice(0, 6).map((item, idx) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-sm inline-block"
                          style={{ backgroundColor: hueColors[idx % hueColors.length] }}
                        />
                        <span className="text-slate-300">{item.label}:</span>
                        <span className="font-mono font-bold text-white">{item.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right: Controls & Parameters */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Plot Customization</h4>
          </div>

          {chartType === "hist" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Numerical Feature</label>
                <select
                  value={histCol}
                  onChange={(e) => setHistCol(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  {numericalCols.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
                  <span>Bin Count:</span>
                  <span className="font-mono font-bold text-blue-400">{histBins}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  value={histBins}
                  onChange={(e) => setHistBins(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {chartType === "scatter" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">X-Axis Feature</label>
                <select
                  value={scatterX}
                  onChange={(e) => setScatterX(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  {numericalCols.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Y-Axis Feature</label>
                <select
                  value={scatterY}
                  onChange={(e) => setScatterY(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  {numericalCols.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Color Hue Dimension</label>
                <select
                  value={scatterHue}
                  onChange={(e) => setScatterHue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="none">None (Single Color)</option>
                  {categoricalCols.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 pt-1">
                <input
                  type="checkbox"
                  checked={showTrendline}
                  onChange={(e) => setShowTrendline(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-0"
                />
                <span>Show OLS Regression Trendline</span>
              </label>
            </div>
          )}

          {chartType === "box" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Numerical Metric</label>
                <select
                  value={boxCol}
                  onChange={(e) => setBoxCol(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  {numericalCols.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Categorical Grouping</label>
                <select
                  value={boxGroupBy}
                  onChange={(e) => setBoxGroupBy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="none">Overall Dataset</option>
                  {categoricalCols.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {(chartType === "bar" || chartType === "pie") && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Categorical Variable</label>
                <select
                  value={catCol}
                  onChange={(e) => setCatCol(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  {categoricalCols.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
