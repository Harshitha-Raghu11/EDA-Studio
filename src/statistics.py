"""Statistical analysis and distribution profiling module.

Calculates comprehensive parametric, non-parametric, shape, quartile,
and categorical frequency metrics with statistical hypothesis evaluations.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
from scipy import stats

from src.utils import setup_logger

logger = setup_logger("statistics")


def compute_parametric_statistics(df: pd.DataFrame) -> pd.DataFrame:
    """Computes comprehensive descriptive statistics for all numerical features.

    Calculates count, mean, standard deviation, variance, standard error,
    min, 25%, 50% (median), 75%, 90%, 99%, max, range, and interquartile range (IQR).

    Args:
        df: Input pandas DataFrame.

    Returns:
        pd.DataFrame indexed by numerical column names with metric values.
    """
    num_df = df.select_dtypes(include=[np.number])
    if num_df.empty:
        logger.warning("No numerical columns found for parametric statistics.")
        return pd.DataFrame()

    results: List[Dict[str, Any]] = []

    for col in num_df.columns:
        series = num_df[col].dropna()
        n = len(series)
        if n == 0:
            continue

        mean_val = float(series.mean())
        std_val = float(series.std(ddof=1)) if n > 1 else 0.0
        var_val = float(series.var(ddof=1)) if n > 1 else 0.0
        sem_val = float(series.sem()) if n > 1 else 0.0
        min_val = float(series.min())
        max_val = float(series.max())
        range_val = max_val - min_val

        q25 = float(series.quantile(0.25))
        q50 = float(series.quantile(0.50))
        q75 = float(series.quantile(0.75))
        q90 = float(series.quantile(0.90))
        q99 = float(series.quantile(0.99))
        iqr_val = q75 - q25

        results.append({
            "Feature": col,
            "Count": n,
            "Mean": round(mean_val, 4),
            "Std Dev": round(std_val, 4),
            "Variance": round(var_val, 4),
            "Std Error": round(sem_val, 4),
            "Min": round(min_val, 4),
            "25% (Q1)": round(q25, 4),
            "50% (Median)": round(q50, 4),
            "75% (Q3)": round(q75, 4),
            "90%": round(q90, 4),
            "99%": round(q99, 4),
            "Max": round(max_val, 4),
            "Range": round(range_val, 4),
            "IQR": round(iqr_val, 4),
        })

    return pd.DataFrame(results).set_index("Feature")


def compute_distribution_metrics(df: pd.DataFrame) -> pd.DataFrame:
    """Evaluates distribution shape parameters (skewness, kurtosis) and normality tests.

    Args:
        df: Input pandas DataFrame.

    Returns:
        pd.DataFrame containing:
            - Skewness
            - Skewness Interpretation (Symmetric, Right-skewed, Left-skewed)
            - Kurtosis (Fisher's definition: normal distribution = 0)
            - Kurtosis Interpretation (Mesokurtic, Leptokurtic, Platykurtic)
            - Jarque-Bera p-value
            - Is Normal (alpha=0.05)
    """
    num_df = df.select_dtypes(include=[np.number])
    if num_df.empty:
        return pd.DataFrame()

    results: List[Dict[str, Any]] = []

    for col in num_df.columns:
        series = num_df[col].dropna()
        n = len(series)
        if n < 8:
            continue

        skew_val = float(series.skew())
        kurt_val = float(series.kurt())  # pandas default is Fisher excess kurtosis

        # Skewness categorization
        if abs(skew_val) < 0.5:
            skew_type = "Approximately Symmetric"
        elif skew_val >= 0.5:
            skew_type = "Moderately / Highly Right-Skewed (Positive)"
        else:
            skew_type = "Moderately / Highly Left-Skewed (Negative)"

        # Kurtosis categorization
        if abs(kurt_val) < 0.5:
            kurt_type = "Mesokurtic (Normal-like tails)"
        elif kurt_val > 0.5:
            kurt_type = "Leptokurtic (Heavy tails, prone to outliers)"
        else:
            kurt_type = "Platykurtic (Light tails, flat peak)"

        # Jarque-Bera test for normality
        try:
            jb_stat, jb_p = stats.jarque_bera(series)
            is_normal = bool(jb_p > 0.05)
        except Exception:
            jb_stat, jb_p = np.nan, np.nan
            is_normal = False

        results.append({
            "Feature": col,
            "Skewness": round(skew_val, 4),
            "Skewness Category": skew_type,
            "Kurtosis": round(kurt_val, 4),
            "Kurtosis Category": kurt_type,
            "Jarque-Bera p-value": round(float(jb_p), 6) if not np.isnan(jb_p) else "N/A",
            "Normally Distributed (p > 0.05)": "Yes" if is_normal else "No",
        })

    return pd.DataFrame(results).set_index("Feature")


def compute_categorical_summary(df: pd.DataFrame) -> pd.DataFrame:
    """Generates cardinality, mode, frequency, and diversity summary for categorical variables.

    Args:
        df: Input pandas DataFrame.

    Returns:
        pd.DataFrame containing:
            - Cardinality (Unique Categories)
            - Most Frequent Category (Mode)
            - Mode Frequency Count
            - Mode Percentage (%)
            - Missing Values Count
    """
    cat_df = df.select_dtypes(exclude=[np.number])
    if cat_df.empty:
        logger.warning("No categorical columns found for frequency summary.")
        return pd.DataFrame()

    results: List[Dict[str, Any]] = []

    for col in cat_df.columns:
        series = cat_df[col]
        total_len = len(series)
        non_null_series = series.dropna()
        n_non_null = len(non_null_series)
        unique_cnt = int(series.nunique(dropna=True))

        if n_non_null > 0:
            val_counts = non_null_series.value_counts()
            top_val = str(val_counts.index[0])
            top_freq = int(val_counts.iloc[0])
            top_pct = round((top_freq / total_len) * 100, 2)
        else:
            top_val = "N/A"
            top_freq = 0
            top_pct = 0.0

        results.append({
            "Categorical Feature": col,
            "Unique Count": unique_cnt,
            "Mode (Most Frequent)": top_val,
            "Mode Count": top_freq,
            "Mode Percentage (%)": top_pct,
            "Missing Count": int(series.isnull().sum()),
        })

    return pd.DataFrame(results).set_index("Categorical Feature")


def generate_full_statistical_profile(df: pd.DataFrame) -> Dict[str, pd.DataFrame]:
    """Compiles a complete statistical overview report for the input dataset.

    Args:
        df: Input pandas DataFrame.

    Returns:
        Dictionary with keys:
            - 'parametric': DataFrame of numerical descriptive stats
            - 'distribution': DataFrame of skewness, kurtosis & normality
            - 'categorical': DataFrame of category frequency distributions
    """
    logger.info("Generating comprehensive statistical profile...")
    return {
        "parametric": compute_parametric_statistics(df),
        "distribution": compute_distribution_metrics(df),
        "categorical": compute_categorical_summary(df),
    }
