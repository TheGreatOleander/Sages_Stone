# The Crucible SDK v2.0 - Complete Documentation

## 📦 Installation & Setup

### Browser (ES Modules)
```html
<script type="module">
  import { Crucible, Constraint, Presets } from './crucible-sdk.js';
  // Your code here
</script>
```

### Node.js
```javascript
import { Crucible, Constraint, StateGenerator } from './crucible-sdk.js';
// or
const { Crucible, Constraint } = require('./crucible-sdk.js');
```

---

## 🚀 Quick Start (5 Minutes)

### Example 1: Test a Simple Constraint

```javascript
import { Crucible, Constraint, StateGenerator } from './crucible-sdk.js';

// 1. Create a constraint
const energyConservation = new Constraint(
  'Energy Conservation',
  (state) => {
    const energy = Math.sqrt(state.reduce((s, x) => s + x*x, 0));
    return Math.abs(energy - 1.0) < 0.1;
  },
  { domain: 'physics' }
);

// 2. Generate test states
const states = StateGenerator.random(50, { dimensions: 6 });

// 3. Create crucible and test
const crucible = new Crucible();
const results = await crucible.test(energyConservation, states, {
  onProgress: (prog) => console.log(`${prog.phase}: ${prog.progress}%`)
});

// 4. Check results
console.log(results.classification);     // 'FUNDAMENTAL', 'EMERGENT', or 'NON-FUNDAMENTAL'
console.log(results.consensusScore);     // 0-100
console.log(results.isFundamental());    // true/false
console.log(results.predictions);        // Array of predictions
```

### Example 2: Use Preset Constraints

```javascript
import { Crucible, Presets, StateGenerator } from './crucible-sdk.js';

const states = StateGenerator.random(50);
const crucible = new Crucible();

// Test a preset
const result = await crucible.test(
  Presets.Physics.energyConservation,
  states
);

console.log(result.getSummary());
// "Energy Conservation: FUNDAMENTAL (Consensus: 95%)"
```

### Example 3: Compare Multiple Constraints

```javascript
import { Crucible, Presets, StateGenerator } from './crucible-sdk.js';

const states = StateGenerator.random(50);
const crucible = new Crucible();

// Test multiple constraints
const comparison = await crucible.compare([
  Presets.Physics.energyConservation,
  Presets.Mathematics.hardBounds,
  Presets.Economics.equilibrium
], states);

console.log(comparison.generateReport());
// Prints detailed comparison report

const fundamental = comparison.getFundamental();
console.log(`Found ${fundamental.length} fundamental laws`);
```

---

## 📚 Core Concepts

### Constraint

A **Constraint** is a testable rule/law/property. It has:
- **Name**: Human-readable identifier
- **Check Function**: `(state) => boolean` test
- **Domain**: Category (physics, math, economics, etc.)
- **Metadata**: Additional information

```javascript
const myConstraint = new Constraint(
  'PositivityLaw',
  (state) => state.every(x => x > 0),
  {
    domain: 'mathematics',
    description: 'All values must be positive',
    metadata: { author: 'Me', version: 1 }
  }
);
```

### State

A **State** represents a point in your system. It can be:
- A number: `42`
- An array: `[1, 2, 3, 4, 5, 6]`
- An object: `{ energy: 1.0, momentum: 0 }`

The SDK normalizes these internally.

### Classification

After testing, constraints are classified as:

- **⭐ FUNDAMENTAL**: Survives projection to 0D (pure existence)
  - Cannot be derived from other laws
  - Truly axiomatic
  - Example: Energy conservation

- **◯ EMERGENT**: Requires specific dimensionality
  - Derivative of more fundamental laws
  - Needs geometric structure
  - Example: Rotation (requires ≥2D)

- **✗ NON-FUNDAMENTAL**: Fails under pressure
  - Conventional or domain-specific
  - Not universal
  - Example: Arbitrary speed limits

---

## 🎯 API Reference

### Class: `Crucible`

Main orchestrator for constraint testing.

#### Constructor

```javascript
const crucible = new Crucible(options);
```

