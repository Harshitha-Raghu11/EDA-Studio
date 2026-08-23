export interface DatasetMetadata {
  name: string;
  numRows: number;
  numColumns: number;
  memoryUsageFormatted: string;
  memoryUsageRaw: number;
  totalNullCells: number;
  totalNullPercentage: number;
  duplicateRowsCount: number;
  numericalColumns: string[];
  categoricalColumns: string[];
}

export interface ColumnSchema {
  name: string;
  type: "numerical" | "categorical" | "datetime" | "boolean";
  nonNullCount: number;
  nullCount: number;
  nullPercentage: number;
  uniqueCount: number;
  sampleValue: string;
}

export interface ParametricStat {
  feature: string;
  count: number;
  mean: number;
  std: number;
  variance: number;
  sem: number;
  min: number;
  q25: number;
  median: number;
  q75: number;
  q90: number;
  q99: number;
  max: number;
  range: number;
  iqr: number;
  skewness: number;
  skewnessCategory: string;
  kurtosis: number;
  kurtosisCategory: string;
  isNormal: boolean;
  jbPValue: number;
}

export interface CategoryFrequency {
  label: string;
  count: number;
  percentage: number;
}

export interface CategoricalStat {
  feature: string;
  uniqueCount: number;
  mode: string;
  modeCount: number;
  modePercentage: number;
  nullCount: number;
  topFrequencies: CategoryFrequency[];
}

export interface CorrelationPair {
  feature1: string;
  feature2: string;
  r: number;
  absR: number;
  relationshipCategory: string;
  narrative: string;
}

export interface OutlierMetric {
  feature: string;
  iqrLower: number;
  iqrUpper: number;
  iqrCount: number;
  iqrPercentage: number;
  zCount: number;
  zPercentage: number;
  outlierRowIndices: number[];
}

export interface CleaningAudit {
  initialRows: number;
  initialColumns: number;
  cleanedRows: number;
  cleanedColumns: number;
  initialNulls: number;
  remainingNulls: number;
  duplicatesRemoved: number;
  operationsLog: string[];
}

export interface SampleDataset {
  id: string;
  name: string;
  domain: string;
  description: string;
  csvContent: string;
  targetCol?: string;
}

export interface DataInsightResponse {
  source: string;
  executiveSummary?: string;
  keyDrivers?: Array<{
    feature: string;
    impact: string;
    description: string;
  }>;
  anomaliesAndRisks?: Array<{
    riskArea: string;
    severity: string;
    mitigation: string;
  }>;
  strategicRecommendations?: string[];
  insights?: Array<{
    title: string;
    type: string;
    finding: string;
    action: string;
  }>;
}

export interface TemporalPoint {
  periodKey: string;
  displayLabel: string;
  timestamp: number;
  count: number;
  metricValue: number;
  metricAvg: number;
  metricSum: number;
  metricMin: number;
  metricMax: number;
  changePctFromPrev?: number;
}

export interface DQISessionPoint {
  id: string;
  sessionName: string;
  timestamp: number;
  overallScore: number;
  completenessScore: number;
  uniquenessScore: number;
  consistencyScore: number;
  grade: string;
  numRows: number;
  numCols: number;
  totalNullCells: number;
  totalOutliers: number;
  actionTrigger?: string;
}

export interface TemporalTrendAnalysis {
  dateColumn: string;
  metricColumn: string;
  aggregation: "count" | "mean" | "sum" | "median" | "min" | "max";
  granularity: "day" | "week" | "month" | "quarter" | "year";
  startDateFormatted: string;
  endDateFormatted: string;
  totalDaysSpan: number;
  totalPeriods: number;
  points: TemporalPoint[];
  overallGrowthPct: number;
  trendDirection: "increasing" | "decreasing" | "stable" | "volatile";
  peakPeriod: { period: string; value: number; count: number };
  troughPeriod: { period: string; value: number; count: number };
  avgValue: number;
  linearRegression: {
    slope: number;
    intercept: number;
    r2: number;
  };
  seasonalityInsight?: string;
  narrativeSummary: string;
}

