"""Visualization generation module.

Generates publication-quality static (Matplotlib/Seaborn) and interactive (Plotly)
charts, enforcing consistent design grids, high-contrast palettes, informative titles,
and automated export into the images directory.
"""

from __future__ import annotations

import os
from typing import List, Optional
import matplotlib
# Use non-interactive Agg backend for robust headless server environments
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

from src.utils import ensure_directory, setup_logger

logger = setup_logger("visualization")

# Consistent professional aesthetic styling
plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
PALETTE = "mako"
ACCENT_COLOR = "#2b5c8f"


def plot_histogram(
    df: pd.DataFrame,
    column: str,
    bins: int = 30,
    kde: bool = True,
    title: Optional[str] = None,
    save_path: Optional[str] = None,
) -> plt.Figure:
    """Renders a distribution histogram with optional Kernel Density Estimate (KDE).

    Args:
        df: Input pandas DataFrame.
        column: Numerical column name to plot.
        bins: Number of histogram bins.
        kde: If True, overlays a smooth KDE curve.
        title: Custom chart title.
        save_path: Optional file path to save the generated figure.

    Returns:
        Matplotlib Figure object.
    """
    fig, ax = plt.subplots(figsize=(8, 5), dpi=120)
    data = df[column].dropna()

    sns.histplot(
        data,
        bins=bins,
        kde=kde,
        color=ACCENT_COLOR,
        edgecolor="white",
        linewidth=1.2,
        alpha=0.75,
        ax=ax,
    )

    mean_val = float(data.mean())
    median_val = float(data.median())

    ax.axvline(mean_val, color="#e63946", linestyle="--", linewidth=1.8, label=f"Mean: {mean_val:.2f}")
    ax.axvline(median_val, color="#2a9d8f", linestyle="-.", linewidth=1.8, label=f"Median: {median_val:.2f}")

    chart_title = title or f"Distribution Analysis of {column}"
    ax.set_title(chart_title, fontsize=13, fontweight="bold", pad=12)
    ax.set_xlabel(column, fontsize=11, fontweight="medium")
    ax.set_ylabel("Frequency / Density", fontsize=11, fontweight="medium")
    ax.legend(frameon=True, facecolor="white", edgecolor="#e2e8f0")
    plt.tight_layout()

    if save_path:
        ensure_directory(os.path.dirname(save_path) or ".")
        fig.savefig(save_path, bbox_inches="tight", dpi=150)
        logger.info("Saved histogram to %s", save_path)

    return fig


def plot_boxplot(
    df: pd.DataFrame,
    column: str,
    by: Optional[str] = None,
    title: Optional[str] = None,
    save_path: Optional[str] = None,
) -> plt.Figure:
    """Renders a box-and-whisker plot to visualize quartiles and potential outliers.

    Args:
        df: Input pandas DataFrame.
        column: Continuous numerical column.
        by: Optional categorical column for group partitioning.
        title: Custom chart title.
        save_path: Optional path for image export.

    Returns:
        Matplotlib Figure object.
    """
    fig, ax = plt.subplots(figsize=(9, 5), dpi=120)

    if by and by in df.columns:
        sns.boxplot(
            data=df,
            x=by,
            y=column,
            palette=PALETTE,
            ax=ax,
            fliersize=4,
            linewidth=1.3,
        )
        ax.set_title(title or f"Box Plot of {column} grouped by {by}", fontsize=13, fontweight="bold", pad=12)
        ax.set_xlabel(by, fontsize=11)
        plt.xticks(rotation=30, ha="right")
    else:
        sns.boxplot(
            y=df[column].dropna(),
            color=ACCENT_COLOR,
            ax=ax,
            fliersize=5,
            linewidth=1.4,
            width=0.4,
        )
        ax.set_title(title or f"Box Plot of {column}", fontsize=13, fontweight="bold", pad=12)

    ax.set_ylabel(column, fontsize=11)
    plt.tight_layout()

    if save_path:
        ensure_directory(os.path.dirname(save_path) or ".")
        fig.savefig(save_path, bbox_inches="tight", dpi=150)
        logger.info("Saved boxplot to %s", save_path)

    return fig


