
"""
Demo: Hello, Collapse
The smallest possible falsification example.
"""

from Sages_Stone_Core.core.lens_base import Lens

class HelloLens(Lens):
    def constraints(self):
        return [lambda s: False]

    def system(self):
        return {"hello": "world"}

if __name__ == "__main__":
    print(HelloLens().observe())
