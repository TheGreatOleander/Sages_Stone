/**
 * ============================================================================
 * CRUCIBLE SDK - PRACTICAL EXAMPLES
 * ============================================================================
 * 
 * Real-world examples showing how to use The Crucible SDK
 * for constraint testing, law discovery, and system validation.
 */

import {
  Crucible,
  Constraint,
  StateGenerator,
  Presets,
  Export
} from './crucible-sdk.js';

// ============================================================================
// EXAMPLE 1: Physics - Test Conservation Laws
// ============================================================================

async function example1_physicsConservation() {
  console.log('\n═══ EXAMPLE 1: Physics Conservation Laws ═══\n');
  
  // Define energy conservation constraint
  const energyConservation = new Constraint(
    'Energy Conservation',
    (state) => {
      const [px, py, pz, vx, vy, vz] = state;
      
      // Kinetic energy
      const KE = 0.5 * (vx*vx + vy*vy + vz*vz);
      
      // Potential energy (gravitational)
      const PE = py; // height
      
      // Total energy
      const E = KE + PE;
      
      // Should be conserved (≈ 1.0)
      return Math.abs(E - 1.0) < 0.15;
    },
    {
      domain: 'physics',
      description: 'Total energy must remain constant in isolated system'
    }
  );
  
  // Generate trajectory of falling particle
  const states = StateGenerator.trajectory(
    (state, t) => {
      const [px, py, pz, vx, vy, vz] = state;
      const dt = 0.01;
      
      // Update position
      const newPx = px + vx * dt;
      const newPy = py + vy * dt;
      const newPz = pz + vz * dt;
      
      // Update velocity (gravity)
      const newVx = vx;
      const newVy = vy - 9.8 * dt;
      const newVz = vz;
      
      return [newPx, newPy, newPz, newVx, newVy, newVz];
    },
    [0, 10, 0, 1, 0, 0], // Initial: 10m high, moving horizontally
    100
  );
  
  // Test the constraint
  const crucible = new Crucible();
  const result = await crucible.test(energyConservation, states, {
    onProgress: (prog) => {
      if (prog.phase === 'dimensional' && prog.detail) {
        console.log(`  ${prog.detail}`);
      }
    }
  });
  
  // Results
  console.log(`\nClassification: ${result.classification}`);
  console.log(`Consensus: ${result.consensusScore}%`);
  console.log(`Min Dimension: ${result.minDimension}`);
  
  if (result.isFundamental()) {
    console.log('\n✓ Energy conservation is FUNDAMENTAL');
    console.log('Predictions:');
    result.predictions.forEach(p => console.log(`  • ${p}`));
  }
  
  return result;
}

// ============================================================================
// EXAMPLE 2: Economics - Market Equilibrium
// ============================================================================

async function example2_marketEquilibrium() {
  console.log('\n═══ EXAMPLE 2: Market Equilibrium ═══\n');
  
  // Define supply-demand equilibrium
  const supplyDemandEquilibrium = new Constraint(
    'Supply-Demand Equilibrium',
    (state) => {
      const [price, supply, demand, inventory, trend, volatility] = state;
      
      // At equilibrium: supply ≈ demand
      const equilibriumGap = Math.abs(supply - demand);
      
      // Price should reflect balance
      const priceCorrect = Math.abs(price - 1.0) < 0.3;
      
      return equilibriumGap < 0.2 && priceCorrect;
    },
    {
      domain: 'economics',
      description: 'Markets tend toward supply-demand balance'
    }
  );
  
  // Simulate market dynamics
  const states = StateGenerator.trajectory(
    (state, t) => {
      let [price, supply, demand, inventory, trend, volatility] = state;
      
      // Demand decreases when price is high
      demand = 1.0 - 0.3 * (price - 1.0);
      
      // Supply increases when price is high
      supply = 1.0 + 0.3 * (price - 1.0);
      
      // Price adjusts toward equilibrium
      const imbalance = demand - supply;
      price = price + 0.1 * imbalance;
      
      // Inventory changes
      inventory = inventory + (supply - demand) * 0.1;
      
      // Add market noise
      price += (Math.random() - 0.5) * volatility;
      volatility = 0.05 + Math.abs(imbalance) * 0.1;
      
      return [price, supply, demand, inventory, imbalance, volatility];
    },
    [1.2, 1.0, 1.0, 0, 0, 0.05], // Start with high price
    150
  );
  
  const crucible = new Crucible();
  const result = await crucible.test(supplyDemandEquilibrium, states);
  
  console.log(`Classification: ${result.classification}`);
  console.log(`Consensus: ${result.consensusScore}%`);
  
  // Lens-specific insights
  console.log('\nLens Insights:');
  console.log(`  Thermodynamic: ${result.lensResults.thermodynamic.verdict}`);
  console.log(`  Game Theoretic: ${result.lensResults.gameTheoretic.verdict}`);
  console.log(`  Network: ${result.lensResults.network.verdict}`);
  
  return result;
}

