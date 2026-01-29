
class VacuumAdapter:
    def update(self, state):
        state.coherence *= 0.995
