
"""
Lens Base + Result Schema
All lenses should implement evaluate(state) -> LensResult
"""

from dataclasses import dataclass, field
from typing import Any, Dict
import time

@dataclass
class LensResult:
    name: str
    score: float = 0.0
    entropy: float = 0.0
    stability: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)
    timestamp: float = field(default_factory=time.time)

class BaseLens:
    name = "BaseLens"

    def evaluate(self, state) -> LensResult:
        raise NotImplementedError("Lens must implement evaluate()")
