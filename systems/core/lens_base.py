"""
Sage's Stone — Canonical Engine Core

This module is the single source of runtime truth.
Everything else in the repository may reference this,
but nothing else defines execution semantics.
"""

class BaseLens:
    def __init__(self, name="base"):
        self.name = name

    def apply(self, value):
        return value

    def __call__(self, value):
        return self.apply(value)


class Lens(BaseLens):
    """Stable public Lens API."""
    pass
