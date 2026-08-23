import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  FileCode2,
  Filter,
  HardDrive,
  Layers,
  RotateCcw,
  Search,
  Table,
} from "lucide-react";
import { ColumnSchema, DatasetMetadata, DQISessionPoint, OutlierMetric } from "../../types";
import { DataQualityIndex } from "../DataQualityIndex";
import { DQIAlerts } from "../DQIAlerts";
import { TemporalTrends } from "../TemporalTrends";
import { GlobalColumnFilter } from "../GlobalColumnFilter";

interface OverviewTabProps {
  metadata: DatasetMetadata;
  schema: ColumnSchema[];
  rows: Record<string, any>[];
  headers: string[];
  allHeaders?: string[];
  hiddenColumns?: string[];
  onToggleColumnVisibility?: (column: string) => void;
  onSetHiddenColumns?: (columns: string[]) => void;
  onShowAllColumns?: () => void;
  outlierMetrics?: OutlierMetric[];
  onNavigateCleaning?: () => void;
  onNavigateOutliers?: () => void;
  onNavigateTab?: (tab: string) => void;
  sessionHistory?: DQISessionPoint[];
  onAddCheckpoint?: (name?: string) => void;
  onClearHistory?: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  metadata,
  schema,
  rows,
  headers,
  allHeaders = headers,
  hiddenColumns = [],
  onToggleColumnVisibility,
  onSetHiddenColumns,
  onShowAllColumns,
  outlierMetrics = [],
  onNavigateCleaning,
  onNavigateOutliers,
  onNavigateTab,
  sessionHistory = [],
  onAddCheckpoint,
  onClearHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "numerical" | "categorical" | "datetime" | "boolean">("all");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "visible" | "hidden">("all");
  const [page, setPage] = useState(1);
  const [previewMode, setPreviewMode] = useState<"visible" | "all">("visible");
  const rowsPerPage = 10;

  const filteredSchema = schema.filter((col) => {
    const matchesSearch = col.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || col.type === typeFilter;
    const isHidden = hiddenColumns.includes(col.name);
    const matchesVisibility =
      visibilityFilter === "all" ||
      (visibilityFilter === "visible" && !isHidden) ||
      (visibilityFilter === "hidden" && isHidden);
    return matchesSearch && matchesType && matchesVisibility;
  });

  const totalPages = Math.ceil(rows.length / rowsPerPage) || 1;
  const paginatedRows = rows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const previewHeaders = previewMode === "visible" ? headers : allHeaders;

