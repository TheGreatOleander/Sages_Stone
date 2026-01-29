# Build Your First Constraint Tournament
## A Hands-On Guide to the Reality Constraint Fuzzer

*Want to test which laws survive pressure? This tutorial walks you through creating your first constraint tournament in 30 minutes.*

---

## What You'll Build

By the end of this tutorial, you'll have:
- A working 3D constraint tournament
- Custom constraints of your own design
- Visualization of collapse dynamics
- Understanding of survival-based epistemology in practice

**Prerequisites:** Basic Python knowledge, 30 minutes

---

## Part 1: Setup (5 minutes)

### Install Dependencies

```bash
pip install numpy matplotlib
```

### Download RCF

```bash
git clone https://github.com/[your-repo]/RCF
cd RCF
```

### Verify Installation

```bash
python Reality_Constraint_Fuzzer.py
```

You should see:
```
============================================================
Reality Constraint Fuzzer (Polyform Engine)
============================================================
```

If it runs and shows visualizations, you're ready.

---

## Part 2: Understanding the Basics (5 minutes)

### What's a State?

A **state** is where your system is right now:

```python
state = State(
    vector=[1.2, 0.8, 1.5],  # 3D position
    intent=0.0,               # accumulated pressure
    memory=0.0                # violation history
)
```

Think of it as a particle in 3D space, but with extra dimensions (intent, memory) that track stress.

### What's a Constraint?

A **constraint** is a rule the state must follow:

```python
constraint = Constraint(
    name="StaySmall",
    func=lambda x: abs(x) < 3.0,  # magnitude must be < 3
    persona="Judge"
)
```

The `func` returns `True` if the rule is satisfied, `False` if violated.

### What Happens During a Tournament?

1. State evolves over 200 "volleys" (time steps)
2. Each volley applies pressure (noise, drift, resonance)
3. After each volley, check if constraints are violated
4. If violated → collapse (system fails)
5. If it survives all 200 volleys → survivor (robust law)

---

## Part 3: Your First Custom Constraint (5 minutes)

Let's create a constraint that says "magnitude must stay between 1 and 4":

```python
from Reality_Constraint_Fuzzer import *

# Define your constraint
my_constraint = Constraint(
    name="Goldilocks",
    func=lambda x: 1.0 < abs(x) < 4.0,  # not too small, not too big
    persona="Guardian"
)

# Create a simulation with just your constraint
sim = SimulationND(
    dimensions=3,
    constraints=[my_constraint],
    limit=5.0,
    frames=200
)

# Run it!
sim.run()
```

Run this and watch what happens. Does your constraint survive 200 volleys?

**Pro tip:** Try changing the bounds (e.g., `0.5 < abs(x) < 2.0`) and see how survival time changes.

---

## Part 4: Constraint Tournament (10 minutes)

Now let's make constraints compete. Which is more robust?

```python
constraints = [
    # Constraint A: Wide bounds
    Constraint("WideBounds", lambda x: 0.1 < abs(x) < 5.0, "Judge"),
    
    # Constraint B: Narrow bounds  
    Constraint("NarrowBounds", lambda x: 1.0 < abs(x) < 3.0, "Trickster"),
    
    # Constraint C: Avoid integers
    Constraint("AntiInteger", lambda x: abs(x - round(x)) > 0.1, "Guardian"),
    
    # Constraint D: Stay near 2.0
    Constraint("StayNear2", lambda x: 1.5 < abs(x) < 2.5, "Judge")
]

# Run 4 separate tournaments
for i, c in enumerate(constraints):
    print(f"\n{'='*60}")
    print(f"Testing: {c.name}")
    print('='*60)
    
    sim = SimulationND(dimensions=3, constraints=[c], limit=5.0, frames=200)
    sim.run()
```

**Question:** Which constraint survived longest? Why?

