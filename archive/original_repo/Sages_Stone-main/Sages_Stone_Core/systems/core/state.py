
from dataclasses import dataclass, field
from typing import Dict, Any
import time

@dataclass
class SystemState:
    time: float = field(default_factory=lambda: time.time())
    entropy: float = 0.0
    coherence: float = 1.0
    geometry: Dict[str, Any] = field(default_factory=dict)
    sound: Dict[str, Any] = field(default_factory=dict)
    vacuum: Dict[str, Any] = field(default_factory=dict)
    observers: Dict[str, Any] = field(default_factory=dict)

    def tick(self, dt: float):
        self.time += dt
