# 🔥 CRUCIBLE SDK - QUICK REFERENCE CARD

**The complete cheat sheet for constraint testing and fundamental law discovery.**

---

## 📦 INSTALLATION

```bash
# Clone and install
git clone <repo>
cd Crucible_SDK
bash install_crucible.sh

# Or manual install
npm install
pip install -e integration/python
```

---

## ⚡ 30-SECOND QUICK START

### JavaScript
```javascript
import { Crucible, Constraint, StateGenerator } from './src/crucible-sdk.js';

const crucible = new Crucible();
const myLaw = new Constraint('MyLaw', (state) => state[0] > 0);
const states = StateGenerator.random(50);

const result = await crucible.test(myLaw, states);
console.log(result.isFundamental()); // true/false
```

### Python
```python
from crucible_python import Crucible, Constraint, StateGenerator

crucible = Crucible()
my_law = Constraint('MyLaw', lambda s: s[0] > 0)
states = StateGenerator.random(50)

result = crucible.test(my_law, states)
print(result.is_fundamental())  # True/False
```

---

## 🎯 CORE API

### Create Constraint
```javascript
const constraint = new Constraint(
    'EnergyConservation',              // Name
    (state) => Math.abs(E(state) - 1.0) < 0.1,  // Test function
    { domain: 'physics' }              // Options
);
```

### Generate States
```javascript
// Random
const states = StateGenerator.random(50, {
    dimensions: 6,
    min: -5,
    max: 5,
    distribution: 'normal'  // 'uniform', 'normal', 'exponential'
});

// Trajectory
const states = StateGenerator.trajectory(
    (state, t) => state.map(x => x * 0.95),  // Evolution function
    [1, 0, 0, 0, 0, 0],  // Initial state
    100  // Steps
);

// From data
const states = StateGenerator.fromData(
    myData,
    (point) => [point.x, point.y, point.z]  // Transform
);
```

### Test Constraint
```javascript
const crucible = new Crucible();
const result = await crucible.test(constraint, states, {
    onProgress: (prog) => console.log(prog.phase, prog.progress),
    skipDimensional: false,
    skipAdversarial: false,
    skipLenses: ['quantum']  // Optional: skip specific lenses
});
```

### Check Results
```javascript
result.isFundamental()     // -> true/false
result.isEmergent()        // -> true/false
result.classification      // -> 'FUNDAMENTAL', 'EMERGENT', 'NON-FUNDAMENTAL'
result.consensusScore      // -> 0-100
result.minDimension        // -> 0-6 or null
result.predictions         // -> Array of predictions
result.getSummary()        // -> One-line summary
```

---

## 🔬 ANALYTICAL LENSES

All 6 lenses run automatically. Access results:

```javascript
result.lensResults.information     // Entropy, compression
result.lensResults.thermodynamic   // Free energy, stability
result.lensResults.gameTheoretic   // Nash equilibria
result.lensResults.quantum         // Coherence, fidelity
result.lensResults.network         // Connectivity, clustering
result.lensResults.category        // Structure preservation
```

Each lens returns:
- Numerical metrics
- `verdict` field with interpretation

---

## 📐 DIMENSIONAL TESTING

```javascript
// Automatic in test()
result.dimensionalResults  // -> { 6: 0.95, 5: 0.90, ..., 0: 0.60 }

// Manual dimensional engine
import { DimensionalEngine } from './src/crucible-sdk.js';
const dimEngine = new DimensionalEngine({ maxDimension: 6 });
const dimResults = await dimEngine.sweep(constraint, states);
```

**Interpretation**:
- **Survives to 0D (>50%)** = FUNDAMENTAL
- **Fails at Dimension N** = Requires ≥N+1 dimensions
- **Fails at 6D** = NON-FUNDAMENTAL

---

## ⚔️ ADVERSARIAL TESTING

```javascript
// Automatic in test()
result.adversarialResults  // -> { wins, losses, survivalRate, verdict }

// Manual adversarial engine
import { AdversarialEngine } from './src/crucible-sdk.js';
const adversary = new AdversarialEngine({ rounds: 20 });
const battleResults = adversary.battle(constraint, states);
```

---

## 📊 BATCH TESTING

