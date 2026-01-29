"""
Iterative Cooling Demo
======================

Constraints are applied gradually.
Early structure survives longer.
Late structure is brittle.
"""

import random


def generate_state():
    return random.uniform(-20, 20)


def cool(value, temperature):
    return value * temperature


if __name__ == "__main__":
    value = generate_state()
    print("\n--- ITERATIVE COOLING ---\n")
    print("Initial:", value)

    temp = 1.0
    for step in range(10):
        temp *= 0.85
        value = cool(value, temp)
        print(f"Step {step}: value={value:.3f}, temp={temp:.3f}")
