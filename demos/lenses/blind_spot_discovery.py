"""
Blind Spot Discovery Demo
=========================

Some dimensions never appear in any observation.
They still exist.
They still matter.

This demo detects invisible axes.
"""

import random
from typing import Dict, List, Callable


def generate_state():
    return {f"d{i}": random.uniform(-5, 5) for i in range(6)}


def lens_1(state: Dict[str, float]):
    return {"x": state["d0"] + state["d1"]}


def lens_2(state: Dict[str, float]):
    return {"y": state["d2"] * state["d3"]}


def find_blind_spots(state: Dict[str, float], lenses: List[Callable]):
    seen = set()
    for lens in lenses:
        shadow = lens(state)
        for k in shadow:
            pass
    for k in state:
        if all(k not in lens(state) for lens in lenses):
            seen.add(k)
    return seen


if __name__ == "__main__":
    state = generate_state()
    lenses = [lens_1, lens_2]

    blind = find_blind_spots(state, lenses)

    print("\n--- BLIND SPOT DISCOVERY ---\n")
    print("State:", state)
    print("Blind dimensions:", blind)
