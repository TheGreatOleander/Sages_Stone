class Evaluator:
    def __init__(self, constraints):
        self.constraints = constraints

    def score(self, state):
        return sum(c.score(state) for c in self.constraints)


class ConstraintEntropyEngine:
    def __init__(self, injector, evaluator, topology):
        self.injector = injector
        self.evaluator = evaluator
        self.topology = topology

    def step(self, state):
        stagnation = self.topology.stagnation(state)
        candidate = self.injector.inject(state, stagnation)

        if self.evaluator.score(candidate) >= self.evaluator.score(state):
            return candidate
        return state
