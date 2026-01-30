class Constraint:
    def __init__(self, name, score_fn, weight=1.0):
        self.name = name
        self.score_fn = score_fn
        self.weight = weight

    def score(self, state):
        return self.weight * self.score_fn(state)
