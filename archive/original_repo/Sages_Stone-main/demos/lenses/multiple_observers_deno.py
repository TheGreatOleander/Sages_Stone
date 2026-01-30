"""
Multiple Observers Demo
=======================

Each observer has a different lens.
All are valid.
None are complete.
"""

import random
from typing import Dict


def generate_state():
    return {f"d{i}": random.uniform(-10, 10) for i in range(6)}


def observer_A(state: Dict[str, float]):
    return sum(state[k] for k in list(state.keys())[:3])


def observer_B(state: Dict[str, float]):
    return sum(abs(v) for v in state.values())


if __name__ == "__main__":
    state = generate_state()

    print("\n--- MULTIPLE OBSERVERS ---\n")
    print("State:", state)
    print("Observer A sees:", observer_A(state))
    print("Observer B sees:", observer_B(state))
