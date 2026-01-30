# Crucible SDK - Integration Guide

## 🌉 Bridging the Worlds

This guide explains how the Crucible SDK integrates with your existing RCF implementations across JavaScript, Python, and other languages.

---

## 📦 What You Have Now

### Files Created:
1. **rcf_adapter.js** - JavaScript bridge to RCF
2. **crucible_python.py** - Python wrapper for SDK
3. **crucible-sdk.js** - Main SDK (already created)

### Integration Architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     CRUCIBLE SDK CORE                       │
│                    (crucible-sdk.js)                        │
│                                                             │
│  • 6 Analytical Lenses                                      │
│  • Dimensional Engine                                       │
│  • Adversarial Testing                                      │
│  • Result Synthesis                                         │
└─────────────────────┬───────────────────────┬───────────────┘
                      │                       │
         ┌────────────┴─────────┐   ┌────────┴─────────────┐
         │                      │   │                      │
         v                      v   v                      v
┌─────────────────┐   ┌─────────────────┐   ┌──────────────────┐
│  RCF Adapter    │   │ Python Wrapper  │   │ Other Languages  │
│ (rcf_adapter.js)│   │(crucible_python)│   │   (future)       │
└────────┬────────┘   └────────┬────────┘   └──────────────────┘
         │                     │
         v                     v
┌─────────────────┐   ┌─────────────────┐
│  Your RCF JS    │   │  Your RCF Py    │
│  Implementation │   │  Implementation │
└─────────────────┘   └─────────────────┘
```

---

## 🔧 Setup Instructions

### 1. Install the Adapters

Create the directory structure:

```bash
cd Crucible_SDK
mkdir -p integration/{rcf,python}

# Place adapters
mv rcf_adapter.js integration/rcf/
mv crucible_python.py integration/python/
```

### 2. Link to Existing RCF Code

Update paths in adapters to point to your RCF implementations:

**In rcf_adapter.js:**
```javascript
// Update this path to your actual RCF location
const RCF_PATH = '../../../Sages_Stone_Core/systems/RCF/RCF.js';
```

**In crucible_python.py:**
```python
# Update these paths
SDK_PATH = "../src/crucible-sdk.js"
RCF_PATH = "../../../Sages_Stone_Core/systems/RCF/implementations/python/rcf"
```

---

## 🚀 Usage Examples

### Example 1: Use Crucible from JavaScript with RCF

```javascript
import { UnifiedRCFEngine } from './integration/rcf/rcf_adapter.js';

// Your existing RCF constraint
const rcfConstraint = {
    name: "HardBounds",
    score_fn: (state) => {
        const inBounds = state.values.every(v => Math.abs(v) < 5);
        return inBounds ? 1.0 : -1.0;
    },
    weight: 1.0
};

// Your existing RCF states
const rcfStates = [
    { id: '1', values: [1, 2, 3, 4, 5], intent: [0, 0, 0, 0, 0], history: [] },
    { id: '2', values: [2, 3, 4, 5, 6], intent: [0, 0, 0, 0, 0], history: [] }
];

// Test using unified engine (runs BOTH RCF and Crucible)
const engine = new UnifiedRCFEngine({ rcfMode: 'hybrid' });
const result = await engine.test(rcfConstraint, rcfStates);

// Results from both methods
console.log('Crucible says:', result.classification);
console.log('RCF says:', result.rcf.collapsed ? 'COLLAPSED' : 'SURVIVED');
console.log('Do they agree?', result.unified.consistencyCheck.agree);
```

### Example 2: Use Crucible from Python

```python
from crucible_python import Crucible, Constraint, StateGenerator

# Create constraint in Python
energy_conservation = Constraint(
    'Energy Conservation',
    lambda state: abs(sum(x**2 for x in state) - 1.0) < 0.3,
    domain='physics'
)

# Generate test states
states = StateGenerator.random(50, dimensions=6)

# Test using Crucible SDK (via JavaScript bridge)
crucible = Crucible()
result = crucible.test(energy_conservation, states)

