"""Feature engineering and transformation pipeline module.

Provides categorical encoding (One-Hot, Label/Ordinal), feature scaling
(StandardScaler, MinMaxScaler), non-linear transformations (log1p), and domain ratios.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder, MinMaxScaler, StandardScaler

from src.utils import setup_logger

logger = setup_logger("feature_engineering")


def encode_categorical_features(
    df: pd.DataFrame,
    method: str = "onehot",
    columns: Optional[List[str]] = None,
    drop_first: bool = True,
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """Encodes categorical columns using One-Hot or Ordinal/Label encoding strategies.

    Args:
        df: Input pandas DataFrame.
        method: Encoding method ('onehot' or 'label').
        columns: Target categorical columns; if None, encodes all non-numeric columns.
        drop_first: For One-Hot encoding, whether to drop the first dummy level to avoid collinearity.

    Returns:
        Tuple containing (transformed DataFrame, encoders metadata dictionary).
    """
    df_encoded = df.copy()
    target_cols = columns or df_encoded.select_dtypes(exclude=[np.number]).columns.tolist()
    encoders: Dict[str, Any] = {}

    if not target_cols:
        logger.warning("No categorical columns available to encode.")
        return df_encoded, encoders

    if method == "onehot":
        df_encoded = pd.get_dummies(df_encoded, columns=target_cols, drop_first=drop_first, dtype=int)
        logger.info("One-hot encoded %d columns (drop_first=%s). New shape: %s", len(target_cols), drop_first, df_encoded.shape)
        encoders["method"] = "onehot"
        encoders["columns"] = target_cols

    elif method == "label":
        for col in target_cols:
            le = LabelEncoder()
            # Convert NaN to string to allow label encoding
            series_str = df_encoded[col].astype(str)
            df_encoded[col] = le.fit_transform(series_str)
            encoders[col] = {
                "classes": list(le.classes_),
                "mapping": {val: int(idx) for idx, val in enumerate(le.classes_)},
            }
        logger.info("Label-encoded %d columns.", len(target_cols))
        encoders["method"] = "label"

    else:
        raise ValueError(f"Unknown encoding method '{method}'. Choose 'onehot' or 'label'.")

    return df_encoded, encoders


def scale_numerical_features(
    df: pd.DataFrame,
    method: str = "standard",
    columns: Optional[List[str]] = None,
) -> Tuple[pd.DataFrame, Any]:
    """Applies statistical feature scaling to continuous numerical attributes.

    Args:
        df: Input pandas DataFrame.
        method: Scaling algorithm:
                - 'standard': Zero-mean, unit-variance standardization Z = (X - μ) / σ
                - 'minmax': Rescales range to [0, 1] X_scaled = (X - X_min) / (X_max - X_min)
        columns: Specific columns to scale; if None, scales all numerical columns.

    Returns:
        Tuple of (scaled DataFrame, fitted scaler object).
    """
    df_scaled = df.copy()
    target_cols = columns or df_scaled.select_dtypes(include=[np.number]).columns.tolist()

    if not target_cols:
        logger.warning("No numerical columns found to scale.")
        return df_scaled, None

    if method == "standard":
        scaler = StandardScaler()
    elif method == "minmax":
        scaler = MinMaxScaler()
    else:
        raise ValueError(f"Unknown scaling method '{method}'. Choose 'standard' or 'minmax'.")

    df_scaled[target_cols] = scaler.fit_transform(df_scaled[target_cols])
    logger.info("Applied %s scaling to %d columns.", method, len(target_cols))
    return df_scaled, scaler


def apply_log_transform(
    df: pd.DataFrame,
    columns: List[str],
    add_suffix: bool = True,
) -> pd.DataFrame:
    """Applies log1p (natural logarithm ln(1 + x)) transformation to compress right-skewed features.

    Args:
        df: Input pandas DataFrame.
        columns: List of non-negative numerical column names to transform.
        add_suffix: If True, creates new columns named '<col>_log1p'; else replaces existing in-place.

    Returns:
        pd.DataFrame with log-transformed columns.
    """
    df_transformed = df.copy()

    for col in columns:
        if col not in df_transformed.columns:
            continue
        min_val = df_transformed[col].min()
        if min_val < 0:
            logger.warning("Column '%s' contains negative values (min=%.2f); skipping log transform.", col, min_val)
            continue

        target_col_name = f"{col}_log1p" if add_suffix else col
        df_transformed[target_col_name] = np.log1p(df_transformed[col])
        logger.info("Created log1p feature: %s", target_col_name)

    return df_transformed


def create_interaction_features(
    df: pd.DataFrame,
    col_a: str,
    col_b: str,
    operation: str = "ratio",
    new_name: Optional[str] = None,
) -> pd.DataFrame:
    """Constructs domain-specific arithmetic interaction and ratio features.

    Args:
        df: Input pandas DataFrame.
        col_a: Primary feature.
        col_b: Secondary feature.
        operation: 'ratio' (a / b), 'product' (a * b), 'difference' (a - b), 'sum' (a + b).
        new_name: Custom feature name; if None, generates standard descriptive label.

    Returns:
        pd.DataFrame with the new interaction feature appended.
    """
    df_out = df.copy()
    col_name = new_name or f"{col_a}_{operation}_{col_b}"

    if operation == "ratio":
        # Avoid division by zero with small epsilon
        denom = df_out[col_b].replace(0, np.nan)
        df_out[col_name] = df_out[col_a] / denom
    elif operation == "product":
        df_out[col_name] = df_out[col_a] * df_out[col_b]
    elif operation == "difference":
        df_out[col_name] = df_out[col_a] - df_out[col_b]
    elif operation == "sum":
        df_out[col_name] = df_out[col_a] + df_out[col_b]
    else:
        raise ValueError(f"Unsupported operation '{operation}'.")

    logger.info("Generated interaction feature: '%s'", col_name)
    return df_out
