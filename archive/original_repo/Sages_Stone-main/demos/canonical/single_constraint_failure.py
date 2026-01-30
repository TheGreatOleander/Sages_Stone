
"""
Demo: One Bad Constraint
A single failing constraint collapses the system.
"""

from Sages_Stone_Core.core.lens_base import Lens

class FragileLens(Lens):
    def constraints(self):
        return [
            lambda s: True,
            lambda s: False,  # bad constraint
        ]

    def system(self):
        return {"state": "fragile"}

if __name__ == "__main__":
    lens = FragileLens()
    report = lens.observe()
    print("Collapse result:", report)
