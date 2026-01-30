
from rcf.core.state import State
from rcf.core.laws import conserve_energy, conserve_coherence

def test_energy_conservation():
    assert conserve_energy(State(energy=1.0, coherence=0.5))

def test_coherence_bounds():
    assert conserve_coherence(State(energy=1.0, coherence=1.0))
