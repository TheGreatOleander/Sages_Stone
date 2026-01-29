
from core.constants import BASE_FREQUENCY, PHI

class MusicAdapter:
    def update(self, state):
        geom = state.geometry.get("radius", 1.0)
        state.sound["frequency"] = BASE_FREQUENCY * (PHI ** geom)
        state.sound["amplitude"] = max(0.0, 1.0 - state.entropy)
