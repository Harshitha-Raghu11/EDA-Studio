import React, { useState, useMemo } from "react";
import {
  Eye,
  EyeOff,
  Filter,
  CheckSquare,
  Square,
  Sparkles,
  Search,
  RotateCcw,
  SlidersHorizontal,
  Layers,
  Hash,
  Type,
  Calendar,
  ToggleLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ColumnSchema } from "../types";

interface GlobalColumnFilterProps {
  allHeaders: string[];
  hiddenColumns: string[];
  schema: ColumnSchema[];
  onToggleColumn: (column: string) => void;
  onSetHiddenColumns: (columns: string[]) => void;
  onShowAll: () => void;
}

export const GlobalColumnFilter: React.FC<GlobalColumnFilterProps> = ({
  allHeaders,
  hiddenColumns,
  schema,
  onToggleColumn,
  onSetHiddenColumns,
  onShowAll,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<
    "all" | "numerical" | "categorical" | "datetime" | "boolean"
  >("all");

  const visibleCount = allHeaders.length - hiddenColumns.length;
  const isAllVisible = hiddenColumns.length === 0;
  const isFilterActive = hiddenColumns.length > 0;

  // Map schema lookup for fast type & null info
  const schemaMap = useMemo(() => {
    const map = new Map<string, ColumnSchema>();
    schema.forEach((col) => map.set(col.name, col));
    return map;
  }, [schema]);

  // Filtered columns based on search and type
  const filteredColumns = useMemo(() => {
    return allHeaders.filter((header) => {
      const colSchema = schemaMap.get(header);
      const matchesSearch = header.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        selectedTypeFilter === "all" || (colSchema && colSchema.type === selectedTypeFilter);
      return matchesSearch && matchesType;
    });
  }, [allHeaders, searchTerm, selectedTypeFilter, schemaMap]);

  // Preset Handlers
  const handleSelectNumericalOnly = () => {
    const nonNumeric = allHeaders.filter((h) => {
      const col = schemaMap.get(h);
      return col?.type !== "numerical";
    });
    // Ensure we don't hide everything if no numeric
    if (nonNumeric.length < allHeaders.length) {
      onSetHiddenColumns(nonNumeric);
    }
  };

  const handleSelectCategoricalOnly = () => {
    const nonCat = allHeaders.filter((h) => {
      const col = schemaMap.get(h);
      return col?.type !== "categorical";
    });
    if (nonCat.length < allHeaders.length) {
      onSetHiddenColumns(nonCat);
    }
  };

  const handleHideHighNulls = () => {
    const highNulls = allHeaders.filter((h) => {
      const col = schemaMap.get(h);
      return col && col.nullPercentage > 20;
    });
    if (highNulls.length > 0 && highNulls.length < allHeaders.length) {
      const newHidden = Array.from(new Set([...hiddenColumns, ...highNulls]));
      onSetHiddenColumns(newHidden);
    }
  };

  const handleInvertSelection = () => {
    const newHidden = allHeaders.filter((h) => !hiddenColumns.includes(h));
    if (newHidden.length < allHeaders.length) {
      onSetHiddenColumns(newHidden);
    } else {
      onShowAll();
    }
  };

  const handleHideAllVisibleInFilter = () => {
    const toHide = filteredColumns.filter((h) => !hiddenColumns.includes(h));
    const newHidden = Array.from(new Set([...hiddenColumns, ...toHide]));
    if (newHidden.length < allHeaders.length) {
      onSetHiddenColumns(newHidden);
    }
  };

  const handleShowAllVisibleInFilter = () => {
    const newHidden = hiddenColumns.filter((h) => !filteredColumns.includes(h));
    onSetHiddenColumns(newHidden);
  };

  return (
    <div
      id="global-column-filter-container"
      className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm relative overflow-hidden mb-6 transition-all"
    >
      {/* Background visual accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-slate-100">
                Global Feature Visibility Filter
              </h3>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                  isFilterActive
                    ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                }`}
              >
                {visibleCount} of {allHeaders.length} Visible
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Selectively hide or isolate columns to reduce visual noise across all studio tabs (Cleaning, Statistics, Charts, Correlations, Outliers)
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {isFilterActive && (
            <button
              id="reset-global-column-filter-btn"
              type="button"
              onClick={onShowAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Show All Features
            </button>
          )}

          <button
            id="toggle-global-filter-collapse-btn"
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>{isExpanded ? "Collapse Controls" : "Configure Columns"}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Controls Body */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Quick Preset Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Quick Presets:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={onShowAll}
                disabled={isAllVisible}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors"
              >
                All Features
              </button>

              <button
                type="button"
                onClick={handleSelectNumericalOnly}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 transition-colors"
              >
                Numerical Only
              </button>

              <button
                type="button"
                onClick={handleSelectCategoricalOnly}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30 transition-colors"
              >
                Categorical Only
              </button>

              <button
                type="button"
                onClick={handleHideHighNulls}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors"
                title="Hide columns where missing values exceed 20%"
              >
                Exclude &gt;20% Null
              </button>

              <button
                type="button"
                onClick={handleInvertSelection}
                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Invert Active
              </button>
            </div>
          </div>

          {/* Search, Type Filter & Batch Toggle Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Filter feature by name..."
                aria-label="Filter features by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-slate-200 placeholder-slate-500 outline-none w-full text-xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="text-slate-500 hover:text-slate-300 ml-1 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Type Filter Pills & Filtered Selection */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                {(["all", "numerical", "categorical", "datetime", "boolean"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedTypeFilter(type)}
                    className={`px-2 py-1 rounded capitalize text-[11px] font-medium transition-colors ${
                      selectedTypeFilter === type
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {filteredColumns.length > 0 && (
                <div className="flex items-center gap-1 ml-1">
                  <button
                    type="button"
                    onClick={handleShowAllVisibleInFilter}
                    className="px-2 py-1 rounded bg-slate-950 border border-slate-800 hover:bg-slate-800 text-[11px] text-slate-300 transition-colors"
                    title="Enable all features currently matching search/type filter"
                  >
                    Enable Matches ({filteredColumns.length})
                  </button>
                  <button
                    type="button"
                    onClick={handleHideAllVisibleInFilter}
                    className="px-2 py-1 rounded bg-slate-950 border border-slate-800 hover:bg-slate-800 text-[11px] text-slate-400 transition-colors"
                    title="Disable all features currently matching search/type filter"
                  >
                    Disable Matches
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Feature Grid / Pill Selector */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 max-h-56 overflow-y-auto">
            {filteredColumns.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No features match "{searchTerm}" with type filter "{selectedTypeFilter}"
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {filteredColumns.map((colName) => {
                  const isHidden = hiddenColumns.includes(colName);
                  const colSchema = schemaMap.get(colName);
                  const isNumeric = colSchema?.type === "numerical";
                  const isDatetime = colSchema?.type === "datetime";
                  const isBoolean = colSchema?.type === "boolean";

                  let typeBadgeClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                  let typeIcon = <Type className="w-3 h-3 text-amber-400" />;
                  if (isNumeric) {
                    typeBadgeClass = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                    typeIcon = <Hash className="w-3 h-3 text-blue-400" />;
                  } else if (isDatetime) {
                    typeBadgeClass = "bg-purple-500/10 text-purple-400 border-purple-500/20";
                    typeIcon = <Calendar className="w-3 h-3 text-purple-400" />;
                  } else if (isBoolean) {
                    typeBadgeClass = "bg-teal-500/10 text-teal-400 border-teal-500/20";
                    typeIcon = <ToggleLeft className="w-3 h-3 text-teal-400" />;
                  }

                  return (
                    <div
                      key={colName}
                      id={`column-filter-chip-${colName}`}
                      onClick={() => onToggleColumn(colName)}
                      className={`flex items-center justify-between gap-2 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                        !isHidden
                          ? "bg-slate-900/90 border-slate-700/80 hover:border-blue-500/60 shadow-sm"
                          : "bg-slate-950/60 border-slate-800/60 opacity-50 hover:opacity-80"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          className="shrink-0 text-slate-400 hover:text-white"
                          aria-label={isHidden ? `Enable ${colName}` : `Hide ${colName}`}
                          title={isHidden ? "Feature hidden — click to enable" : "Feature active — click to hide"}
                        >
                          {!isHidden ? (
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                          )}
                        </button>
                        <span
                          className={`text-xs font-mono truncate ${
                            !isHidden ? "text-slate-200 font-medium" : "text-slate-500 line-through"
                          }`}
                          title={colName}
                        >
                          {colName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {colSchema && (
                          <span
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase border ${typeBadgeClass}`}
                          >
                            {colSchema.type.substring(0, 3)}
                          </span>
                        )}
                        {colSchema && colSchema.nullPercentage > 0 && (
                          <span
                            className={`text-[10px] font-mono ${
                              colSchema.nullPercentage > 20 ? "text-rose-400" : "text-amber-400"
                            }`}
                            title={`${colSchema.nullCount} nulls (${colSchema.nullPercentage}%)`}
                          >
                            {colSchema.nullPercentage}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Summary Footnote */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
            <span>
              💡 Tip: Click any feature or eye icon to toggle visibility across charts, correlations, and statistics.
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              {allHeaders.length - hiddenColumns.length} Active / {hiddenColumns.length} Hidden
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
