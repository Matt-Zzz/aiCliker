"""Centralized logging helpers for agent operations."""

import logging
from pathlib import Path

LOG_DIR = Path("logs")


def configure_logging() -> None:
    """Create log directory and configure handlers."""
    # Real implementation would ensure rotating file handler per session.
    LOG_DIR.mkdir(exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[logging.StreamHandler()],
    )
