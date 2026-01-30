"""
Competing Constraints Demo
==========================

Two constraints impose incompatible pressures.
The final structure reveals dominance, compromise, or oscillation.

Key question:
    When rules disagree, which ones reality listens to?
"""

import random
from typing import Dict, Callable, List


def generate_state() -> Dict[str, float]:
    return {f"x{i}": random.uniform(-10, 10) for i in range(4)}


# Constraint A: drive values toward zero
def damping(state: Dict[str, float]) -> Dict[str, float]:
    return {k: v * 0.7 for k, v in state.items()}


# Constraint B: enforce minimum magnitude
def amplification(state: Dict[str, float]) -> Dict[str, float]:
    return {
        k: v if abs(v) >= 3 else (3 if v >= 0 else -3)
        for k, v in state.items()
    }


def collapse(
    state: Dict[str, float],
    constraints: List[Callable],
    iterations: int = 20
) -> Dict[str, float]:
    s = state.copy()
    for _ in range(iterations):
        for c in constraints:
            s = c(s)
    return s


if __name__ == "__main__":
    initial = generate_state()
    final = collapse(initial, [damping, amplification])

    print("\n--- COMPETING CONSTRAINTS ---\n")
    for k in initial:
        print(f"{k}: {initial[k]:.2f} → {final[k]:.2f}")
