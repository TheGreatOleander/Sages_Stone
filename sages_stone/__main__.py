from systems.RCF.engine import RCFEngine
from systems.RCF.constraint import Constraint
from systems.RCF.state import State
from systems.RCF.dynamics import Dynamics

class AlwaysValid(Constraint):
    def validate(self, state):
        return True

class Increment(Dynamics):
    def step(self, state):
        state.x += 1
        return state

if __name__ == "__main__":
    engine = RCFEngine(constraints=[AlwaysValid()], dynamics=Increment())
    state = State(x=0)
    for _ in range(5):
        state = engine.step(state)
        print(state.x)
