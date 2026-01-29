
from rcf.core.state import State
from rcf.core.engine import step

def test_engine_step_valid():
    s = State(energy=1.0, coherence=0.5)
    assert step(s) is s
