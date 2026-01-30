
"""
Demo: Observer Matters
Same system, two lenses, different interpretations.
"""

from Sages_Stone_Core.core.lens_base import Lens

SYSTEM = {"value": 42}

class PermissiveLens(Lens):
    def constraints(self):
        return [lambda s: True]

    def system(self):
        return SYSTEM

class StrictLens(Lens):
    def constraints(self):
        return [lambda s: s["value"] < 10]

    def system(self):
        return SYSTEM

if __name__ == "__main__":
    print("Permissive:", PermissiveLens().observe())
    print("Strict:", StrictLens().observe())
