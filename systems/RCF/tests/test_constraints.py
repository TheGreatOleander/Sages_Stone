
import pytest
from rcf.core.constraint import admissible, ConstraintViolation

def test_state_not_none():
    with pytest.raises(ConstraintViolation):
        admissible(None)
