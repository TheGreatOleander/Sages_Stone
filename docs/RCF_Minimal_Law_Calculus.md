# RCF — Reality Constraint Fuzzer

*A calculus of admissibility under pressure*

---

## I. First Principles (Axioms)

### Axiom 1 — Admissibility

A state is not true or false. It is **admissible** or **inadmissible** under a set of constraints.

Truth is optional. Law is not.

---

### Axiom 2 — Irreversibility

Once a state violates a constraint, it cannot re-enter the same admissible region unchanged.

Recovery requires **transformation**, not correction.

---

### Axiom 3 — Cost

Every admissible transition has a **cost**.

Zero-cost transitions are unstable and pathological.

---

### Axiom 4 — History Matters

Two identical states with different trajectories are **not equivalent**.

RCF evaluates **paths**, not snapshots.

---

### Axiom 5 — Law Is Not Neutral

Constraints are not passive filters. They accumulate stress, remember violations, and evolve.

---

## II. Core Objects

### 1. State

A state is a carrier of pressure.

```
State S := {
  form        // present configuration
  trajectory  // ordered history of events
  intent      // directional bias (vector)
  entropy     // accumulated pressure
  scars       // irreversible violations
}
```

Scars are permanent. Removing them violates RCF.

---

### 2. Constraint

A constraint is a law, not a rule.

```
Constraint C := {
  name
  domain
  admissibility_fn
  cost_fn
  fracture_limit
  memory
}
```

Constraints remember.

---

### 3. Event

Nothing happens without an event.

```
Event E := {
  source_state
  attempted_transition
  entropy_injection
  timestamp
}
```

RCF does not require time, but history requires order.

---

## III. Laws of Motion

### Law 1 — Sequential Evaluation

Constraints are applied **in order**. Order is non-commutative.

---

### Law 2 — Conditional Survival

Constraint evaluation yields one of three outcomes:

- clean survival
- scarred survival
- rejection

---

### Law 3 — Permanent Scarring

Scars:

- alter future admissibility
- increase entropy
- bias intent
- cannot be removed

---

### Law 4 — Entropy Accumulation

Entropy is pressure, not noise. It accumulates via events and scars and feeds back into constraints.

---

### Law 5 — Constraint Backreaction

If accumulated stress exceeds a constraint’s fracture limit:

```
C → harden | split | fail
```

Law itself may change.

---

## IV. Failure Semantics

RCF does not throw exceptions.

Failure modes:

1. **Rejection** — trajectory terminates
2. **Scarred Survival** — state persists, future space shrinks
3. **Law Fracture** — global system changes

Failure is informative.

---

## V. Canonical Execution Flow

```
S₀ → Event → S₁
S₁ → Constraint₁ → S₁'
S₁' → Constraint₂ → S₁''
...
→ admissible or inadmissible
```

At every step:

- cost accumulates
- entropy increases
- scars persist
- constraints remember

---

## VI. Reference Logic (Pseudo-Implementation)

```
def apply_constraints(state, constraints, event):
    state.entropy += event.entropy_injection

    for C in constraints:
        result = C.evaluate(state)

        if result.rejected:
            state.scars.append(result.scar)
            return Inadmissible(state)

        state = result.state
        state.entropy += result.cost

        if result.scar:
            state.scars.append(result.scar)
            C.memory.record(result.scar)

        if C.memory.stress_exceeded():
            C.mutate()

    return Admissible(state)
```

No rollback. No forgiveness. Only transformation.

---

## VII. Defining Property of RCF

- It resists optimization
- It preserves failure
- It punishes shortcuts
- It makes edge cases permanent

If a system is uncomfortable to debug, it is closer to reality.

---

## Final Statement

**RCF is a calculus of survivability under law.**

Meaning does not compute.

It endures — or it collapses.

