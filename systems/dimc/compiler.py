
class Constraint:
    def __init__(self, condition, action, cost):
        self.condition = condition
        self.action = action
        self.cost = cost

    def apply(self, state):
        if self.condition(state):
            self.action(state)
            self.cost(state)
