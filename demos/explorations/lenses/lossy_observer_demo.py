"""
Lossy Observer Demo
===================

This observer cannot see how much —
only which side of zero.

The shadow is brutally lossy,
yet still structured.
"""

import random


def generate_state():
    return {f"a{i}": random.uniform(-10, 10) for i in range(6)}


def sign_only_lens(state):
    return {k: "positive" if v >= 0 else "negative" for k, v in state.items()}


if __name__ == "__main__":
    state = generate_state()
    shadow = sign_only_lens(state)

    print("\n--- LOSSY OBSERVER ---\n")
    print("State:")
    print(state)
    print("\nObserved shadow:")
    print(shadow)
