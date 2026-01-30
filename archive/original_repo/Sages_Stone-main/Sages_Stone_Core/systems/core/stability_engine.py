
from core.constants import DEFAULT_ENTROPY_LIMIT, DEFAULT_COHERENCE_MIN

class StabilityEngine:
    def __init__(self, entropy_limit=DEFAULT_ENTROPY_LIMIT, coherence_min=DEFAULT_COHERENCE_MIN):
        self.entropy_limit = entropy_limit
        self.coherence_min = coherence_min

    def evaluate(self, state):
        unstable = False
        reasons = []
        if state.entropy > self.entropy_limit:
            unstable = True
            reasons.append("entropy_exceeded")
        if state.coherence < self.coherence_min:
            unstable = True
            reasons.append("coherence_too_low")
        return unstable, reasons

    def stabilize(self, state):
        state.entropy *= 0.9
        state.coherence += (1.0 - state.coherence) * 0.1
