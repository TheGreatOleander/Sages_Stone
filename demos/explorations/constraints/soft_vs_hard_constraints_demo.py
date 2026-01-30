"""
Soft vs Hard Constraints
========================

Hard constraints snap reality into compliance.
Soft constraints bend it.

This demo compares both acting on the same state.
"""

import random
from typing import Dict


def generate_state():
    return {f"x{i}": random.uniform(-15, 15) for i in range(5)}


def hard_clamp(state: Dict[str, float]) -> Dict[str, float]:
    return {k: max(-5, min(5, v)) for k, v in state.items()}


def soft_pull(state: Dict[str, float]) -> Dict[str, float]:
    return {k: v * 0.85 for k, v in state.items()}


def run(label, constraint):
    s = generate_state()
    original = s.copy()
    for _ in range(10):
        s = constraint(s)

    print(f"\n{label}")
    for k in s:
        print(f"{k}: {original[k]:6.2f} → {s[k]:6.2f}")


if __name__ == "__main__":
    run("Soft Constraint", soft_pull)
    run("Hard Constraint", hard_clamp)
