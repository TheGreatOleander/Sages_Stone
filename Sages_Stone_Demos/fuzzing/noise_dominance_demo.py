"""
Noise Dominance Demo
====================

At sufficient noise levels,
no invariant survives.
"""

import random


def signal():
    return 5.0


def noise():
    return random.uniform(-10, 10)


if __name__ == "__main__":
    print("\n--- NOISE DOMINANCE ---\n")
    for step in range(10):
        value = signal() + noise()
        print(f"Step {step}: {value:.2f}")
