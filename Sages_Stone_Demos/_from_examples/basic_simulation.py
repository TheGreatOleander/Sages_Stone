from systems.RCF.engine import RCFEngine
from systems.RCF.constraint import Constraint
from systems.RCF.state import State
from systems.RCF.dynamics import Dynamics

class NonNegative(Constraint):
    def validate(self, state):
        return state.x >= 0

class Increment(Dynamics):
    def step(self, state):
        state.x += 1
        return state

engine = RCFEngine(constraints=[NonNegative()], dynamics=Increment())
state = State(x=0)

for i in range(10):
    state = engine.step(state)
    print(f"Step {i}: x={state.x}")
