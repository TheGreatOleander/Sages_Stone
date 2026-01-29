
class StabilityMonitor:
    def __init__(self, budget=1.0):
        self.budget = budget

    def consume(self, cost):
        if self.budget < cost:
            raise RuntimeError('Stability budget exhausted')
        self.budget -= cost

    def snapshot(self):
        return self.budget