**Options:**
```javascript
{
  dimensional: {
    maxDimension: 6,           // Highest dimension to test
    trialsPerDimension: 10,    // Trials at each dimension
    stepsPerTrial: 50,         // Steps per trial
    pressure: 0.15             // Base pressure level (0-1)
  },
  adversarial: {
    rounds: 10,                // Battle test rounds
    attackStrength: 1.0        // Perturbation strength
  },
  temperature: 1.0             // Thermodynamic temperature
}
```

#### Methods

##### `test(constraint, states, options)`

Test a single constraint.

```javascript
const result = await crucible.test(constraint, states, {
  onProgress: (progress) => {
    console.log(progress.phase, progress.progress);
  },
  skipDimensional: false,      // Skip dimensional testing
  skipAdversarial: false,      // Skip adversarial testing
  skipLenses: ['quantum']      // Skip specific lenses
});
```

**Returns:** `CrucibleResult`

##### `testBatch(constraints, states, onProgress)`

Test multiple constraints.

```javascript
const results = await crucible.testBatch(
  [constraint1, constraint2, constraint3],
  states,
  (progress) => console.log(progress.overall)
);
```

**Returns:** `Array<CrucibleResult>`

##### `compare(constraints, states)`

Compare multiple constraints and find relationships.

```javascript
const comparison = await crucible.compare(constraints, states);
console.log(comparison.generateReport());
```

**Returns:** `ComparisonResult`

---

### Class: `Constraint`

Represents a testable constraint.

#### Constructor

```javascript
const constraint = new Constraint(name, checkFunction, options);
```

#### Methods

##### `test(state)`

Test constraint against a state.

```javascript
const satisfied = constraint.test([1, 2, 3]);
```

##### `isFundamental()`

Check if constraint is fundamental.

```javascript
if (constraint.isFundamental()) {
  console.log('This is a fundamental law!');
}
```

##### `isEmergent()`

Check if constraint is emergent.

```javascript
if (constraint.isEmergent()) {
  const minDim = constraint.getMinDimension();
  console.log(`Emerges at ${minDim}D`);
}
```

##### `getMinDimension()`

Get minimum dimension required.

```javascript
const minDim = constraint.getMinDimension();
// Returns: 0, 1, 2, 3, 4, 5, 6, or null
```

##### `toJSON()`

Export constraint data.

```javascript
const data = constraint.toJSON();
console.log(data.classification); // 'FUNDAMENTAL', 'EMERGENT', etc.
```

---

### Class: `StateGenerator`

Generate test states.

#### Static Methods

##### `random(count, options)`

Generate random states.

```javascript
const states = StateGenerator.random(50, {
  dimensions: 6,
  min: -5,
  max: 5,
  distribution: 'uniform'  // 'uniform', 'normal', 'exponential'
});
```

##### `trajectory(evolutionFn, initialState, steps)`

Generate states from evolution function.

```javascript
const states = StateGenerator.trajectory(
  (prevState, t) => prevState.map(x => x * 0.95 + Math.sin(t * 0.1)),
  [1, 0, 0, 0, 0, 0],
  100
);
```

##### `fromData(data, transformer)`

Generate states from real data.

```javascript
const states = StateGenerator.fromData(
  realWorldData,
  (dataPoint) => [dataPoint.x, dataPoint.y, dataPoint.z]
);
```

---

### Class: `CrucibleResult`

Contains test results for a constraint.

#### Properties

- `constraint` - The tested constraint
- `classification` - 'FUNDAMENTAL', 'EMERGENT', or 'NON-FUNDAMENTAL'
- `consensusScore` - Score 0-100
- `minDimension` - Minimum dimension required (or null)
- `lensResults` - Results from all 6 lenses
- `dimensionalResults` - Survival rate per dimension
- `adversarialResults` - Battle test results
- `predictions` - Array of falsifiable predictions

#### Methods

##### `isFundamental()`

```javascript
if (result.isFundamental()) {
  console.log('Fundamental law discovered!');
}
```

##### `isEmergent()`

```javascript
if (result.isEmergent()) {
  console.log(`Emergent at ${result.minDimension}D`);
}
```

##### `getSummary()`

Get one-line summary.

