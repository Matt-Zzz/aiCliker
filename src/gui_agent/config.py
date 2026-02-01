"""Configuration models and helpers for the GUI automation agent."""

from dataclasses import dataclass, field
from datetime import time
from typing import List, Optional


@dataclass
class Credentials:
    username: str = ""
    password: str = ""
    remember: bool = False


@dataclass
class SessionConfig:
    course_id: str = ""
    session_label: str = ""
    preferred_start: Optional[time] = None
    preferred_end: Optional[time] = None


@dataclass
class StrategyConfig:
    use_llm_vision: bool = False
    answer_priority: List[str] = field(default_factory=list)
    max_retries: int = 3


@dataclass
class AgentConfig:
    credentials: Credentials = field(default_factory=Credentials)
    session: SessionConfig = field(default_factory=SessionConfig)
    strategy: StrategyConfig = field(default_factory=StrategyConfig)
