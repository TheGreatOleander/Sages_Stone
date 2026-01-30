
from observers.base import Observer

class CoherenceObserver(Observer):
    def observe(self, state):
        if state.sound.get("frequency", 0) > 900:
            state.coherence *= 0.97