```javascript
console.log(result.getSummary());
// "Energy Conservation: FUNDAMENTAL (Consensus: 95%)"
```

##### `toJSON()`

Export full results.

```javascript
const json = result.toJSON();
// Save to file, send to API, etc.
```

---

### Class: `ComparisonResult`

Results from comparing multiple constraints.

#### Methods

##### `getFundamental()`

Get all fundamental constraints.

```javascript
const fundamental = comparison.getFundamental();
console.log(`Found ${fundamental.length} fundamental laws`);
```

##### `getEmergent()`

Get all emergent constraints.

```javascript
const emergent = comparison.getEmergent();
```

##### `rankByConsensus()`

Rank constraints by consensus score.

```javascript
const ranked = comparison.rankByConsensus();
console.log(`Top law: ${ranked[0].constraint.name}`);
```

##### `findContradictions()`

Find where lenses disagree.

```javascript
const contradictions = comparison.findContradictions();
contradictions.forEach(c => console.log(c.details));
```

##### `generateReport()`

Generate text report.

```javascript
const report = comparison.generateReport();
console.log(report);
```

---

### Namespace: `Presets`

Pre-built constraints for testing.

#### Available Presets

```javascript
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

// Get all
const allPresets = Presets.getAll();
```

---

### Namespace: `Export`

Export utilities.

#### Methods

##### `toJSON(data, filename)`

Export to JSON file.

```javascript
Export.toJSON(result, 'my-results.json');
```

##### `toCSV(results, filename)`

Export results to CSV.

```javascript
Export.toCSV([result1, result2, result3], 'comparison.csv');
```

##### `toMarkdown(result)`

Generate markdown report.

```javascript
const markdown = Export.toMarkdown(result);
console.log(markdown);
```

---

## 🔬 Advanced Usage

### Custom Lenses

Create your own analytical lens:

```javascript
class MyCustomLens {
  constructor() {
    this.name = 'MyLens';
  }

  analyze(states, constraint) {
    // Your analysis logic
    return {
      myMetric: 42,
      verdict: 'Looks good'
    };
  }
}

// Add to crucible
const crucible = new Crucible();
crucible.lenses.myLens = new MyCustomLens();
```

### Custom State Evolution

Test constraints on evolving systems:

```javascript
// Create dynamic system
const states = StateGenerator.trajectory(
  (state, t) => {
    // Apply physics
    const acceleration = -0.1 * state[0]; // Spring force
    return [
      state[0] + state[1] * 0.1,
      state[1] + acceleration * 0.1,
      ...state.slice(2)
    ];
  },
  [1, 0, 0, 0, 0, 0],
  200
);

// Test constraint on trajectory
const result = await crucible.test(myConstraint, states);
```

### Real-World Data Integration

```javascript
// Load your data
const sensorData = await fetch('/api/sensors').then(r => r.json());

// Transform to states
const states = StateGenerator.fromData(
  sensorData,
  (reading) => [
    reading.temperature,
    reading.pressure,
    reading.humidity,
    reading.vibration,
    reading.power,
    reading.flux
  ]
);

// Test your hypothesis
const hypothesis = new Constraint(
  'Temperature-Pressure Coupling',
  (state) => {
    const temp = state[0];
    const pressure = state[1];
    return Math.abs(pressure - temp * 2.5) < 10;
  }
);

const result = await crucible.test(hypothesis, states);
```

### Batch Processing with Progress

```javascript
const allConstraints = [
  ...Presets.Physics,
  ...Presets.Mathematics,
  ...myCustomConstraints
];

const results = await crucible.testBatch(
  allConstraints,
  states,
  (progress) => {
    console.log(`Testing ${progress.constraint}`);
    console.log(`Overall: ${progress.overall.toFixed(1)}%`);
    updateProgressBar(progress.overall);
  }
);

// Find the best ones
const fundamental = results.filter(r => r.isFundamental());
console.log(`Discovered ${fundamental.length} fundamental laws!`);
```

### Dimensional Sweep Only

