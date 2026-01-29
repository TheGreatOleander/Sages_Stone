
"""RCF Constraints
Admissibility checks. Explicit failure only.
"""

class ConstraintViolation(Exception):
    pass

def admissible(state):
    if state is None:
        raise ConstraintViolation("State cannot be None")
    return True
