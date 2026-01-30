
class InvariantRegistry:
    def __init__(self):
        self.invariants = []

    def register(self, description, evidence):
        self.invariants.append({
            'description': description,
            'evidence': evidence
        })

    def all(self):
        return self.invariants
