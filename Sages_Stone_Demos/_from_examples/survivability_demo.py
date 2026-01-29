"""
Survivability Demo: Constraint Erosion vs Unconstrained Growth

This demo compares two systems:
1. An unconstrained growth system
2. A constraint-aware system using RCF

The unconstrained system grows faster — until it catastrophically fails.
The constrained system survives.
"""

from systems.RCF.engine import RCFEngine
from systems.RCF.constraint import Constraint
from systems.RCF.state import State
from systems.RCF.dynamics import Dynamics

# ----- Constraints -----
class ResourceLimit(Constraint):
    def validate(self, state):
        return state.resources >= 0

# ----- Dynamics -----
class AggressiveGrowth(Dynamics):
    def step(self, state):
        state.population *= 1.5
        state.resources -= state.population * 0.8
        return state

class SustainableGrowth(Dynamics):
    def step(self, state):
        growth = min(state.resources * 0.1, state.population * 0.2)
        state.population += growth
        state.resources -= growth * 0.5
        return state

# ----- Simulation -----
def run(engine, label):
    state = State(population=10.0, resources=100.0)
    print(f"\n--- {label} ---")
    for step in range(1, 21):
        try:
            state = engine.step(state)
            print(f"Step {step:02d} | pop={state.population:.2f} | res={state.resources:.2f}")
        except ValueError:
            print(f"Step {step:02d} | SYSTEM COLLAPSE")
            break

unconstrained = RCFEngine(
    constraints=[],
    dynamics=AggressiveGrowth()
)

constrained = RCFEngine(
    constraints=[ResourceLimit()],
    dynamics=SustainableGrowth()
)

run(unconstrained, "Unconstrained Growth")
run(constrained, "Constraint-Aware Growth")
