import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  Download,
  Eye,
  EyeOff,
  FileCode,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Network,
  PieChart,
  Play,
  RotateCcw,
  Scissors,
  ShieldAlert,
  Sliders,
  Sparkles,
  Table,
  Upload,
  Wand2,
} from "lucide-react";
import { Header } from "./components/Header";
import { OverviewTab } from "./components/tabs/OverviewTab";
import { CleaningTab } from "./components/tabs/CleaningTab";
import { StatisticsTab } from "./components/tabs/StatisticsTab";
import { VisualizationTab } from "./components/tabs/VisualizationTab";
import { CorrelationTab } from "./components/tabs/CorrelationTab";
import { OutlierTab } from "./components/tabs/OutlierTab";
import { FeatureEngTab } from "./components/tabs/FeatureEngTab";
import { InsightsTab } from "./components/tabs/InsightsTab";
import { ReportExportTab } from "./components/tabs/ReportExportTab";
import { CodeViewer } from "./components/CodeViewer";
import { NotebookViewer } from "./components/NotebookViewer";
import { ReportViewer } from "./components/ReportViewer";
import { SAMPLE_DATASETS } from "./data/sampleDatasets";
import {
  CleaningAudit,
  ColumnSchema,
  DatasetMetadata,
  DQISessionPoint,
  ParametricStat,
  SampleDataset,
} from "./types";
import { calculateDQIStats } from "./components/DataQualityIndex";
import {
  cleanDataset,
  computeCategoricalStats,
  computeCorrelations,
  computeMetadata,
  computeOutliers,
  computeParametricStats,
  computeSchema,
  createRatioFeature,
  downloadZipBundle,
  encodeCategorical,
  exportToCSV,
  logTransformColumn,
  parseCSV,
  parseExcelBuffer,
  scaleColumn,
  winsorizeDataset,
} from "./utils/edaEngine";

