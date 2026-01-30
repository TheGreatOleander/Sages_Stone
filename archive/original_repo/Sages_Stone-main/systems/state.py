import uuid
from typing import List

class State:
    def __init__(self, values: List[float], intent: List[float] = None, history=None):
        self.id = uuid.uuid4().hex
        self.values = values
        self.intent = intent or [0.0 for _ in values]
        self.history = history or []

    def clone(self):
        s = State(
            self.values[:],
            self.intent[:],
            self.history[:] + [self.values[:]]
        )
        s.id = self.id
        return s
