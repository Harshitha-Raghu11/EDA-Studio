import React, { useState } from "react";
import {
  Binary,
  Cpu,
  Divide,
  Layers,
  Plus,
  Scale,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface FeatureEngTabProps {
  numericalCols: string[];
  categoricalCols: string[];
  headers: string[];
  rows: Record<string, any>[];
  onEncodeCat: (col: string, method: "onehot" | "label") => void;
  onScaleNum: (col: string, method: "standard" | "minmax") => void;
  onLogTransform: (col: string) => void;
  onCreateRatio: (colA: string, colB: string, name: string) => void;
  engineeredCols: string[];
}

export const FeatureEngTab: React.FC<FeatureEngTabProps> = ({
  numericalCols,
  categoricalCols,
  headers,
  rows,
  onEncodeCat,
  onScaleNum,
  onLogTransform,
  onCreateRatio,
  engineeredCols,
}) => {
  // Encoding state
  const [catToEncode, setCatToEncode] = useState(categoricalCols[0] || "");
  const [encodeMethod, setEncodeMethod] = useState<"onehot" | "label">("onehot");

  // Scaling state
  const [numToScale, setNumToScale] = useState(numericalCols[0] || "");
  const [scaleMethod, setScaleMethod] = useState<"standard" | "minmax">("standard");

  // Log state
  const [numToLog, setNumToLog] = useState(numericalCols[0] || "");

  // Ratio state
  const [ratioColA, setRatioColA] = useState(numericalCols[1] || numericalCols[0] || "");
  const [ratioColB, setRatioColB] = useState(numericalCols[0] || "");
  const [ratioName, setRatioName] = useState("custom_ratio_feature");

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Cpu className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Feature Engineering & Machine Learning Preprocessing</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Transform raw columns into model-ready features with one-hot encoding, normalization, log-transforms, and custom ratios.
            </p>
          </div>
        </div>

        {/* 4 Feature Engineering Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {/* 1. Categorical Encoding */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Binary className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Categorical Encoding</h4>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Categorical Feature:</label>
                <select
                  value={catToEncode}
                  onChange={(e) => setCatToEncode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  {categoricalCols.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Encoding Method:</label>
                <select
                  value={encodeMethod}
                  onChange={(e: any) => setEncodeMethod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="onehot">One-Hot Dummy Variables (k-1 levels)</option>
                  <option value="label">Ordinal / Integer Label Encoding</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => onEncodeCat(catToEncode, encodeMethod)}
                className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-900/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Apply Encoding to `{catToEncode}`</span>
              </button>
            </div>
          </div>

          {/* 2. Numerical Scaling */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Feature Scaling & Normalization</h4>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Numerical Feature:</label>
                <select
                  value={numToScale}
                  onChange={(e) => setNumToScale(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  {numericalCols.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Scaler Algorithm:</label>
                <select
                  value={scaleMethod}
                  onChange={(e: any) => setScaleMethod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  <option value="standard">StandardScaler (Mean = 0, Std = 1)</option>
                  <option value="minmax">MinMaxScaler (Normalized to [0, 1])</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => onScaleNum(numToScale, scaleMethod)}
                className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-900/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Scale Feature `{numToScale}`</span>
              </button>
            </div>
          </div>

          {/* 3. Non-Linear Log Transformation */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Log Transformation (log1p)</h4>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Right-Skewed Feature:</label>
                <select
                  value={numToLog}
                  onChange={(e) => setNumToLog(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                >
                  {numericalCols.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Applies natural log $ln(1 + x)$ to compress heavy long-tail skewness.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onLogTransform(numToLog)}
                className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-900/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Apply Log Transform to `{numToLog}`</span>
              </button>
            </div>
          </div>

          {/* 4. Ratio / Interaction Builder */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Divide className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Interaction / Ratio Feature</h4>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Numerator (A):</label>
                  <select
                    value={ratioColA}
                    onChange={(e) => setRatioColA(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                  >
                    {numericalCols.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Denominator (B):</label>
                  <select
                    value={ratioColB}
                    onChange={(e) => setRatioColB(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                  >
                    {numericalCols.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">New Feature Name:</label>
                <input
                  type="text"
                  value={ratioName}
                  onChange={(e) => setRatioName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none font-mono focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={() => onCreateRatio(ratioColA, ratioColB, ratioName)}
                className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-900/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Ratio ({ratioColA} / {ratioColB})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Engineered Columns Live Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Engineered Feature Matrix (First 10 Rows)
            </h4>
            <p className="text-xs text-slate-400">
              Total Columns: {headers.length} ({engineeredCols.length} newly engineered)
            </p>
          </div>

          {engineeredCols.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400">Added:</span>
              {engineeredCols.map((col) => (
                <span
                  key={col}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20"
                >
                  {col}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-3 py-2.5 text-slate-500 w-12">#</th>
                {headers.map((h) => {
                  const isEng = engineeredCols.includes(h);
                  return (
                    <th
                      key={h}
                      className={`px-3 py-2.5 font-mono whitespace-nowrap ${
                        isEng ? "text-blue-400 bg-blue-500/10 font-bold" : ""
                      }`}
                    >
                      {h}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.slice(0, 10).map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="px-3 py-2 text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                  {headers.map((h) => {
                    const isEng = engineeredCols.includes(h);
                    return (
                      <td
                        key={h}
                        className={`px-3 py-2 font-mono whitespace-nowrap text-[11px] ${
                          isEng ? "text-blue-300 bg-blue-500/5 font-semibold" : ""
                        }`}
                      >
                        {String(row[h] ?? "")}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
