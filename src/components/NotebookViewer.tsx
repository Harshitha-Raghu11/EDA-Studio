import React, { useState } from "react";
import {
  BookOpen,
  Check,
  Code2,
  Copy,
  Download,
  FileCode2,
  Play,
  Terminal,
} from "lucide-react";

export const NotebookViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const notebookSections = [
    {
      title: "1. Environment Setup & Modular Library Imports",
      description: "Import standardized scientific computing packages alongside project modules from src/.",
      code: `import os
import sys
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

# Append project root to sys.path
sys.path.append(os.path.abspath('..'))

from src.load_data import load_dataset, inspect_metadata, get_schema_summary
from src.cleaning import run_cleaning_pipeline
from src.statistics import compute_parametric_statistics, compute_distribution_metrics
from src.visualization import plot_histogram, plot_boxplot, plot_correlation_matrix
from src.correlation import compute_correlation_matrices, find_top_correlated_pairs
from src.outliers import summarize_all_outliers, cap_outliers_iqr
from src.feature_engineering import encode_categorical_features, scale_numerical_features
from src.report import generate_markdown_report

print("All modules loaded successfully.")`,
      output: "All modules loaded successfully."
    },
    {
      title: "2. Data Ingestion & Structural Metadata Profiling",
      description: "Load raw customer telemetry data, check total memory footprint, row count, and column data types.",
      code: `DATA_PATH = '../data/raw/customer_churn.csv'
df_raw = load_dataset(DATA_PATH)

meta = inspect_metadata(df_raw)
print(f"Dataset Dimensions: {meta['num_rows']:,} rows × {meta['num_columns']} columns")
print(f"Memory Footprint: {meta['memory_usage_formatted']}")
print(f"Null Cells: {meta['total_null_cells']} ({meta['total_null_percentage']}%)")

df_raw.head()`,
      output: `Dataset Dimensions: 1,000 rows × 21 columns
Memory Footprint: 382.45 KB
Null Cells: 21 (0.10%)`
    },
    {
      title: "3. Data Cleaning & Quality Remediation Pipeline",
      description: "Execute missing value imputation, duplicate removal, and whitespace sanitation with full audit logging.",
      code: `df_clean, audit_log = run_cleaning_pipeline(
    df_raw, 
    impute_strategy='auto', 
    strip_strings=True, 
    drop_dups=True
)
print("Cleaning Audit Summary:", audit_log)
print("Remaining Null Cells:", df_clean.isnull().sum().sum())`,
      output: `Cleaning Audit Summary: {'initial_rows': 1000, 'cleaned_rows': 1000, 'remaining_nulls': 0, 'duplicates_removed': 0, 'impute_strategy': 'auto'}
Remaining Null Cells: 0`
    },
    {
      title: "4. Descriptive & Parametric Summary Statistics",
      description: "Measure central tendency (Mean, Median), dispersion (Standard Deviation, Variance, Range, IQR), and quantiles.",
      code: `parametric_stats = compute_parametric_statistics(df_clean)
parametric_stats`,
      output: `              feature   count     mean      std      min      q25   median      q75      max      iqr
0       tenure_months    1000    32.37    24.59     1.00     9.00    29.00    55.00    72.00    46.00
1     monthly_charges    1000    64.76    30.09    18.25    35.50    70.35    89.85   118.75    54.35
2       total_charges    1000  2283.30  2266.77    18.85   398.55  1397.48  3794.74  8684.80  3396.19
3     support_tickets    1000     1.42     1.34     0.00     0.00     1.00     2.00     6.00     2.00
4  satisfaction_score    1000     3.78     1.15     1.00     3.00     4.00     5.00     5.00     2.00`
    },
    {
      title: "5. Distribution Diagnostics & Normality Tests",
      description: "Analyze feature skewness, excess kurtosis, and Jarque-Bera hypothesis test p-values.",
      code: `dist_metrics = compute_distribution_metrics(df_clean)
dist_metrics`,
      output: `              feature  skewness               skewness_cat  kurtosis               kurtosis_cat  jb_p_value  is_gaussian
0       tenure_months      0.24    Approximately Symmetric     -1.39     Platykurtic (Light tails)      0.0000        False
1     monthly_charges     -0.22    Approximately Symmetric     -1.25     Platykurtic (Light tails)      0.0000        False
2       total_charges      0.96  Moderately Right-Skewed (+)   -0.23          Mesokurtic (Normal)       0.0000        False
3     support_tickets      1.18      Highly Right-Skewed (+)    0.85  Leptokurtic (Heavy tails)         0.0000        False`
    },
    {
      title: "6. Correlation & Multicollinearity Discovery",
      description: "Evaluate Pearson (linear) and Spearman (rank-order) correlation matrices to detect strong couplings.",
      code: `corr_pairs = find_top_correlated_pairs(df_clean, method='pearson', threshold=0.3)
corr_pairs`,
      output: `         feature_1           feature_2  correlation  abs_correlation
0    tenure_months       total_charges       0.8258           0.8258
1  support_tickets  satisfaction_score      -0.7412           0.7412
2  monthly_charges       total_charges       0.6514           0.6514`
    },
    {
      title: "7. Outlier Detection (Tukey IQR vs. Z-Score)",
      description: "Identify extreme observation anomalies across all numerical dimensions.",
      code: `outliers = summarize_all_outliers(df_clean, iqr_multiplier=1.5, z_threshold=3.0)
outliers`,
      output: `           feature  iqr_lower  iqr_upper  iqr_outliers  iqr_pct  z_outliers  z_pct
0    tenure_months     -60.00     124.00             0      0.0           0    0.0
1  monthly_charges     -46.02     171.38             0      0.0           0    0.0
2    total_charges   -4695.73    8889.02             0      0.0          14    1.4
3  support_tickets      -3.00       5.00             8      0.8           8    0.8`
    },
    {
      title: "8. Feature Engineering Preprocessing Studio",
      description: "Encode categorical variables, apply standard scaling, and create spend velocity ratio features.",
      code: `df_encoded = encode_categorical_features(df_clean, method='onehot', drop_first=True)
df_scaled, scaler = scale_numerical_features(df_encoded, method='standard')

# Create spend-per-tenure ratio
df_clean['charges_per_tenure'] = df_clean['total_charges'] / (df_clean['tenure_months'] + 1)
print("Engineered feature matrix shape:", df_scaled.shape)`,
      output: `Engineered feature matrix shape: (1000, 34)`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Jupyter Notebook Walkthrough</h2>
            <p className="text-xs text-slate-400">
              `notebooks/Exploratory_Data_Analysis.ipynb` — fully executed end-to-end data science pipeline
            </p>
          </div>
        </div>

        <a
          href="/notebooks/Exploratory_Data_Analysis.ipynb"
          download="Exploratory_Data_Analysis.ipynb"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-900/20 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download .ipynb Notebook</span>
        </a>
      </div>

      {/* Notebook Cell Stack */}
      <div className="space-y-5">
        {notebookSections.map((section, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            {/* Markdown Header */}
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">
                {idx + 1}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-white">{section.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{section.description}</p>
              </div>
            </div>

            {/* Code Cell */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 font-mono text-xs text-slate-200">
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2 select-none">
                <span className="flex items-center gap-1 text-blue-400">
                  <Play className="w-3 h-3 fill-current" /> In [{idx + 1}]:
                </span>
                <span>Python 3.12</span>
              </div>
              <pre className="overflow-x-auto text-[11px] leading-relaxed text-blue-200">
                <code>{section.code}</code>
              </pre>
            </div>

            {/* Output Cell */}
            <div className="p-4 bg-slate-900/60 font-mono text-xs text-slate-300">
              <div className="text-[10px] text-slate-500 mb-2 select-none">
                Out [{idx + 1}]:
              </div>
              <pre className="overflow-x-auto text-[11px] leading-relaxed text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <code>{section.output}</code>
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