def plot_scatter(
    df: pd.DataFrame,
    x_col: str,
    y_col: str,
    hue: Optional[str] = None,
    regression: bool = True,
    save_path: Optional[str] = None,
) -> plt.Figure:
    """Renders a scatter plot with optional categorical hue and linear trendline.

    Args:
        df: Input pandas DataFrame.
        x_col: Numerical feature for X-axis.
        y_col: Numerical feature for Y-axis.
        hue: Optional categorical column for color encoding.
        regression: If True, adds an OLS regression line.
        save_path: Optional path for image export.

    Returns:
        Matplotlib Figure object.
    """
    fig, ax = plt.subplots(figsize=(8, 5.5), dpi=120)

    if regression and hue is None:
        sns.regplot(
            data=df,
            x=x_col,
            y=y_col,
            scatter_kws={"alpha": 0.6, "color": ACCENT_COLOR, "s": 35},
            line_kws={"color": "#e63946", "linewidth": 2},
            ax=ax,
        )
    else:
        sns.scatterplot(
            data=df,
            x=x_col,
            y=y_col,
            hue=hue,
            palette=PALETTE if hue else None,
            alpha=0.75,
            s=45,
            ax=ax,
        )

    ax.set_title(f"Bivariate Scatter: {y_col} vs. {x_col}", fontsize=13, fontweight="bold", pad=12)
    ax.set_xlabel(x_col, fontsize=11)
    ax.set_ylabel(y_col, fontsize=11)
    if hue:
        ax.legend(title=hue, frameon=True, facecolor="white")
    plt.tight_layout()

    if save_path:
        ensure_directory(os.path.dirname(save_path) or ".")
        fig.savefig(save_path, bbox_inches="tight", dpi=150)
        logger.info("Saved scatter plot to %s", save_path)

    return fig


def plot_countplot(
    df: pd.DataFrame,
    column: str,
    top_n: int = 12,
    save_path: Optional[str] = None,
) -> plt.Figure:
    """Renders a frequency count bar chart for categorical variables.

    Args:
        df: Input pandas DataFrame.
        column: Categorical column name.
        top_n: Maximum number of distinct categories to display.
        save_path: Optional path for image export.

    Returns:
        Matplotlib Figure object.
    """
    fig, ax = plt.subplots(figsize=(9, 5), dpi=120)
    top_categories = df[column].value_counts().head(top_n)

    sns.barplot(
        x=top_categories.values,
        y=top_categories.index.astype(str),
        palette=PALETTE,
        ax=ax,
        edgecolor="none",
    )

    # Annotate counts on bars
    for i, v in enumerate(top_categories.values):
        ax.text(v + (max(top_categories.values) * 0.01), i, f" {v}", va="center", fontsize=9, fontweight="medium")

    ax.set_title(f"Category Frequencies: {column}", fontsize=13, fontweight="bold", pad=12)
    ax.set_xlabel("Observation Count", fontsize=11)
    ax.set_ylabel(column, fontsize=11)
    plt.tight_layout()

    if save_path:
        ensure_directory(os.path.dirname(save_path) or ".")
        fig.savefig(save_path, bbox_inches="tight", dpi=150)
        logger.info("Saved count plot to %s", save_path)

    return fig


def plot_correlation_matrix(
    df: pd.DataFrame,
    method: str = "pearson",
    annot: bool = True,
    save_path: Optional[str] = None,
) -> plt.Figure:
    """Generates a triangular correlation heatmap with numeric annotations.

    Args:
        df: Input pandas DataFrame.
        method: Correlation method ('pearson', 'spearman', 'kendall').
        annot: Whether to write values in each heatmap cell.
        save_path: Optional path for image export.

    Returns:
        Matplotlib Figure object.
    """
    num_df = df.select_dtypes(include=[np.number])
    corr = num_df.corr(method=method)

    fig, ax = plt.subplots(figsize=(10, 8), dpi=120)
    mask = np.triu(np.ones_like(corr, dtype=bool))

    sns.heatmap(
        corr,
        mask=mask,
        cmap="vlag",
        vmax=1.0,
        vmin=-1.0,
        center=0.0,
        annot=annot,
        fmt=".2f",
        square=True,
        linewidths=0.75,
        cbar_kws={"shrink": 0.8, "label": f"{method.capitalize()} Correlation"},
        ax=ax,
    )

    ax.set_title(f"{method.capitalize()} Correlation Heatmap", fontsize=14, fontweight="bold", pad=15)
    plt.tight_layout()

    if save_path:
        ensure_directory(os.path.dirname(save_path) or ".")
        fig.savefig(save_path, bbox_inches="tight", dpi=150)
        logger.info("Saved correlation heatmap to %s", save_path)

    return fig


