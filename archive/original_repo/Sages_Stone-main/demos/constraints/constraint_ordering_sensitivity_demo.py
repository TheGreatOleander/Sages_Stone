"""
Constraint Ordering Sensitivity Demo
====================================

This demo shows that constraints are NOT commutative.
Order is a hidden assumption—and assumptions matter.
"""

import random
from typing import Dict


def generate_state():
    return {f"a{i}": random.uniform(-8, 8) for i in range(4)}


def clamp(state: Dict[str, float]) -> Dict[str, float]:
    return {k: max(-5, min(5, v)) for k, v in state.items()}


def normalize(state: Dict[str, float]) -> Dict[str, float]:
    mag = sum(abs(v) for v in state.values())
    if mag == 0:
        return state
    return {k: v / mag * 5 for k, v in state.items()}


def run(order_name, constraints):
    s = generate_state()
    original = s.copy()
    for c in constraints:
        s = c(s)

    print(f"\nOrder: {order_name}")
    for k in s:
        print(f"{k}: {original[k]:.2f} → {s[k]:.2f}")


if __name__ == "__main__":
    run("Clamp → Normalize", [clamp, normalize])
    run("Normalize → Clamp", [normalize, clamp])
