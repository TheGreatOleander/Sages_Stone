
class GeometryAdapter:
    def __init__(self, bus=None):
        self.bus = bus

    def update(self, state):
        r = state.geometry.get("radius", 1.0) + 0.02
        state.geometry["radius"] = r
        state.entropy += r * 0.001
        if self.bus and r > 2.0:
            self.bus.emit(Event("CURVATURE_SPIKE", {"radius": r}))