// ============================================================================
// EXAMPLE 3: Real Data Integration - Sensor Validation
// ============================================================================

async function example3_sensorValidation() {
  console.log('\n═══ EXAMPLE 3: Sensor Data Validation ═══\n');
  
  // Define sensor consistency constraint
  const sensorConsistency = new Constraint(
    'Sensor Consistency',
    (state) => {
      const [temp1, temp2, pressure, humidity, power, flux] = state;
      
      // Temperature sensors should agree
      const tempDiff = Math.abs(temp1 - temp2);
      
      // Physical relationships
      const idealGasCheck = Math.abs(pressure - temp1 * 2.5) < 5;
      
      // Bounds check
      const boundsOK = temp1 > 0 && temp1 < 100 &&
                      pressure > 0 && pressure < 200;
      
      return tempDiff < 2.0 && idealGasCheck && boundsOK;
    },
    {
      domain: 'instrumentation',
      description: 'Sensor readings must be internally consistent'
    }
  );
  
  // Simulate sensor data (you'd load real data here)
  const mockSensorData = Array(100).fill(0).map((_, i) => ({
    timestamp: Date.now() + i * 1000,
    temp1: 25 + Math.sin(i * 0.1) * 5 + (Math.random() - 0.5) * 0.5,
    temp2: 25 + Math.sin(i * 0.1) * 5 + (Math.random() - 0.5) * 0.5,
    pressure: 62.5 + Math.sin(i * 0.1) * 12.5,
    humidity: 50 + (Math.random() - 0.5) * 10,
    power: 100 + (Math.random() - 0.5) * 5,
    flux: 0.5 + Math.random() * 0.2
  }));
  
  // Transform to state vectors
  const states = StateGenerator.fromData(
    mockSensorData,
    (reading) => [
      reading.temp1,
      reading.temp2,
      reading.pressure,
      reading.humidity,
      reading.power,
      reading.flux
    ]
  );
  
  const crucible = new Crucible();
  const result = await crucible.test(sensorConsistency, states);
  
  console.log(`Sensor Validation: ${result.classification}`);
  console.log(`Consensus: ${result.consensusScore}%`);
  
  if (result.consensusScore < 70) {
    console.log('\n⚠️  WARNING: Sensor readings may be unreliable');
    console.log('Recommended actions:');
    console.log('  • Calibrate temperature sensors');
    console.log('  • Check pressure sensor');
    console.log('  • Verify sensor mounting');
  } else {
    console.log('\n✓ Sensor system validated');
  }
  
  return result;
}

// ============================================================================
// EXAMPLE 4: Cross-Domain Pattern Discovery
// ============================================================================