```javascript
const dimEngine = new DimensionalEngine({
  maxDimension: 6,
  trialsPerDimension: 20,
  pressure: 0.2
});

const dimensionalResults = await dimEngine.sweep(
  constraint,
  states,
  (progress) => console.log(`${progress.dimension}D: ${progress.survival}`)
);

console.log('Survival by dimension:', dimensionalResults);
```

### Adversarial Testing Only

```javascript
const adversary = new AdversarialEngine({
  rounds: 50,
  attackStrength: 2.0
});

const battleResults = adversary.battle(constraint, states);
console.log(`Won ${battleResults.wins} / ${battleResults.rounds}`);
console.log(`Verdict: ${battleResults.verdict}`);
```

---

## 💡 Usage Patterns

### Pattern 1: Scientific Discovery

Test a hypothesis against experimental data:

```javascript
// Your hypothesis
const hypothesis = new Constraint(
  'Dark Matter Distribution',
  (state) => {
    const [x, y, z, mass, velocity, spin] = state;
    const distance = Math.sqrt(x*x + y*y + z*z);
    return mass / (distance * distance) > 0.1;
  },
  { domain: 'astrophysics' }
);

// Your data
const galaxyData = loadGalaxyObservations();
const states = StateGenerator.fromData(galaxyData, transformToState);

// Test
const result = await crucible.test(hypothesis, states);

if (result.isFundamental()) {
  console.log('Hypothesis is fundamental!');
  console.log('Predictions:', result.predictions);
  publishPaper(result);
} else {
  console.log('Back to the drawing board...');
}
```

### Pattern 2: Economics/Market Analysis

Find fundamental market laws:

```javascript
const marketConstraints = [
  new Constraint('Supply-Demand', ...),
  new Constraint('Price-Stability', ...),
  new Constraint('Risk-Return', ...)
];

const marketData = getHistoricalMarketData();
const states = StateGenerator.fromData(marketData, toStateVector);

const comparison = await crucible.compare(marketConstraints, states);
const fundamental = comparison.getFundamental();

console.log('Fundamental economic laws:', fundamental.map(r => r.constraint.name));
```

### Pattern 3: System Validation

Validate that your system obeys required laws:

```javascript
const systemRequirements = [
  new Constraint('No Deadlocks', checkDeadlock),
  new Constraint('Bounded Memory', checkMemory),
  new Constraint('Response Time', checkLatency)
];

const systemTraces = captureSystemTraces();
const states = StateGenerator.fromData(systemTraces, toStateVector);

const results = await crucible.testBatch(systemRequirements, states);

const failures = results.filter(r => !r.isFundamental());
if (failures.length > 0) {
  console.error('System violates:', failures.map(r => r.constraint.name));
} else {
  console.log('✓ All requirements satisfied');
}
```

### Pattern 4: Cross-Domain Discovery

Find patterns that appear across multiple domains:

```javascript
const universalPattern = new Constraint(
  'Power Law Distribution',
  (state) => checkPowerLaw(state),
  { domain: 'universal' }
);

const domains = {
  physics: loadPhysicsData(),
  biology: loadBiologyData(),
  economics: loadEconomicsData(),
  social: loadSocialNetworkData()
};

for (const [domain, data] of Object.entries(domains)) {
  const states = StateGenerator.fromData(data, transform);
  const result = await crucible.test(universalPattern, states);
  
  console.log(`${domain}: ${result.classification}`);
}
```

---

## 🎓 Best Practices

### 1. State Design

**Good:**
```javascript
// Normalized, multi-dimensional
const state = [
  energy / maxEnergy,
  momentum / maxMomentum,
  position / maxDistance,
  time / duration,
  entropy / maxEntropy,
  complexity
];
```

**Bad:**
```javascript
// Unnormalized, single-dimensional
const state = totalEnergy; // Too simple
```

### 2. Constraint Functions

**Good:**
```javascript
const constraint = new Constraint('Conservation', (state) => {
  try {
    const before = state[0];
    const after = state[1];
    return Math.abs(before - after) < TOLERANCE;
  } catch (e) {
    return false; // Fail gracefully
  }
});
```

**Bad:**
```javascript
const constraint = new Constraint('Bad', (state) => {
  return state.energy === 1.0; // Exact equality, will never pass
});
```

