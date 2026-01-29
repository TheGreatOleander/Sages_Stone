
"""RCF Laws
Pure, deterministic invariants.
NO state mutation.
NO side effects.
"""

def conserve_energy(state):
    """Energy must be conserved across transitions."""
    return state.energy >= 0

def conserve_coherence(state):
    """Coherence must remain within [0,1]."""
    return 0.0 <= state.coherence <= 1.0

LAWS = (
    conserve_energy,
    conserve_coherence,
)
