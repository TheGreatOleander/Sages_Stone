"""
Hysteresis Demo
===============

Collapse and expansion are not symmetric.
The path matters.

You cannot rewind reality
by reversing the rules.
"""

import random


def compress(x):
    return max(-3, min(3, x))


def expand(x):
    return x * 2


if __name__ == "__main__":
    x = random.uniform(-10, 10)

    print("\n--- HYSTERESIS ---\n")
    print("Initial:", x)

    compressed = compress(x)
    expanded = expand(compressed)

    print("After compression:", compressed)
    print("After expansion:", expanded)
