
class URFEngine:
    def __init__(self, reality, observers, stability, invariant_registry):
        self.reality = reality
        self.observers = observers
        self.stability = stability
        self.invariants = invariant_registry
        self.history = []

    def apply_mutation(self, mutation):
        self.stability.consume(mutation.cost)
        mutation.apply(self.reality)
        self.history.append(mutation.name)

    def run_observers(self):
        results = {}
        for obs in self.observers:
            obs_results = {}
            for name, proj in self.reality.representations.items():
                obs_results[name] = obs.observe(proj, self.reality)
            results[obs.name] = obs_results
        return results
