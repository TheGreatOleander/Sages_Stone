"""
Constraint Removal Demo (Ablation)
=================================

This demo removes constraints one at a time to observe
which structural features depend on which rules.

If removing a constraint changes nothing,
that constraint was ornamental.

If removing one collapses meaning,
that constraint was load-bearing.
"""

import random
from typing import Dict, Callable, List


def generate_state():
    return {f"d{i}": random.uniform(-12, 12) for i in range(6)}


def cap_energy(state: Dict[str, float]) -> Dict[str, float]:
    total = sum(abs(v) for v in state.values())
    if total <= 20 or total == 0:
        return state
    scale = 20 / total
    return {k: v * scale for k, v in state.items()}


def enforce_symmetry(state: Dict[str, float]) -> Dict[str, float]:
    keys = list(state.keys())
    for i in range(0, len(keys) - 1, 2):
        avg = (state[keys[i]] + state[keys[i + 1]]) / 2
        state[keys[i]] = avg
        state[keys[i + 1]] = avg
    return state


def collapse(state, constraints: List[Callable], steps=10):
    s = state.copy()
    for _ in range(steps):
        for c in constraints:
            s = c(s)
    return s


def run(label, constraints):
    s0 = generate_state()
    s1 = collapse(s0, constraints)
    print(f"\n{label}")
    for k in s0:
        print(f"{k}: {s0[k]:6.2f} → {s1[k]:6.2f}")


if __name__ == "__main__":
    both = [cap_energy, enforce_symmetry]
    run("Both Constraints", both)
    run("Energy Only", [cap_energy])
    run("Symmetry Only", [enforce_symmetry])