```javascript
// Test multiple constraints
const results = await crucible.testBatch([c1, c2, c3], states);

// Compare and analyze
const comparison = await crucible.compare([c1, c2, c3], states);
comparison.getFundamental()     // -> Fundamental constraints
comparison.getEmergent()        // -> Emergent constraints
comparison.rankByConsensus()    // -> Sorted by score
comparison.findContradictions() // -> Where lenses disagree
comparison.generateReport()     // -> Text report
```

---

## 🎨 PRESETS

```javascript
import { Presets } from './src/crucible-sdk.js';

// Physics
Presets.Physics.energyConservation
Presets.Physics.momentumConservation
Presets.Physics.positivity

// Mathematics
Presets.Mathematics.hardBounds
Presets.Mathematics.monotonicity
Presets.Mathematics.symmetry

// Economics
Presets.Economics.equilibrium
Presets.Economics.scarcity

// All presets
const all = Presets.getAll();
```

---

## 💾 EXPORT

```javascript
import { Export } from './src/crucible-sdk.js';

// JSON
Export.toJSON(result, 'results.json');

// CSV (batch results)
Export.toCSV([result1, result2], 'comparison.csv');

// Markdown report
const markdown = Export.toMarkdown(result);
console.log(markdown);
```

---

## 🔗 RCF INTEGRATION

### Use RCF Constraints with Crucible

```javascript
import { RCFConstraintAdapter, UnifiedRCFEngine } from './integration/rcf/rcf_adapter.js';

// Convert RCF to Crucible
const rcfConstraint = { name: 'Law', score_fn: ..., weight: 1.0 };
const crucibleConstraint = RCFConstraintAdapter.toCrucible(rcfConstraint);

// Or use unified engine (runs BOTH)
const engine = new UnifiedRCFEngine({ rcfMode: 'hybrid' });
const result = await engine.test(rcfConstraint, states);

console.log('Crucible:', result.classification);
console.log('RCF:', result.rcf.collapsed ? 'COLLAPSED' : 'SURVIVED');
console.log('Agreement:', result.unified.consistencyCheck.agree);
```

### Import RCF Results

```javascript
import { importRCFArchaeology } from './integration/rcf/rcf_adapter.js';

const rcfResults = { fundamental_laws: [...], emergent_laws: [...] };
const crucibleFormat = importRCFArchaeology(rcfResults);
```

---

## 🐍 PYTHON BRIDGE

```python
from crucible_python import Crucible, Constraint, StateGenerator

# Create constraint
constraint = Constraint('MyLaw', lambda s: s[0] > 0)

# Generate states
states = StateGenerator.random(50, dimensions=6)

# Test
crucible = Crucible()  # Can use mode='subprocess' or mode='http'
result = crucible.test(constraint, states)

# Results
print(result.classification)
print(result.is_fundamental())
print(result.get_summary())
```

### Convert RCF to Crucible (Python)

```python
from crucible_python import RCFIntegration

rcf_constraint = {'name': 'Law', 'score_fn': lambda s: ..., 'weight': 1.0}
crucible_constraint = RCFIntegration.rcf_to_crucible_constraint(rcf_constraint)
```

---

## 🖥️ CLI USAGE

```bash
# Test a constraint
./ui/cli/crucible-cli.js test myConstraint.js states.json

# Test preset
./ui/cli/crucible-cli.js preset energyConservation

# Run examples
node examples/crucible-examples.js

# Run tests
node tests/comprehensive-test.js

# Start web UI
cd ui/web && node server.js
# Open http://localhost:3000
```

---

## 🎓 COMMON PATTERNS

### Pattern 1: Validate Hypothesis

```javascript
const hypothesis = new Constraint('MyTheory', (s) => /* your theory */);
const experimentalData = loadData();
const states = StateGenerator.fromData(experimentalData, transform);

const result = await crucible.test(hypothesis, states);

if (result.isFundamental()) {
    console.log('Theory is fundamental!');
    console.log('Predictions:', result.predictions);
    publishPaper(result);
}
```

### Pattern 2: Find Universal Patterns

```javascript
const pattern = new Constraint('PowerLaw', checkPowerLaw);

const domains = {
    physics: loadPhysicsData(),
    economics: loadEconomicsData(),
    biology: loadBiologyData()
};

for (const [domain, data] of Object.entries(domains)) {
    const states = StateGenerator.fromData(data, transform);
    const result = await crucible.test(pattern, states);
    console.log(`${domain}: ${result.classification}`);
}
```

### Pattern 3: Progressive Refinement

