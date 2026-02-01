"""Vision helpers (OCR, screenshot capture, and optional LLM calls)."""

from typing import Any, Dict


def capture_screen(region: tuple[int, int, int, int] | None = None) -> bytes:
    """Take a screenshot of the specified region."""
    raise NotImplementedError


def parse_question_via_ocr(image_bytes: bytes) -> Dict[str, Any]:
    """Return structured question/choices extracted with OCR."""
    raise NotImplementedError


def query_llm_vision(image_bytes: bytes) -> Dict[str, Any]:
    """Use an LLM vision endpoint to describe the screen state."""
    raise NotImplementedError
