from systems.core.lens_base import Lens

class DoubleLens(Lens):
    def apply(self, value):
        return value * 2

if __name__ == "__main__":
    lens = DoubleLens("double")
    print("Demo result:", lens(21))
