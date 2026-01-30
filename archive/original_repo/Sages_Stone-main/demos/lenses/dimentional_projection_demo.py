"""
Dimensional Projection Demo
===========================

A high-dimensional state is projected into a lower-dimensional shadow.
Information is lost — but not randomly.

Invariants leave fingerprints.
"""

import random
from typing import Dict


def generate_state(dim=6):
    return {f"d{i}": random.uniform(-10, 10) for i in range(dim)}


def project_to_2d(state: Dict[str, float]):
    keys = list(state.keys())
    x = sum(state[k] for k in keys[::2])
    y = sum(state[k] for k in keys[1::2])
    return {"x": x, "y": y}


if __name__ == "__main__":
    state = generate_state()
    shadow = project_to_2d(state)

    print("\n--- DIMENSIONAL PROJECTION ---\n")
    print("Original state:")
    for k, v in state.items():
        print(f"  {k}: {v:.2f}")

    print("\nProjected shadow:")
    for k, v in shadow.items():
        print(f"  {k}: {v:.2f}")
