
from dataclasses import dataclass
from typing import Callable

@dataclass
class Mutation:
    name: str
    target: str  # ontology | dynamics | representation
    operator: Callable
    cost: float = 0.1

    def apply(self, reality):
        layer = getattr(reality, self.target)
        self.operator(layer)
