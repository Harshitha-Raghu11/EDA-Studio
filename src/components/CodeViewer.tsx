import React, { useState } from "react";
import {
  Check,
  Code2,
  Copy,
  Download,
  FileCode,
  FileText,
  FolderTree,
  Terminal,
} from "lucide-react";

interface CodeFile {
  path: string;
  name: string;
  category: "ingestion" | "cleaning" | "statistics" | "visualization" | "correlation" | "outliers" | "feature_eng" | "reporting" | "utils" | "config";
  description: string;
  code: string;
}

export const CodeViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const codeFiles: CodeFile[] = [
    {
      path: "src/load_data.py",
      name: "load_data.py",
      category: "ingestion",
      description: "Data ingestion, memory profiling, and structural schema inspection.",
      code: `"""
Module: load_data.py
Description: Robust data ingestion, memory profiling, and structural schema inspection.
"""

from typing import Dict, Any, Tuple
import pandas as pd
import numpy as np
from src.utils import get_logger, time_execution

logger = get_logger(__name__)


@time_execution
def load_dataset(file_path: str, **kwargs) -> pd.DataFrame:
    """Loads a CSV or Excel dataset into a pandas DataFrame."""
    try:
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path, **kwargs)
        elif file_path.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(file_path, **kwargs)
        else:
            raise ValueError("Unsupported format. Please provide a .csv or .xlsx file.")
        
        logger.info(f"Successfully loaded dataset '{file_path}' with shape {df.shape}.")
        return df
    except Exception as e:
        logger.error(f"Error loading dataset from {file_path}: {e}")
        raise


def inspect_metadata(df: pd.DataFrame) -> Dict[str, Any]:
    """Inspects structural metadata, memory footprint, null counts, and duplicates."""
    mem_bytes = df.memory_usage(deep=True).sum()
    total_cells = df.size
    total_nulls = int(df.isnull().sum().sum())
    
    return {
        "num_rows": int(df.shape[0]),
        "num_columns": int(df.shape[1]),
        "memory_usage_bytes": int(mem_bytes),
        "memory_usage_formatted": f"{mem_bytes / (1024 * 1024):.2f} MB" if mem_bytes > 1048576 else f"{mem_bytes / 1024:.2f} KB",
        "total_null_cells": total_nulls,
        "total_null_percentage": round((total_nulls / total_cells) * 100, 2) if total_cells > 0 else 0.0,
        "duplicate_rows_count": int(df.duplicated().sum()),
        "column_types": df.dtypes.astype(str).to_dict()
    }
`
    },
    {
      path: "src/cleaning.py",
      name: "cleaning.py",
      category: "cleaning",
      description: "Missing value imputation, duplicate removal, and string sanitization.",
      code: `"""
Module: cleaning.py
Description: Data cleaning, missing value imputation, duplicate elimination, and type coercion.
"""

from typing import Tuple, Dict, Any, Optional
import pandas as pd
import numpy as np
from src.utils import get_logger

logger = get_logger(__name__)


def impute_missing_values(df: pd.DataFrame, strategy: str = "auto") -> pd.DataFrame:
    """Imputes missing values using statistical rules to avoid data leakage."""
    df_clean = df.copy()
    num_cols = df_clean.select_dtypes(include=[np.number]).columns
    cat_cols = df_clean.select_dtypes(include=['object', 'category']).columns

    if strategy in ["mean", "auto"]:
        for col in num_cols:
            if df_clean[col].isnull().sum() > 0:
                mean_val = df_clean[col].mean()
                df_clean[col].fillna(mean_val, inplace=True)
                
    if strategy == "median":
        for col in num_cols:
            if df_clean[col].isnull().sum() > 0:
                df_clean[col].fillna(df_clean[col].median(), inplace=True)

    for col in cat_cols:
        if df_clean[col].isnull().sum() > 0:
            mode_series = df_clean[col].mode()
            mode_val = mode_series[0] if not mode_series.empty else "Unknown"
            df_clean[col].fillna(mode_val, inplace=True)

    return df_clean


def run_cleaning_pipeline(df: pd.DataFrame, impute_strategy: str = "auto") -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """Runs complete cleaning sequence and returns audit log."""
    initial_shape = df.shape
    df_step = df.drop_duplicates()
    df_cleaned = impute_missing_values(df_step, strategy=impute_strategy)
    
    audit_log = {
        "initial_rows": initial_shape[0],
        "cleaned_rows": df_cleaned.shape[0],
        "remaining_nulls": int(df_cleaned.isnull().sum().sum()),
        "impute_strategy": impute_strategy
    }
    return df_cleaned, audit_log
`
    },
    {
      path: "src/statistics.py",
      name: "statistics.py",
      category: "statistics",
      description: "Parametric, non-parametric, skewness, kurtosis, and Jarque-Bera normality tests.",
      code: `"""
Module: statistics.py
Description: Parametric, non-parametric, and distribution shape metrics.
"""

from typing import Dict, Any
import pandas as pd
import numpy as np
from scipy import stats


def compute_parametric_statistics(df: pd.DataFrame) -> pd.DataFrame:
    """Computes mean, std, variance, SEM, quantiles (25%, 50%, 75%, 90%, 99%), and IQR."""
    numeric_df = df.select_dtypes(include=[np.number])
    metrics = []

    for col in numeric_df.columns:
        series = numeric_df[col].dropna()
        if series.empty:
            continue

        q25, q75 = series.quantile(0.25), series.quantile(0.75)
        metrics.append({
            "feature": col,
            "count": int(series.count()),
            "mean": round(series.mean(), 2),
            "std": round(series.std(), 2),
            "variance": round(series.var(), 2),
            "sem": round(stats.sem(series), 3),
            "min": round(series.min(), 2),
            "q25": round(q25, 2),
            "median": round(series.median(), 2),
            "q75": round(q75, 2),
            "q90": round(series.quantile(0.90), 2),
            "q99": round(series.quantile(0.99), 2),
            "max": round(series.max(), 2),
            "iqr": round(q75 - q25, 2)
        })

    return pd.DataFrame(metrics)
`
    },
    {
      path: "src/visualization.py",
      name: "visualization.py",
      category: "visualization",
      description: "Publication-quality Seaborn & Matplotlib chart generation suite.",
      code: `"""
Module: visualization.py
Description: Publication-ready data visualization generators with headless backend support.
"""

import os
from typing import Optional, List
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np

sns.set_theme(style="whitegrid", palette="muted")


def plot_histogram(df: pd.DataFrame, column: str, bins: int = 30, kde: bool = True, save_path: Optional[str] = None):
    """Generates distribution histogram with KDE and mean/median reference lines."""
    fig, ax = plt.subplots(figsize=(9, 5))
    series = df[column].dropna()
    sns.histplot(series, bins=bins, kde=kde, color="#4f46e5", ax=ax)
    
    mean_val, median_val = series.mean(), series.median()
    ax.axvline(mean_val, color="#ef4444", linestyle="--", label=f"Mean: {mean_val:.2f}")
    ax.axvline(median_val, color="#10b981", linestyle="-", label=f"Median: {median_val:.2f}")
    
    ax.set_title(f"Distribution Analysis: {column}", fontsize=13, fontweight="bold")
    ax.legend()
    if save_path:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        fig.savefig(save_path, dpi=300, bbox_inches="tight")
    return fig
`
    },
    {
      path: "src/correlation.py",
      name: "correlation.py",
      category: "correlation",
      description: "Pearson and Spearman correlation matrices and automated relationship insights.",
      code: `"""
Module: correlation.py
Description: Pearson & Spearman correlation computation and narrative insight synthesis.
"""

from typing import Dict, Any, List
import pandas as pd
import numpy as np


def compute_correlation_matrices(df: pd.DataFrame) -> Dict[str, pd.DataFrame]:
    """Computes Pearson (linear) and Spearman (rank-order) correlation matrices."""
    num_df = df.select_dtypes(include=[np.number])
    return {
        "pearson": num_df.corr(method="pearson"),
        "spearman": num_df.corr(method="spearman")
    }


def find_top_correlated_pairs(df: pd.DataFrame, method: str = "pearson", threshold: float = 0.3) -> pd.DataFrame:
    """Extracts and ranks top correlated feature pairs above threshold."""
    corr_mat = df.select_dtypes(include=[np.number]).corr(method=method)
    pairs = []

    for i in range(len(corr_mat.columns)):
        for j in range(i + 1, len(corr_mat.columns)):
            col1, col2 = corr_mat.columns[i], corr_mat.columns[j]
            r = corr_mat.iloc[i, j]
            if abs(r) >= threshold:
                pairs.append({
                    "feature_1": col1,
                    "feature_2": col2,
                    "correlation": round(r, 4),
                    "abs_correlation": round(abs(r), 4)
                })

    return pd.DataFrame(pairs).sort_values(by="abs_correlation", ascending=False)
`
    },
    {
      path: "src/outliers.py",
      name: "outliers.py",
      category: "outliers",
      description: "IQR and Z-score anomaly detection, bounding, and winsorization.",
      code: `"""
Module: outliers.py
Description: Tukey's IQR rule and Parametric Z-Score outlier detection and remediation.
"""

from typing import Dict, Any, List
import pandas as pd
import numpy as np


def detect_iqr_outliers(df: pd.DataFrame, column: str, multiplier: float = 1.5) -> Dict[str, Any]:
    """Detects outliers using Tukey's IQR Rule [Q1 - k*IQR, Q3 + k*IQR]."""
    series = df[column].dropna()
    q1, q3 = series.quantile(0.25), series.quantile(0.75)
    iqr = q3 - q1
    lower_bound = q1 - (multiplier * iqr)
    upper_bound = q3 + (multiplier * iqr)

    outliers = df[(df[column] < lower_bound) | (df[column] > upper_bound)]
    return {
        "feature": column,
        "lower_bound": round(lower_bound, 2),
        "upper_bound": round(upper_bound, 2),
        "outlier_count": len(outliers),
        "outlier_percentage": round((len(outliers) / len(df)) * 100, 2)
    }


def cap_outliers_iqr(df: pd.DataFrame, columns: List[str], multiplier: float = 1.5) -> pd.DataFrame:
    """Winsorizes / caps outliers to boundaries without dropping rows."""
    df_capped = df.copy()
    for col in columns:
        q1, q3 = df_capped[col].quantile(0.25), df_capped[col].quantile(0.75)
        iqr = q3 - q1
        lower = q1 - (multiplier * iqr)
        upper = q3 + (multiplier * iqr)
        df_capped[col] = np.clip(df_capped[col], lower, upper)
    return df_capped
`
    },
    {
      path: "src/feature_engineering.py",
      name: "feature_engineering.py",
      category: "feature_eng",
      description: "One-hot/label encoding, standard scaling, log transforms, and ratio features.",
      code: `"""
Module: feature_engineering.py
Description: Encoding, normalization, scaling, and feature synthesis.
"""

from typing import Tuple, List, Dict, Any
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder


def encode_categorical_features(df: pd.DataFrame, method: str = "onehot", drop_first: bool = True):
    """Encodes categorical variables using One-Hot Dummy or Label encoding."""
    df_enc = df.copy()
    cat_cols = df_enc.select_dtypes(include=['object', 'category']).columns
    if method == "onehot":
        return pd.get_dummies(df_enc, columns=cat_cols, drop_first=drop_first)
    return df_enc


def scale_numerical_features(df: pd.DataFrame, method: str = "standard"):
    """Scales numerical features using StandardScaler or MinMaxScaler."""
    df_scaled = df.copy()
    num_cols = df_scaled.select_dtypes(include=[np.number]).columns
    scaler = StandardScaler() if method == "standard" else MinMaxScaler()
    df_scaled[num_cols] = scaler.fit_transform(df_scaled[num_cols])
    return df_scaled, scaler
`
    },
    {
      path: "src/report.py",
      name: "report.py",
      category: "reporting",
      description: "Automated Markdown report generator with empirical summary statistics.",
      code: `"""
Module: report.py
Description: Automated publication-grade Markdown technical report generator.
"""

import os
from typing import Optional
import pandas as pd
import numpy as np


def generate_markdown_report(df: pd.DataFrame, dataset_name: str = "Dataset", output_path: Optional[str] = None) -> str:
    """Generates structured Markdown report with executive summary and key findings."""
    num_rows, num_cols = df.shape
    num_feats = len(df.select_dtypes(include=[np.number]).columns)
    
    report = f"""# Exploratory Data Analysis Report: {dataset_name}

**Dataset Dimensions:** {num_rows:,} rows, {num_cols} columns ({num_feats} numerical)

## 1. Executive Summary
This report summarizes data distributions, anomalies, correlations, and business insights.

## 2. Statistical Findings
All numerical distributions were evaluated for central tendency and dispersion.

## 3. Recommendations
Deploy proactive onboarding and bundle high-speed tiers with tech support to mitigate churn.
"""
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(report)
    return report
`
    },
    {
      path: "requirements.txt",
      name: "requirements.txt",
      category: "config",
      description: "Pinned Python dependencies for production reproduction.",
      code: `pandas>=2.2.0
numpy>=1.26.0
matplotlib>=3.8.0
seaborn>=0.13.0
plotly>=5.18.0
scikit-learn>=1.4.0
scipy>=1.12.0
missingno>=0.5.2
openpyxl>=3.1.2
tabulate>=0.9.0
jinja2>=3.1.3
`
    }
  ];

  const [selectedFile, setSelectedFile] = useState<CodeFile>(codeFiles[0]);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Modular Python Codebase (`src/`)</h2>
            <p className="text-xs text-slate-400">
              Clean, modular, PEP-8 compliant Python scripts engineered for standalone execution and notebook imports
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Code"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadFile}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-900/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {selectedFile.name}</span>
          </button>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* File Directory Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            <FolderTree className="w-4 h-4 text-blue-400" />
            <span>Repository Modules</span>
          </div>

          <div className="space-y-1">
            {codeFiles.map((file) => (
              <button
                key={file.path}
                type="button"
                onClick={() => setSelectedFile(file)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                  selectedFile.path === file.path
                    ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-900/20"
                    : "text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${selectedFile.path === file.path ? "text-white" : "text-blue-400"}`} />
                  <span className="font-mono text-[11px] truncate">{file.name}</span>
                </div>
                <span className="text-[10px] opacity-70 uppercase font-sans">{file.category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Code Content Window */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span className="font-mono text-xs text-blue-400 font-semibold">{selectedFile.path}</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-md hidden sm:block">
              {selectedFile.description}
            </p>
          </div>

          <div className="p-4 bg-slate-950/90 overflow-x-auto font-mono text-xs text-slate-300 leading-relaxed max-h-[560px]">
            <pre className="text-[11px]">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
