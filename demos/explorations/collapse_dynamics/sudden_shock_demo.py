"""
Sudden Shock Demo
=================

A violent constraint is applied once.
Compare to gradual collapse.
"""

import random


def generate_state():
    return random.uniform(-30, 30)


def shock(value):
    return max(-5, min(5, value))


if __name__ == "__main__":
    value = generate_state()

    print("\n--- SUDDEN SHOCK ---\n")
    print("Before:", value)
    print("After:", shock(value))
