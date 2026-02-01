"""Task scheduling and lifecycle management for the agent."""

from datetime import datetime
from typing import Callable, Optional


def schedule_task(start_time: datetime, task: Callable[[], None]) -> None:
    """Register a callable to run at the requested start_time."""
    raise NotImplementedError


def monitor_session(check_fn: Callable[[], bool], timeout_seconds: int = 30) -> bool:
    """Poll a condition until it signals the session is active or times out."""
    raise NotImplementedError


def shutdown_session(cleanup_fn: Optional[Callable[[], None]] = None) -> None:
    """Perform any necessary teardown when the session closes."""
    if cleanup_fn:
        cleanup_fn()
