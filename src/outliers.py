"""Outlier detection, profiling, and remediation module.

Implements Interquartile Range (IQR) and Z-Score statistical anomaly detection algorithms,
with support for outlier summary tables, winsorization (capping), and sample pruning.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from scipy import stats

from src.utils import setup_logger

logger = setup_logger("outliers")


def detect_iqr_outliers(
    df: pd.DataFrame,
    column: str,
    multiplier: float = 1.5,
) -> Dict[str, Any]:
    """Detects outliers in a specific column using the Tukey IQR rule.

    Calculates boundaries:
        Lower Bound = Q1 - (multiplier * IQR)
        Upper Bound = Q3 + (multiplier * IQR)

    Args:
        df: Input pandas DataFrame.
        column: Numerical column to analyze.
        multiplier: IQR scaling factor (default 1.5 for standard outliers, 3.0 for extreme).

    Returns:
        Dictionary containing outlier boundary metrics, counts, percentages, and outlier indices.
    """
    series = df[column].dropna()
    n_total = len(df)
    n_valid = len(series)

    if n_valid == 0:
        return {"column": column, "count": 0, "percentage": 0.0, "indices": []}

    q25 = float(series.quantile(0.25))
    q75 = float(series.quantile(0.75))
    iqr = q75 - q25

    lower_bound = q25 - (multiplier * iqr)
    upper_bound = q75 + (multiplier * iqr)

    outlier_mask = (df[column] < lower_bound) | (df[column] > upper_bound)
    outlier_indices = df[outlier_mask].index.tolist()
    outlier_count = len(outlier_indices)
    outlier_pct = round((outlier_count / n_total) * 100, 2) if n_total > 0 else 0.0

    return {
        "column": column,
        "method": f"IQR ({multiplier}x)",
        "q1": round(q25, 4),
        "q3": round(q75, 4),
        "iqr": round(iqr, 4),
        "lower_bound": round(lower_bound, 4),
        "upper_bound": round(upper_bound, 4),
        "outlier_count": outlier_count,
        "outlier_percentage": outlier_pct,
        "indices": outlier_indices,
    }


def detect_zscore_outliers(
    df: pd.DataFrame,
    column: str,
    threshold: float = 3.0,
) -> Dict[str, Any]:
    """Detects outliers using the parametric Z-score standard deviation metric.

    Flags records where |(X - Mean) / StdDev| >= threshold.

    Args:
        df: Input pandas DataFrame.
        column: Target numerical column.
        threshold: Absolute Z-Score threshold cutoff (default 3.0).

    Returns:
        Dictionary with Z-score outlier detection details.
    """
    series = df[column].dropna()
    n_total = len(df)
    n_valid = len(series)

    if n_valid < 3:
        return {"column": column, "count": 0, "percentage": 0.0, "indices": []}

    mean_val = float(series.mean())
    std_val = float(series.std(ddof=1))

    if std_val == 0:
        return {"column": column, "count": 0, "percentage": 0.0, "indices": []}

    z_scores = np.abs((df[column] - mean_val) / std_val)
    outlier_mask = z_scores >= threshold
    outlier_indices = df[outlier_mask].index.tolist()
    outlier_count = len(outlier_indices)
    outlier_pct = round((outlier_count / n_total) * 100, 2) if n_total > 0 else 0.0

    lower_bound = mean_val - (threshold * std_val)
    upper_bound = mean_val + (threshold * std_val)

    return {
        "column": column,
        "method": f"Z-Score (±{threshold}σ)",
        "mean": round(mean_val, 4),
        "std": round(std_val, 4),
        "lower_bound": round(lower_bound, 4),
        "upper_bound": round(upper_bound, 4),
        "outlier_count": outlier_count,
        "outlier_percentage": outlier_pct,
        "indices": outlier_indices,
    }


def summarize_all_outliers(
    df: pd.DataFrame,
    iqr_multiplier: float = 1.5,
    z_threshold: float = 3.0,
) -> pd.DataFrame:
    """Produces a comprehensive comparative table of IQR vs Z-Score anomalies across all numerical columns.

    Args:
        df: Input pandas DataFrame.
        iqr_multiplier: IQR boundary multiplier.
        z_threshold: Z-Score threshold.

    Returns:
        pd.DataFrame summarizing outlier metrics across all numerical features.
    """
    num_cols = df.select_dtypes(include=[np.number]).columns
    rows: List[Dict[str, Any]] = []

    for col in num_cols:
        iqr_res = detect_iqr_outliers(df, col, multiplier=iqr_multiplier)
        z_res = detect_zscore_outliers(df, col, threshold=z_threshold)

        rows.append({
            "Feature": col,
            "IQR Lower Bound": iqr_res["lower_bound"],
            "IQR Upper Bound": iqr_res["upper_bound"],
            "IQR Outlier Count": iqr_res["outlier_count"],
            "IQR Outliers (%)": iqr_res["outlier_percentage"],
            "Z-Score Outlier Count": z_res["outlier_count"],
            "Z-Score Outliers (%)": z_res["outlier_percentage"],
        })

    return pd.DataFrame(rows).set_index("Feature")


def cap_outliers_iqr(
    df: pd.DataFrame,
    columns: Optional[List[str]] = None,
    multiplier: float = 1.5,
) -> pd.DataFrame:
    """Applies Winsorization (capping) to constrain extreme values within IQR boundaries without row deletion.

    Args:
        df: Input pandas DataFrame.
        columns: Optional list of specific columns to cap; if None, caps all numerical columns.
        multiplier: IQR multiplier.

    Returns:
        pd.DataFrame with clipped boundary values.
    """
    df_capped = df.copy()
    target_cols = columns or df_capped.select_dtypes(include=[np.number]).columns.tolist()

    for col in target_cols:
        res = detect_iqr_outliers(df_capped, col, multiplier=multiplier)
        df_capped[col] = df_capped[col].clip(lower=res["lower_bound"], upper=res["upper_bound"])
        logger.info("Winsorized column '%s' into range [%.2f, %.2f]", col, res["lower_bound"], res["upper_bound"])

    return df_capped


def remove_outliers_iqr(
    df: pd.DataFrame,
    columns: Optional[List[str]] = None,
    multiplier: float = 1.5,
) -> Tuple[pd.DataFrame, int]:
    """Drops all rows containing an outlier in any of the specified target features.

    Args:
        df: Input pandas DataFrame.
        columns: Columns to check for outlier conditions.
        multiplier: IQR threshold multiplier.

    Returns:
        Tuple of (pruned DataFrame, count of dropped rows).
    """
    target_cols = columns or df.select_dtypes(include=[np.number]).columns.tolist()
    all_outlier_indices = set()

    for col in target_cols:
        res = detect_iqr_outliers(df, col, multiplier=multiplier)
        all_outlier_indices.update(res["indices"])

    df_cleaned = df.drop(index=list(all_outlier_indices)).reset_index(drop=True)
    logger.info("Removed %d total rows containing IQR outliers across %s", len(all_outlier_indices), str(target_cols))
    return df_cleaned, len(all_outlier_indices)