async function example4_crossDomainPattern() {
  console.log('\n═══ EXAMPLE 4: Cross-Domain Pattern Discovery ═══\n');
  
  // Universal power-law pattern
  const powerLaw = new Constraint(
    'Power Law Distribution',
    (state) => {
      // Check if state follows power law: P(x) ∝ x^(-α)
      const sorted = [...state].sort((a, b) => b - a);
      
      // Log-log should be linear for power law
      let isLinear = true;
      for (let i = 1; i < sorted.length - 1; i++) {
        if (sorted[i] <= 0) continue;
        
        const logRatio = Math.log(sorted[i]) / Math.log(sorted[i-1]);
        if (Math.abs(logRatio - 0.7) > 0.5) { // Approximate check
          isLinear = false;
          break;
        }
      }
      
      return isLinear;
    },
    {
      domain: 'universal',
      description: 'Power law: common pattern across domains'
    }
  );
  
  // Test across different domains
  const domains = {
    'City Sizes': StateGenerator.random(50, { 
      distribution: 'exponential',
      max: 100 
    }),
    'Wealth Distribution': StateGenerator.random(50, { 
      distribution: 'exponential',
      max: 100 
    }),
    'Word Frequency': StateGenerator.random(50, { 
      distribution: 'exponential',
      max: 100 
    }),
    'Earthquake Magnitudes': StateGenerator.random(50, { 
      distribution: 'exponential',
      max: 10 
    })
  };
  
  const crucible = new Crucible();
  
  console.log('Testing power law across domains:\n');
  
  for (const [domain, states] of Object.entries(domains)) {
    const result = await crucible.test(powerLaw, states, {
      skipDimensional: true, // Fast check
      skipAdversarial: true
    });
    
    console.log(`  ${domain}: ${result.classification} (${result.consensusScore}%)`);
  }
  
  console.log('\nPower laws appear across radically different domains!');
}

// ============================================================================
// EXAMPLE 5: Batch Testing with Comparison
// ============================================================================

async function example5_batchComparison() {
  console.log('\n═══ EXAMPLE 5: Batch Testing & Comparison ═══\n');
  
  // Define multiple hypotheses
  const hypotheses = [
    new Constraint('Bounds', (s) => s.every(x => Math.abs(x) < 5)),
    new Constraint('Positivity', (s) => s.every(x => x > 0)),
    new Constraint('Symmetry', (s) => {
      const mid = Math.floor(s.length / 2);
      return s.slice(0, mid).every((x, i) => Math.abs(x - s[s.length-1-i]) < 1);
    }),
    new Constraint('Monotonic', (s) => {
      for (let i = 1; i < s.length; i++) {
        if (s[i] < s[i-1]) return false;
      }
      return true;
    }),
    new Constraint('Conservation', (s) => {
      const sum = s.reduce((a, b) => a + b, 0);
      return Math.abs(sum - 0) < 0.5;
    })
  ];
  
  // Generate test states
  const states = StateGenerator.random(50, { dimensions: 6 });
  
  // Batch test
  const crucible = new Crucible();
  console.log('Testing 5 hypotheses...\n');
  
  const comparison = await crucible.compare(hypotheses, states);
  
  // Results
  console.log(comparison.generateReport());
  
  // Export
  Export.toJSON(comparison.toJSON(), 'comparison-results.json');
  console.log('\n✓ Results exported to comparison-results.json');
  
  return comparison;
}

// ============================================================================
// EXAMPLE 6: Custom Lens Development
// ============================================================================

