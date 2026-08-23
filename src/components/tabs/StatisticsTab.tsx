import React, { useState } from "react";
import {
  Activity,
  Calculator,
  Compass,
  PieChart,
  SlidersHorizontal,
} from "lucide-react";
import { CategoricalStat, ParametricStat } from "../../types";

interface StatisticsTabProps {
  parametricStats: ParametricStat[];
  categoricalStats: CategoricalStat[];
}

export const StatisticsTab: React.FC<StatisticsTabProps> = ({
  parametricStats,
  categoricalStats,
}) => {
  const [selectedCat, setSelectedCat] = useState<string>(
    categoricalStats[0]?.feature || ""
  );

  const activeCatStat = categoricalStats.find((c) => c.feature === selectedCat) || categoricalStats[0];

  return (
    <div className="space-y-6">
      {/* Parametric Descriptive Statistics Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Parametric & Dispersion Statistics</h3>
              <p className="text-xs text-slate-400">Measures of central tendency, variance, standard deviation, and quantile distribution</p>
            </div>
          </div>
          <span className="text-xs text-blue-400 font-mono bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
            {parametricStats.length} Numerical Features
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 sticky left-0 bg-slate-950 z-10">Feature</th>
                <th className="px-4 py-3">Count</th>
                <th className="px-4 py-3 text-blue-400">Mean</th>
                <th className="px-4 py-3">Std Dev (σ)</th>
                <th className="px-4 py-3">Variance (σ²)</th>
                <th className="px-4 py-3">Std Error (SEM)</th>
                <th className="px-4 py-3">Min</th>
                <th className="px-4 py-3">25% (Q1)</th>
                <th className="px-4 py-3 text-blue-400 font-bold">Median (Q2)</th>
                <th className="px-4 py-3">75% (Q3)</th>
                <th className="px-4 py-3">90%</th>
                <th className="px-4 py-3">99%</th>
                <th className="px-4 py-3">Max</th>
                <th className="px-4 py-3">IQR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {parametricStats.map((stat) => (
                <tr key={stat.feature} className="hover:bg-slate-800/40">
                  <td className="px-4 py-2.5 font-sans font-semibold text-blue-400 sticky left-0 bg-slate-900 z-10 whitespace-nowrap">
                    {stat.feature}
                  </td>
                  <td className="px-4 py-2.5 text-slate-300">{stat.count}</td>
                  <td className="px-4 py-2.5 text-blue-400 font-semibold">{stat.mean.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-slate-300">{stat.std.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-slate-400">{stat.variance.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-slate-400">{stat.sem}</td>
                  <td className="px-4 py-2.5 text-slate-300">{stat.min}</td>
                  <td className="px-4 py-2.5 text-slate-400">{stat.q25}</td>
                  <td className="px-4 py-2.5 text-blue-400 font-semibold">{stat.median}</td>
                  <td className="px-4 py-2.5 text-slate-400">{stat.q75}</td>
                  <td className="px-4 py-2.5 text-slate-400">{stat.q90}</td>
                  <td className="px-4 py-2.5 text-slate-400">{stat.q99}</td>
                  <td className="px-4 py-2.5 text-slate-300">{stat.max}</td>
                  <td className="px-4 py-2.5 text-amber-400">{stat.iqr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribution Shape & Normality Diagnostics Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Distribution Shape & Normality Diagnostics</h3>
              <p className="text-xs text-slate-400">Sample skewness, Fisher excess kurtosis, and Jarque-Bera normality tests</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Feature</th>
                <th className="px-4 py-3">Skewness</th>
                <th className="px-4 py-3">Skewness Interpretation</th>
                <th className="px-4 py-3">Excess Kurtosis</th>
                <th className="px-4 py-3">Kurtosis Interpretation</th>
                <th className="px-4 py-3">Jarque-Bera p-value</th>
                <th className="px-4 py-3">Distribution Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {parametricStats.map((stat) => (
                <tr key={stat.feature} className="hover:bg-slate-800/40">
                  <td className="px-4 py-2.5 font-mono font-medium text-blue-400">{stat.feature}</td>
                  <td className="px-4 py-2.5 font-mono text-blue-400">{stat.skewness}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs text-slate-300">{stat.skewnessCategory}</span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-amber-400">{stat.kurtosis}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs text-slate-300">{stat.kurtosisCategory}</span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-400">{stat.jbPValue}</td>
                  <td className="px-4 py-2.5">
                    {stat.isNormal ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Gaussian / Normal
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Non-Gaussian Skewed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Categorical Breakdown Studio */}
      {categoricalStats.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">Categorical Cardinality & Frequency Inspector</h3>
                <p className="text-xs text-slate-400">Modal classes, frequency distributions, and class imbalances</p>
              </div>
            </div>

            {/* Column Selector */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5">
              <span className="text-xs text-slate-400 font-medium">Select Feature:</span>
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="bg-transparent text-xs text-blue-400 font-mono font-semibold outline-none cursor-pointer"
              >
                {categoricalStats.map((c) => (
                  <option key={c.feature} value={c.feature} className="bg-slate-900 text-slate-200">
                    {c.feature} ({c.uniqueCount} distinct)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeCatStat && (
            <div className="space-y-4">
              {/* Stat Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                  <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Unique Levels</span>
                  <p className="text-xl font-light text-white mt-0.5">{activeCatStat.uniqueCount}</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                  <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Modal Class</span>
                  <p className="text-xl font-light text-blue-400 mt-0.5 truncate">{activeCatStat.mode}</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                  <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Mode Count</span>
                  <p className="text-xl font-light text-white mt-0.5">{activeCatStat.modeCount}</p>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                  <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Dominance %</span>
                  <p className="text-xl font-light text-emerald-400 mt-0.5">{activeCatStat.modePercentage}%</p>
                </div>
              </div>

              {/* Frequencies Bar List */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Category Level Breakdown for `{activeCatStat.feature}`:
                </h4>
                <div className="space-y-2">
                  {activeCatStat.topFrequencies.map((cat, i) => (
                    <div key={cat.label} className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-mono text-[11px]">#{i + 1}</span>
                          <span className="font-semibold text-slate-200">{cat.label || "(Empty)"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 text-[11px]">{cat.count.toLocaleString()} occurrences</span>
                          <span className="font-mono font-bold text-blue-400">{cat.percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
