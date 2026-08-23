import React, { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  FileCode2,
  HelpCircle,
  Info,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Wand2,
} from "lucide-react";
import { DatasetMetadata, DQISessionPoint, OutlierMetric } from "../types";
import { DQISparkline } from "./DQISparkline";

export function calculateDQIStats(metadata: DatasetMetadata, outlierMetrics: OutlierMetric[] = []) {
  const numRows = metadata.numRows || 0;
  const numCols = metadata.numColumns || 0;
  const totalCells = Math.max(1, numRows * numCols);

  // 1. Missing Values Analysis
  const totalNullCells = metadata.totalNullCells || 0;
  const missingPercentage = totalCells > 0 ? (totalNullCells / totalCells) * 100 : 0;
  // Missing penalty weight: 40% of total score
  // 0% missing = 0 penalty, 25%+ missing reaches max penalty
  const missingPenalty = Math.min(40, (missingPercentage / 25) * 40);
  const completenessScore = Math.max(0, Math.round(100 - (missingPercentage / 25) * 100));

  // 2. Duplicate Rows Analysis
  const duplicateRowsCount = metadata.duplicateRowsCount || 0;
  const duplicatePercentage = numRows > 0 ? (duplicateRowsCount / numRows) * 100 : 0;
  // Duplicate penalty weight: 30% of total score
  // 0% duplicates = 0 penalty, 20%+ duplicates reaches max penalty
  const duplicatePenalty = Math.min(30, (duplicatePercentage / 20) * 30);
  const uniquenessScore = Math.max(0, Math.round(100 - (duplicatePercentage / 20) * 100));

  // 3. Outliers Analysis
  const totalOutliers = outlierMetrics.reduce((sum, metric) => sum + (metric.iqrCount || 0), 0);
  const numNumericalCols = Math.max(1, metadata.numericalColumns.length);
  const totalNumericalPoints = Math.max(1, numRows * numNumericalCols);
  const outlierPercentage = (totalOutliers / totalNumericalPoints) * 100;
  // Outlier penalty weight: 30% of total score
  // 0% outliers = 0 penalty, 15%+ outliers reaches max penalty
  const outlierPenalty = Math.min(30, (outlierPercentage / 15) * 30);
  const consistencyScore = Math.max(0, Math.round(100 - (outlierPercentage / 15) * 100));

  // Overall Data Quality Index (0 - 100)
  const rawScore = 100 - (missingPenalty + duplicatePenalty + outlierPenalty);
  const overallScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Qualitative Grade & Status
  let grade = "Grade A";
  let gradeLabel = "Optimal Quality";
  let gradeColor = "text-emerald-400";
  let gradeBg = "bg-emerald-500/10 border-emerald-500/20";
  let statusSummary = "Dataset possesses high statistical fidelity, zero critical anomalies, and is ready for modeling.";

  if (overallScore < 55) {
    grade = "Grade D";
    gradeLabel = "Critical Degradation";
    gradeColor = "text-rose-400";
    gradeBg = "bg-rose-500/10 border-rose-500/20";
    statusSummary = "Severe missingness, duplicate clustering, or extreme outlier dispersion detected. Immediate pipeline remediation required.";
  } else if (overallScore < 75) {
    grade = "Grade C";
    gradeLabel = "Moderate Quality";
    gradeColor = "text-amber-400";
    gradeBg = "bg-amber-500/10 border-amber-500/20";
    statusSummary = "Moderate data quality degradation. Statistical imputation and outlier winsorization recommended.";
  } else if (overallScore < 90) {
    grade = "Grade B";
    gradeLabel = "Good Quality";
    gradeColor = "text-blue-400";
    gradeBg = "bg-blue-500/10 border-blue-500/20";
    statusSummary = "Dataset is generally well-formed with minor missing values or localized anomalies.";
  }

  return {
    numRows,
    numCols,
    totalCells,
    totalNullCells,
    missingPercentage: Number(missingPercentage.toFixed(2)),
    missingPenalty: Number(missingPenalty.toFixed(1)),
    completenessScore,
    duplicateRowsCount,
    duplicatePercentage: Number(duplicatePercentage.toFixed(2)),
    duplicatePenalty: Number(duplicatePenalty.toFixed(1)),
    uniquenessScore,
    totalOutliers,
    outlierPercentage: Number(outlierPercentage.toFixed(2)),
    outlierPenalty: Number(outlierPenalty.toFixed(1)),
    consistencyScore,
    overallScore,
    grade,
    gradeLabel,
    gradeColor,
    gradeBg,
    statusSummary,
  };
}

interface DataQualityIndexProps {
  metadata: DatasetMetadata;
  outlierMetrics?: OutlierMetric[];
  onNavigateCleaning?: () => void;
  sessionHistory?: DQISessionPoint[];
  onAddCheckpoint?: (name?: string) => void;
  onClearHistory?: () => void;
}

