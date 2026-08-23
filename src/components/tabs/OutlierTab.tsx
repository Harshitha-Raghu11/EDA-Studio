import React, { useState } from "react";
import {
  AlertOctagon,
  CheckCircle,
  HelpCircle,
  Scissors,
  ShieldAlert,
  Sliders,
  Sparkles,
} from "lucide-react";
import { OutlierMetric } from "../../types";

interface OutlierTabProps {
  outlierMetrics: OutlierMetric[];
  rows: Record<string, any>[];
  headers: string[];
  onWinsorize: () => void;
  onUpdateThresholds: (iqrMult: number, zThresh: number) => void;
}

export const OutlierTab: React.FC<OutlierTabProps> = ({
  outlierMetrics,
  rows,
  headers,
  onWinsorize,
  onUpdateThresholds,
}) => {
  const [iqrMultiplier, setIqrMultiplier] = useState(1.5);
  const [zThreshold, setZThreshold] = useState(3.0);
  const [selectedFeature, setSelectedFeature] = useState(outlierMetrics[0]?.feature || "");

  const handleApplyParams = (newIqr: number, newZ: number) => {
    setIqrMultiplier(newIqr);
    setZThreshold(newZ);
    onUpdateThresholds(newIqr, newZ);
  };

  const activeMetric = outlierMetrics.find((m) => m.feature === selectedFeature) || outlierMetrics[0];

  const flaggedRows = activeMetric
    ? activeMetric.outlierRowIndices.map((idx) => ({ ...rows[idx], _rowIndex: idx + 1 }))
    : [];

  const totalAnomalies = outlierMetrics.reduce((sum, m) => sum + m.iqrCount, 0);

  return (
    <div className="space-y-6">
      {/* Control Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h3 className="text-sm font-semibold text-white">Statistical Anomaly & Outlier Diagnostics</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Benchmark Tukey&apos;s Interquartile Range (IQR) method against parametric Gaussian Z-score thresholds
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onWinsorize}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-900/20 transition-all"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Winsorize / Clip Bounds</span>
            </button>
          </div>
        </div>

        {/* Param Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Tukey IQR Multiplier:</span>
              <span className="font-mono font-bold text-blue-400">{iqrMultiplier}x IQR</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.5"
              value={iqrMultiplier}
              onChange={(e) => handleApplyParams(Number(e.target.value), zThreshold)}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1.0x (Aggressive)</span>
              <span>1.5x (Standard Tukey)</span>
              <span>3.0x (Extreme Anomaly)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Standard Deviation Z-Score Threshold:</span>
              <span className="font-mono font-bold text-blue-400">|Z| &gt; {zThreshold}σ</span>
            </div>
            <input
              type="range"
              min="2.0"
              max="4.0"
              step="0.5"
              value={zThreshold}
              onChange={(e) => handleApplyParams(iqrMultiplier, Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>2.0σ (95.4% Coverage)</span>
              <span>3.0σ (99.7% Gaussian)</span>
              <span>4.0σ (Rare Tail)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Anomaly Summary Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
            Outlier Distribution by Numerical Feature
          </h4>
          <span className="text-xs text-rose-400 font-mono bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
            {totalAnomalies} Total Anomaly Points
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Feature</th>
                <th className="px-4 py-3">IQR Lower Limit</th>
                <th className="px-4 py-3">IQR Upper Limit</th>
                <th className="px-4 py-3">IQR Outlier Count</th>
                <th className="px-4 py-3">IQR % of Data</th>
                <th className="px-4 py-3">Z-Score Outliers (&gt;{zThreshold}σ)</th>
                <th className="px-4 py-3">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {outlierMetrics.map((m) => (
                <tr key={m.feature} className="hover:bg-slate-800/40">
                  <td className="px-4 py-2.5 font-mono font-medium text-blue-400">{m.feature}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-300">{m.iqrLower}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-300">{m.iqrUpper}</td>
                  <td className="px-4 py-2.5 font-mono">
                    <span
                      className={`font-bold ${
                        m.iqrCount > 0 ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {m.iqrCount}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono">
                    <span
                      className={
                        m.iqrPercentage > 5 ? "text-rose-400 font-bold" : "text-slate-300"
                      }
                    >
                      {m.iqrPercentage}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-blue-400">{m.zCount}</td>
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedFeature(m.feature)}
                      className={`px-2.5 py-1 rounded text-xs transition-colors ${
                        selectedFeature === m.feature
                          ? "bg-blue-600 text-white font-bold"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      Inspect Rows
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outlier Row Inspector */}
      {activeMetric && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                Flagged Observations for `{activeMetric.feature}`
              </h4>
              <p className="text-xs text-slate-400">
                Displaying {flaggedRows.length} rows exceeding boundaries [{activeMetric.iqrLower}, {activeMetric.iqrUpper}]
              </p>
            </div>
          </div>

          {flaggedRows.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
              <span>No outlier observations detected in `{activeMetric.feature}` at the current threshold.</span>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 sticky top-0 uppercase text-[11px] font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-2.5 text-slate-500 w-16">Row #</th>
                    <th className="px-3 py-2.5 font-mono text-rose-400 font-bold bg-rose-500/10">
                      {activeMetric.feature} (Flagged)
                    </th>
                    {headers
                      .filter((h) => h !== activeMetric.feature)
                      .slice(0, 7)
                      .map((h) => (
                        <th key={h} className="px-3 py-2.5 font-mono whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {flaggedRows.map((row) => (
                    <tr key={row._rowIndex} className="hover:bg-slate-800/40">
                      <td className="px-3 py-2 text-slate-500 font-mono text-[11px]">{row._rowIndex}</td>
                      <td className="px-3 py-2 font-mono font-bold text-rose-400 bg-rose-500/10 whitespace-nowrap text-[11px]">
                        {String(row[activeMetric.feature])}
                      </td>
                      {headers
                        .filter((h) => h !== activeMetric.feature)
                        .slice(0, 7)
                        .map((h) => (
                          <td key={h} className="px-3 py-2 font-mono whitespace-nowrap text-[11px] text-slate-300">
                            {String(row[h])}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
