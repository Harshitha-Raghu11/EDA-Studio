"""Correlation analysis and relationship discovery module.

Calculates Pearson (linear) and Spearman (monotonic rank) correlation matrices,
isolates influential multi-variable pairs, and synthesizes analytical interpretations.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd

from src.utils import setup_logger

logger = setup_logger("correlation")


def compute_correlation_matrices(df: pd.DataFrame) -> Dict[str, pd.DataFrame]:
    """Computes both Pearson and Spearman correlation matrices for numerical columns.

    Args:
        df: Input pandas DataFrame.

    Returns:
        Dictionary mapping {'pearson': DataFrame, 'spearman': DataFrame}.
    """
    num_df = df.select_dtypes(include=[np.number])
    if num_df.empty or num_df.shape[1] < 2:
        logger.warning("Fewer than 2 numerical features available for correlation analysis.")
        empty_df = pd.DataFrame()
        return {"pearson": empty_df, "spearman": empty_df}

    pearson_matrix = num_df.corr(method="pearson").round(4)
    spearman_matrix = num_df.corr(method="spearman").round(4)

    return {
        "pearson": pearson_matrix,
        "spearman": spearman_matrix,
    }


def categorize_relationship_strength(r: float) -> str:
    """Categorizes the strength and direction of a correlation coefficient (r).

    Args:
        r: Correlation value in [-1.0, 1.0].

    Returns:
        Descriptive string representation.
    """
    abs_r = abs(r)
    if abs_r >= 0.8:
        strength = "Very Strong"
    elif abs_r >= 0.6:
        strength = "Strong"
    elif abs_r >= 0.4:
        strength = "Moderate"
    elif abs_r >= 0.2:
        strength = "Weak"
    else:
        return "Negligible / Uncorrelated"

    direction = "Positive (Direct)" if r > 0 else "Negative (Inverse)"
    return f"{strength} {direction}"


def find_top_correlated_pairs(
    df: pd.DataFrame,
    method: str = "pearson",
    threshold: float = 0.3,
    top_n: int = 15,
) -> pd.DataFrame:
    """Extracts the strongest unique pairwise relationships above a specified threshold.

    Args:
        df: Input pandas DataFrame.
        method: Correlation method ('pearson' or 'spearman').
        threshold: Absolute correlation coefficient filter threshold (|r| >= threshold).
        top_n: Maximum number of ranked pairs to return.

    Returns:
        pd.DataFrame containing:
            - Feature 1
            - Feature 2
            - Correlation Coefficient
            - Absolute Correlation
            - Relationship Category
    """
    num_df = df.select_dtypes(include=[np.number])
    if num_df.empty or num_df.shape[1] < 2:
        return pd.DataFrame()

    corr_matrix = num_df.corr(method=method)
    columns = corr_matrix.columns
    pairs: List[Dict[str, Any]] = []

    for i in range(len(columns)):
        for j in range(i + 1, len(columns)):
            col1 = columns[i]
            col2 = columns[j]
            r = corr_matrix.iloc[i, j]

            if not np.isnan(r) and abs(r) >= threshold:
                pairs.append({
                    "Feature 1": col1,
                    "Feature 2": col2,
                    "Correlation (r)": round(float(r), 4),
                    "Abs Correlation": round(abs(float(r)), 4),
                    "Relationship Category": categorize_relationship_strength(r),
                })

    if not pairs:
        logger.info("No pairwise correlations exceeded threshold %.2f", threshold)
        return pd.DataFrame()

    pair_df = pd.DataFrame(pairs).sort_values(by="Abs Correlation", ascending=False).head(top_n)
    return pair_df.reset_index(drop=True)


def generate_correlation_insights(df: pd.DataFrame, threshold: float = 0.4) -> List[str]:
    """Translates empirical pairwise correlation findings into clear narrative observations.

    Args:
        df: Input pandas DataFrame.
        threshold: Minimum correlation magnitude to include in narrative highlights.

    Returns:
        List of formatted analytical insight bullet strings.
    """
    top_pairs = find_top_correlated_pairs(df, method="pearson", threshold=threshold, top_n=8)
    insights: List[str] = []

    if top_pairs.empty:
        return ["No strong linear correlations (|r| >= " + str(threshold) + ") were identified among numerical features."]

    for _, row in top_pairs.iterrows():
        f1 = row["Feature 1"]
        f2 = row["Feature 2"]
        r = row["Correlation (r)"]
        cat = row["Relationship Category"]

        if r > 0:
            insight = (
                f"**{f1}** and **{f2}** demonstrate a {cat.lower()} relationship (r = {r:+.2f}). "
                f"Increases in '{f1}' are consistently associated with higher values of '{f2}'."
            )
        else:
            insight = (
                f"**{f1}** and **{f2}** exhibit a {cat.lower()} relationship (r = {r:+.2f}). "
                f"As '{f1}' rises, '{f2}' systematically diminishes."
            )
        insights.append(insight)

    return insights