**Expected result:**
- WideBounds: Survives (200 volleys)
- NarrowBounds: Maybe survives, maybe crystallizes
- AntiInteger: Probably crystallizes around volley 100-150
- StayNear2: Collapses early (too restrictive)

**Lesson:** Tighter constraints fail faster. Robustness requires flexibility.

---

## Part 5: Combine Constraints (5 minutes)

What if a system must satisfy *multiple* constraints simultaneously?

```python
# Must satisfy ALL of these
combined_constraints = [
    Constraint("HardBounds", lambda x: 0.1 < abs(x) < 5.0, "Judge"),
    Constraint("AntiInteger", lambda x: abs(x - round(x)) > 0.05, "Trickster")
]

sim = SimulationND(
    dimensions=3,
    constraints=combined_constraints,  # Both must be satisfied
    limit=5.0,
    frames=200
)

sim.run()
```

**Question:** Does the system survive as long as with just one constraint?

**Expected result:** No. More constraints = harder to survive. The system must navigate a smaller "allowed region" of state space.

**Lesson:** Fundamental laws are minimal. Too many constraints → brittleness.

---

## Part 6: Interpret the Visualizations

When you run a simulation, you get three plots:

### Plot 1: Magnitude/Intent/Memory Timeline

- **Magnitude** (blue): Distance from origin. Spiky = entropy storms hitting.
- **Intent** (orange): Accumulated directional pressure. Grows over time.
- **Memory** (green): Constraint violation history. Staircase = violations accumulating.

**What to look for:**
- Sudden magnitude drop → anchor function triggered (volley > 30)
- Intent spikes → resonance amplification
- Memory jumps → violations occurring

### Plot 2: Collapse Cartography

X-axis = Intent, Y-axis = Memory, Color = Magnitude

This shows the **phase space trajectory**. Bright spots = high magnitude. Dark regions = forbidden territories (never visited before collapse).

**What to look for:**
- Does trajectory stay in one region (stable) or wander (unstable)?
- Are there "walls" where the system can't go?
- Does collapse happen at boundary (collision) or center (crystallization)?

### Plot 3: Apple Mesh

If the system survives, it generates a 3D "apple" shape from the final state.

This is symbolic—showing that form emerges from constraint-tested geometry.

---

## Part 7: Design Your Own Experiment

Now you understand the basics. Try these experiments:

### Experiment 1: Test Symmetry
```python
Constraint("Symmetry", lambda x: abs(x - 2.0) < 0.5 or abs(x - 3.0) < 0.5, "Guardian")
```
Does it survive? Why or why not?

### Experiment 2: Adaptive Constraints
```python
Constraint("Adaptive", lambda x: 0.5 < abs(x) < 4.0, "Judge", adaptive=True)
```
The `adaptive=True` flag means the constraint *changes* after repeated violations. Does this help it survive longer?

### Experiment 3: Higher Dimensions
```python
sim = SimulationND(dimensions=7, constraints=[...], frames=200)
```
Do constraints that survive in 3D also survive in 7D? This tests dimensional persistence.

### Experiment 4: Longer Runs
```python
sim = SimulationND(dimensions=3, constraints=[...], frames=500)
```
Does doubling the volleys change which constraints survive? Or do they all eventually collapse?

---

## Part 8: Understanding Collapse Modes

When a system fails, it fails in specific ways. Here's what each means:

### Code -1: Collision
```
[!] Terminated at volley 42: Collision → The Stern Judge: 'Order must be kept.'
```

**What happened:** Magnitude violated hard bounds (too big or too small).

**Why:** Pressure accumulated faster than state could dissipate.

**Lesson:** Hard boundaries eventually get hit if pressure is sustained.

### Code -2: Crystallization
```
[!] Terminated at volley 127: Crystallization → 'The familiar became brittle.'
```

**What happened:** System got stuck visiting the same state region repeatedly (fatigue > 5).

**Why:** Not enough flexibility to explore new regions under pressure.

