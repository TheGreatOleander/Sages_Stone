
class Observer:
    def __init__(self, name, bias=None):
        self.name = name
        self.bias = bias

    def observe(self, projection, reality):
        return projection.projector(reality)
