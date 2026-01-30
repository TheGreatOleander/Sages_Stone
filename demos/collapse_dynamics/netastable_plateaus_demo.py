"""
Metastable Plateaus Demo
=======================

The system appears stable…
until it suddenly isn't.

This demonstrates false equilibrium.
"""

import random


def generate_state():
    return random.uniform(-20, 20)


def soft_constraint(x):
    if abs(x) < 4:
        return x
    return x * 0.9


if __name__ == "__main__":
    x = generate_state()
    print("\n--- METASTABLE PLATEAU ---\n")
    print("Initial:", x)

    for step in range(20):
        x = soft_constraint(x)
        print(f"Step {step:02d}: {x:.4f}")
