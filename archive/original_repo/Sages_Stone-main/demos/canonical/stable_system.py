
"""
Demo: Stable System
Shows a constraint set that does NOT collapse.
"""

from Sages_Stone_Core.core.lens_base import Lens

class StableLens(Lens):
    def constraints(self):
        return [lambda s: True, lambda s: True]

    def system(self):
        return {"state": "stable"}

if __name__ == "__main__":
    lens = StableLens()
    report = lens.observe()
    print("Stable system result:", report)
