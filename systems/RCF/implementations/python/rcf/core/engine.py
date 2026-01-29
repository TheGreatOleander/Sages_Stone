
"""RCF Engine
The only temporal orchestrator.
"""

from .laws import LAWS
from .constraint import admissible

def step(state):
    admissible(state)
    for law in LAWS:
        if not law(state):
            raise RuntimeError(f"Law violation: {law.__name__}")
    return state