export const DataQualityIndex: React.FC<DataQualityIndexProps> = ({
  metadata,
  outlierMetrics = [],
  onNavigateCleaning,
  sessionHistory = [],
  onAddCheckpoint,
  onClearHistory,
}) => {
  const qualityStats = useMemo(() => {
    return calculateDQIStats(metadata, outlierMetrics);
  }, [metadata, outlierMetrics]);

  // Stroke offset for circular meter (circumference = 2 * PI * r = 2 * Math.PI * 40 = 251.32)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (qualityStats.overallScore / 100) * circumference;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Data Quality Index (DQI)</h3>
            <p className="text-xs text-slate-400">
              Composite telemetry score evaluated across completeness, uniqueness, and outlier boundaries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`px-2.5 py-1 rounded-lg border text-xs font-semibold uppercase flex items-center gap-1.5 ${qualityStats.gradeBg} ${qualityStats.gradeColor}`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{qualityStats.grade}: {qualityStats.gradeLabel}</span>
          </div>
        </div>
      </div>

      {/* Main Scoring Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Circular Dial & Primary Score */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-slate-800"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className={
                  qualityStats.overallScore >= 90
                    ? "text-emerald-500"
                    : qualityStats.overallScore >= 75
                    ? "text-blue-500"
                    : qualityStats.overallScore >= 55
                    ? "text-amber-500"
                    : "text-rose-500"
                }
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-light text-white tracking-tight">
                {qualityStats.overallScore}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                / 100 pts
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-medium mt-3">
            Overall Health Index
          </p>
          <p className="text-[11px] text-slate-500 max-w-xs mt-1 leading-relaxed">
            {qualityStats.statusSummary}
          </p>
        </div>

        {/* 3 Core Quality Pillars */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* 1. Completeness / Missing Values */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between space-y-2.5">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Completeness</span>
                <AlertTriangle className={`w-3.5 h-3.5 ${qualityStats.totalNullCells > 0 ? "text-amber-400" : "text-emerald-400"}`} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-light text-white">{qualityStats.completenessScore}%</span>
                <span className="text-[10px] text-slate-500 font-mono">Score</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {qualityStats.totalNullCells} null cells ({qualityStats.missingPercentage}%)
              </p>
            </div>

            <div className="space-y-1 pt-1 border-t border-slate-800/80">
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${qualityStats.completenessScore}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Weight: 40%</span>
                <span className={qualityStats.missingPenalty > 0 ? "text-amber-400" : "text-emerald-400"}>
                  -{qualityStats.missingPenalty} pts
                </span>
              </div>
            </div>
          </div>

          {/* 2. Uniqueness / Duplicate Rows */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between space-y-2.5">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Uniqueness</span>
                <FileCode2 className={`w-3.5 h-3.5 ${qualityStats.duplicateRowsCount > 0 ? "text-rose-400" : "text-emerald-400"}`} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-light text-white">{qualityStats.uniquenessScore}%</span>
                <span className="text-[10px] text-slate-500 font-mono">Score</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {qualityStats.duplicateRowsCount} duplicate rows ({qualityStats.duplicatePercentage}%)
              </p>
            </div>

            <div className="space-y-1 pt-1 border-t border-slate-800/80">
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${qualityStats.uniquenessScore}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Weight: 30%</span>
                <span className={qualityStats.duplicatePenalty > 0 ? "text-rose-400" : "text-emerald-400"}>
                  -{qualityStats.duplicatePenalty} pts
                </span>
              </div>
            </div>
          </div>

          {/* 3. Consistency / Outliers */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between space-y-2.5">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Consistency</span>
                <ShieldAlert className={`w-3.5 h-3.5 ${qualityStats.totalOutliers > 0 ? "text-blue-400" : "text-emerald-400"}`} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-light text-white">{qualityStats.consistencyScore}%</span>
                <span className="text-[10px] text-slate-500 font-mono">Score</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {qualityStats.totalOutliers} outliers ({qualityStats.outlierPercentage}%)
              </p>
            </div>

            <div className="space-y-1 pt-1 border-t border-slate-800/80">
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${qualityStats.consistencyScore}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Weight: 30%</span>
                <span className={qualityStats.outlierPenalty > 0 ? "text-blue-400" : "text-emerald-400"}>
                  -{qualityStats.outlierPenalty} pts
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DQI Historical Progression Sparkline across Analysis Sessions */}
      <DQISparkline
        sessionHistory={sessionHistory}
        currentScore={qualityStats.overallScore}
        onAddCheckpoint={onAddCheckpoint}
        onClearHistory={onClearHistory}
      />

      {/* Mathematical Breakdown Details Bar */}
      <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-[11px]">
            Formula: <code className="text-slate-200 font-mono font-semibold">DQI = 100 - [40% Missing + 30% Duplicates + 30% Outliers]</code>
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span>Total Records: <strong className="text-slate-300 font-mono">{qualityStats.numRows.toLocaleString()}</strong></span>
          <span>Matrix Cells: <strong className="text-slate-300 font-mono">{qualityStats.totalCells.toLocaleString()}</strong></span>
        </div>
      </div>
    </div>
  );
};
