from dataclasses import dataclass
from typing import Callable, List

@dataclass
class State:
    energy: float
    entropy: float

Constraint = Callable[[State], bool]

class ConstraintViolation(Exception):
    pass

class ConstraintEngine:
    def __init__(self, constraints: List[Constraint]):
        self.constraints = constraints

    def validate(self, state: State):
        for c in self.constraints:
            if not c(state):
                raise ConstraintViolation(f"Constraint failed: {c.__name__}")

    def transition(self, state: State, update: Callable[[State], State]) -> State:
        new_state = update(state)
        self.validate(new_state)
        return new_state

def energy_non_negative(state: State) -> bool:
    return state.energy >= 0

def entropy_non_decreasing(state: State) -> bool:
    return state.entropy >= 0

engine = ConstraintEngine([
    energy_non_negative,
    entropy_non_decreasing,
])

state = State(energy=10.0, entropy=1.0)
print("Initial:", state)

state = engine.transition(
    state,
    lambda s: State(energy=s.energy - 3, entropy=s.entropy + 0.2)
)
print("After valid transition:", state)

try:
    state = engine.transition(
        state,
        lambda s: State(energy=s.energy - 20, entropy=s.entropy + 0.1)
    )
except ConstraintViolation as e:
    print("Blocked:", e)
