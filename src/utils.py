"""Utility functions for Exploratory Data Analysis (EDA) Project.

Provides shared logging, directory management, execution timers,
and memory formatting helpers.
"""

from __future__ import annotations

import functools
import logging
import os
import time
from typing import Any, Callable


def setup_logger(name: str = "eda_logger", level: int = logging.INFO) -> logging.Logger:
    """Configures and returns a standardized console logger.

    Args:
        name: Logger identifier.
        level: Logging verbosity level (e.g. logging.INFO, logging.DEBUG).

    Returns:
        Configured logging.Logger instance.
    """
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(level)
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            fmt="[%(asctime)s] [%(levelname)s] %(name)s: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger


def ensure_directory(path: str) -> str:
    """Ensures that a specified directory exists, creating it if necessary.

    Args:
        path: Directory path to check/create.

    Returns:
        The normalized absolute directory path.
    """
    os.makedirs(path, exist_ok=True)
    return os.path.abspath(path)


def format_bytes(size_bytes: int | float) -> str:
    """Formats raw byte counts into human-readable strings (KB, MB, GB).

    Args:
        size_bytes: Size in integer or float bytes.

    Returns:
        Formatted string, e.g., '14.25 MB'.
    """
    if size_bytes <= 0:
        return "0 B"
    size_names = ("B", "KB", "MB", "GB", "TB")
    i = 0
    size = float(size_bytes)
    while size >= 1024.0 and i < len(size_names) - 1:
        size /= 1024.0
        i += 1
    return f"{size:.2f} {size_names[i]}"


def time_it(func: Callable[..., Any]) -> Callable[..., Any]:
    """Decorator to measure and log function execution runtime.

    Args:
        func: The target function to benchmark.

    Returns:
        Wrapped function with runtime logging.
    """
    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        logger = setup_logger("timer")
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start_time
        logger.info("Function '%s' executed in %.4f seconds.", func.__name__, elapsed)
        return result

    return wrapper
