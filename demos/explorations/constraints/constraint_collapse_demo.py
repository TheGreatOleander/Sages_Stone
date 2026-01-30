"""
Static Constraint Collapse Demo
================================

This demo illustrates the core idea of the Reality Constraint Fuzzer:

    Structure is not created.
    Structure is revealed under pressure.

A high-entropy state is subjected to fixed constraints repeatedly.
What survives is considered invariant relative to those constraints.

This demo makes NO claims about physical reality.
It is epistemic, illustrative, and non-predictive.
"""

import random
from typing import Dict, Callable, List


# -----------------------------
# Reality State
# -----------------------------

def generate_state(dimensions: int = 6) -> Dict[str, float]:
    """Generate a high-entropy initial state."""
    return {
        f"axis_{i}": random.uniform(-20.0, 20.0)
        for i in range(dimensions)
    }


# -----------------------------
# Constraints
# -----------------------------

def energy_cap(state: Dict[str, float], cap: float = 15.0) -> Dict[str, float]:
    """Limits total absolute magnitude."""
    total = sum(abs(v) for v in state.values())
    if total <= cap or total == 0:
        return state

    scale = cap / total
    return {k: v * scale for k, v in state.items()}


def symmetry_pairing(state: Dict[str, float]) -> Dict[str, float]:
    """Forces paired axes toward symmetry."""
    keys = list(state.keys())
    for i in range(0, len(keys) - 1, 2):
        avg = (state[keys[i]] + state[keys[i + 1]]) / 2
        state[keys[i]] = avg
        state[keys[i + 1]] = avg
    return state


# -----------------------------
# Collapse Engine
# -----------------------------

def collapse(
    state: Dict[str, float],
    constraints: List[Callable[[Dict[str, float]], Dict[str, float]]],
    iterations: int = 12
) -> Dict[str, float]:
    current = state.copy()
    for _ in range(iterations):
        for constraint in constraints:
            current = constraint(current)
    return current


# -----------------------------
# Revelation
# -----------------------------

def reveal(initial: Dict[str, float], collapsed: Dict[str, float]) -> None:
    print("\n--- STATIC CONSTRAINT COLLAPSE ---\n")
    for k in initial:
        delta = collapsed[k] - initial[k]
        print(
            f"{k:>8} | "
            f"initial={initial[k]:>7.2f} | "
            f"final={collapsed[k]:>7.2f} | "
            f"Δ={delta:>7.2f}"
        )


# -----------------------------
# Run Demo
# -----------------------------

if __name__ == "__main__":
    initial_state = generate_state()
    constraints = [energy_cap, symmetry_pairing]
    collapsed_state = collapse(initial_state, constraints)
    reveal(initial_state, collapsed_state)
