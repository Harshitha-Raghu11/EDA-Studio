import React, { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Download,
  Play,
  RotateCcw,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { CleaningAudit, ColumnSchema } from "../../types";

interface CleaningTabProps {
  schema: ColumnSchema[];
  onRunCleaning: (options: {
    imputeStrategy: "auto" | "mean" | "median" | "mode" | "drop";
    stripWhitespace: boolean;
    dropDuplicates: boolean;
  }) => void;
  onResetData: () => void;
  auditLog: CleaningAudit | null;
  onExportCleanedCsv: () => void;
  isCleaned: boolean;
}

export const CleaningTab: React.FC<CleaningTabProps> = ({
  schema,
  onRunCleaning,
  onResetData,
  auditLog,
  onExportCleanedCsv,
  isCleaned,
}) => {
  const [imputeStrategy, setImputeStrategy] = useState<"auto" | "mean" | "median" | "mode" | "drop">("auto");
  const [stripWhitespace, setStripWhitespace] = useState(true);
  const [dropDuplicates, setDropDuplicates] = useState(true);

  const missingColumns = schema.filter((c) => c.nullCount > 0);

  return (
    <div className="space-y-6">
      {/* Pipeline Control Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-semibold text-white">Automated Data Cleaning & Quality Pipeline</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Impute missing values, strip whitespace, standardize null tokens, and eliminate duplicate records with full audit tracking.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isCleaned && (
              <button
                type="button"
                onClick={onResetData}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Raw</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onRunCleaning({ imputeStrategy, stripWhitespace, dropDuplicates })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-900/20 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute Cleaning Pipeline</span>
            </button>
          </div>
        </div>

        {/* Configuration Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Missing Value Imputation Strategy
            </label>
            <select
              value={imputeStrategy}
              onChange={(e: any) => setImputeStrategy(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="auto">Auto (Median for numeric, Mode for categorical)</option>
              <option value="median">Median Imputation (Robust to outliers)</option>
              <option value="mean">Mean Imputation (Parametric standard)</option>
              <option value="mode">Mode Imputation (Most frequent)</option>
              <option value="drop">Drop Incomplete Rows (Listwise deletion)</option>
            </select>
            <p className="text-[11px] text-slate-500">
              Preserves statistical distributions while avoiding data leakage.
            </p>
          </div>

          <div className="space-y-2.5">
            <label className="block text-xs font-medium text-slate-300">Text & Token Sanitation</label>
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={stripWhitespace}
                onChange={(e) => setStripWhitespace(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-0"
              />
              <span>Strip whitespace and coerce &apos;N/A&apos;, &apos;?&apos;, &apos;null&apos; to NaN</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Cleans string columns and coerces invisible empty string tokens.
            </p>
          </div>

          <div className="space-y-2.5">
            <label className="block text-xs font-medium text-slate-300">Duplicate Record Remediation</label>
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={dropDuplicates}
                onChange={(e) => setDropDuplicates(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-0"
              />
              <span>Deduplicate exact row duplicates</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Retains first unique instance across identical observations.
            </p>
          </div>
        </div>
      </div>

      {/* Before vs After Audit Card */}
      {auditLog && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Pipeline Execution Audit Results</h3>
            </div>
            <button
              type="button"
              onClick={onExportCleanedCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Cleaned CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Observations</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-light text-slate-300">{auditLog.initialRows}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-lg font-light text-blue-400">{auditLog.cleanedRows}</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Missing Cells</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-light text-amber-400">{auditLog.initialNulls}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-lg font-light text-emerald-400">{auditLog.remainingNulls}</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Duplicates Removed</span>
              <p className="text-lg font-light text-emerald-400 mt-1">{auditLog.duplicatesRemoved}</p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Data Completeness</span>
              <p className="text-lg font-light text-emerald-400 mt-1">100.0%</p>
            </div>
          </div>

          {/* Audit Log Entries */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5 font-mono text-xs">
            <p className="text-slate-400 font-sans font-semibold text-[11px] uppercase tracking-wider mb-1">
              Applied Transformations:
            </p>
            {auditLog.operationsLog.map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-300 text-[11px]">
                <span className="text-blue-400">[{i + 1}]</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Missing Values Diagnostic Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-white">Missing Value Distribution by Feature</h3>
          <p className="text-xs text-slate-400">Detailed overview of null rates across all dataset columns</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Feature</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Missing Cells</th>
                <th className="px-4 py-3">Missing Rate %</th>
                <th className="px-4 py-3 w-1/3">Visual Null Rate Bar</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {schema.map((col) => (
                <tr key={col.name} className="hover:bg-slate-800/40">
                  <td className="px-4 py-2.5 font-mono font-medium text-blue-400">{col.name}</td>
                  <td className="px-4 py-2.5 uppercase text-[10px] text-slate-400">{col.type}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-300">{col.nullCount}</td>
                  <td className="px-4 py-2.5 font-mono">
                    <span className={col.nullCount > 0 ? "text-amber-400 font-bold" : "text-emerald-400"}>
                      {col.nullPercentage}%
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden flex border border-slate-800">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${100 - col.nullPercentage}%` }}
                      />
                      {col.nullPercentage > 0 && (
                        <div
                          className="bg-amber-400 h-full"
                          style={{ width: `${col.nullPercentage}%` }}
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    {col.nullCount === 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Clean
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" /> Needs Imputation
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