# Results
print(f"Classification: {result.classification}")
print(f"Is Fundamental: {result.is_fundamental()}")
print(f"Consensus: {result.consensus_score}%")
```

### Example 3: Convert RCF Results to Crucible Format

```javascript
import { importRCFArchaeology } from './integration/rcf/rcf_adapter.js';

// Your RCF archaeology results
const rcfArchaeologyResults = {
    fundamental_laws: [
        { name: 'BoundsLaw', check_function: (s) => ..., lawscore: 0.95 }
    ],
    emergent_laws: [...],
    failed_candidates: [...]
};

// Import into Crucible format
const crucibleFormat = importRCFArchaeology(rcfArchaeologyResults);

console.log('Fundamental laws:', crucibleFormat.fundamental);
console.log('Emergent laws:', crucibleFormat.emergent);
```

### Example 4: Hybrid Testing Suite

```javascript
import { hybridTestSuite } from './integration/rcf/rcf_adapter.js';

// Mix of RCF and Crucible constraints
const constraints = [
    // RCF format
    { name: 'RCF_Bounds', score_fn: (s) => ..., weight: 1.0 },
    
    // Crucible format
    new Constraint('Crucible_Energy', (s) => ...),
];

const states = generateStates();

// Test all with both methods
const results = await hybridTestSuite(constraints, states);

console.log('Summary:', results.summary);
console.log('Conflicts:', results.summary.conflicts);
```

---

## 🔄 Workflow Patterns

### Pattern 1: RCF → Crucible Pipeline

**Use Case**: You have RCF constraints, want Crucible's advanced analysis

```javascript
import { RCFConstraintAdapter, Crucible } from './integration/rcf/rcf_adapter.js';

// 1. Start with RCF constraint
const rcfConstraint = { name: 'MyLaw', score_fn: ..., weight: 1.0 };

// 2. Convert to Crucible
const crucibleConstraint = RCFConstraintAdapter.toCrucible(rcfConstraint);

// 3. Run through Crucible's 6 lenses
const crucible = new Crucible();
const result = await crucible.test(crucibleConstraint, states);

// 4. Get dimensional analysis
console.log('Survives to 0D?', result.isFundamental());
console.log('Minimum dimension:', result.minDimension);
```

### Pattern 2: Crucible → RCF Pipeline

**Use Case**: Use Crucible to find candidates, validate with RCF pressure testing

```javascript
import { Crucible, Presets } from '../src/crucible-sdk.js';
import { RCFConstraintAdapter } from './integration/rcf/rcf_adapter.js';

// 1. Find candidates with Crucible
const crucible = new Crucible();
const candidates = await crucible.testBatch(Presets.getAll(), states);

const fundamentals = candidates.filter(r => r.isFundamental());

// 2. Validate each with RCF
for (const result of fundamentals) {
    const rcfConstraint = RCFConstraintAdapter.toRCF(result.constraint);
    const rcfResult = await runRCFSimulation(rcfConstraint, states);
    
    console.log(`${result.constraint.name}:`);
    console.log(`  Crucible: FUNDAMENTAL`);
    console.log(`  RCF: ${rcfResult.collapsed ? 'FAILED' : 'PASSED'}`);
}
```

### Pattern 3: Python Analysis → JavaScript Visualization

**Use Case**: Run analysis in Python, visualize with JavaScript UI

```python
# analysis.py
from crucible_python import Crucible, Constraint
import json

# Run tests in Python
crucible = Crucible()
results = crucible.test_batch(constraints, states)

# Export for JavaScript
with open('results.json', 'w') as f:
    json.dump([r.__dict__ for r in results], f)
```

```javascript
// visualize.js
import { renderCrucibleUI } from './ui/web/the_crucible.jsx';

// Load Python results
const results = await fetch('results.json').then(r => r.json());

// Render in UI
renderCrucibleUI(results);
```

---

## 🧪 Testing the Integration

### Test 1: Simple Round-Trip

```javascript
import { RCFConstraintAdapter, RCFStateAdapter } from './integration/rcf/rcf_adapter.js';

// Original RCF format
const original = {
    constraint: { name: 'Test', score_fn: (s) => 1.0, weight: 1.0 },
    state: { id: '1', values: [1, 2, 3], intent: [0, 0, 0], history: [] }
};

