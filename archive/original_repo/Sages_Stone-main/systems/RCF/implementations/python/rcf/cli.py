import json
from rcf.core.state import State
from rcf.core.constraint import Constraint
from rcf.core.engine import Engine

def main():
    c = Constraint("unit_sphere", lambda s: (s.vec**2).sum() <= 1.0)
    e = Engine([c], seed=42)
    s = State([0.0,0.0,0.0])

    for _ in range(1000):
        ok, hit = e.step(s)
        if not ok:
            break

    print(json.dumps(e.fatigue, indent=2))

if __name__ == "__main__":
    main()