def plot_violin(
    df: pd.DataFrame,
    x_col: str,
    y_col: str,
    save_path: Optional[str] = None,
) -> plt.Figure:
    """Renders a violin plot demonstrating distribution density across categorical levels.

    Args:
        df: Input pandas DataFrame.
        x_col: Categorical feature.
        y_col: Continuous numerical feature.
        save_path: Optional path for image export.

    Returns:
        Matplotlib Figure object.
    """
    fig, ax = plt.subplots(figsize=(9, 5), dpi=120)

    sns.violinplot(
        data=df,
        x=x_col,
        y=y_col,
        palette=PALETTE,
        inner="quartile",
        cut=0,
        ax=ax,
    )

    ax.set_title(f"Violin Distribution of {y_col} by {x_col}", fontsize=13, fontweight="bold", pad=12)
    ax.set_xlabel(x_col, fontsize=11)
    ax.set_ylabel(y_col, fontsize=11)
    plt.xticks(rotation=25, ha="right")
    plt.tight_layout()

    if save_path:
        ensure_directory(os.path.dirname(save_path) or ".")
        fig.savefig(save_path, bbox_inches="tight", dpi=150)
        logger.info("Saved violin plot to %s", save_path)

    return fig


def generate_all_visualizations(df: pd.DataFrame, output_dir: str = "images") -> List[str]:
    """Generates and exports an end-to-end suite of standard EDA figures.

    Args:
        df: Cleaned or raw pandas DataFrame.
        output_dir: Target directory to save all charts.

    Returns:
        List of generated image file paths.
    """
    ensure_directory(output_dir)
    generated_files: List[str] = []
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()

    logger.info("Generating standard EDA visualizations into '%s'...", output_dir)

    # 1. Correlation heatmap
    if len(num_cols) >= 2:
        corr_path = os.path.join(output_dir, "correlation_heatmap.png")
        plot_correlation_matrix(df, method="pearson", save_path=corr_path)
        plt.close()
        generated_files.append(corr_path)

    # 2. Histograms for top numerical features
    for col in num_cols[:3]:
        hist_path = os.path.join(output_dir, f"histogram_{col}.png")
        plot_histogram(df, column=col, save_path=hist_path)
        plt.close()
        generated_files.append(hist_path)

    # 3. Box plots for top numerical features
    for col in num_cols[:2]:
        box_path = os.path.join(output_dir, f"boxplot_{col}.png")
        group_col = cat_cols[0] if cat_cols else None
        plot_boxplot(df, column=col, by=group_col, save_path=box_path)
        plt.close()
        generated_files.append(box_path)

    # 4. Count plots for top categorical features
    for col in cat_cols[:2]:
        count_path = os.path.join(output_dir, f"countplot_{col}.png")
        plot_countplot(df, column=col, save_path=count_path)
        plt.close()
        generated_files.append(count_path)

    # 5. Scatter plot if at least 2 numerical features
    if len(num_cols) >= 2:
        scatter_path = os.path.join(output_dir, "scatter_overview.png")
        hue_val = cat_cols[0] if cat_cols else None
        plot_scatter(df, x_col=num_cols[0], y_col=num_cols[1], hue=hue_val, save_path=scatter_path)
        plt.close()
        generated_files.append(scatter_path)

    logger.info("Successfully generated %d visualizations.", len(generated_files))
    return generated_files
