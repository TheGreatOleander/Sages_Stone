class RCFEngine:
    def __init__(self, constraints=None, dynamics=None):
        self.constraints = constraints or []
        self.dynamics = dynamics

    def step(self, state):
        for c in self.constraints:
            if not c.validate(state):
                raise ValueError("Constraint violation")
        if self.dynamics:
            return self.dynamics.step(state)
        return state