**Lesson:** Overly restrictive constraints cause repetitive behavior.

### Code -3: Global Collapse
```
[!] Terminated at volley 183: Global Collapse → 'The envelope shrank to silence.'
```

**What happened:** The "allowed region" contracted to zero as global stress accumulated.

**Why:** Every volley adds stress. Eventually, no state is allowed.

**Lesson:** All systems with memory + contraction eventually collapse (Irreversibility Theorem).

---

## Part 9: Extract the Irreducible Law Kernel (Advanced)

Once you've run multiple tournaments, you want to know: **What's the minimal constraint set that explains all survivors?**

This is the **Irreducible Law Kernel (ILK)**.

```python
# Run multiple constraints
results = {}

for c in constraints:
    sim = SimulationND(dimensions=3, constraints=[c], limit=5.0, frames=200)
    sim.run()
    
    # Did it survive?
    results[c.name] = len(sim.survivors) > 0

# Which survived?
survivors = [name for name, survived in results.items() if survived]

print("\nSurvivors:", survivors)
print("ILK = minimal set explaining all survivals")
```

**Manual ILK extraction:**
1. List all survivors
2. Find smallest subset that "covers" all observed behaviors
3. That's your ILK

**Example:**
- If `WideBounds` and `Symmetry` both survive, but removing either causes collapse → ILK = {WideBounds, Symmetry}
- If removing `Symmetry` doesn't change anything → ILK = {WideBounds} (Symmetry is redundant)

---

## Part 10: Next Steps

You now understand:
- How to create constraints
- How to run tournaments
- How to interpret collapse modes
- How to think about survival-based epistemology

**Go deeper:**

1. **Read the paper:** See `RCF-Law_Extraction.md` for the full theoretical framework
2. **Try the React interface:** Interactive web visualization (no coding required)
3. **Design novel constraints:** What rules might govern a different physics?
4. **Test dimensional persistence:** Do your constraints survive in 5D? 7D? 10D?
5. **Implement new spike functions:** Create custom pressure operators

**Share your results:**
- Twitter: Tag with #RCF and #ConstraintTournament
- GitHub: Open issues with interesting findings
- Reddit: Post to r/compsci or r/philosophy

---

## Common Questions

**Q: Why does my constraint always collapse around volley 150?**

A: That's when global stress typically exhausts the envelope. Try increasing `limit` (e.g., `limit=10.0`) or reducing global stress accumulation.

**Q: What if I want constraints that depend on *multiple* dimensions, not just magnitude?**

A: Modify the `check` function to accept the full state vector:
```python
Constraint("Custom", lambda s: s.vector[0] < 2*s.vector[1], "Judge")
```
(This requires modifying the tension function—see advanced docs)

**Q: Can I visualize the constraint competition in real-time?**

A: Yes! Use the React/TypeScript interface (`rcf_explorer.tsx`) which shows live updates.

**Q: How do I make constraints evolve during the simulation?**

A: Set `adaptive=True` and the constraint will modify its `check` function after repeated violations. See `Constraint.adapt()` method.

**Q: What's the point of "personas" (Judge, Trickster, Guardian)?**

A: Purely narrative. They give constraints "voices" when violations occur. It's philosophical flavoring, not functional.

---

## Conclusion

You've built your first constraint tournament. You've seen how survival pressure reveals which rules are robust and which are brittle.

This is **survival-based epistemology** in action: laws emerge from what doesn't collapse, not from what we assume.

**Remember the principle:**

> *"A law is not true because it is elegant. It is elegant because it survived."*

Now go test some constraints. See what survives.

---

**Resources:**
- GitHub: [repo link]
- Full docs: `README.md`
- Theory: `RCF-Law_Extraction.md`
- Paper: [academic paper link]
- Community: [Discord/Reddit link]

**Support:** If this tutorial helped, consider [buying me a coffee](https://buymeacoffee.com/TheGreatOleander) ☕
