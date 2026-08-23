import Papa from "papaparse";
import JSZip from "jszip";
import {
  CategoricalStat,
  CategoryFrequency,
  CleaningAudit,
  ColumnSchema,
  CorrelationPair,
  DatasetMetadata,
  OutlierMetric,
  ParametricStat,
  TemporalPoint,
  TemporalTrendAnalysis,
} from "../types";

export function parseDateSafe(val: any): Date | null {
  if (val === null || val === undefined || val === "") return null;
  if (val instanceof Date && !isNaN(val.getTime())) return val;
  if (typeof val === "number") {
    // 4-digit year e.g. 2023
    if (val >= 1970 && val <= 2050) {
      return new Date(val, 0, 1);
    }
    // Unix seconds
    if (val > 1000000000 && val < 2500000000) {
      return new Date(val * 1000);
    }
    // Unix milliseconds
    if (val > 1000000000000 && val < 2500000000000) {
      return new Date(val);
    }
    return null;
  }
  const str = String(val).trim();
  if (str.length < 4 || str.length > 40) return null;

  // Pure numeric check - only allow 4 digit years
  if (/^\d+$/.test(str)) {
    if (str.length === 4) {
      const y = parseInt(str, 10);
      if (y >= 1970 && y <= 2050) return new Date(y, 0, 1);
    }
    return null;
  }

  // Common date formats: YYYY-MM-DD, YYYY/MM/DD, MM/DD/YYYY, DD-MM-YYYY, ISO strings
  const dateRegex = /^(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})([ T]\d{1,2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;
  if (dateRegex.test(str)) {
    const timestamp = Date.parse(str.replace(/\//g, "-"));
    if (!isNaN(timestamp)) {
      const d = new Date(timestamp);
      const y = d.getFullYear();
      if (y >= 1970 && y <= 2050) return d;
    }
  }

  const timestamp = Date.parse(str);
  if (!isNaN(timestamp)) {
    const d = new Date(timestamp);
    const y = d.getFullYear();
    if (y >= 1970 && y <= 2050) return d;
  }

  return null;
}

export function isDateValue(val: any): boolean {
  return parseDateSafe(val) !== null;
}

export function detectTemporalColumns(headers: string[], rows: Record<string, any>[]): string[] {
  const temporalCols: string[] = [];
  const sampleSize = Math.min(rows.length, 120);
  if (sampleSize === 0) return [];

  for (const h of headers) {
    let dateMatchCount = 0;
    let nonNullCount = 0;
    const nameLower = h.toLowerCase();
    const isNameHint =
      nameLower.includes("date") ||
      nameLower.includes("time") ||
      nameLower.includes("year") ||
      nameLower.includes("month") ||
      nameLower.includes("day") ||
      nameLower.includes("period") ||
      nameLower.includes("created") ||
      nameLower.includes("signup") ||
      nameLower.includes("hire") ||
      nameLower.includes("order") ||
      nameLower.includes("joined");

    for (let i = 0; i < sampleSize; i++) {
      const v = rows[i][h];
      if (v !== null && v !== undefined && v !== "") {
        nonNullCount++;
        if (isDateValue(v)) {
          dateMatchCount++;
        }
      }
    }

    if (
      nonNullCount > 0 &&
      ((dateMatchCount / nonNullCount >= 0.6) || (isNameHint && dateMatchCount / nonNullCount >= 0.35))
    ) {
      temporalCols.push(h);
    }
  }

  return temporalCols;
}


export function parseCSV(csvText: string): { headers: string[]; rows: Record<string, any>[] } {
  const result = Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  const headers = result.meta.fields || [];
  const rows = (result.data as Record<string, any>[]).map((row) => {
    const cleanRow: Record<string, any> = {};
    for (const key of headers) {
      cleanRow[key] = row[key] !== undefined ? row[key] : null;
    }
    return cleanRow;
  });

  return { headers, rows };
}

export async function parseExcelBuffer(buffer: ArrayBuffer): Promise<{ headers: string[]; rows: Record<string, any>[] }> {
  const { default: readXlsxFile } = await import("read-excel-file/browser");
  const sheets = await readXlsxFile(buffer);
  const jsonData = sheets[0]?.data ?? [];

  if (!jsonData || jsonData.length === 0) {
    return { headers: [], rows: [] };
  }

  const rawHeaders = jsonData[0] as string[];
  const headers = rawHeaders.map((h, i) => (h ? String(h).trim() : `Col_${i + 1}`));
  const rows: Record<string, any>[] = [];

  for (let i = 1; i < jsonData.length; i++) {
    const rowArray = jsonData[i];
    if (!rowArray || rowArray.length === 0) continue;
    const rowObj: Record<string, any> = {};
    headers.forEach((h, idx) => {
      const val = rowArray[idx];
      rowObj[h] = val !== undefined && val !== "" ? val : null;
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

export function computeMetadata(name: string, headers: string[], rows: Record<string, any>[]): DatasetMetadata {
  const numRows = rows.length;
  const numColumns = headers.length;

  let totalNullCells = 0;
  const numericalCols: string[] = [];
  const categoricalCols: string[] = [];

  for (const h of headers) {
    let numericCount = 0;
    let validCount = 0;

    for (const row of rows) {
      const val = row[h];
      if (val === null || val === undefined || val === "") {
        totalNullCells++;
      } else {
        validCount++;
        if (typeof val === "number" && !isNaN(val)) {
          numericCount++;
        }
      }
    }

    if (validCount > 0 && numericCount / validCount > 0.7) {
      numericalCols.push(h);
    } else {
      categoricalCols.push(h);
    }
  }

  // Deduplication check
  const rowStrings = new Set<string>();
  let duplicateRowsCount = 0;
  for (const row of rows) {
    const s = JSON.stringify(row);
    if (rowStrings.has(s)) {
      duplicateRowsCount++;
    } else {
      rowStrings.add(s);
    }
  }

  const memoryEstimate = numRows * numColumns * 16 + 1024;
  const memoryUsageFormatted =
    memoryEstimate > 1024 * 1024
      ? `${(memoryEstimate / (1024 * 1024)).toFixed(2)} MB`
      : `${(memoryEstimate / 1024).toFixed(1)} KB`;

  const totalCells = numRows * numColumns || 1;
  const totalNullPercentage = Number(((totalNullCells / totalCells) * 100).toFixed(2));

  return {
    name,
    numRows,
    numColumns,
    memoryUsageFormatted,
    memoryUsageRaw: memoryEstimate,
    totalNullCells,
    totalNullPercentage,
    duplicateRowsCount,
    numericalColumns: numericalCols,
    categoricalColumns: categoricalCols,
  };
}

export function computeSchema(headers: string[], rows: Record<string, any>[]): ColumnSchema[] {
  const n = rows.length;
  const sampleSize = Math.min(n, 120);

  return headers.map((col) => {
    let nulls = 0;
    const uniqueVals = new Set();
    let numericCount = 0;
    let dateCount = 0;
    let sample = "N/A";

    for (const row of rows) {
      const v = row[col];
      if (v === null || v === undefined || v === "") {
        nulls++;
      } else {
        uniqueVals.add(String(v));
        if (sample === "N/A") sample = String(v);
        if (typeof v === "number" && !isNaN(v)) numericCount++;
        if (isDateValue(v)) dateCount++;
      }
    }

    const nonNulls = n - nulls;
    const isDate = nonNulls > 0 && uniqueVals.size > 1 && dateCount / nonNulls > 0.6;
    const isNum = !isDate && nonNulls > 0 && numericCount / nonNulls > 0.7;

    // Check boolean
    let isBool = false;
    if (!isDate && !isNum && uniqueVals.size <= 2 && uniqueVals.size > 0) {
      const lowerVals = Array.from(uniqueVals).map((u) => String(u).toLowerCase());
      isBool = lowerVals.every((lv) => ["true", "false", "0", "1", "yes", "no"].includes(lv));
    }

    let detectedType: "numerical" | "categorical" | "datetime" | "boolean" = "categorical";
    if (isDate) detectedType = "datetime";
    else if (isNum) detectedType = "numerical";
    else if (isBool) detectedType = "boolean";

    return {
      name: col,
      type: detectedType,
      nonNullCount: nonNulls,
      nullCount: nulls,
      nullPercentage: n > 0 ? Number(((nulls / n) * 100).toFixed(2)) : 0,
      uniqueCount: uniqueVals.size,
      sampleValue: sample.length > 30 ? sample.substring(0, 27) + "..." : sample,
    };
  });
}

export function computeParametricStats(numericalCols: string[], rows: Record<string, any>[]): ParametricStat[] {
  return numericalCols.map((col) => {
    const values: number[] = [];
    for (const row of rows) {
      const v = row[col];
      if (typeof v === "number" && !isNaN(v)) {
        values.push(v);
      } else if (v !== null && v !== undefined && !isNaN(Number(v))) {
        values.push(Number(v));
      }
    }

    const count = values.length;
    if (count === 0) {
      return {
        feature: col,
        count: 0,
        mean: 0,
        std: 0,
        variance: 0,
        sem: 0,
        min: 0,
        q25: 0,
        median: 0,
        q75: 0,
        q90: 0,
        q99: 0,
        max: 0,
        range: 0,
        iqr: 0,
        skewness: 0,
        skewnessCategory: "N/A",
        kurtosis: 0,
        kurtosisCategory: "N/A",
        isNormal: false,
        jbPValue: 0,
      };
    }

    values.sort((a, b) => a - b);

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / count;

    let varSum = 0;
    let m3 = 0;
    let m4 = 0;
    for (const v of values) {
      const diff = v - mean;
      varSum += diff * diff;
      m3 += Math.pow(diff, 3);
      m4 += Math.pow(diff, 4);
    }

    const variance = count > 1 ? varSum / (count - 1) : 0;
    const std = Math.sqrt(variance);
    const sem = count > 1 ? std / Math.sqrt(count) : 0;

    const min = values[0];
    const max = values[values.length - 1];
    const range = max - min;

    const getQuantile = (q: number) => {
      const pos = (values.length - 1) * q;
      const base = Math.floor(pos);
      const rest = pos - base;
      if (values[base + 1] !== undefined) {
        return values[base] + rest * (values[base + 1] - values[base]);
      }
      return values[base];
    };

    const q25 = getQuantile(0.25);
    const median = getQuantile(0.5);
    const q75 = getQuantile(0.75);
    const q90 = getQuantile(0.9);
    const q99 = getQuantile(0.99);
    const iqr = q75 - q25;

    // Skewness (Sample adjusted)
    const skewness = std > 0 && count > 2 ? (m3 / count) / Math.pow(std, 3) : 0;
    let skewCat = "Approximately Symmetric";
    if (skewness >= 0.5) skewCat = "Moderately / Highly Right-Skewed (+)";
    else if (skewness <= -0.5) skewCat = "Moderately / Highly Left-Skewed (-)";

    // Excess Kurtosis (Fisher)
    const kurtosis = std > 0 && count > 3 ? (m4 / count) / Math.pow(std, 4) - 3 : 0;
    let kurtCat = "Mesokurtic (Normal)";
    if (kurtosis > 0.5) kurtCat = "Leptokurtic (Heavy tails / Outliers)";
    else if (kurtosis < -0.5) kurtCat = "Platykurtic (Light tails / Flat)";

    // Jarque-Bera statistic approximation
    const jb = (count / 6) * (Math.pow(skewness, 2) + Math.pow(kurtosis, 2) / 4);
    // Approximation for 2 DOF chi-square p-value
    const jbPValue = Math.exp(-jb / 2);
    const isNormal = jbPValue > 0.05;

    return {
      feature: col,
      count,
      mean: Number(mean.toFixed(2)),
      std: Number(std.toFixed(2)),
      variance: Number(variance.toFixed(2)),
      sem: Number(sem.toFixed(3)),
      min: Number(min.toFixed(2)),
      q25: Number(q25.toFixed(2)),
      median: Number(median.toFixed(2)),
      q75: Number(q75.toFixed(2)),
      q90: Number(q90.toFixed(2)),
      q99: Number(q99.toFixed(2)),
      max: Number(max.toFixed(2)),
      range: Number(range.toFixed(2)),
      iqr: Number(iqr.toFixed(2)),
      skewness: Number(skewness.toFixed(3)),
      skewnessCategory: skewCat,
      kurtosis: Number(kurtosis.toFixed(3)),
      kurtosisCategory: kurtCat,
      isNormal,
      jbPValue: Number(jbPValue.toFixed(4)),
    };
  });
}

export function computeCategoricalStats(categoricalCols: string[], rows: Record<string, any>[]): CategoricalStat[] {
  return categoricalCols.map((col) => {
    const freqMap: Record<string, number> = {};
    let nullCount = 0;

    for (const row of rows) {
      const v = row[col];
      if (v === null || v === undefined || v === "") {
        nullCount++;
      } else {
        const str = String(v);
        freqMap[str] = (freqMap[str] || 0) + 1;
      }
    }

    const totalValid = rows.length - nullCount;
    const sorted = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]): CategoryFrequency => ({
        label,
        count,
        percentage: totalValid > 0 ? Number(((count / totalValid) * 100).toFixed(1)) : 0,
      }));

    const modeEntry = sorted[0] || { label: "N/A", count: 0, percentage: 0 };

    return {
      feature: col,
      uniqueCount: Object.keys(freqMap).length,
      mode: modeEntry.label,
      modeCount: modeEntry.count,
      modePercentage: modeEntry.percentage,
      nullCount,
      topFrequencies: sorted.slice(0, 10),
    };
  });
}

export function computeCorrelations(
  numericalCols: string[],
  rows: Record<string, any>[],
  method: "pearson" | "spearman" = "pearson"
): { matrix: Record<string, Record<string, number>>; pairs: CorrelationPair[] } {
  const matrix: Record<string, Record<string, number>> = {};
  const pairs: CorrelationPair[] = [];

  for (const c1 of numericalCols) {
    matrix[c1] = {};
    for (const c2 of numericalCols) {
      matrix[c1][c2] = 0;
    }
  }

  // Extract numerical vectors
  const vectors: Record<string, number[]> = {};
  for (const col of numericalCols) {
    vectors[col] = rows.map((r) => {
      const v = Number(r[col]);
      return isNaN(v) ? 0 : v;
    });
  }

  const getRanks = (arr: number[]) => {
    const indexed = arr.map((val, idx) => ({ val, idx }));
    indexed.sort((a, b) => a.val - b.val);
    const ranks = new Array(arr.length);
    for (let i = 0; i < indexed.length; i++) {
      ranks[indexed[i].idx] = i + 1;
    }
    return ranks;
  };

  const processedVectors: Record<string, number[]> = {};
  if (method === "spearman") {
    for (const col of numericalCols) {
      processedVectors[col] = getRanks(vectors[col]);
    }
  } else {
    for (const col of numericalCols) {
      processedVectors[col] = vectors[col];
    }
  }

  for (let i = 0; i < numericalCols.length; i++) {
    const c1 = numericalCols[i];
    matrix[c1][c1] = 1.0;

    for (let j = i + 1; j < numericalCols.length; j++) {
      const c2 = numericalCols[j];
      const x = processedVectors[c1];
      const y = processedVectors[c2];
      const n = x.length;

      if (n === 0) continue;

      const meanX = x.reduce((a, b) => a + b, 0) / n;
      const meanY = y.reduce((a, b) => a + b, 0) / n;

      let num = 0;
      let denX = 0;
      let denY = 0;

      for (let k = 0; k < n; k++) {
        const dx = x[k] - meanX;
        const dy = y[k] - meanY;
        num += dx * dy;
        denX += dx * dx;
        denY += dy * dy;
      }

      const denom = Math.sqrt(denX * denY);
      const r = denom > 0 ? Number((num / denom).toFixed(3)) : 0;

      matrix[c1][c2] = r;
      matrix[c2][c1] = r;

      const absR = Math.abs(r);
      let cat = "Negligible / Uncorrelated";
      if (absR >= 0.8) cat = r > 0 ? "Very Strong Positive (+)" : "Very Strong Negative (-)";
      else if (absR >= 0.6) cat = r > 0 ? "Strong Positive (+)" : "Strong Negative (-)";
      else if (absR >= 0.4) cat = r > 0 ? "Moderate Positive (+)" : "Moderate Negative (-)";
      else if (absR >= 0.2) cat = r > 0 ? "Weak Positive (+)" : "Weak Negative (-)";

      let narrative = "";
      if (absR >= 0.4) {
        narrative =
          r > 0
            ? `Higher values of ${c1} strongly co-occur with increases in ${c2}.`
            : `Increases in ${c1} are consistently linked with sharp drops in ${c2}.`;
      } else {
        narrative = `Weak or negligible linear coupling between ${c1} and ${c2}.`;
      }

      pairs.push({
        feature1: c1,
        feature2: c2,
        r,
        absR,
        relationshipCategory: cat,
        narrative,
      });
    }
  }

  pairs.sort((a, b) => b.absR - a.absR);

  return { matrix, pairs };
}

export function computeOutliers(
  numericalCols: string[],
  rows: Record<string, any>[],
  iqrMultiplier = 1.5,
  zThreshold = 3.0
): OutlierMetric[] {
  const nTotal = rows.length;

  return numericalCols.map((col) => {
    const values: { val: number; idx: number }[] = [];
    for (let i = 0; i < rows.length; i++) {
      const v = Number(rows[i][col]);
      if (!isNaN(v)) {
        values.push({ val: v, idx: i });
      }
    }

    if (values.length < 4) {
      return {
        feature: col,
        iqrLower: 0,
        iqrUpper: 0,
        iqrCount: 0,
        iqrPercentage: 0,
        zCount: 0,
        zPercentage: 0,
        outlierRowIndices: [],
      };
    }

    values.sort((a, b) => a.val - b.val);
    const sortedVals = values.map((v) => v.val);

    const getQuantile = (q: number) => {
      const pos = (sortedVals.length - 1) * q;
      const base = Math.floor(pos);
      const rest = pos - base;
      return sortedVals[base] + rest * ((sortedVals[base + 1] ?? sortedVals[base]) - sortedVals[base]);
    };

    const q1 = getQuantile(0.25);
    const q3 = getQuantile(0.75);
    const iqr = q3 - q1;

    const lowerBound = q1 - iqrMultiplier * iqr;
    const upperBound = q3 + iqrMultiplier * iqr;

    const sum = sortedVals.reduce((a, b) => a + b, 0);
    const mean = sum / sortedVals.length;
    const variance = sortedVals.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (sortedVals.length - 1);
    const std = Math.sqrt(variance);

    const outlierIndices: number[] = [];
    let zCount = 0;

    for (const item of values) {
      const isIqr = item.val < lowerBound || item.val > upperBound;
      const isZ = std > 0 && Math.abs((item.val - mean) / std) >= zThreshold;

      if (isIqr) outlierIndices.push(item.idx);
      if (isZ) zCount++;
    }

    const iqrCount = outlierIndices.length;
    const iqrPercentage = nTotal > 0 ? Number(((iqrCount / nTotal) * 100).toFixed(1)) : 0;
    const zPercentage = nTotal > 0 ? Number(((zCount / nTotal) * 100).toFixed(1)) : 0;

    return {
      feature: col,
      iqrLower: Number(lowerBound.toFixed(2)),
      iqrUpper: Number(upperBound.toFixed(2)),
      iqrCount,
      iqrPercentage,
      zCount,
      zPercentage,
      outlierRowIndices: outlierIndices,
    };
  });
}

export function cleanDataset(
  rows: Record<string, any>[],
  headers: string[],
  options: {
    imputeStrategy: "auto" | "mean" | "median" | "mode" | "drop";
    stripWhitespace: boolean;
    dropDuplicates: boolean;
  }
): { cleanedRows: Record<string, any>[]; audit: CleaningAudit } {
  const initialRows = rows.length;
  const initialColumns = headers.length;

  let initialNulls = 0;
  for (const r of rows) {
    for (const h of headers) {
      if (r[h] === null || r[h] === undefined || r[h] === "") {
        initialNulls++;
      }
    }
  }

  const logs: string[] = [];

  // Step 1: Whitespace & empty token standardization
  let workingRows = rows.map((r) => {
    const newRow: Record<string, any> = {};
    for (const h of headers) {
      let val = r[h];
      if (typeof val === "string" && options.stripWhitespace) {
        val = val.trim();
        if (val === "" || ["none", "null", "nan", "n/a", "?"].includes(val.toLowerCase())) {
          val = null;
        }
      }
      newRow[h] = val;
    }
    return newRow;
  });
  if (options.stripWhitespace) logs.push("Stripped whitespace and standardized null tokens ('N/A', '?') to null.");

  // Step 2: Imputation
  if (options.imputeStrategy === "drop") {
    workingRows = workingRows.filter((r) => {
      return headers.every((h) => r[h] !== null && r[h] !== undefined && r[h] !== "");
    });
    logs.push("Dropped all rows containing any missing value.");
  } else {
    for (const h of headers) {
      const nonNulls = workingRows.map((r) => r[h]).filter((v) => v !== null && v !== undefined && v !== "");
      const isNum = nonNulls.length > 0 && nonNulls.every((v) => typeof v === "number" || !isNaN(Number(v)));

      let fillVal: any = null;
      if (isNum && (options.imputeStrategy === "mean" || options.imputeStrategy === "auto")) {
        const numArr = nonNulls.map(Number);
        fillVal = numArr.reduce((a, b) => a + b, 0) / (numArr.length || 1);
        fillVal = Number(fillVal.toFixed(2));
      } else if (isNum && options.imputeStrategy === "median") {
        const numArr = nonNulls.map(Number).sort((a, b) => a - b);
        fillVal = numArr[Math.floor(numArr.length / 2)] || 0;
      } else {
        // Mode for categorical
        const freq: Record<string, number> = {};
        for (const v of nonNulls) {
          const s = String(v);
          freq[s] = (freq[s] || 0) + 1;
        }
        const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
        fillVal = top ? top[0] : isNum ? 0 : "Unknown";
      }

      for (const r of workingRows) {
        if (r[h] === null || r[h] === undefined || r[h] === "") {
          r[h] = fillVal;
        }
      }
    }
    logs.push(`Imputed missing features using strategy: '${options.imputeStrategy}'.`);
  }

  // Step 3: Duplicate removal
  let duplicatesRemoved = 0;
  if (options.dropDuplicates) {
    const seen = new Set<string>();
    const deduped: Record<string, any>[] = [];
    for (const r of workingRows) {
      const s = JSON.stringify(r);
      if (!seen.has(s)) {
        seen.add(s);
        deduped.push(r);
      } else {
        duplicatesRemoved++;
      }
    }
    workingRows = deduped;
    logs.push(`Removed ${duplicatesRemoved} duplicate records.`);
  }

  let remainingNulls = 0;
  for (const r of workingRows) {
    for (const h of headers) {
      if (r[h] === null || r[h] === undefined || r[h] === "") {
        remainingNulls++;
      }
    }
  }

  const audit: CleaningAudit = {
    initialRows,
    initialColumns,
    cleanedRows: workingRows.length,
    cleanedColumns: headers.length,
    initialNulls,
    remainingNulls,
    duplicatesRemoved,
    operationsLog: logs,
  };

  return { cleanedRows: workingRows, audit };
}

export function winsorizeDataset(rows: Record<string, any>[], outlierMetrics: OutlierMetric[]): Record<string, any>[] {
  const boundaryMap = new Map<string, { lower: number; upper: number }>();
  for (const o of outlierMetrics) {
    boundaryMap.set(o.feature, { lower: o.iqrLower, upper: o.iqrUpper });
  }

  return rows.map((r) => {
    const newR = { ...r };
    for (const [col, bounds] of boundaryMap.entries()) {
      if (typeof newR[col] === "number") {
        newR[col] = Math.max(bounds.lower, Math.min(bounds.upper, newR[col]));
      }
    }
    return newR;
  });
}

export function encodeCategorical(
  rows: Record<string, any>[],
  column: string,
  method: "onehot" | "label"
): { rows: Record<string, any>[]; newCols: string[] } {
  const distinctVals = Array.from(new Set(rows.map((r) => String(r[column])))).sort();

  if (method === "label") {
    const labelMap = new Map<string, number>();
    distinctVals.forEach((val, idx) => labelMap.set(val, idx));

    const newRows = rows.map((r) => ({
      ...r,
      [`${column}_encoded`]: labelMap.get(String(r[column])) ?? 0,
    }));
    return { rows: newRows, newCols: [`${column}_encoded`] };
  } else {
    // One-hot dummy columns (dropping first level)
    const dummyCols = distinctVals.slice(1).map((val) => `${column}_${val.replace(/\s+/g, "_")}`);
    const newRows = rows.map((r) => {
      const rowCopy = { ...r };
      const currentVal = String(r[column]);
      for (const val of distinctVals.slice(1)) {
        const dummyName = `${column}_${val.replace(/\s+/g, "_")}`;
        rowCopy[dummyName] = currentVal === val ? 1 : 0;
      }
      return rowCopy;
    });
    return { rows: newRows, newCols: dummyCols };
  }
}

export function scaleColumn(
  rows: Record<string, any>[],
  column: string,
  method: "standard" | "minmax"
): Record<string, any>[] {
  const vals = rows.map((r) => Number(r[column])).filter((v) => !isNaN(v));
  if (vals.length === 0) return rows;

  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const std = Math.sqrt(vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (vals.length - 1)) || 1;

  return rows.map((r) => {
    const v = Number(r[column]);
    let scaled = 0;
    if (!isNaN(v)) {
      if (method === "standard") {
        scaled = (v - mean) / std;
      } else {
        scaled = max > min ? (v - min) / (max - min) : 0;
      }
    }
    return {
      ...r,
      [`${column}_${method}`]: Number(scaled.toFixed(3)),
    };
  });
}

export function logTransformColumn(rows: Record<string, any>[], column: string): Record<string, any>[] {
  return rows.map((r) => {
    const v = Number(r[column]);
    const logVal = !isNaN(v) && v >= 0 ? Math.log1p(v) : 0;
    return {
      ...r,
      [`${column}_log1p`]: Number(logVal.toFixed(3)),
    };
  });
}

export function createRatioFeature(
  rows: Record<string, any>[],
  colA: string,
  colB: string,
  newName: string
): Record<string, any>[] {
  return rows.map((r) => {
    const a = Number(r[colA]);
    const b = Number(r[colB]);
    const ratio = !isNaN(a) && !isNaN(b) && b !== 0 ? a / b : 0;
    return {
      ...r,
      [newName]: Number(ratio.toFixed(3)),
    };
  });
}

export function exportToCSV(headers: string[], rows: Record<string, any>[]): string {
  return Papa.unparse({
    fields: headers,
    data: rows,
  });
}

export async function downloadZipBundle(
  rawCsvContent: string,
  cleanedCsvContent: string,
  reportMd: string
): Promise<Blob> {
  const zip = new JSZip();

  // 1. Data folders
  zip.file("data/raw/customer_churn.csv", rawCsvContent);
  zip.file("data/processed/customer_churn_cleaned.csv", cleanedCsvContent);

  // 2. Reports
  zip.file("reports/report.md", reportMd);

  // 3. Requirements & License & Readme & Gitignore
  zip.file(
    "requirements.txt",
    `pandas>=2.2.0\nnumpy>=1.26.0\nmatplotlib>=3.8.0\nseaborn>=0.13.0\nplotly>=5.18.0\nscikit-learn>=1.4.0\nscipy>=1.12.0\nmissingno>=0.5.2\nopenpyxl>=3.1.2\ntabulate>=0.9.0\njinja2>=3.1.3\n`
  );
  zip.file(
    "LICENSE",
    `MIT License\n\nCopyright (c) 2026 EDA Project Contributors\n\nPermission is hereby granted, free of charge...`
  );
  zip.file(
    ".gitignore",
    `__pycache__/\n*.py[cod]\n*.so\n.env\n.venv\nenv/\nvenv/\nnode_modules/\ndist/\n.ipynb_checkpoints/\n`
  );

  // Add sample README
  zip.file("README.md", `# Exploratory Data Analysis (EDA) Project\n\nProduction-quality Exploratory Data Analysis Python repository.`);

  return await zip.generateAsync({ type: "blob" });
}

export function computeTemporalTrend(
  rows: Record<string, any>[],
  dateCol: string,
  metricCol: string = "_record_count",
  options?: {
    aggregation?: "count" | "mean" | "sum" | "median" | "min" | "max";
    granularity?: "auto" | "day" | "week" | "month" | "quarter" | "year";
  }
): TemporalTrendAnalysis | null {
  if (!rows || rows.length === 0 || !dateCol) return null;

  // Extract valid date rows
  const validEntries: { date: Date; value: number }[] = [];
  for (const r of rows) {
    const d = parseDateSafe(r[dateCol]);
    if (d) {
      let val = 1;
      if (metricCol !== "_record_count") {
        const raw = r[metricCol];
        val = typeof raw === "number" ? raw : Number(raw);
        if (isNaN(val)) continue;
      }
      validEntries.push({ date: d, value: val });
    }
  }

  if (validEntries.length === 0) return null;

  // Sort chronologically
  validEntries.sort((a, b) => a.date.getTime() - b.date.getTime());

  const firstDate = validEntries[0].date;
  const lastDate = validEntries[validEntries.length - 1].date;
  const totalDaysSpan = Math.max(1, Math.round((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));

  // Determine granularity
  let gran = options?.granularity || "auto";
  if (gran === "auto") {
    if (totalDaysSpan <= 45) gran = "day";
    else if (totalDaysSpan <= 180) gran = "week";
    else if (totalDaysSpan <= 365 * 3) gran = "month";
    else if (totalDaysSpan <= 365 * 8) gran = "quarter";
    else gran = "year";
  }
  const activeGranularity = gran as "day" | "week" | "month" | "quarter" | "year";

  const agg = options?.aggregation || (metricCol === "_record_count" ? "count" : "mean");

  // Group by period
  const groups = new Map<string, { label: string; timestamp: number; values: number[] }>();

  for (const entry of validEntries) {
    const d = entry.date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    let key = "";
    let label = "";
    const midTime = d.getTime();

    if (activeGranularity === "day") {
      key = `${year}-${month}-${day}`;
      label = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } else if (activeGranularity === "week") {
      const tempDate = new Date(d.getTime());
      tempDate.setHours(0, 0, 0, 0);
      tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
      const week1 = new Date(tempDate.getFullYear(), 0, 4);
      const weekNum = 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
      key = `${year}-W${String(weekNum).padStart(2, "0")}`;
      label = `W${weekNum} ${year}`;
    } else if (activeGranularity === "month") {
      key = `${year}-${month}`;
      label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } else if (activeGranularity === "quarter") {
      const q = Math.floor(d.getMonth() / 3) + 1;
      key = `${year}-Q${q}`;
      label = `Q${q} ${year}`;
    } else {
      key = `${year}`;
      label = `${year}`;
    }

    if (!groups.has(key)) {
      groups.set(key, { label, timestamp: midTime, values: [] });
    }
    groups.get(key)!.values.push(entry.value);
  }

  const sortedKeys = Array.from(groups.keys()).sort();
  const points: TemporalPoint[] = [];

  for (let i = 0; i < sortedKeys.length; i++) {
    const k = sortedKeys[i];
    const grp = groups.get(k)!;
    const vals = grp.values;
    const count = vals.length;
    const sum = vals.reduce((a, b) => a + b, 0);
    const avg = sum / (count || 1);
    const min = Math.min(...vals);
    const max = Math.max(...vals);

    let metricVal = count;
    if (agg === "mean") metricVal = Number(avg.toFixed(2));
    else if (agg === "sum") metricVal = Number(sum.toFixed(2));
    else if (agg === "min") metricVal = Number(min.toFixed(2));
    else if (agg === "max") metricVal = Number(max.toFixed(2));
    else if (agg === "median") {
      const s = [...vals].sort((a, b) => a - b);
      metricVal = Number(s[Math.floor(s.length / 2)].toFixed(2));
    }

    const point: TemporalPoint = {
      periodKey: k,
      displayLabel: grp.label,
      timestamp: grp.timestamp,
      count,
      metricValue: metricVal,
      metricAvg: Number(avg.toFixed(2)),
      metricSum: Number(sum.toFixed(2)),
      metricMin: Number(min.toFixed(2)),
      metricMax: Number(max.toFixed(2)),
    };

    if (i > 0) {
      const prevVal = points[i - 1].metricValue;
      if (prevVal !== 0) {
        point.changePctFromPrev = Number((((metricVal - prevVal) / Math.abs(prevVal)) * 100).toFixed(1));
      }
    }

    points.push(point);
  }

  // Linear Regression
  const n = points.length;
  let slope = 0;
  let intercept = 0;
  let r2 = 0;

  if (n > 1) {
    const xVals = points.map((_, i) => i);
    const yVals = points.map((p) => p.metricValue);
    const xMean = (n - 1) / 2;
    const yMean = yVals.reduce((a, b) => a + b, 0) / n;

    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (xVals[i] - xMean) * (yVals[i] - yMean);
      den += Math.pow(xVals[i] - xMean, 2);
    }
    slope = den !== 0 ? num / den : 0;
    intercept = yMean - slope * xMean;

    let ssTot = 0;
    let ssRes = 0;
    for (let i = 0; i < n; i++) {
      const pred = slope * xVals[i] + intercept;
      ssRes += Math.pow(yVals[i] - pred, 2);
      ssTot += Math.pow(yVals[i] - yMean, 2);
    }
    r2 = ssTot !== 0 ? Math.max(0, Math.min(1, 1 - ssRes / ssTot)) : 0;
  }

  const firstVal = points[0]?.metricValue || 1;
  const lastVal = points[points.length - 1]?.metricValue || 1;
  const overallGrowthPct = firstVal !== 0 ? Number((((lastVal - firstVal) / Math.abs(firstVal)) * 100).toFixed(1)) : 0;

  let trendDirection: "increasing" | "decreasing" | "stable" | "volatile" = "stable";
  if (Math.abs(overallGrowthPct) > 5 && r2 >= 0.2) {
    trendDirection = overallGrowthPct > 0 ? "increasing" : "decreasing";
  } else if (r2 < 0.15 && points.length >= 4) {
    trendDirection = "volatile";
  }

  let peak = points[0];
  let trough = points[0];
  for (const p of points) {
    if (p.metricValue > peak.metricValue) peak = p;
    if (p.metricValue < trough.metricValue) trough = p;
  }

  const allVals = points.map((p) => p.metricValue);
  const avgVal = allVals.length > 0 ? Number((allVals.reduce((a, b) => a + b, 0) / allVals.length).toFixed(2)) : 0;

  const startDateFormatted = firstDate.toISOString().split("T")[0];
  const endDateFormatted = lastDate.toISOString().split("T")[0];

  const metricLabel = metricCol === "_record_count" ? "Record volume" : `Metric '${metricCol}' (${agg})`;
  let narrativeSummary = `${metricLabel} spans ${totalDaysSpan} days (${startDateFormatted} to ${endDateFormatted}) across ${points.length} ${activeGranularity} buckets. `;
  if (trendDirection === "increasing") {
    narrativeSummary += `Observed an upward temporal progression of +${overallGrowthPct}% with a peak in ${peak.displayLabel} (${peak.metricValue.toLocaleString()}).`;
  } else if (trendDirection === "decreasing") {
    narrativeSummary += `Observed a downward progression of ${overallGrowthPct}% over the observation window with baseline trough at ${trough.displayLabel} (${trough.metricValue.toLocaleString()}).`;
  } else if (trendDirection === "volatile") {
    narrativeSummary += `Telemetry displays fluctuating activity across intervals with high variance between peak (${peak.displayLabel}: ${peak.metricValue.toLocaleString()}) and baseline (${trough.displayLabel}: ${trough.metricValue.toLocaleString()}).`;
  } else {
    narrativeSummary += `Telemetry shows a steady progression with minimal deviation around the mean of ${avgVal.toLocaleString()}.`;
  }

  return {
    dateColumn: dateCol,
    metricColumn: metricCol,
    aggregation: agg as any,
    granularity: activeGranularity,
    startDateFormatted,
    endDateFormatted,
    totalDaysSpan,
    totalPeriods: points.length,
    points,
    overallGrowthPct,
    trendDirection,
    peakPeriod: { period: peak?.displayLabel || "N/A", value: peak?.metricValue || 0, count: peak?.count || 0 },
    troughPeriod: { period: trough?.displayLabel || "N/A", value: trough?.metricValue || 0, count: trough?.count || 0 },
    avgValue: avgVal,
    linearRegression: {
      slope: Number(slope.toFixed(3)),
      intercept: Number(intercept.toFixed(2)),
      r2: Number(r2.toFixed(3)),
    },
    narrativeSummary,
  };
}

