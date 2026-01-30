"""
Rotating Lens Demo
==================

The observer rotates their basis.
Reality does not change.
The shadow does.

This demonstrates that observation is an active operation,
not a passive window.
"""

import random
import math
from typing import Dict


def generate_state():
    return {f"x{i}": random.uniform(-10, 10) for i in range(2)}


def rotate(state: Dict[str, float], theta: float):
    x, y = state["x0"], state["x1"]
    xr = x * math.cos(theta) - y * math.sin(theta)
    yr = x * math.sin(theta) + y * math.cos(theta)
    return {"x": xr, "y": yr}


if __name__ == "__main__":
    state = generate_state()

    print("\n--- ROTATING LENS ---\n")
    print("Original state:", state)

    for angle in [0, math.pi / 4, math.pi / 2]:
        shadow = rotate(state, angle)
        print(f"\nRotation {angle:.2f} rad → shadow {shadow}")