  return (
    <div className="space-y-6">
      {/* Primary Data Quality Index Component with Session Trend Sparkline */}
      <DataQualityIndex
        metadata={metadata}
        outlierMetrics={outlierMetrics}
        onNavigateCleaning={onNavigateCleaning}
        sessionHistory={sessionHistory}
        onAddCheckpoint={onAddCheckpoint}
        onClearHistory={onClearHistory}
      />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Rows</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl lg:text-3xl font-light text-white tracking-tight">{metadata.numRows.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-1">Total Observations</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Features</span>
            <Table className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl lg:text-3xl font-light text-white tracking-tight">{headers.length}</p>
            {hiddenColumns.length > 0 && (
              <span className="text-xs text-amber-400 font-mono">({hiddenColumns.length} hidden)</span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {metadata.numericalColumns.length} Num / {metadata.categoricalColumns.length} Cat Active
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Memory</span>
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl lg:text-3xl font-light text-white tracking-tight">{metadata.memoryUsageFormatted}</p>
          <p className="text-[11px] text-slate-500 mt-1">Estimated In-Memory</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Null Cells</span>
            <AlertTriangle className={`w-4 h-4 ${metadata.totalNullCells > 0 ? "text-amber-400" : "text-emerald-400"}`} />
          </div>
          <p className="text-2xl lg:text-3xl font-light text-white tracking-tight">{metadata.totalNullCells}</p>
          <p className="text-[11px] text-slate-500 mt-1">{metadata.totalNullPercentage}% of active data</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Duplicates</span>
            <FileCode2 className={`w-4 h-4 ${metadata.duplicateRowsCount > 0 ? "text-rose-400" : "text-emerald-400"}`} />
          </div>
          <p className="text-2xl lg:text-3xl font-light text-white tracking-tight">{metadata.duplicateRowsCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Duplicate records</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Data Health</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl lg:text-3xl font-light text-emerald-400 tracking-tight">
            {100 - metadata.totalNullPercentage > 95 ? "Grade A" : "Grade B"}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Integrity index</p>
        </div>
      </div>

      {/* DQI Quality Alerts & Remediation Panel */}
      <DQIAlerts
        metadata={metadata}
        schema={schema}
        outlierMetrics={outlierMetrics}
        hiddenColumns={hiddenColumns}
        onNavigateCleaning={onNavigateCleaning}
        onNavigateOutliers={onNavigateOutliers}
        onNavigateTab={onNavigateTab}
        onToggleColumnVisibility={onToggleColumnVisibility}
      />

      {/* Global Column Filtering & Visibility Manager */}
      {onToggleColumnVisibility && onSetHiddenColumns && onShowAllColumns && (
        <GlobalColumnFilter
          allHeaders={allHeaders}
          hiddenColumns={hiddenColumns}
          schema={schema}
          onToggleColumn={onToggleColumnVisibility}
          onSetHiddenColumns={onSetHiddenColumns}
          onShowAll={onShowAllColumns}
        />
      )}

      {/* Temporal Trend & Time-Series Progression Analysis */}
      <TemporalTrends metadata={metadata} rows={rows} headers={headers} />

      {/* Column Schema Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Structural Feature Schema</h3>
              <span className="text-xs text-slate-400 font-mono">
                ({filteredSchema.length} feature{filteredSchema.length !== 1 ? "s" : ""})
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Column data types, missing value rates, unique cardinality, and global studio visibility toggle
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search feature..."
                aria-label="Search features"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-slate-200 outline-none w-28 sm:w-40 placeholder-slate-500 text-xs"
              />
            </div>

            <select
              value={typeFilter}
              aria-label="Filter features by type"
              onChange={(e: any) => setTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="numerical">Numerical</option>
              <option value="categorical">Categorical</option>
              <option value="datetime">Datetime</option>
              <option value="boolean">Boolean</option>
            </select>

            {hiddenColumns.length > 0 && (
              <select
                value={visibilityFilter}
                onChange={(e: any) => setVisibilityFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="visible">Active Only ({allHeaders.length - hiddenColumns.length})</option>
                <option value="hidden">Hidden Only ({hiddenColumns.length})</option>
              </select>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-3 py-3 w-10 text-center">Active</th>
                <th className="px-4 py-3">Feature Name</th>
                <th className="px-4 py-3">Inferred Type</th>
                <th className="px-4 py-3">Non-Null Count</th>
                <th className="px-4 py-3">Missing Rate</th>
                <th className="px-4 py-3">Unique Values</th>
                <th className="px-4 py-3">Sample Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSchema.map((col) => {
                const isHidden = hiddenColumns.includes(col.name);
                let badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                if (col.type === "numerical") {
                  badgeStyle = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                } else if (col.type === "datetime") {
                  badgeStyle = "bg-purple-500/10 text-purple-400 border-purple-500/20";
                } else if (col.type === "boolean") {
                  badgeStyle = "bg-teal-500/10 text-teal-400 border-teal-500/20";
                }

                return (
                  <tr
                    key={col.name}
                    className={`transition-colors ${
                      !isHidden ? "hover:bg-slate-800/40" : "bg-slate-950/40 opacity-60 hover:opacity-90"
                    }`}
                  >
                    <td className="px-3 py-2.5 text-center">
                      {onToggleColumnVisibility && (
                        <button
                          type="button"
                          id={`schema-toggle-vis-${col.name}`}
                          onClick={() => onToggleColumnVisibility(col.name)}
                          title={
                            isHidden
                              ? "Feature is currently hidden across studio tabs. Click to activate."
                              : "Feature is active across studio. Click to hide."
                          }
                          className="p-1 rounded hover:bg-slate-800 transition-colors inline-flex items-center justify-center text-slate-400 hover:text-white"
                        >
                          {!isHidden ? (
                            <Eye className="w-4 h-4 text-blue-400" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-slate-600" />
                          )}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono font-medium flex items-center gap-2">
                      <span className={!isHidden ? "text-blue-400" : "text-slate-500 line-through"}>
                        {col.name}
                      </span>
                      {isHidden && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-400 font-sans">
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${badgeStyle}`}
                      >
                        {col.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-300">{col.nonNullCount.toLocaleString()}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className={col.nullCount > 0 ? "text-amber-400 font-medium" : "text-emerald-400"}>
                          {col.nullPercentage}%
                        </span>
                        {col.nullCount > 0 && (
                          <span className="text-[10px] text-slate-500">({col.nullCount} nulls)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-300">{col.uniqueCount.toLocaleString()}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-400 text-[11px] truncate max-w-xs">{col.sampleValue}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Data Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Dataset Inspection Table</h3>
              {hiddenColumns.length > 0 && (
                <span className="text-xs text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {previewMode === "visible" ? `${headers.length} Active Columns` : `All ${allHeaders.length} Columns`}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Displaying rows {(page - 1) * rowsPerPage + 1} to {Math.min(page * rowsPerPage, rows.length)} of {rows.length.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hiddenColumns.length > 0 && (
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs mr-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode("visible")}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    previewMode === "visible" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Active ({headers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("all")}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    previewMode === "all" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  All ({allHeaders.length})
                </button>
              </div>
            )}

            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-slate-400">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 sticky top-0 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-3 py-2.5 text-slate-500 w-12">#</th>
                {previewHeaders.map((h) => {
                  const isHidden = hiddenColumns.includes(h);
                  return (
                    <th key={h} className={`px-3 py-2.5 font-mono whitespace-nowrap ${isHidden ? "text-slate-500 opacity-60" : ""}`}>
                      <div className="flex items-center gap-1.5">
                        <span>{h}</span>
                        {isHidden && <EyeOff className="w-3 h-3 text-slate-600 shrink-0" />}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-3 py-2 text-slate-500 font-mono text-[11px]">
                    {(page - 1) * rowsPerPage + idx + 1}
                  </td>
                  {previewHeaders.map((h) => {
                    const isHidden = hiddenColumns.includes(h);
                    const val = row[h];
                    const isNull = val === null || val === undefined || val === "";
                    return (
                      <td
                        key={h}
                        className={`px-3 py-2 font-mono whitespace-nowrap text-[11px] ${
                          isHidden ? "opacity-50 text-slate-500" : ""
                        }`}
                      >
                        {isNull ? (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px]">
                            NaN
                          </span>
                        ) : (
                          String(val)
                        )}
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


