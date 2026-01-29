"""
Random Constraint Fuzzing
=========================

Constraints are injected at random.
The system must survive nonsense.
"""

import random


def random_constraint(x):
    return x + random.uniform(-2, 2)


if __name__ == "__main__":
    x = 0.0
    print("\n--- RANDOM CONSTRAINT FUZZING ---\n")

    for step in range(10):
        x = random_constraint(x)
        print(f"Step {step}: {x:.3f}")