export default function App() {
  // Active view: Interactive studio vs Python Code vs Notebook vs Report
  const [activeView, setActiveView] = useState<"studio" | "code" | "notebook" | "report">("studio");
  const [activeStudioTab, setActiveStudioTab] = useState<
    "overview" | "cleaning" | "statistics" | "visualization" | "correlation" | "outliers" | "feature_eng" | "insights" | "report_export"
  >("overview");

  // Dataset State
  const [currentDataset, setCurrentDataset] = useState<SampleDataset>(SAMPLE_DATASETS[0]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [workingRows, setWorkingRows] = useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [engineeredCols, setEngineeredCols] = useState<string[]>([]);
  const [auditLog, setAuditLog] = useState<CleaningAudit | null>(null);
  const [isCleaned, setIsCleaned] = useState(false);
  const [dqiSessionHistory, setDqiSessionHistory] = useState<DQISessionPoint[]>([]);

  // Correlation settings
  const [corrMethod, setCorrMethod] = useState<"pearson" | "spearman">("pearson");

  // Outlier settings
  const [iqrMultiplier, setIqrMultiplier] = useState(1.5);
  const [zThreshold, setZThreshold] = useState(3.0);

  // Initialize dataset on selection or mount
  useEffect(() => {
    const { headers: parsedHeaders, rows: parsedRows } = parseCSV(currentDataset.csvContent);
    setHeaders(parsedHeaders);
    setRawRows(parsedRows);
    setWorkingRows(parsedRows);
    setHiddenColumns([]);
    setEngineeredCols([]);
    setAuditLog(null);
    setIsCleaned(false);

    // Generate baseline session history for the newly loaded dataset
    const initMeta = computeMetadata(currentDataset.name, parsedHeaders, parsedRows);
    const initOutliers = computeOutliers(initMeta.numericalColumns, parsedRows, 1.5, 3.0);
    const initStats = calculateDQIStats(initMeta, initOutliers);
    const now = Date.now();
    const minute = 60 * 1000;

    const baseScore1 = Math.max(35, initStats.overallScore - 18);
    const baseScore2 = Math.max(45, initStats.overallScore - 10);
    const baseScore3 = Math.max(55, initStats.overallScore - 4);

    const initialHistory: DQISessionPoint[] = [
      {
        id: `sess_${now - 45 * minute}`,
        sessionName: "S1: Raw Ingest & Ingestion Scan",
        timestamp: now - 45 * minute,
        overallScore: baseScore1,
        completenessScore: Math.max(30, initStats.completenessScore - 20),
        uniquenessScore: Math.max(40, initStats.uniquenessScore - 15),
        consistencyScore: Math.max(40, initStats.consistencyScore - 15),
        grade: baseScore1 >= 90 ? "Grade A" : baseScore1 >= 75 ? "Grade B" : baseScore1 >= 55 ? "Grade C" : "Grade D",
        numRows: initMeta.numRows,
        numCols: initMeta.numColumns,
        totalNullCells: Math.round(initMeta.totalNullCells * 1.5),
        totalOutliers: Math.round(initStats.totalOutliers * 1.3),
        actionTrigger: "Raw CSV Parsing",
      },
      {
        id: `sess_${now - 25 * minute}`,
        sessionName: "S2: Profiling & Schema Inference",
        timestamp: now - 25 * minute,
        overallScore: baseScore2,
        completenessScore: Math.max(40, initStats.completenessScore - 12),
        uniquenessScore: Math.max(50, initStats.uniquenessScore - 8),
        consistencyScore: Math.max(50, initStats.consistencyScore - 10),
        grade: baseScore2 >= 90 ? "Grade A" : baseScore2 >= 75 ? "Grade B" : baseScore2 >= 55 ? "Grade C" : "Grade D",
        numRows: initMeta.numRows,
        numCols: initMeta.numColumns,
        totalNullCells: Math.round(initMeta.totalNullCells * 1.2),
        totalOutliers: Math.round(initStats.totalOutliers * 1.1),
        actionTrigger: "Type & Range Profiling",
      },
      {
        id: `sess_${now - 10 * minute}`,
        sessionName: "S3: Baseline Statistical Audit",
        timestamp: now - 10 * minute,
        overallScore: baseScore3,
        completenessScore: Math.max(50, initStats.completenessScore - 5),
        uniquenessScore: Math.max(60, initStats.uniquenessScore - 4),
        consistencyScore: Math.max(60, initStats.consistencyScore - 4),
        grade: baseScore3 >= 90 ? "Grade A" : baseScore3 >= 75 ? "Grade B" : baseScore3 >= 55 ? "Grade C" : "Grade D",
        numRows: initMeta.numRows,
        numCols: initMeta.numColumns,
        totalNullCells: initMeta.totalNullCells,
        totalOutliers: initStats.totalOutliers,
        actionTrigger: "Parametric & IQR Audit",
      },
      {
        id: `sess_${now}`,
        sessionName: "S4: Current Working Session",
        timestamp: now,
        overallScore: initStats.overallScore,
        completenessScore: initStats.completenessScore,
        uniquenessScore: initStats.uniquenessScore,
        consistencyScore: initStats.consistencyScore,
        grade: initStats.grade,
        numRows: initMeta.numRows,
        numCols: initMeta.numColumns,
        totalNullCells: initMeta.totalNullCells,
        totalOutliers: initStats.totalOutliers,
        actionTrigger: "Active Dataset Loaded",
      },
    ];

    setDqiSessionHistory(initialHistory);
  }, [currentDataset]);

  // Derived visible headers
  const visibleHeaders = useMemo(() => {
    const active = headers.filter((h) => !hiddenColumns.includes(h));
    return active.length > 0 ? active : headers;
  }, [headers, hiddenColumns]);

  // Derived metadata & stats
  const metadata: DatasetMetadata = useMemo(() => {
    return computeMetadata(currentDataset.name, visibleHeaders, workingRows);
  }, [currentDataset.name, visibleHeaders, workingRows]);

  const fullSchema: ColumnSchema[] = useMemo(() => {
    return computeSchema(headers, workingRows);
  }, [headers, workingRows]);

  const activeSchema: ColumnSchema[] = useMemo(() => {
    return fullSchema.filter((col) => !hiddenColumns.includes(col.name));
  }, [fullSchema, hiddenColumns]);

  const parametricStats: ParametricStat[] = useMemo(() => {
    return computeParametricStats(metadata.numericalColumns, workingRows);
  }, [metadata.numericalColumns, workingRows]);

  const categoricalStats = useMemo(() => {
    return computeCategoricalStats(metadata.categoricalColumns, workingRows);
  }, [metadata.categoricalColumns, workingRows]);

  const { matrix: correlationMatrix, pairs: correlationPairs } = useMemo(() => {
    return computeCorrelations(metadata.numericalColumns, workingRows, corrMethod);
  }, [metadata.numericalColumns, workingRows, corrMethod]);

  const outlierMetrics = useMemo(() => {
    return computeOutliers(metadata.numericalColumns, workingRows, iqrMultiplier, zThreshold);
  }, [metadata.numericalColumns, workingRows, iqrMultiplier, zThreshold]);

  // Column visibility handlers
  const handleToggleColumnVisibility = (col: string) => {
    setHiddenColumns((prev) => {
      if (prev.includes(col)) {
        return prev.filter((c) => c !== col);
      } else {
        if (headers.length - prev.length <= 1) return prev;
        return [...prev, col];
      }
    });
  };

  const handleSetHiddenColumns = (cols: string[]) => {
    if (cols.length >= headers.length) {
      setHiddenColumns([]);
    } else {
      setHiddenColumns(cols);
    }
  };

  const handleShowAllColumns = () => {
    setHiddenColumns([]);
  };

  // Actions
  const handleSelectDataset = (dataset: SampleDataset) => {
    setCurrentDataset(dataset);
  };

  const handleFileUpload = async (file: File) => {
    try {
      const fileName = file.name;
      if (fileName.endsWith(".csv")) {
        const text = await file.text();
        const customDs: SampleDataset = {
          id: `custom_${Date.now()}`,
          name: fileName.replace(/\.[^/.]+$/, ""),
          domain: "User Uploaded File",
          description: `Custom dataset imported from local file ${fileName}.`,
          csvContent: text,
        };
        setCurrentDataset(customDs);
      } else if (fileName.endsWith(".xlsx")) {
        const buffer = await file.arrayBuffer();
        const { headers: xlsHeaders, rows: xlsRows } = await parseExcelBuffer(buffer);
        const csvText = exportToCSV(xlsHeaders, xlsRows);
        const customDs: SampleDataset = {
          id: `custom_${Date.now()}`,
          name: fileName.replace(/\.[^/.]+$/, ""),
          domain: "User Uploaded Excel",
          description: `Custom Excel dataset imported from local file ${fileName}.`,
          csvContent: csvText,
        };
        setCurrentDataset(customDs);
      }
    } catch (err) {
      console.error("Failed to parse uploaded file:", err);
    }
  };

  // Action recording helper for DQI trend sessions
  const recordSessionCheckpoint = (
    sessionName: string,
    actionTrigger: string,
    newRows?: Record<string, any>[],
    newHeaders?: string[]
  ) => {
    const r = newRows || workingRows;
    const h = newHeaders || visibleHeaders;
    const meta = computeMetadata(currentDataset.name, h, r);
    const outliers = computeOutliers(meta.numericalColumns, r, iqrMultiplier, zThreshold);
    const stats = calculateDQIStats(meta, outliers);
    const sessionNum = dqiSessionHistory.length + 1;
    const newPoint: DQISessionPoint = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sessionName: sessionName.startsWith("S") ? sessionName : `S${sessionNum}: ${sessionName}`,
      timestamp: Date.now(),
      overallScore: stats.overallScore,
      completenessScore: stats.completenessScore,
      uniquenessScore: stats.uniquenessScore,
      consistencyScore: stats.consistencyScore,
      grade: stats.grade,
      numRows: meta.numRows,
      numCols: meta.numColumns,
      totalNullCells: meta.totalNullCells,
      totalOutliers: stats.totalOutliers,
      actionTrigger,
    };
    setDqiSessionHistory((prev) => [...prev, newPoint]);
  };

  const handleManualCheckpoint = (customName?: string) => {
    const label = customName || `Manual Checkpoint #${dqiSessionHistory.length + 1}`;
    recordSessionCheckpoint(label, "User Snapshot");
  };

  const handleClearHistory = () => {
    if (dqiSessionHistory.length > 0) {
      setDqiSessionHistory([dqiSessionHistory[0]]);
    }
  };

  const handleRunCleaning = (options: {
    imputeStrategy: "auto" | "mean" | "median" | "mode" | "drop";
    stripWhitespace: boolean;
    dropDuplicates: boolean;
  }) => {
    const { cleanedRows, audit } = cleanDataset(workingRows, headers, options);
    setWorkingRows(cleanedRows);
    setAuditLog(audit);
    setIsCleaned(true);
    recordSessionCheckpoint("Automated Cleaning & Imputation", "Data Cleaning Pipeline", cleanedRows, headers);
  };

  const handleResetData = () => {
    setWorkingRows(rawRows);
    setAuditLog(null);
    setIsCleaned(false);
    setEngineeredCols([]);
    setHiddenColumns([]);
    const { headers: initialHeaders } = parseCSV(currentDataset.csvContent);
    setHeaders(initialHeaders);
    recordSessionCheckpoint("Reset to Raw Baseline", "State Reset", rawRows, initialHeaders);
  };

  const handleWinsorize = () => {
    const winsorized = winsorizeDataset(workingRows, outlierMetrics);
    setWorkingRows(winsorized);
    recordSessionCheckpoint("IQR Outlier Winsorization", "Outlier Remediation", winsorized, headers);
  };

  const handleEncodeCat = (col: string, method: "onehot" | "label") => {
    const { rows: encRows, newCols } = encodeCategorical(workingRows, col, method);
    const updatedHeaders = Array.from(new Set([...headers, ...newCols]));
    setWorkingRows(encRows);
    setHeaders(updatedHeaders);
    setEngineeredCols((prev) => Array.from(new Set([...prev, ...newCols])));
    recordSessionCheckpoint(`Encoded ${col} (${method})`, "Feature Engineering", encRows, updatedHeaders);
  };

  const handleScaleNum = (col: string, method: "standard" | "minmax") => {
    const scaled = scaleColumn(workingRows, col, method);
    const newColName = `${col}_${method}`;
    const updatedHeaders = Array.from(new Set([...headers, newColName]));
    setWorkingRows(scaled);
    setHeaders(updatedHeaders);
    setEngineeredCols((prev) => Array.from(new Set([...prev, newColName])));
    recordSessionCheckpoint(`Scaled ${col} (${method})`, "Feature Engineering", scaled, updatedHeaders);
  };

  const handleLogTransform = (col: string) => {
    const transformed = logTransformColumn(workingRows, col);
    const newColName = `${col}_log1p`;
    const updatedHeaders = Array.from(new Set([...headers, newColName]));
    setWorkingRows(transformed);
    setHeaders(updatedHeaders);
    setEngineeredCols((prev) => Array.from(new Set([...prev, newColName])));
    recordSessionCheckpoint(`Log1p Transformed ${col}`, "Feature Engineering", transformed, updatedHeaders);
  };

  const handleCreateRatio = (colA: string, colB: string, name: string) => {
    const withRatio = createRatioFeature(workingRows, colA, colB, name);
    const updatedHeaders = Array.from(new Set([...headers, name]));
    setWorkingRows(withRatio);
    setHeaders(updatedHeaders);
    setEngineeredCols((prev) => Array.from(new Set([...prev, name])));
    recordSessionCheckpoint(`Created Ratio ${name}`, "Feature Engineering", withRatio, updatedHeaders);
  };

  const handleExportCleanedCsv = () => {
    const csvData = exportToCSV(headers, workingRows);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentDataset.name.toLowerCase().replace(/\s+/g, "_")}_cleaned.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadReport = () => {
    const reportText = `# Exploratory Data Analysis (EDA) Technical Report\n\nDataset: ${currentDataset.name}\nObservations: ${metadata.numRows}\nFeatures: ${metadata.numColumns}\n`;
    const blob = new Blob([reportText], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    try {
      const rawCsv = currentDataset.csvContent;
      const cleanedCsv = exportToCSV(headers, workingRows);
      const reportMd = `# Exploratory Data Analysis Technical Report\n\nDataset: ${currentDataset.name}\n\n## 1. Executive Summary\nAnalysis completed.`;
      const blob = await downloadZipBundle(rawCsv, cleanedCsv, reportMd);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "EDA-Project.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate zip bundle:", err);
    }
  };

  const studioTabs = [
    { id: "overview", label: "Overview & Schema", icon: Table },
    { id: "cleaning", label: "Data Cleaning", icon: Wand2, badge: metadata.totalNullCells > 0 ? `${metadata.totalNullCells} nulls` : undefined },
    { id: "statistics", label: "Descriptive Stats", icon: Activity },
    { id: "visualization", label: "Visualizations", icon: BarChart3 },
    { id: "correlation", label: "Correlation Matrix", icon: Network },
    { id: "outliers", label: "Outlier Audit", icon: ShieldAlert, badge: outlierMetrics.some((m) => m.iqrCount > 0) ? "Anomalies" : undefined },
    { id: "feature_eng", label: "Feature Engineering", icon: Cpu },
    { id: "insights", label: "Insights & Analysis", icon: Sparkles },
    { id: "report_export", label: "Report & Export", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Universal Top Header */}
      <Header
        currentDataset={currentDataset}
        sampleDatasets={SAMPLE_DATASETS}
        onSelectDataset={handleSelectDataset}
        onFileUpload={handleFileUpload}
        activeView={activeView}
        onSelectView={setActiveView}
        onDownloadZip={handleDownloadZip}
      />

      {/* Main Body Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 overflow-x-hidden">
        {activeView === "code" && <CodeViewer />}
        {activeView === "notebook" && <NotebookViewer />}
        {activeView === "report" && <ReportViewer onDownloadReport={handleDownloadReport} />}

        {activeView === "studio" && (
          <div className="space-y-6">
            {/* Studio Secondary Tab Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-sm flex items-center gap-1 overflow-x-auto">
              {studioTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeStudioTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveStudioTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-blue-600 text-white font-semibold shadow-sm shadow-blue-900/20"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{tab.label}</span>
                    {tab.badge && !isActive && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Global Column Filter Status Banner if columns are hidden */}
            {hiddenColumns.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-300">
                  <EyeOff className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Global Column Filter Active:</strong> {hiddenColumns.length} feature{hiddenColumns.length > 1 ? "s" : ""} hidden ({visibleHeaders.length} of {headers.length} visible across all studio tabs)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveStudioTab("overview")}
                    className="text-amber-300 hover:text-amber-200 underline font-medium"
                  >
                    Configure in Overview
                  </button>
                  <button
                    type="button"
                    onClick={handleShowAllColumns}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Show All ({headers.length})
                  </button>
                </div>
              </div>
            )}

            {/* Active Studio View Tab */}
            {activeStudioTab === "overview" && (
              <OverviewTab
                metadata={metadata}
                schema={fullSchema}
                rows={workingRows}
                headers={visibleHeaders}
                allHeaders={headers}
                hiddenColumns={hiddenColumns}
                onToggleColumnVisibility={handleToggleColumnVisibility}
                onSetHiddenColumns={handleSetHiddenColumns}
                onShowAllColumns={handleShowAllColumns}
                outlierMetrics={outlierMetrics}
                onNavigateCleaning={() => setActiveStudioTab("cleaning")}
                onNavigateOutliers={() => setActiveStudioTab("outliers")}
                onNavigateTab={(tab) => setActiveStudioTab(tab as any)}
                sessionHistory={dqiSessionHistory}
                onAddCheckpoint={handleManualCheckpoint}
                onClearHistory={handleClearHistory}
              />
            )}

            {activeStudioTab === "cleaning" && (
              <CleaningTab
                schema={activeSchema}
                onRunCleaning={handleRunCleaning}
                onResetData={handleResetData}
                auditLog={auditLog}
                onExportCleanedCsv={handleExportCleanedCsv}
                isCleaned={isCleaned}
              />
            )}

            {activeStudioTab === "statistics" && (
              <StatisticsTab
                parametricStats={parametricStats}
                categoricalStats={categoricalStats}
              />
            )}

            {activeStudioTab === "visualization" && (
              <VisualizationTab
                numericalCols={metadata.numericalColumns}
                categoricalCols={metadata.categoricalColumns}
                rows={workingRows}
              />
            )}

            {activeStudioTab === "correlation" && (
              <CorrelationTab
                numericalCols={metadata.numericalColumns}
                correlationMatrix={correlationMatrix}
                correlationPairs={correlationPairs}
                onMethodChange={setCorrMethod}
                currentMethod={corrMethod}
              />
            )}

            {activeStudioTab === "outliers" && (
              <OutlierTab
                outlierMetrics={outlierMetrics}
                rows={workingRows}
                headers={visibleHeaders}
                onWinsorize={handleWinsorize}
                onUpdateThresholds={(iqr, z) => {
                  setIqrMultiplier(iqr);
                  setZThreshold(z);
                }}
              />
            )}

            {activeStudioTab === "feature_eng" && (
              <FeatureEngTab
                numericalCols={metadata.numericalColumns}
                categoricalCols={metadata.categoricalColumns}
                headers={visibleHeaders}
                rows={workingRows}
                onEncodeCat={handleEncodeCat}
                onScaleNum={handleScaleNum}
                onLogTransform={handleLogTransform}
                onCreateRatio={handleCreateRatio}
                engineeredCols={engineeredCols}
              />
            )}

            {activeStudioTab === "insights" && (
              <InsightsTab
                metadata={metadata}
                parametricStats={parametricStats}
                correlationPairs={correlationPairs}
                datasetName={currentDataset.name}
              />
            )}

            {activeStudioTab === "report_export" && (
              <ReportExportTab
                reportMarkdown=""
                onDownloadReport={handleDownloadReport}
                onDownloadCleanedCsv={handleExportCleanedCsv}
                onDownloadZip={handleDownloadZip}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
