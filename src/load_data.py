"""Data ingestion and metadata inspection module.

Supports robust loading of CSV and Excel datasets, memory computation,
schema profiling, and preliminary structural inspection.
"""

from __future__ import annotations

import os
from typing import Any, Dict, Optional
import numpy as np
import pandas as pd

from src.utils import format_bytes, setup_logger

logger = setup_logger("load_data")


def load_dataset(file_path: str, **kwargs: Any) -> pd.DataFrame:
    """Loads a structured tabular dataset from CSV or Excel file formats.

    Args:
        file_path: Path to the CSV (.csv) or Excel (.xlsx, .xls) file.
        **kwargs: Additional parameters forwarded to pandas reader functions.

    Returns:
        pd.DataFrame containing the ingested dataset.

    Raises:
        FileNotFoundError: If the specified file cannot be located.
        ValueError: If an unsupported file extension is provided.
    """
    if not os.path.exists(file_path):
        logger.error("Dataset file not found at: %s", file_path)
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()
    logger.info("Ingesting dataset from %s (format: %s)...", file_path, ext)

    if ext == ".csv":
        df = pd.read_csv(file_path, **kwargs)
    elif ext in [".xlsx", ".xls"]:
        df = pd.read_excel(file_path, **kwargs)
    else:
        raise ValueError(f"Unsupported file format '{ext}'. Expected .csv, .xlsx, or .xls")

    logger.info(
        "Successfully loaded dataset: %d rows x %d columns (%s in memory).",
        df.shape[0],
        df.shape[1],
        format_bytes(df.memory_usage(deep=True).sum()),
    )
    return df


def inspect_metadata(df: pd.DataFrame) -> Dict[str, Any]:
    """Extracts high-level dataset metadata, shape, memory, and type breakdown.

    Args:
        df: Input pandas DataFrame.

    Returns:
        Dictionary containing structural metadata:
            - num_rows (int)
            - num_columns (int)
            - memory_usage_raw (int)
            - memory_usage_formatted (str)
            - numerical_columns_count (int)
            - categorical_columns_count (int)
            - total_null_cells (int)
            - total_null_percentage (float)
            - duplicate_rows_count (int)
    """
    total_cells = df.shape[0] * df.shape[1] if df.shape[0] > 0 and df.shape[1] > 0 else 1
    total_nulls = int(df.isnull().sum().sum())
    memory_raw = int(df.memory_usage(deep=True).sum())
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()
    duplicate_rows = int(df.duplicated().sum())

    metadata: Dict[str, Any] = {
        "num_rows": int(df.shape[0]),
        "num_columns": int(df.shape[1]),
        "memory_usage_raw": memory_raw,
        "memory_usage_formatted": format_bytes(memory_raw),
        "numerical_columns_count": len(num_cols),
        "categorical_columns_count": len(cat_cols),
        "numerical_columns": num_cols,
        "categorical_columns": cat_cols,
        "total_null_cells": total_nulls,
        "total_null_percentage": round((total_nulls / total_cells) * 100, 2),
        "duplicate_rows_count": duplicate_rows,
    }
    return metadata


def get_schema_summary(df: pd.DataFrame) -> pd.DataFrame:
    """Builds a comprehensive column-by-column schema profile.

    Args:
        df: Input pandas DataFrame.

    Returns:
        pd.DataFrame containing per-column metrics:
            - Column Name
            - Data Type
            - Non-Null Count
            - Null Count
            - Null Percentage
            - Unique Values Count
            - Sample Value
    """
    records = []
    n_rows = len(df)

    for col in df.columns:
        null_count = int(df[col].isnull().sum())
        non_null_count = n_rows - null_count
        null_pct = round((null_count / n_rows) * 100, 2) if n_rows > 0 else 0.0
        n_unique = int(df[col].nunique(dropna=True))

        # Grab a representative non-null sample
        sample_series = df[col].dropna()
        sample_val = str(sample_series.iloc[0]) if len(sample_series) > 0 else "N/A"
        if len(sample_val) > 40:
            sample_val = sample_val[:37] + "..."

        records.append({
            "Column Name": col,
            "Data Type": str(df[col].dtype),
            "Non-Null Count": non_null_count,
            "Null Count": null_count,
            "Null Percentage (%)": null_pct,
            "Unique Count": n_unique,
            "Sample Value": sample_val,
        })

    return pd.DataFrame(records)
