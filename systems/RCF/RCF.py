import math
import json
import uuid
import argparse
import numpy as np
import matplotlib.pyplot as plt
import random
from datetime import datetime

# ============================================================
# Reality Constraint Fuzzer (RCF)
# Canonical Engine – Headless + Instrumented + Adaptive Edition
# ============================================================

# ---------------- LENS DEFINITIONS ----------------
class Lens:
    def __init__(self, name):
        self.name = name

class ConstraintLens(Lens): pass
class GenerativeLens(Lens): pass
class EmergentLens(Lens): pass
class ObservationalLens(Lens): pass
class BoundaryLens(Lens): pass

# ---------------- STATE ----------------
class State:
    def __init__(self, vector, intent=0.0, memory=0.0):
        self.vector = np.array(vector, dtype=float)
        self.intent = intent
        self.memory = memory

    def magnitude(self):
        return float(np.linalg.norm(self.vector))

# ---------------- CONSTRAINT ----------------
class Constraint:
    def __init__(self, name, func, lens: Lens, persona="Neutral"):
        self.id = str(uuid.uuid4())
        self.name = name
        self.func = func
        self.lens = lens
        self.persona = persona
        self.violations = 0
        self.survival_score = 0
        self.history = []

    def evaluate(self, val):
        ok = bool(self.func(val))
        self.history.append(ok)
        if ok:
            self.survival_score += 1
        else:
            self.violations += 1
        return ok

    def snapshot(self):
        return {
            "constraint_id": self.id,
            "name": self.name,
            "lens": self.lens.name,
            "persona": self.persona,
            "survival_score": self.survival_score,
            "violations": self.violations,
            "history": self.history,
        }

# ---------------- REALITY NET ----------------
class RealityNet:
    def __init__(self, constraints, limit=5.0):
        self.constraints = constraints
        self.limit = limit
        self.global_stress = 0.0

    def lens_interaction(self):
        for c in self.constraints:
            if c.lens.name.lower() == "chaos" and c.violations > 0:
                self.global_stress += 0.01

    def tension(self, vector, drift):
        mag = float(np.linalg.norm(vector))
        self.global_stress += abs(drift) * 0.02 + 0.01
        self.lens_interaction()

        if abs(mag) >= (self.limit - self.global_stress):
            return -3, "GLOBAL COLLAPSE"

        for c in self.constraints:
            for v in vector:
                if not c.evaluate(v):
                    return -1, f"Constraint Breach → {c.name}"

        return 1, None

# ---------------- TRANSFORMS ----------------
def static_fn(s: State):
    return State(s.vector * 0.9, s.intent + 0.05, s.memory)

def entropy_fn(s: State, stress):
    scale = 0.05 + stress * 0.01
    return State(
        s.vector + np.random.normal(0, scale, size=len(s.vector)),
        s.intent + 0.1,
        s.memory,
    )

def resonance_fn(s: State):
    return State(
        s.vector * (1 + 0.01 * np.sin(s.intent)),
        s.intent + 0.15,
        s.memory,
    )

# ---------------- SIMULATION ----------------
class Simulation:
    def __init__(self, dims, constraints, frames=200, platform="python", headless=False):
        self.run_id = str(uuid.uuid4())
        self.platform = platform
        self.started = datetime.utcnow().isoformat() + "Z"
        self.state = State(np.random.uniform(0.5, 1.5, size=dims))
        self.net = RealityNet(constraints)
        self.frames = frames
        self.history = []
        self.step_log = []
        self.collapse_reason = None
        self.headless = headless

    def step(self, i):
        if random.random() < 0.5:
            self.state = static_fn(self.state)
        if random.random() < 0.5:
            self.state = entropy_fn(self.state, self.net.global_stress)
        if random.random() < 0.5:
            self.state = resonance_fn(self.state)

        drift = float(np.mean(self.state.vector) * 0.01)
        code, msg = self.net.tension(self.state.vector, drift)

        self.history.append(self.state.magnitude())
        self.step_log.append({
            "step": i,
            "vector": self.state.vector.tolist(),
            "magnitude": self.state.magnitude(),
            "intent": self.state.intent,
            "global_stress": self.net.global_stress,
        })

        if code < 0:
            self.collapse_reason = msg
        return code, msg

    def run(self):
        for i in range(self.frames):
            code, msg = self.step(i)
            if code < 0:
                if not self.headless:
                    print(msg)
                break
        else:
            if not self.headless:
                print("✓ Stable Run")

        if not self.headless:
            self.render()
        self.export()

    # ---------------- OUTPUT ----------------
    def render(self):
        scores = [c.survival_score for c in self.net.constraints]
        plt.figure(figsize=(6, 4))
        plt.bar([c.name for c in self.net.constraints], scores)
        plt.title("Constraint Survivability")
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.show()

        plt.figure()
        plt.plot(self.history)
        plt.title("State Magnitude Over Time")
        plt.xlabel("Step")
        plt.ylabel("Magnitude")
        plt.show()

    def export(self, path=None):
        data = {
            "run_id": self.run_id,
            "platform": self.platform,
            "started": self.started,
            "frames": len(self.history),
            "collapsed": self.collapse_reason is not None,
            "collapse_reason": self.collapse_reason,
            "constraints": [c.snapshot() for c in self.net.constraints],
            "history": self.history,
            "steps": self.step_log,
        }
        if path is None:
            path = f"rcf_run_{self.run_id}.json"
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
        if not self.headless:
            print(f"Run exported → {path}")

# ---------------- CLI ----------------
def main():
    parser = argparse.ArgumentParser(description="Reality Constraint Fuzzer")
    parser.add_argument("--dims", type=int, default=3)
    parser.add_argument("--frames", type=int, default=200)
    parser.add_argument("--platform", type=str, default="python")
    parser.add_argument("--headless", action="store_true")
    args = parser.parse_args()

    constraints = [
        Constraint(
            "Bounds",
            lambda x: 0.1 < abs(x) < 5.0,
            ConstraintLens("Boundary"),
            persona="Containment",
        ),
        Constraint(
            "NonInteger",
            lambda x: abs(x - round(x)) > 0.05,
            ConstraintLens("Chaos"),
            persona="Irrationality",
        ),
    ]

    sim = Simulation(
        dims=args.dims,
        constraints=constraints,
        frames=args.frames,
        platform=args.platform,
        headless=args.headless,
    )

    sim.run()


if __name__ == "__main__":
    main()