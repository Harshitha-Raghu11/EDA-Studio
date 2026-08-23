import React, { useState, useMemo } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  EyeOff,
  Filter,
  Flame,
  Info,
  Layers,
  Percent,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
  Wand2,
  Zap,
} from "lucide-react";
import { ColumnSchema, DatasetMetadata, OutlierMetric } from "../types";

export interface DQIAlertItem {
  id: string;
  column: string;
  category: "nulls" | "outliers" | "duplicates" | "cardinality" | "constant";
  title: string;
  severity: "critical" | "warning" | "info";
  metricValueFormatted: string;
  dqiPenaltyPoints: number;
  description: string;
  remediation: string;
  actionTab?: "cleaning" | "outliers" | "feature_eng";
  actionLabel?: string;
  columnType?: string;
}

interface DQIAlertsProps {
  metadata: DatasetMetadata;
  schema: ColumnSchema[];
  outlierMetrics?: OutlierMetric[];
  hiddenColumns?: string[];
  onNavigateCleaning?: () => void;
  onNavigateOutliers?: () => void;
  onNavigateTab?: (tab: string) => void;
  onToggleColumnVisibility?: (column: string) => void;
}

export const DQIAlerts: React.FC<DQIAlertsProps> = ({
  metadata,
  schema,
  outlierMetrics = [],
  hiddenColumns = [],
  onNavigateCleaning,
  onNavigateOutliers,
  onNavigateTab,
  onToggleColumnVisibility,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "nulls" | "outliers" | "structural">("all");
  const [selectedSeverity, setSelectedSeverity] = useState<"all" | "critical" | "warning">("all");
  const [sortBy, setSortBy] = useState<"penalty" | "severity" | "name">("penalty");
  const [expandedAlerts, setExpandedAlerts] = useState<Record<string, boolean>>({});

  const toggleAlertExpand = (id: string) => {
    setExpandedAlerts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Compute all individual quality alerts and their mathematical penalty contribution
  const alerts: DQIAlertItem[] = useMemo(() => {
    const list: DQIAlertItem[] = [];
    const numRows = metadata.numRows || 0;
    const numCols = metadata.numColumns || 0;
    const totalCells = Math.max(1, numRows * numCols);

    // 1. Column-specific Null Percentage Alerts
    schema.forEach((col) => {
      if (col.nullCount > 0) {
        // Missing penalty formula weight: 40% max at 25% missing
        const colMissingRateOfTotal = (col.nullCount / totalCells) * 100;
        const penalty = Math.min(40, (colMissingRateOfTotal / 25) * 40);

        let severity: "critical" | "warning" | "info" = "info";
        let title = "Moderate Null Density";

        if (col.nullPercentage >= 30) {
          severity = "critical";
          title = "Critical Missing Rate";
        } else if (col.nullPercentage >= 10) {
          severity = "warning";
          title = "High Null Percentage";
        } else {
          severity = "info";
          title = "Localized Null Cells";
        }

        list.push({
          id: `null_${col.name}`,
          column: col.name,
          category: "nulls",
          title,
          severity,
          metricValueFormatted: `${col.nullPercentage}% missing (${col.nullCount.toLocaleString()} / ${numRows.toLocaleString()} cells)`,
          dqiPenaltyPoints: Number(penalty.toFixed(2)),
          description: `Feature '${col.name}' contains ${col.nullPercentage}% missing observations. This degrades completeness score and induces parametric estimator bias.`,
          remediation:
            col.nullPercentage > 50
              ? "Consider dropping this feature or hiding it from global analysis to avoid noise."
              : col.type === "numerical"
              ? "Apply median or mean statistical imputation in Data Cleaning."
              : "Impute with mode frequency or placeholder token in Data Cleaning.",
          actionTab: "cleaning",
          actionLabel: "Impute in Cleaning Tab",
          columnType: col.type,
        });
      }
    });

    // 2. Numerical Outlier Density Alerts
    const numNumericalCols = Math.max(1, metadata.numericalColumns.length);
    const totalNumericalPoints = Math.max(1, numRows * numNumericalCols);

    outlierMetrics.forEach((metric) => {
      if (metric.iqrCount > 0) {
        const colOutlierRateOfTotal = (metric.iqrCount / totalNumericalPoints) * 100;
        const penalty = Math.min(30, (colOutlierRateOfTotal / 15) * 30);

        let severity: "critical" | "warning" | "info" = "info";
        let title = "Elevated Outlier Frequency";

        if (metric.iqrPercentage >= 8) {
          severity = "critical";
          title = "Extreme Outlier Density";
        } else if (metric.iqrPercentage >= 3) {
          severity = "warning";
          title = "High Outlier Dispersion";
        }

        list.push({
          id: `outlier_${metric.feature}`,
          column: metric.feature,
          category: "outliers",
          title,
          severity,
          metricValueFormatted: `${metric.iqrPercentage}% IQR outliers (${metric.iqrCount} pts outside [${metric.iqrLower.toFixed(1)}, ${metric.iqrUpper.toFixed(1)}])`,
          dqiPenaltyPoints: Number(penalty.toFixed(2)),
          description: `Feature '${metric.feature}' exhibits heavy-tailed dispersion with ${metric.iqrCount} observations exceeding the 1.5× IQR boundary.`,
          remediation:
            "Winsorize extreme values to IQR boundary or apply log1p/RobustScaler transformations to stabilize variance.",
          actionTab: "outliers",
          actionLabel: "Remediate in Outlier Audit",
          columnType: "numerical",
        });
      }
    });

    // 3. Dataset-Level Duplicate Rows Alert
    if (metadata.duplicateRowsCount > 0) {
      const duplicatePercentage = numRows > 0 ? (metadata.duplicateRowsCount / numRows) * 100 : 0;
      const penalty = Math.min(30, (duplicatePercentage / 20) * 30);
      const isCritical = duplicatePercentage >= 5;

      list.push({
        id: "duplicate_rows_alert",
        column: "Dataset (Global)",
        category: "duplicates",
        title: isCritical ? "Critical Duplicate Row Clustering" : "Duplicate Record Redundancy",
        severity: isCritical ? "critical" : "warning",
        metricValueFormatted: `${duplicatePercentage.toFixed(1)}% duplicates (${metadata.duplicateRowsCount.toLocaleString()} duplicate rows)`,
        dqiPenaltyPoints: Number(penalty.toFixed(2)),
        description: `Found ${metadata.duplicateRowsCount} duplicate records in the active dataset. Duplicate observations artificially inflate sample density and cause overfitting.`,
        remediation: "Execute automated deduplication in the Data Cleaning sequence to preserve sample uniqueness.",
        actionTab: "cleaning",
        actionLabel: "Deduplicate in Cleaning Tab",
      });
    }

    // 4. Zero Variance / Constant Columns
    schema.forEach((col) => {
      if (col.uniqueCount === 1 && numRows > 1) {
        list.push({
          id: `constant_${col.name}`,
          column: col.name,
          category: "constant",
          title: "Constant Feature (Zero Variance)",
          severity: "warning",
          metricValueFormatted: `1 unique value: "${col.sampleValue}"`,
          dqiPenaltyPoints: 1.5,
          description: `Feature '${col.name}' has 0 information entropy with all rows sharing the exact same value. It adds zero predictive power.`,
          remediation: "Hide or remove this column from the active feature matrix.",
          actionTab: "cleaning",
          actionLabel: "Manage in Column Schema",
          columnType: col.type,
        });
      }
    });

    // 5. High Cardinality ID Columns in Categorical Features
    schema.forEach((col) => {
      if (col.type === "categorical" && numRows >= 30 && col.uniqueCount / numRows > 0.9) {
        list.push({
          id: `cardinality_${col.name}`,
          column: col.name,
          category: "cardinality",
          title: "High Cardinality / Pseudo-Identifier",
          severity: "info",
          metricValueFormatted: `${((col.uniqueCount / numRows) * 100).toFixed(0)}% uniqueness (${col.uniqueCount} distinct values)`,
          dqiPenaltyPoints: 0.5,
          description: `Categorical feature '${col.name}' behaves like a primary key or UUID. One-hot encoding will produce an excessively sparse matrix.`,
          remediation: "Exclude from one-hot encoding or use target frequency encoding.",
          actionTab: "feature_eng",
          actionLabel: "Inspect in Feature Eng",
          columnType: col.type,
        });
      }
    });

    return list;
  }, [metadata, schema, outlierMetrics]);

  // Summary Metrics
  const summary = useMemo(() => {
    const criticalCount = alerts.filter((a) => a.severity === "critical").length;
    const warningCount = alerts.filter((a) => a.severity === "warning").length;
    const infoCount = alerts.filter((a) => a.severity === "info").length;
    const totalPenalty = alerts.reduce((acc, curr) => acc + curr.dqiPenaltyPoints, 0);

    const nullAlerts = alerts.filter((a) => a.category === "nulls").length;
    const outlierAlerts = alerts.filter((a) => a.category === "outliers").length;
    const structAlerts = alerts.filter(
      (a) => a.category === "duplicates" || a.category === "constant" || a.category === "cardinality"
    ).length;

    return {
      total: alerts.length,
      criticalCount,
      warningCount,
      infoCount,
      totalPenalty: Number(totalPenalty.toFixed(1)),
      nullAlerts,
      outlierAlerts,
      structAlerts,
    };
  }, [alerts]);

  // Filtered & Sorted Alerts
  const displayedAlerts = useMemo(() => {
    return alerts
      .filter((alert) => {
        if (selectedCategory === "nulls" && alert.category !== "nulls") return false;
        if (selectedCategory === "outliers" && alert.category !== "outliers") return false;
        if (
          selectedCategory === "structural" &&
          alert.category !== "duplicates" &&
          alert.category !== "constant" &&
          alert.category !== "cardinality"
        )
          return false;

        if (selectedSeverity === "critical" && alert.severity !== "critical") return false;
        if (selectedSeverity === "warning" && alert.severity !== "warning") return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "penalty") {
          return b.dqiPenaltyPoints - a.dqiPenaltyPoints;
        }
        if (sortBy === "severity") {
          const rank = { critical: 3, warning: 2, info: 1 };
          return rank[b.severity] - rank[a.severity] || b.dqiPenaltyPoints - a.dqiPenaltyPoints;
        }
        return a.column.localeCompare(b.column);
      });
  }, [alerts, selectedCategory, selectedSeverity, sortBy]);

  const handleAction = (alert: DQIAlertItem) => {
    if (alert.actionTab === "cleaning" && onNavigateCleaning) {
      onNavigateCleaning();
    } else if (alert.actionTab === "outliers" && onNavigateOutliers) {
      onNavigateOutliers();
    } else if (alert.actionTab && onNavigateTab) {
      onNavigateTab(alert.actionTab);
    } else if (onNavigateCleaning) {
      onNavigateCleaning();
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Header Banner */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">DQI Quality Alerts & Remediation Engine</h3>
              {summary.total > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {summary.total} Issue{summary.total !== 1 ? "s" : ""} Detected
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  All Clear
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Specific columns & anomalies contributing most to DQI score penalties with actionable remediation
            </p>
          </div>
        </div>

        {/* Quick Summary Pill Badges */}
        <div className="flex items-center gap-2 text-xs">
          {summary.criticalCount > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium">
              <Flame className="w-3.5 h-3.5" />
              <span>{summary.criticalCount} Critical</span>
            </div>
          )}
          {summary.warningCount > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{summary.warningCount} Warnings</span>
            </div>
          )}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>-{summary.totalPenalty} pts DQI Impact</span>
          </div>
        </div>
      </div>

      {/* Filter & Sorting Toolbar */}
      <div className="p-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Category Selector Tabs */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              selectedCategory === "all" ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Categories ({alerts.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("nulls")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              selectedCategory === "nulls" ? "bg-amber-600 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Missing Values ({summary.nullAlerts})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("outliers")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              selectedCategory === "outliers" ? "bg-rose-600 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Outlier Density ({summary.outlierAlerts})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("structural")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              selectedCategory === "structural" ? "bg-purple-600 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Structural ({summary.structAlerts})
          </button>
        </div>

        {/* Severity Filter & Sort Dropdown */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-slate-400 text-[11px]">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedSeverity}
              aria-label="Filter alerts by severity"
              onChange={(e: any) => setSelectedSeverity(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 outline-none cursor-pointer text-xs"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="warning">Warning Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1 text-slate-400 text-[11px]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              aria-label="Sort data quality alerts"
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 outline-none cursor-pointer text-xs"
            >
              <option value="penalty">Highest DQI Penalty</option>
              <option value="severity">Severity Order</option>
              <option value="name">Column Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Grid / Card List */}
      <div className="p-4 space-y-3">
        {displayedAlerts.length === 0 ? (
          <div className="py-8 px-4 text-center rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">No Quality Alerts Found</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {alerts.length === 0
                ? "The dataset maintains high statistical integrity with 0 missing cells, 0 duplicates, and low outlier density."
                : "No alerts match the currently selected category or severity filter."}
            </p>
            {alerts.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedSeverity("all");
                }}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {displayedAlerts.map((alert) => {
              const isExpanded = !!expandedAlerts[alert.id];
              const isHidden = hiddenColumns.includes(alert.column);

              let badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
              let cardBorder = "border-slate-800 hover:border-slate-700";
              let iconBg = "bg-blue-500/10 text-blue-400 border-blue-500/20";

              if (alert.severity === "critical") {
                badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/30";
                cardBorder = "border-rose-500/30 hover:border-rose-500/50 bg-rose-950/10";
                iconBg = "bg-rose-500/15 text-rose-400 border-rose-500/30";
              } else if (alert.severity === "warning") {
                badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/30";
                cardBorder = "border-amber-500/20 hover:border-amber-500/40 bg-amber-950/5";
                iconBg = "bg-amber-500/15 text-amber-400 border-amber-500/30";
              }

              return (
                <div
                  key={alert.id}
                  className={`rounded-xl border ${cardBorder} bg-slate-950/60 transition-all p-3.5 space-y-2.5`}
                >
                  {/* Top Bar of Alert Card */}
                  <div className="flex flex-wrap items-start justify-between gap-2.5">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg border ${iconBg} shrink-0 mt-0.5`}>
                        {alert.severity === "critical" ? (
                          <Flame className="w-4 h-4" />
                        ) : alert.severity === "warning" ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <Info className="w-4 h-4" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-white">{alert.column}</span>
                          {alert.columnType && (
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                              {alert.columnType}
                            </span>
                          )}
                          {isHidden && (
                            <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 flex items-center gap-1">
                              <EyeOff className="w-2.5 h-2.5" /> Hidden
                            </span>
                          )}
                          <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${badgeColor}`}>
                            {alert.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{alert.metricValueFormatted}</p>
                      </div>
                    </div>

                    {/* DQI Score Penalty Tag & Primary Action */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-xs font-semibold">
                        <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                        <span>-{alert.dqiPenaltyPoints} pts</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAction(alert)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>{alert.actionLabel || "Fix Issue"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Contextual Description & Remediation Guide */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-xs pt-1 border-t border-slate-800/80">
                    <div className="md:col-span-6 text-slate-400 leading-relaxed">
                      <span className="text-slate-300 font-medium">Impact: </span>
                      {alert.description}
                    </div>
                    <div className="md:col-span-6 text-slate-300 bg-slate-900/80 border border-slate-800 rounded-lg p-2 leading-relaxed flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-cyan-400 font-semibold">Recommended Fix: </span>
                        <span>{alert.remediation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expand / Quick Column Toggle Row */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <div className="flex items-center gap-2">
                      {onToggleColumnVisibility && alert.column !== "Dataset (Global)" && (
                        <button
                          type="button"
                          onClick={() => onToggleColumnVisibility(alert.column)}
                          className="hover:text-slate-300 transition-colors flex items-center gap-1 text-[11px]"
                        >
                          {isHidden ? (
                            <>
                              <EyeOff className="w-3 h-3 text-amber-400" />
                              <span>Unhide Feature</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-slate-400" />
                              <span>Hide Feature from Studio</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleAlertExpand(alert.id)}
                      className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                    >
                      <span>{isExpanded ? "Less Details" : "More Diagnostics"}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Expanded Diagnostics */}
                  {isExpanded && (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Alert Identifier:</span>
                        <span className="text-slate-400">{alert.id}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Target Category:</span>
                        <span className="text-cyan-400 uppercase">{alert.category}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Penalty Metric:</span>
                        <span className="text-rose-400 font-bold">{alert.dqiPenaltyPoints} pts deducted from DQI 100</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