async function example6_customLens() {
  console.log('\n═══ EXAMPLE 6: Custom Lens Development ═══\n');
  
  // Create custom complexity lens
  class ComplexityLens {
    constructor() {
      this.name = 'Complexity';
    }
    
    analyze(states, constraint) {
      // Measure state space complexity
      const uniqueStates = new Set(states.map(s => JSON.stringify(s))).size;
      const complexity = uniqueStates / states.length;
      
      // Measure constraint complexity
      let constraintFires = 0;
      states.forEach(s => {
        if (constraint && constraint.test(s)) constraintFires++;
      });
      const selectivity = constraintFires / states.length;
      
      // Kolmogorov-style: how much does constraint compress?
      const compressionRatio = selectivity < 1 ? 1 / (1 - selectivity) : Infinity;
      
      return {
        stateComplexity: complexity.toFixed(3),
        selectivity: selectivity.toFixed(3),
        compressionRatio: compressionRatio.toFixed(2),
        verdict: complexity > 0.5 ? 'High Complexity' : 'Low Complexity'
      };
    }
  }
  
  // Add custom lens to crucible
  const crucible = new Crucible();
  crucible.lenses.complexity = new ComplexityLens();
  
  // Test with custom lens
  const constraint = Presets.Physics.energyConservation;
  const states = StateGenerator.random(50);
  
  const result = await crucible.test(constraint, states);
  
  console.log('Standard Lenses:');
  Object.entries(result.lensResults).forEach(([name, lens]) => {
    console.log(`  ${name}: ${lens.verdict}`);
  });
  
  console.log('\n✓ Custom lens integrated successfully!');
  
  return result;
}

// ============================================================================
// EXAMPLE 7: Progressive Refinement
// ============================================================================

async function example7_progressiveRefinement() {
  console.log('\n═══ EXAMPLE 7: Progressive Refinement ═══\n');
  
  // Start with coarse hypothesis
  let hypothesis = new Constraint(
    'Energy Bounded v1',
    (state) => {
      const energy = state.reduce((s, x) => s + x*x, 0);
      return energy < 100; // Very loose
    }
  );
  
  const states = StateGenerator.random(50);
  const crucible = new Crucible();
  
  console.log('Iteration 1: Testing coarse hypothesis...');
  let result = await crucible.test(hypothesis, states);
  console.log(`  Result: ${result.classification} (${result.consensusScore}%)`);
  
  if (result.consensusScore < 80) {
    console.log('\nIteration 2: Tightening constraint...');
    
    hypothesis = new Constraint(
      'Energy Bounded v2',
      (state) => {
        const energy = state.reduce((s, x) => s + x*x, 0);
        return energy < 50; // Tighter
      }
    );
    
    result = await crucible.test(hypothesis, states);
    console.log(`  Result: ${result.classification} (${result.consensusScore}%)`);
  }
  
  if (result.consensusScore < 80) {
    console.log('\nIteration 3: Adding normalization...');
    
    hypothesis = new Constraint(
      'Energy Bounded v3',
      (state) => {
        const energy = state.reduce((s, x) => s + x*x, 0) / state.length;
        return Math.abs(energy - 4.0) < 2.0; // Normalized around mean
      }
    );
    
    result = await crucible.test(hypothesis, states);
    console.log(`  Result: ${result.classification} (${result.consensusScore}%)`);
  }
  
  console.log('\n✓ Refinement complete!');
  console.log(`Final consensus: ${result.consensusScore}%`);
  
  return result;
}

// ============================================================================
// MAIN: RUN ALL EXAMPLES
// ============================================================================

async function runAllExamples() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║           CRUCIBLE SDK - PRACTICAL EXAMPLES                  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  try {
    await example1_physicsConservation();
    await example2_marketEquilibrium();
    await example3_sensorValidation();
    await example4_crossDomainPattern();
    await example5_batchComparison();
    await example6_customLens();
    await example7_progressiveRefinement();
    
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║              ALL EXAMPLES COMPLETED                          ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('\n✓ SDK is working correctly!');
    console.log('✓ You can now build your own constraint tests!');
    
  } catch (error) {
    console.error('\n❌ Error running examples:', error);
    console.error(error.stack);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export {
  example1_physicsConservation,
  example2_marketEquilibrium,
  example3_sensorValidation,
  example4_crossDomainPattern,
  example5_batchComparison,
  example6_customLens,
  example7_progressiveRefinement,
  runAllExamples
};

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}