```javascript
let hypothesis = new Constraint('v1', (s) => /* coarse test */);

for (let iteration = 0; iteration < 5; iteration++) {
    const result = await crucible.test(hypothesis, states);
    
    if (result.consensusScore > 90) break;  // Good enough
    
    // Refine hypothesis based on failures
    hypothesis = refineHypothesis(hypothesis, result);
}
```

### Pattern 4: System Validation

```javascript
const requirements = [
    new Constraint('NoDeadlocks', checkDeadlock),
    new Constraint('BoundedMemory', checkMemory),
    new Constraint('FastResponse', checkLatency)
];

const systemTraces = captureTraces();
const states = StateGenerator.fromData(systemTraces, toState);

const results = await crucible.testBatch(requirements, states);
const failures = results.filter(r => !r.isFundamental());

if (failures.length > 0) {
    console.error('System violations:', failures.map(r => r.constraint.name));
}
```

---

## 🐛 DEBUGGING

### Enable Verbose Output

```javascript
const crucible = new Crucible();
const result = await crucible.test(constraint, states, {
    onProgress: (prog) => {
        console.log(`[${prog.phase}] ${prog.progress}% ${prog.detail || ''}`);
    }
});
```

### Check Individual Lenses

```javascript
import { InformationLens, ThermodynamicLens } from './src/crucible-sdk.js';

const infoLens = new InformationLens();
const infoResults = infoLens.analyze(states);
console.log('Information:', infoResults);

const thermoLens = new ThermodynamicLens();
const thermoResults = thermoLens.analyze(states);
console.log('Thermodynamic:', thermoResults);
```

### Test State Generation

```javascript
const states = StateGenerator.random(10);
console.log('Generated states:', states);

// Verify constraints work
const passes = states.filter(s => constraint.test(s));
console.log(`${passes.length}/${states.length} states pass constraint`);
```

---

## ⚠️ COMMON PITFALLS

### ❌ Don't: Exact equality in constraints
```javascript
// BAD
const bad = new Constraint('Bad', (s) => s[0] === 1.0);
```

### ✅ Do: Use tolerance
```javascript
// GOOD
const good = new Constraint('Good', (s) => Math.abs(s[0] - 1.0) < 0.01);
```

### ❌ Don't: Assume constraint always works
```javascript
// BAD
const bad = new Constraint('Bad', (s) => s.customProperty.value);
```

### ✅ Do: Add error handling
```javascript
// GOOD
const good = new Constraint('Good', (s) => {
    try {
        return s.customProperty?.value > 0;
    } catch {
        return false;
    }
});
```

---

## 🎯 CLASSIFICATION GUIDE

| Result | Meaning | Action |
|--------|---------|--------|
| **FUNDAMENTAL** | Survives to 0D | Cannot be derived. Truly axiomatic. |
| **EMERGENT** | Requires dimension N | Derivative of simpler laws. Investigate dimension N. |
| **NON-FUNDAMENTAL** | Fails testing | Conventional rule, not universal. |

### Consensus Score Guide

- **90-100**: Very strong, publish-worthy
- **70-89**: Good, investigate further
- **50-69**: Mixed signals, refine hypothesis
- **<50**: Likely not fundamental

---

## 📚 RESOURCES

- **Full Docs**: `docs/CRUCIBLE-SDK-DOCS.md`
- **Integration**: `docs/INTEGRATION_GUIDE.md`
- **Examples**: `examples/crucible-examples.js`
- **Tests**: `tests/comprehensive-test.js`
- **Source**: `src/crucible-sdk.js`

---

## 🆘 GETTING HELP

```javascript
// Check SDK version
console.log('Crucible SDK v2.0.0');

// Run diagnostics
node tests/comprehensive-test.js

// Try examples
node examples/crucible-examples.js

// Read full docs
cat docs/CRUCIBLE-SDK-DOCS.md
```

---

## 🔥 ONE-LINERS

```javascript
// Quick test
new Crucible().test(new Constraint('L', s=>s[0]>0), StateGenerator.random(50))

// Preset test
new Crucible().test(Presets.Physics.energyConservation, StateGenerator.random(50))

// Batch test all presets
new Crucible().testBatch(Presets.getAll(), StateGenerator.random(50))

// Export result
Export.toJSON(result, 'out.json')
```

---

**Remember**: The Crucible doesn't just test—it discovers what's truly fundamental. 🔥

**Print this. Pin it. Push reality to its limits.**