### 3. Test State Generation

**Good:**
```javascript
// Diverse, representative sample
const states = [
  ...StateGenerator.random(30, { distribution: 'normal' }),
  ...StateGenerator.random(10, { distribution: 'exponential' }),
  ...StateGenerator.fromData(realData, transform)
];
```

**Bad:**
```javascript
// All identical
const states = Array(50).fill([1, 2, 3, 4, 5, 6]);
```

### 4. Progress Monitoring

```javascript
await crucible.test(constraint, states, {
  onProgress: async (prog) => {
    // Update UI
    updateProgress(prog.progress);
    
    // Log checkpoints
    if (prog.phase === 'dimensional' && prog.detail) {
      console.log(prog.detail);
    }
    
    // Allow UI to update
    await new Promise(resolve => setTimeout(resolve, 10));
  }
});
```

### 5. Error Handling

```javascript
try {
  const result = await crucible.test(constraint, states);
  
  if (result.consensusScore < 50) {
    console.warn('Low consensus - results may be unreliable');
  }
  
  processResults(result);
} catch (error) {
  console.error('Crucible test failed:', error);
  // Fallback logic
}
```

---

## 🐛 Troubleshooting

### Problem: All constraints fail

**Solution:** Your states might be too extreme or your pressure too high.

```javascript
// Reduce pressure
const crucible = new Crucible({
  dimensional: { pressure: 0.05 }
});

// Or normalize states
const states = states.map(s => s.map(x => x / maxValue));
```

### Problem: Inconsistent results

**Solution:** Increase trials for better statistics.

```javascript
const crucible = new Crucible({
  dimensional: {
    trialsPerDimension: 50,  // More trials
    stepsPerTrial: 100       // More steps
  }
});
```

### Problem: Tests too slow

**Solution:** Skip expensive phases or reduce samples.

```javascript
const result = await crucible.test(constraint, states, {
  skipAdversarial: true,
  skipLenses: ['quantum', 'network']
});
```

### Problem: Out of memory

**Solution:** Use fewer states or batch processing.

```javascript
const states = StateGenerator.random(20); // Fewer states

// Or batch
const batches = chunk(allStates, 20);
for (const batch of batches) {
  await crucible.test(constraint, batch);
}
```

---

## 📊 Interpreting Results

### Consensus Score

- **90-100**: Very strong agreement across all methods
- **70-89**: Good agreement, likely correct classification
- **50-69**: Mixed signals, interpret with caution
- **Below 50**: Conflicting evidence, needs more investigation

### Dimensional Survival

```
6D: 100% ├─ Survives in full space
5D:  95% ├─ Robust to reduction
4D:  90% ├─ Still stable
3D:  85% ├─ Weakening
2D:  70% ├─ Struggling
1D:  55% ├─ Barely surviving
0D:  60% └─ FUNDAMENTAL! (>50% at 0D)
```

### Lens Verdicts

- **Information**: High entropy = disorder, Low = order
- **Thermodynamic**: Negative ΔF = stable, Positive = unstable
- **Game Theoretic**: Nash equilibria = stable strategy
- **Quantum**: High fidelity = preserved, Low = decoherent
- **Network**: High density = connected, Low = fragmented
- **Category**: Structure preserved = compositional

---

## 🚀 Examples

See `/examples` folder for complete working examples:

1. `physics-conservation.js` - Test conservation laws
2. `economics-markets.js` - Find market fundamentals
3. `real-data-integration.js` - Use actual sensor data
4. `cross-domain.js` - Find universal patterns
5. `custom-lenses.js` - Build your own analytical lens

---

## 📖 Further Reading

- **Theory**: See `THEORY.md` for mathematical foundations
- **Architecture**: See `ARCHITECTURE.md` for system design
- **Contributing**: See `CONTRIBUTING.md` for development guide

---

## 📄 License

MIT License - Use freely for research, commercial, or personal projects.

---

## 🤝 Support

- Issues: https://github.com/crucible-sdk/issues
- Discussions: https://github.com/crucible-sdk/discussions
- Email: support@crucible-sdk.org

---

**Happy Testing! May you discover fundamental truths.** ⚗️
