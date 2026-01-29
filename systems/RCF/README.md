# RCF — Reality Constraint Fuzzer

RCF is a **fuzzing engine for constraint-bound systems**.

It is not a simulator.  
It is not an ontology.  
It is not an AI system.

RCF subjects evolving states to pressure from constraints and observes
which states **survive**, which survive with **irreversible damage**, and which **collapse**.

---

## Core Idea

Traditional fuzzers search for crashes.

RCF searches for **collapse boundaries**.

Instead of asking:
> “Does this input break the program?”

RCF asks:
> “Under what conditions does this state stop being admissible?”

---

## Fundamental Properties

- **Admissibility over correctness**  
  States are admissible or inadmissible — never correct or incorrect.

- **Irreversibility**  
  Constraint violations leave permanent scars.
  There is no rollback. History is binding.

- **Path dependence**  
  Identical states with different trajectories are not equivalent.

- **Entropy as pressure**  
  Entropy is injected, accumulates, and biases future survival.

- **Constraint backreaction**  
  Constraints are not passive.
  Under stress, they harden, fracture, or fail.

---

## What RCF Is Used For

RCF is designed to explore:

- survivability under competing constraints
- emergent law discovery
- collapse thresholds and phase transitions
- adversarial and safety-critical environments

Applicable domains include:
- governance and policy stress-testing
- complex adaptive systems
- safety and alignment research
- game rules, economies, and protocols
- philosophical and physical law analogues

---

## What RCF Is Not

RCF is **not**:
- a machine learning framework
- a prediction engine
- a probabilistic simulator
- a claim about how reality fundamentally works

RCF makes no metaphysical claims.
It is an **instrument for pressure-testing systems under law**.

---

## Repository Structure

### Core Documentation
- **`RCF_Minimal_Law_Calculus.md`**  
  The formal axioms and laws that define RCF behavior.

- **`RCF_Applied_Layer.md`**  
  Practical applications for autonomous systems and constraint-preserving stabilization.

- **`RCF_Law_Extraction.md`**  
  Techniques for extracting emergent constraints from fuzzing results.

### Reference Implementation
- **`RCF.py`**  
  Complete, self-contained reference implementation.  
  Use this to understand how RCF works.  
  Run it directly: `python RCF.py --dims 3 --frames 200`

### Modular Library
- **`implementations/python/rcf/`**  
  Installable Python package for building RCF into your own projects.  
  Extract the core components without the visualization and tooling overhead.

---

## Getting Started

### Run the Reference Implementation

```bash
python RCF.py --dims 3 --frames 200
```

This runs a complete simulation with visualization and JSON export.

### Use RCF as a Library

```bash
cd implementations/python
pip install -e .
```

Then in your code:

```python
from rcf.core import State, Constraint, Engine

# Define your constraints
c = Constraint("unit_sphere", lambda s: (s.vec**2).sum() <= 1.0)

# Create engine and state
engine = Engine([c], seed=42)
state = State([0.0, 0.0, 0.0])

# Run simulation
for _ in range(1000):
    ok, hit = engine.step(state)
    if not ok:
        print(f"Collapsed: {hit}")
        break
```

### Choose Your Approach

- **Want to understand RCF?** → Read `RCF_Minimal_Law_Calculus.md` then run `RCF.py`
- **Want to experiment?** → Modify and run `RCF.py` directly
- **Want to build with RCF?** → Install `implementations/python/rcf/` as a library
- **Want to apply RCF?** → Read `RCF_Applied_Layer.md` for domain-specific guidance

---

## Design Philosophy

RCF does not optimize for comfort.

If the system under test becomes harder to reason about over time,
that is evidence of **real constraint pressure**, not a flaw.

---

## License

RCF is released under a permissive open license.
Use it, fork it, break it.