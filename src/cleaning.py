"""Data cleaning and quality remediation module.

Provides functions for missing value detection & imputation, duplicate elimination,
whitespace stripping, data type coercion, column sanitization, and before/after auditing.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional, Tuple, Union
import numpy as np
import pandas as pd

from src.utils import setup_logger

logger = setup_logger("cleaning")


def detect_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """Identifies and reports missing values across all columns.

    Args:
        df: Input pandas DataFrame.

    Returns:
        pd.DataFrame sorted in descending order of null percentage:
            - Column
            - Missing Count
            - Missing Percentage (%)
            - Data Type
    """
    null_counts = df.isnull().sum()
    n_rows = len(df)
    null_pct = (null_counts / n_rows) * 100 if n_rows > 0 else 0.0

    report = pd.DataFrame({
        "Column": df.columns,
        "Missing Count": null_counts.values,
        "Missing Percentage (%)": null_pct.values.round(2),
        "Data Type": [str(df[c].dtype) for c in df.columns],
    })
    return report[report["Missing Count"] > 0].sort_values(
        by="Missing Percentage (%)", ascending=False
    ).reset_index(drop=True)


def impute_missing_values(
    df: pd.DataFrame,
    strategy: str = "auto",
    custom_strategies: Optional[Dict[str, Union[str, Any]]] = None,
) -> pd.DataFrame:
    """Imputes missing values using statistical strategies or custom constants.

    Args:
        df: Input pandas DataFrame.
        strategy: Global strategy ('auto', 'mean', 'median', 'mode', 'drop').
                  'auto' uses median for numeric columns and mode for categorical columns.
        custom_strategies: Optional dictionary mapping column names to specific strategies
                           ('mean', 'median', 'mode', 'drop', or a literal scalar value).

    Returns:
        pd.DataFrame with missing values resolved.
    """
    df_clean = df.copy()
    custom = custom_strategies or {}

    for col in df_clean.columns:
        if df_clean[col].isnull().sum() == 0:
            continue

        col_strategy = custom.get(col, strategy)
        is_numeric = pd.api.types.is_numeric_dtype(df_clean[col])

        if col_strategy == "drop":
            df_clean = df_clean.dropna(subset=[col])
            logger.info("Dropped rows with null values in column '%s'", col)
        elif col_strategy == "mean" and is_numeric:
            fill_val = df_clean[col].mean()
            df_clean[col] = df_clean[col].fillna(fill_val)
            logger.info("Imputed '%s' nulls with mean: %.4f", col, fill_val)
        elif col_strategy == "median" and is_numeric:
            fill_val = df_clean[col].median()
            df_clean[col] = df_clean[col].fillna(fill_val)
            logger.info("Imputed '%s' nulls with median: %.4f", col, fill_val)
        elif col_strategy == "mode":
            mode_series = df_clean[col].mode()
            fill_val = mode_series.iloc[0] if not mode_series.empty else ("Unknown" if not is_numeric else 0)
            df_clean[col] = df_clean[col].fillna(fill_val)
            logger.info("Imputed '%s' nulls with mode: %s", col, str(fill_val))
        elif col_strategy == "auto":
            if is_numeric:
                fill_val = df_clean[col].median()
            else:
                mode_series = df_clean[col].mode()
                fill_val = mode_series.iloc[0] if not mode_series.empty else "Missing"
            df_clean[col] = df_clean[col].fillna(fill_val)
            logger.info("Auto-imputed '%s' with %s", col, str(fill_val))
        else:
            # Literal custom value fallback
            df_clean[col] = df_clean[col].fillna(col_strategy)
            logger.info("Imputed '%s' with custom constant: %s", col, str(col_strategy))

    return df_clean


def remove_duplicates(
    df: pd.DataFrame,
    subset: Optional[List[str]] = None,
    keep: str = "first",
) -> Tuple[pd.DataFrame, int]:
    """Detects and purges duplicate rows from the dataset.

    Args:
        df: Input pandas DataFrame.
        subset: Optional list of columns to consider for identifying duplicates.
        keep: Determines which duplicates to retain ('first', 'last', False).

    Returns:
        Tuple containing (cleaned DataFrame, count of removed duplicates).
    """
    dup_count = int(df.duplicated(subset=subset, keep=keep).sum())
    df_clean = df.drop_duplicates(subset=subset, keep=keep).reset_index(drop=True)
    logger.info("Removed %d duplicate rows (subset: %s).", dup_count, str(subset))
    return df_clean, dup_count


def clean_string_columns(
    df: pd.DataFrame,
    strip_whitespace: bool = True,
    standardize_empty: bool = True,
) -> pd.DataFrame:
    """Sanitizes text/object columns by stripping extraneous whitespace and standardizing empty strings.

    Args:
        df: Input pandas DataFrame.
        strip_whitespace: If True, trims leading and trailing whitespace from string values.
        standardize_empty: If True, replaces whitespace-only or empty strings with np.nan.

    Returns:
        pd.DataFrame with cleaned text columns.
    """
    df_clean = df.copy()
    str_cols = df_clean.select_dtypes(include=["object", "string"]).columns

    for col in str_cols:
        # Fill None/NaN temporarily before str operations
        if strip_whitespace:
            df_clean[col] = df_clean[col].apply(
                lambda x: x.strip() if isinstance(x, str) else x
            )
        if standardize_empty:
            df_clean[col] = df_clean[col].apply(
                lambda x: np.nan if isinstance(x, str) and (x.strip() == "" or x.lower() in ["none", "null", "nan", "n/a", "?"]) else x
            )

    logger.info("Sanitized %d string columns.", len(str_cols))
    return df_clean


def convert_column_types(
    df: pd.DataFrame,
    type_mapping: Dict[str, str],
) -> pd.DataFrame:
    """Coerces columns to specified target data types with graceful error tolerance.

    Args:
        df: Input pandas DataFrame.
        type_mapping: Dictionary mapping column names to target types
                      (e.g., {'tenure': 'int64', 'total_charges': 'float64', 'signup_date': 'datetime64[ns]'}).

    Returns:
        pd.DataFrame with updated column data types.
    """
    df_clean = df.copy()

    for col, target_type in type_mapping.items():
        if col not in df_clean.columns:
            logger.warning("Column '%s' not present for type conversion.", col)
            continue
        try:
            if "datetime" in target_type:
                df_clean[col] = pd.to_datetime(df_clean[col], errors="coerce")
            elif target_type in ["float", "float64", "numeric"]:
                df_clean[col] = pd.to_numeric(df_clean[col], errors="coerce")
            elif target_type in ["int", "int64"]:
                numeric_series = pd.to_numeric(df_clean[col], errors="coerce")
                df_clean[col] = numeric_series.fillna(0).astype("int64")
            elif target_type in ["category", "categorical"]:
                df_clean[col] = df_clean[col].astype("category")
            elif target_type in ["string", "str"]:
                df_clean[col] = df_clean[col].astype(str)
            else:
                df_clean[col] = df_clean[col].astype(target_type)
            logger.info("Successfully converted '%s' to %s", col, target_type)
        except Exception as e:
            logger.error("Failed converting column '%s' to '%s': %s", col, target_type, e)

    return df_clean


def rename_columns(
    df: pd.DataFrame,
    rename_map: Optional[Dict[str, str]] = None,
    clean_snake_case: bool = False,
) -> pd.DataFrame:
    """Renames DataFrame columns using explicit mappings or automatic snake_case formatting.

    Args:
        df: Input pandas DataFrame.
        rename_map: Explicit column mapping dictionary.
        clean_snake_case: If True, converts all column names to clean lowercase snake_case.

    Returns:
        pd.DataFrame with renamed columns.
    """
    df_clean = df.copy()

    if clean_snake_case:
        new_cols = {}
        for col in df_clean.columns:
            s = str(col).strip()
            s = re.sub(r"[^\w\s]", "", s)
            s = re.sub(r"\s+", "_", s).lower()
            new_cols[col] = s
        df_clean = df_clean.rename(columns=new_cols)
        logger.info("Normalized all column names to snake_case.")

    if rename_map:
        df_clean = df_clean.rename(columns=rename_map)
        logger.info("Applied explicit rename map to %d columns.", len(rename_map))

    return df_clean


def run_cleaning_pipeline(
    df: pd.DataFrame,
    impute_strategy: str = "auto",
    strip_strings: bool = True,
    drop_dups: bool = True,
    snake_case_names: bool = False,
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """Executes a unified, end-to-end data cleaning pipeline and generates an audit log.

    Args:
        df: Raw input pandas DataFrame.
        impute_strategy: Missing value strategy ('auto', 'median', 'mean', 'mode', 'drop').
        strip_strings: Whether to strip and standardize string columns.
        drop_dups: Whether to remove duplicate records.
        snake_case_names: Whether to format column names to clean snake_case.

    Returns:
        Tuple containing (cleaned DataFrame, audit summary metrics dictionary).
    """
    initial_shape = df.shape
    initial_nulls = int(df.isnull().sum().sum())
    initial_dups = int(df.duplicated().sum())

    # Step 1: String cleaning (standardize empty strings to np.nan)
    step1 = clean_string_columns(df, strip_whitespace=strip_strings) if strip_strings else df.copy()

    # Step 2: Imputation
    step2 = impute_missing_values(step1, strategy=impute_strategy)

    # Step 3: Duplicate removal
    step3, removed_dups = remove_duplicates(step2) if drop_dups else (step2, 0)

    # Step 4: Column renaming
    final_df = rename_columns(step3, clean_snake_case=snake_case_names) if snake_case_names else step3

    audit_summary = {
        "initial_rows": initial_shape[0],
        "initial_columns": initial_shape[1],
        "cleaned_rows": final_df.shape[0],
        "cleaned_columns": final_df.shape[1],
        "initial_null_cells": initial_nulls,
        "remaining_null_cells": int(final_df.isnull().sum().sum()),
        "removed_duplicates_count": removed_dups,
    }

    logger.info("Cleaning pipeline completed successfully: %s", str(audit_summary))
    return final_df, audit_summary