// Convert to Crucible
const crucibleConstraint = RCFConstraintAdapter.toCrucible(original.constraint);
const crucibleState = RCFStateAdapter.toCrucible(original.state);

// Convert back to RCF
const backToRCF = {
    constraint: RCFConstraintAdapter.toRCF(crucibleConstraint),
    state: RCFStateAdapter.toRCF(crucibleState)
};

// Should match original
console.assert(original.constraint.name === backToRCF.constraint.name);
console.assert(JSON.stringify(original.state.values) === JSON.stringify(backToRCF.state.values));
```

### Test 2: Consistency Check

```javascript
import { UnifiedRCFEngine } from './integration/rcf/rcf_adapter.js';

const constraint = { name: 'Test', score_fn: (s) => s.every(v => v > 0) ? 1 : -1 };
const states = [[1, 2, 3], [4, 5, 6], [-1, 2, 3]]; // Last should fail

const engine = new UnifiedRCFEngine({ rcfMode: 'hybrid' });
const result = await engine.test(constraint, states);

// Both methods should agree on failure
console.assert(!result.unified.consistencyCheck.agree || result.rcf.collapsed);
```

---

## 📝 Configuration

### rcf_adapter.js Configuration

```javascript
const config = {
    // Path to RCF implementation
    rcfPath: '../../../Sages_Stone_Core/systems/RCF/RCF.js',
    
    // Pressure testing parameters
    pressure: 0.15,
    steps: 100,
    
    // Mode: 'rcf', 'crucible', or 'hybrid'
    mode: 'hybrid',
    
    // Threshold for RCF score → boolean conversion
    scoreThreshold: 0.0
};
```

### crucible_python.py Configuration

```python
config = {
    # Bridge mode
    'mode': 'subprocess',  # or 'http'
    
    # Paths
    'sdk_path': '../src/crucible-sdk.js',
    'node_path': 'node',
    
    # HTTP server (if mode='http')
    'server_url': 'http://localhost:3000',
    
    # Timeout
    'timeout': 30
}
```

---

## 🐛 Troubleshooting

### Problem: "Module not found"

**Solution**: Check paths in adapter files

```javascript
// In rcf_adapter.js, verify:
import { Crucible } from '../../src/crucible-sdk.js'; // Correct relative path
```

### Problem: Python can't find Node.js

**Solution**: Specify node path explicitly

```python
crucible = Crucible(mode='subprocess', node_path='/usr/local/bin/node')
```

### Problem: RCF and Crucible disagree

**Solution**: This is actually interesting! Investigate why:

```javascript
const result = await engine.test(constraint, states);

if (!result.unified.consistencyCheck.agree) {
    console.log('Methods disagree!');
    console.log('Crucible:', result.classification);
    console.log('RCF:', result.rcf.collapsed ? 'COLLAPSED' : 'SURVIVED');
    
    // Dive deeper
    console.log('Dimensional survival:', result.dimensionalResults);
    console.log('RCF trajectory:', result.rcf.trajectory);
    
    // This reveals hidden structure!
}
```

### Problem: Slow performance

**Solution**: Use HTTP mode instead of subprocess

```python
# Start server once
# node crucible-server.js

# Use HTTP mode
crucible = Crucible(mode='http', url='http://localhost:3000')
```

---

## 🎯 Next Steps

1. **Test the adapters** with your existing RCF code
2. **Run comparison** between RCF and Crucible results
3. **Document differences** where methods disagree
4. **Extend adapters** for your specific use cases
5. **Create domain-specific presets** combining both approaches

---

## 📚 Further Reading

- `rcf_adapter.js` - Full adapter code with comments
- `crucible_python.py` - Python wrapper implementation
- `crucible-sdk.js` - Core SDK documentation
- `CRUCIBLE-SDK-DOCS.md` - Complete API reference

---

## 🤝 Contributing

Found a better way to bridge RCF and Crucible? Submit a PR!

Integration improvements welcome:
- Faster serialization
- Better error handling
- More language bindings (Rust, Julia, Go)
- Performance optimizations

---

**The bridges are built. Now cross them and discover what lies beyond.** 🌉
