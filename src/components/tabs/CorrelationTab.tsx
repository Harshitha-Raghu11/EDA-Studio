import React, { useState } from "react";
import {
  ArrowUpDown,
  Filter,
  Grid,
  Info,
  Network,
  Sparkles,
} from "lucide-react";
import { CorrelationPair } from "../../types";

interface CorrelationTabProps {
  numericalCols: string[];
  correlationMatrix: Record<string, Record<string, number>>;
  correlationPairs: CorrelationPair[];
  onMethodChange: (method: "pearson" | "spearman") => void;
  currentMethod: "pearson" | "spearman";
}

export const CorrelationTab: React.FC<CorrelationTabProps> = ({
  numericalCols,
  correlationMatrix,
  correlationPairs,
  onMethodChange,
  currentMethod,
}) => {
  const [minThreshold, setMinThreshold] = useState(0.2);

  const filteredPairs = correlationPairs.filter((p) => p.absR >= minThreshold);

  // Helper to color correlation cells
  const getCellBg = (r: number) => {
    if (r === 1) return "bg-blue-600 text-white font-bold";
    if (r > 0.7) return "bg-blue-500 text-white font-bold";
    if (r > 0.4) return "bg-blue-600/40 text-blue-200 font-semibold";
    if (r > 0.1) return "bg-blue-900/30 text-blue-300";
    if (r < -0.7) return "bg-rose-600 text-white font-bold";
    if (r < -0.4) return "bg-rose-600/40 text-rose-200 font-semibold";
    if (r < -0.1) return "bg-rose-900/30 text-rose-300";
    return "bg-slate-950/60 text-slate-400";
  };

  return (
    <div className="space-y-6">
      {/* Configuration Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Correlation Discovery & Collinearity Matrix</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify linear (Pearson) and non-linear monotonic (Spearman) dependencies between features
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Method selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => onMethodChange("pearson")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                currentMethod === "pearson"
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Pearson (Linear)
            </button>
            <button
              type="button"
              onClick={() => onMethodChange("spearman")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                currentMethod === "spearman"
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Spearman (Rank-Order)
            </button>
          </div>

          {/* Threshold slider */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Min |r|:</span>
            <input
              type="range"
              min="0.0"
              max="0.8"
              step="0.05"
              value={minThreshold}
              onChange={(e) => setMinThreshold(Number(e.target.value))}
              className="w-20 accent-blue-500 cursor-pointer"
            />
            <span className="font-mono font-bold text-blue-400">{minThreshold.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Interactive Correlation Heatmap Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              {currentMethod.toUpperCase()} Correlation Heatmap
            </h4>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              <span>Negative (-1.0)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-700" />
              <span>Neutral (0.0)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
              <span>Positive (+1.0)</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="text-center text-xs border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-slate-400 font-mono">Feature</th>
                {numericalCols.map((col) => (
                  <th key={col} className="p-2 text-slate-300 font-mono text-[11px] max-w-[90px] truncate">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {numericalCols.map((rowCol) => (
                <tr key={rowCol}>
                  <td className="p-2 text-left font-mono font-medium text-blue-400 text-[11px] whitespace-nowrap">
                    {rowCol}
                  </td>
                  {numericalCols.map((colCol) => {
                    const r = correlationMatrix[rowCol]?.[colCol] ?? 0;
                    return (
                      <td key={colCol} className="p-1">
                        <div
                          className={`w-14 h-10 flex items-center justify-center rounded text-xs font-mono transition-transform hover:scale-105 cursor-pointer ${getCellBg(
                            r
                          )}`}
                          title={`${rowCol} vs ${colCol}: r = ${r}`}
                        >
                          {r.toFixed(2)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Ranked Correlated Pairs with Narrative Insights */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Significant Pairwise Relationships (|r| ≥ {minThreshold.toFixed(2)})
            </h4>
            <p className="text-xs text-slate-400">Automated relationship classifications and domain findings</p>
          </div>
          <span className="text-xs text-blue-400 font-mono bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
            {filteredPairs.length} Significant Pairs
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {filteredPairs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No feature pairs meet the correlation threshold of |r| ≥ {minThreshold.toFixed(2)}. Lower the threshold slider above.
            </div>
          ) : (
            filteredPairs.map((pair, idx) => (
              <div key={idx} className="p-4 hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-blue-400 text-xs">{pair.feature1}</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono font-medium text-blue-400 text-xs">{pair.feature2}</span>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        pair.r > 0
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {pair.relationshipCategory}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{pair.narrative}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Coefficient</span>
                    <p
                      className={`text-lg font-mono font-light ${
                        pair.r > 0 ? "text-blue-400" : "text-rose-400"
                      }`}
                    >
                      {pair.r > 0 ? `+${pair.r.toFixed(3)}` : pair.r.toFixed(3)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
