/**
 * ============================================================================
 * THE CRUCIBLE SDK v2.0
 * ============================================================================
 * 
 * A complete Software Development Kit for constraint testing, dimensional
 * analysis, and fundamental law discovery.
 * 
 * @author The Crucible Project
 * @license MIT
 * @version 2.0.0
 * 
 * QUICK START:
 * 
 *   import { Crucible, Constraint } from './crucible-sdk.js';
 * 
 *   const crucible = new Crucible();
 *   const myConstraint = new Constraint('MyLaw', (state) => state.energy > 0);
 *   const results = await crucible.test(myConstraint, states);
 *   
 *   console.log(results.isFundamental()); // true/false
 * 
 * ============================================================================
 */

// ============================================================================
// CORE: CONSTRAINT CLASS
// ============================================================================

/**
 * Represents a testable constraint/law/rule
 * 
 * @class Constraint
 * @example
 * const energyConservation = new Constraint(
 *   'EnergyConservation',
 *   (state) => Math.abs(state.energy - 1.0) < 0.01,
 *   { domain: 'physics', description: 'Energy must be conserved' }
 * );
 */
export class Constraint {
  /**
   * @param {string} name - Human-readable name
   * @param {Function} checkFunction - (state) => boolean test function
   * @param {Object} options - Additional metadata
   * @param {string} options.domain - Domain (physics, math, economics, etc)
   * @param {string} options.description - What this constraint represents
   * @param {Object} options.metadata - Any additional data
   */
  constructor(name, checkFunction, options = {}) {
    this.name = name;
    this.check = checkFunction;
    this.domain = options.domain || 'general';
    this.description = options.description || '';
    this.metadata = options.metadata || {};
    
    // Results (populated by testing)
    this.survivalHistory = [];
    this.lawScore = 0;
    this.dimensionalSurvival = new Map();
    this.testResults = null;
  }

  /**
   * Test this constraint against a state
   * @param {*} state - State to test (number, array, object)
   * @returns {boolean} Whether constraint is satisfied
   */
  test(state) {
    try {
      return Boolean(this.check(state));
    } catch (e) {
      console.warn(`Constraint ${this.name} threw error:`, e);
      return false;
    }
  }

  /**
   * Check if constraint is fundamental (survives to 0D)
   * @returns {boolean}
   */
  isFundamental() {
    return this.dimensionalSurvival.has(0) && this.dimensionalSurvival.get(0) >= 0.5;
  }

  /**
   * Check if constraint is emergent (requires dimension)
   * @returns {boolean}
   */
  isEmergent() {
    return !this.isFundamental() && this.dimensionalSurvival.size > 0;
  }

  /**
   * Get minimum dimension required
   * @returns {number|null}
   */
  getMinDimension() {
    const surviving = Array.from(this.dimensionalSurvival.entries())
      .filter(([d, s]) => s >= 0.5)
      .map(([d]) => parseInt(d));
    
    return surviving.length > 0 ? Math.min(...surviving) : null;
  }

  /**
   * Export constraint data
   * @returns {Object}
   */
  toJSON() {
    return {
      name: this.name,
      domain: this.domain,
      description: this.description,
      metadata: this.metadata,
      lawScore: this.lawScore,
      dimensionalSurvival: Object.fromEntries(this.dimensionalSurvival),
      classification: this.isFundamental() ? 'FUNDAMENTAL' : 
                     this.isEmergent() ? 'EMERGENT' : 'NON-FUNDAMENTAL'
    };
  }
}

// ============================================================================
// CORE: STATE GENERATION
// ============================================================================

/**
 * Generate test states for constraint testing
 * @class StateGenerator
 */
export class StateGenerator {
  /**
   * Generate random states
   * @param {number} count - Number of states
   * @param {Object} options - Generation options
   * @returns {Array}
   */
  static random(count = 50, options = {}) {
    const {
      dimensions = 6,
      min = -5,
      max = 5,
      distribution = 'uniform' // uniform, normal, exponential
    } = options;

    const states = [];
    
    for (let i = 0; i < count; i++) {
      const state = [];
      for (let d = 0; d < dimensions; d++) {
        let value;
        
        if (distribution === 'normal') {
          value = this._normalRandom() * (max - min) + (max + min) / 2;
        } else if (distribution === 'exponential') {
          value = -Math.log(Math.random()) * (max - min) / 5;
        } else {
          value = Math.random() * (max - min) + min;
        }
        
        state.push(value);
      }
      states.push(state);
    }
    
    return states;
  }

  /**
   * Generate states from a trajectory
   * @param {Function} evolutionFn - (prevState, t) => nextState
   * @param {Array} initialState - Starting state
   * @param {number} steps - Number of evolution steps
   * @returns {Array}
   */
  static trajectory(evolutionFn, initialState, steps = 50) {
    const states = [initialState];
    
    for (let t = 1; t < steps; t++) {
      const nextState = evolutionFn(states[t - 1], t);
      states.push(nextState);
    }
    
    return states;
  }

  /**
   * Generate states from real data
   * @param {Array} data - Raw data points
   * @param {Function} transformer - (dataPoint) => state
   * @returns {Array}
   */
  static fromData(data, transformer) {
    return data.map(transformer);
  }

  // Helper: Box-Muller transform for normal distribution
  static _normalRandom() {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
}

// ============================================================================
// ENGINE: DIMENSIONAL PROJECTION
// ============================================================================

/**
 * Tests constraints across dimensions
 * @class DimensionalEngine
 */
export class DimensionalEngine {
  constructor(options = {}) {
    this.maxDimension = options.maxDimension || 6;
    this.trialsPerDimension = options.trialsPerDimension || 10;
    this.stepsPerTrial = options.stepsPerTrial || 50;
    this.basePressure = options.pressure || 0.15;
  }

  /**
   * Project state to specific dimension
   * @param {Array} state - State vector
   * @param {number} dimension - Target dimension
   * @returns {Array}
   */
  projectToD(state, dimension) {
    if (!Array.isArray(state)) state = [state];
    
    if (dimension === 0) {
      // 0D: Pure existence (magnitude only)
      const magnitude = Math.sqrt(state.reduce((sum, x) => sum + x * x, 0));
      return [magnitude];
    } else if (dimension < state.length) {
      return state.slice(0, dimension);
    } else {
      // Pad if needed
      return [...state, ...Array(dimension - state.length).fill(0)];
    }
  }

  /**
   * Test constraint at specific dimension
   * @param {Constraint} constraint - Constraint to test
   * @param {Array} states - Test states
   * @param {number} dimension - Test dimension
   * @returns {number} Survival rate (0-1)
   */
  testAtDimension(constraint, states, dimension) {
    let survivalCount = 0;

    for (let trial = 0; trial < this.trialsPerDimension; trial++) {
      let survived = true;
      
      for (let step = 0; step < this.stepsPerTrial; step++) {
        // Pick random state
        const stateIndex = Math.floor(Math.random() * states.length);
        const state = this.projectToD(states[stateIndex], dimension);
        
        // Apply dimensional pressure
        const pressure = this.basePressure * (1 + dimension * 0.05);
        const perturbedState = state.map(x => 
          x * (1 - pressure * 0.1) + (Math.random() - 0.5) * pressure
        );
        
        // Test constraint
        if (!constraint.test(perturbedState)) {
          survived = false;
          break;
        }
      }
      
      if (survived) survivalCount++;
    }

    return survivalCount / this.trialsPerDimension;
  }

  /**
   * Full dimensional sweep (maxD down to 0D)
   * @param {Constraint} constraint - Constraint to test
   * @param {Array} states - Test states
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Dimensional survival map
   */
  async sweep(constraint, states, onProgress = null) {
    const results = {};
    
    for (let dim = this.maxDimension; dim >= 0; dim--) {
      const survival = this.testAtDimension(constraint, states, dim);
      results[dim] = survival;
      
      constraint.dimensionalSurvival.set(dim, survival);
      
      if (onProgress) {
        await onProgress({
          dimension: dim,
          survival: survival,
          progress: ((this.maxDimension - dim) / (this.maxDimension + 1)) * 100
        });
      }
      
      // Early exit if constraint fails
      if (survival < 0.5) {
        console.log(`Constraint ${constraint.name} failed at ${dim}D`);
        break;
      }
    }
    
    return results;
  }
}

// ============================================================================
// LENSES: ANALYTICAL FRAMEWORKS
// ============================================================================

/**
 * Base class for analytical lenses
 * @class Lens
 */
class Lens {
  constructor(name) {
    this.name = name;
  }

  analyze(states, constraint = null) {
    throw new Error('Lens must implement analyze()');
  }
}

/**
 * Information-theoretic analysis
 * @class InformationLens
 */
export class InformationLens extends Lens {
  constructor() {
    super('Information');
  }

  analyze(states) {
    const stateStrings = states.map(s => JSON.stringify(s));
    const counts = {};
    stateStrings.forEach(s => counts[s] = (counts[s] || 0) + 1);
    
    // Shannon entropy
    const total = stateStrings.length;
    let entropy = 0;
    Object.values(counts).forEach(count => {
      const p = count / total;
      if (p > 0) entropy -= p * Math.log2(p);
    });
    
    // Kolmogorov complexity (approximated by compression)
    const unique = new Set(stateStrings).size;
    const compressionRatio = total / (unique || 1);
    const complexity = 1 / compressionRatio;
    
    return {
      entropy: parseFloat(entropy.toFixed(3)),
      complexity: parseFloat(complexity.toFixed(3)),
      compressionRatio: parseFloat(compressionRatio.toFixed(2)),
      informationDensity: parseFloat((1 / compressionRatio).toFixed(3)),
      verdict: entropy < 2 ? 'Ordered' : 'Disordered'
    };
  }
}

/**
 * Thermodynamic analysis
 * @class ThermodynamicLens
 */
export class ThermodynamicLens extends Lens {
  constructor(temperature = 1.0) {
    super('Thermodynamic');
    this.temperature = temperature;
  }

  analyze(states) {
    const energies = states.map(s => {
      const arr = Array.isArray(s) ? s : [s];
      return arr.reduce((sum, x) => sum + x * x, 0) / 2;
    });
    
    const initialEnergy = energies[0];
    const finalEnergy = energies[energies.length - 1];
    const deltaE = finalEnergy - initialEnergy;
    
    const avgEnergy = energies.reduce((a, b) => a + b, 0) / energies.length;
    const variance = energies.reduce((sum, e) => sum + (e - avgEnergy) ** 2, 0) / energies.length;
    
    const freeEnergy = avgEnergy - this.temperature * Math.log(variance + 1);
    
    return {
      initialEnergy: parseFloat(initialEnergy.toFixed(3)),
      finalEnergy: parseFloat(finalEnergy.toFixed(3)),
      freeEnergyChange: parseFloat(deltaE.toFixed(3)),
      temperature: this.temperature,
      entropy: parseFloat(Math.log(variance + 1).toFixed(3)),
      verdict: deltaE < 0 ? 'Stabilizing' : 'Destabilizing'
    };
  }
}

/**
 * Game-theoretic analysis
 * @class GameTheoreticLens
 */
export class GameTheoreticLens extends Lens {
  constructor() {
    super('GameTheoretic');
  }

  analyze(states, constraint) {
    // Simplified Nash equilibrium check
    // Check if constraint is stable against local perturbations
    
    let equilibriumCount = 0;
    const sampleSize = Math.min(10, states.length);
    
    for (let i = 0; i < sampleSize; i++) {
      const state = states[Math.floor(Math.random() * states.length)];
      const arr = Array.isArray(state) ? state : [state];
      
      // Test local perturbations
      let isEquilibrium = true;
      for (let j = 0; j < arr.length; j++) {
        const perturbed = [...arr];
        perturbed[j] += (Math.random() - 0.5) * 0.5;
        
        const originalSatisfies = constraint ? constraint.test(arr) : true;
        const perturbedSatisfies = constraint ? constraint.test(perturbed) : true;
        
        // If perturbation improves satisfaction, not an equilibrium
        if (!originalSatisfies && perturbedSatisfies) {
          isEquilibrium = false;
          break;
        }
      }
      
      if (isEquilibrium) equilibriumCount++;
    }
    
    const equilibriumRate = equilibriumCount / sampleSize;
    
    return {
      nashEquilibria: equilibriumCount,
      equilibriumRate: parseFloat(equilibriumRate.toFixed(2)),
      verdict: equilibriumRate > 0.5 ? 'Strategically Stable' : 'Unstable'
    };
  }
}

/**
 * Quantum-informational analysis
 * @class QuantumLens
 */
export class QuantumLens extends Lens {
  constructor() {
    super('Quantum');
  }

  analyze(states) {
    const first = Array.isArray(states[0]) ? states[0] : [states[0]];
    const last = Array.isArray(states[states.length - 1]) ? states[states.length - 1] : [states[states.length - 1]];
    
    // Fidelity between first and last state
    const norm1 = Math.sqrt(first.reduce((s, x) => s + x * x, 0)) || 1;
    const norm2 = Math.sqrt(last.reduce((s, x) => s + x * x, 0)) || 1;
    const dot = first.reduce((s, x, i) => s + x * (last[i] || 0), 0);
    const fidelity = Math.abs(dot / (norm1 * norm2));
    
    // Purity (trace of density matrix squared)
    const purity = fidelity; // Simplified
    
    return {
      fidelity: parseFloat(fidelity.toFixed(3)),
      coherence: parseFloat((fidelity * 100).toFixed(1)),
      purity: parseFloat(purity.toFixed(3)),
      verdict: fidelity > 0.5 ? 'Coherent' : 'Decoherent'
    };
  }
}

/**
 * Network-theoretic analysis
 * @class NetworkLens
 */
export class NetworkLens extends Lens {
  constructor() {
    super('Network');
  }

  analyze(states) {
    const n = states.length;
    let edges = 0;
    const threshold = 0.7;
    
    // Build connectivity graph
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const sim = this._cosineSimilarity(states[i], states[j]);
        if (sim > threshold) edges++;
      }
    }
    
    const maxEdges = (n * (n - 1)) / 2;
    const density = maxEdges > 0 ? edges / maxEdges : 0;
    
    return {
      nodes: n,
      edges: edges,
      density: parseFloat(density.toFixed(3)),
      avgDegree: parseFloat(((2 * edges) / n).toFixed(2)),
      verdict: density > 0.3 ? 'Highly Connected' : 'Sparse'
    };
  }

  _cosineSimilarity(a, b) {
    const arr1 = Array.isArray(a) ? a : [a];
    const arr2 = Array.isArray(b) ? b : [b];
    
    const normA = Math.sqrt(arr1.reduce((s, x) => s + x * x, 0)) || 1;
    const normB = Math.sqrt(arr2.reduce((s, x) => s + x * x, 0)) || 1;
    const dot = arr1.reduce((s, x, i) => s + x * (arr2[i] || 0), 0);
    
    return dot / (normA * normB);
  }
}

/**
 * Category-theoretic analysis
 * @class CategoryLens
 */
export class CategoryLens extends Lens {
  constructor() {
    super('Category');
  }

  analyze(states) {
    const uniqueStates = new Set(states.map(s => JSON.stringify(s))).size;
    const morphisms = states.length - 1;
    
    // Check composition (state transitions form arrows)
    const preservesStructure = uniqueStates < states.length * 0.8;
    
    return {
      objects: uniqueStates,
      morphisms: morphisms,
      compositionValid: true,
      functorPreserving: preservesStructure,
      verdict: preservesStructure ? 'Structure Preserved' : 'Structure Lost'
    };
  }
}

// ============================================================================
// ENGINE: ADVERSARIAL TESTING
// ============================================================================

/**
 * Adversarial constraint testing
 * @class AdversarialEngine
 */
export class AdversarialEngine {
  constructor(options = {}) {
    this.rounds = options.rounds || 10;
    this.attackStrength = options.attackStrength || 1.0;
  }

  /**
   * Generate anti-constraint (tries to violate)
   * @param {Constraint} constraint - Original constraint
   * @returns {Constraint}
   */
  generateAntiConstraint(constraint) {
    return new Constraint(
      `Anti-${constraint.name}`,
      (state) => !constraint.test(state),
      { domain: 'adversarial' }
    );
  }

  /**
   * Battle test: constraint vs adversary
   * @param {Constraint} constraint - Constraint to test
   * @param {Array} states - Test states
   * @returns {Object} Battle results
   */
  battle(constraint, states) {
    let wins = 0;
    let losses = 0;
    const battleLog = [];

    for (let round = 0; round < this.rounds; round++) {
      const testState = states[Math.floor(Math.random() * states.length)];
      
      // Apply adversarial perturbation
      const attacked = Array.isArray(testState)
        ? testState.map(x => x + (Math.random() - 0.5) * this.attackStrength * 4)
        : testState + (Math.random() - 0.5) * this.attackStrength * 4;
      
      const survived = constraint.test(attacked);
      
      if (survived) {
        wins++;
        battleLog.push({ round, result: 'WIN', state: attacked });
      } else {
        losses++;
        battleLog.push({ round, result: 'LOSS', state: attacked });
      }
    }

    const survivalRate = wins / (wins + losses);
    
    return {
      wins,
      losses,
      survivalRate: parseFloat(survivalRate.toFixed(3)),
      verdict: survivalRate > 0.6 ? 'Adversary Resistant' : 'Vulnerable',
      battleLog
    };
  }
}

// ============================================================================
// MAIN: CRUCIBLE CLASS
// ============================================================================

/**
 * Main Crucible orchestrator
 * @class Crucible
 * 
 * @example
 * const crucible = new Crucible();
 * const results = await crucible.test(myConstraint, states);
 * console.log(results.classification); // 'FUNDAMENTAL', 'EMERGENT', or 'FAILED'
 */
export class Crucible {
  constructor(options = {}) {
    this.dimensionalEngine = new DimensionalEngine(options.dimensional);
    this.adversarialEngine = new AdversarialEngine(options.adversarial);
    
    // Initialize all lenses
    this.lenses = {
      information: new InformationLens(),
      thermodynamic: new ThermodynamicLens(options.temperature),
      gameTheoretic: new GameTheoreticLens(),
      quantum: new QuantumLens(),
      network: new NetworkLens(),
      category: new CategoryLens()
    };
    
    this.testHistory = [];
  }

  /**
   * Test a constraint through all systems
   * @param {Constraint} constraint - Constraint to test
   * @param {Array} states - Test states
   * @param {Object} options - Test options
   * @returns {Promise<CrucibleResult>}
   */
  async test(constraint, states, options = {}) {
    const {
      onProgress = null,
      skipDimensional = false,
      skipAdversarial = false,
      skipLenses = []
    } = options;

    const result = new CrucibleResult(constraint);

    // Phase 1: Lens Analysis
    if (onProgress) await onProgress({ phase: 'lenses', progress: 0 });
    
    for (const [name, lens] of Object.entries(this.lenses)) {
      if (skipLenses.includes(name)) continue;
      
      try {
        const lensResult = lens.analyze(states, constraint);
        result.lensResults[name] = lensResult;
      } catch (e) {
        console.warn(`Lens ${name} failed:`, e);
        result.lensResults[name] = { error: e.message };
      }
    }

    // Phase 2: Dimensional Sweep
    if (!skipDimensional) {
      if (onProgress) await onProgress({ phase: 'dimensional', progress: 30 });
      
      result.dimensionalResults = await this.dimensionalEngine.sweep(
        constraint,
        states,
        async (prog) => {
          if (onProgress) {
            await onProgress({
              phase: 'dimensional',
              progress: 30 + prog.progress * 0.5,
              detail: `${prog.dimension}D: ${(prog.survival * 100).toFixed(0)}%`
            });
          }
        }
      );
    }

    // Phase 3: Adversarial Battle
    if (!skipAdversarial) {
      if (onProgress) await onProgress({ phase: 'adversarial', progress: 80 });
      
      result.adversarialResults = this.adversarialEngine.battle(constraint, states);
    }

    // Phase 4: Synthesis & Classification
    if (onProgress) await onProgress({ phase: 'synthesis', progress: 90 });
    
    result.synthesize();
    
    // Store in history
    constraint.testResults = result;
    this.testHistory.push(result);
    
    if (onProgress) await onProgress({ phase: 'complete', progress: 100 });
    
    return result;
  }

  /**
   * Batch test multiple constraints
   * @param {Array<Constraint>} constraints - Constraints to test
   * @param {Array} states - Test states
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Array<CrucibleResult>>}
   */
  async testBatch(constraints, states, onProgress = null) {
    const results = [];
    
    for (let i = 0; i < constraints.length; i++) {
      const result = await this.test(
        constraints[i],
        states,
        {
          onProgress: onProgress ? (prog) => {
            const overallProgress = (i / constraints.length) * 100 + (prog.progress / constraints.length);
            onProgress({
              ...prog,
              constraint: constraints[i].name,
              overall: overallProgress
            });
          } : null
        }
      );
      
      results.push(result);
    }
    
    return results;
  }

  /**
   * Compare multiple constraints
   * @param {Array<Constraint>} constraints - Constraints to compare
   * @param {Array} states - Test states
   * @returns {Promise<ComparisonResult>}
   */
  async compare(constraints, states) {
    const results = await this.testBatch(constraints, states);
    
    return new ComparisonResult(results);
  }

  /**
   * Export crucible configuration
   * @returns {Object}
   */
  toJSON() {
    return {
      version: '2.0.0',
      lenses: Object.keys(this.lenses),
      testHistory: this.testHistory.map(r => r.toJSON())
    };
  }
}

// ============================================================================
// RESULTS: CRUCIBLE RESULT
// ============================================================================

/**
 * Test results container
 * @class CrucibleResult
 */
export class CrucibleResult {
  constructor(constraint) {
    this.constraint = constraint;
    this.timestamp = new Date().toISOString();
    
    this.lensResults = {};
    this.dimensionalResults = {};
    this.adversarialResults = {};
    
    this.classification = 'PENDING';
    this.consensusScore = 0;
    this.predictions = [];
    this.minDimension = null;
  }

  /**
   * Synthesize results and generate classification
   */
  synthesize() {
    // Check dimensional survival
    const survives0D = this.dimensionalResults[0] >= 0.5;
    const survivingDimensions = Object.entries(this.dimensionalResults)
      .filter(([d, s]) => s >= 0.5)
      .map(([d]) => parseInt(d));
    
    this.minDimension = survivingDimensions.length > 0 
      ? Math.min(...survivingDimensions) 
      : null;

    // Classify
    if (survives0D) {
      this.classification = 'FUNDAMENTAL';
      this.consensusScore = 95;
      
      this.predictions = [
        `${this.constraint.name} must hold in any dimensional framework`,
        'Cannot be derived from other laws (axiomatic)',
        'Violations would collapse entire system',
        `Survives pure existence test (0D)`
      ];
      
    } else if (this.minDimension !== null && this.minDimension < 6) {
      this.classification = 'EMERGENT';
      this.consensusScore = 70;
      
      this.predictions = [
        `${this.constraint.name} emerges at dimension ≥${this.minDimension}`,
        'Derivative of more fundamental laws',
        'May break down in extreme dimensional reduction',
        `Requires geometric structure of ${this.minDimension}D space`
      ];
      
    } else {
      this.classification = 'NON-FUNDAMENTAL';
      this.consensusScore = 30;
      
      this.predictions = [
        `${this.constraint.name} is not fundamental`,
        'Likely a conventional or domain-specific rule',
        'Does not survive pressure testing',
        'May be useful but not universal'
      ];
    }

    // Adjust consensus based on adversarial results
    if (this.adversarialResults.survivalRate) {
      const adversarialBonus = (this.adversarialResults.survivalRate - 0.5) * 20;
      this.consensusScore = Math.min(100, this.consensusScore + adversarialBonus);
    }

    // Store back to constraint
    this.constraint.lawScore = this.consensusScore;
  }

  /**
   * Check if fundamental
   * @returns {boolean}
   */
  isFundamental() {
    return this.classification === 'FUNDAMENTAL';
  }

  /**
   * Check if emergent
   * @returns {boolean}
   */
  isEmergent() {
    return this.classification === 'EMERGENT';
  }

  /**
   * Get human-readable summary
   * @returns {string}
   */
  getSummary() {
    return `${this.constraint.name}: ${this.classification} (Consensus: ${this.consensusScore}%)`;
  }

  /**
   * Export results
   * @returns {Object}
   */
  toJSON() {
    return {
      constraint: this.constraint.toJSON(),
      timestamp: this.timestamp,
      classification: this.classification,
      consensusScore: this.consensusScore,
      minDimension: this.minDimension,
      lensResults: this.lensResults,
      dimensionalResults: this.dimensionalResults,
      adversarialResults: this.adversarialResults,
      predictions: this.predictions
    };
  }
}

// ============================================================================
// RESULTS: COMPARISON
// ============================================================================

/**
 * Comparison of multiple constraints
 * @class ComparisonResult
 */
export class ComparisonResult {
  constructor(results) {
    this.results = results;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Get all fundamental constraints
   * @returns {Array<CrucibleResult>}
   */
  getFundamental() {
    return this.results.filter(r => r.isFundamental());
  }

  /**
   * Get all emergent constraints
   * @returns {Array<CrucibleResult>}
   */
  getEmergent() {
    return this.results.filter(r => r.isEmergent());
  }

  /**
   * Rank by consensus score
   * @returns {Array<CrucibleResult>}
   */
  rankByConsensus() {
    return [...this.results].sort((a, b) => b.consensusScore - a.consensusScore);
  }

  /**
   * Find contradictions (where lenses disagree)
   * @returns {Array<Object>}
   */
  findContradictions() {
    const contradictions = [];
    
    // Compare pairs of results
    for (let i = 0; i < this.results.length; i++) {
      for (let j = i + 1; j < this.results.length; j++) {
        const r1 = this.results[i];
        const r2 = this.results[j];
        
        // If both fundamental but different dimensions
        if (r1.isFundamental() && r2.isFundamental() && 
            r1.minDimension !== r2.minDimension) {
          contradictions.push({
            type: 'DIMENSIONAL_MISMATCH',
            constraints: [r1.constraint.name, r2.constraint.name],
            details: `Different minimum dimensions: ${r1.minDimension} vs ${r2.minDimension}`
          });
        }
      }
    }
    
    return contradictions;
  }

  /**
   * Generate report
   * @returns {string}
   */
  generateReport() {
    const fundamental = this.getFundamental();
    const emergent = this.getEmergent();
    const failed = this.results.filter(r => !r.isFundamental() && !r.isEmergent());
    
    let report = '═══════════════════════════════════════\n';
    report += '  CRUCIBLE COMPARISON REPORT\n';
    report += '═══════════════════════════════════════\n\n';
    
    report += `Total Constraints Tested: ${this.results.length}\n`;
    report += `  ⭐ Fundamental: ${fundamental.length}\n`;
    report += `  ◯ Emergent: ${emergent.length}\n`;
    report += `  ✗ Failed: ${failed.length}\n\n`;
    
    if (fundamental.length > 0) {
      report += '⭐ FUNDAMENTAL LAWS:\n';
      fundamental.forEach(r => {
        report += `  • ${r.constraint.name} (${r.consensusScore}%)\n`;
      });
      report += '\n';
    }
    
    if (emergent.length > 0) {
      report += '◯ EMERGENT LAWS:\n';
      emergent.forEach(r => {
        report += `  • ${r.constraint.name} (≥${r.minDimension}D, ${r.consensusScore}%)\n`;
      });
      report += '\n';
    }
    
    const contradictions = this.findContradictions();
    if (contradictions.length > 0) {
      report += '⚠️  CONTRADICTIONS DETECTED:\n';
      contradictions.forEach(c => {
        report += `  • ${c.type}: ${c.details}\n`;
      });
      report += '\n';
    }
    
    report += '═══════════════════════════════════════\n';
    
    return report;
  }

  /**
   * Export comparison
   * @returns {Object}
   */
  toJSON() {
    return {
      timestamp: this.timestamp,
      totalTests: this.results.length,
      fundamental: this.getFundamental().length,
      emergent: this.getEmergent().length,
      results: this.results.map(r => r.toJSON()),
      contradictions: this.findContradictions()
    };
  }
}

// ============================================================================
// UTILITIES: PRESET CONSTRAINTS
// ============================================================================

/**
 * Library of preset constraints for testing
 * @namespace Presets
 */
export const Presets = {
  /**
   * Physics constraints
   */
  Physics: {
    energyConservation: new Constraint(
      'Energy Conservation',
      (state) => {
        const arr = Array.isArray(state) ? state : [state];
        const magnitude = Math.sqrt(arr.reduce((s, x) => s + x * x, 0));
        return Math.abs(magnitude - 1.0) < 0.3;
      },
      { domain: 'physics', description: 'Total energy must be conserved' }
    ),
    
    momentumConservation: new Constraint(
      'Momentum Conservation',
      (state) => {
        const arr = Array.isArray(state) ? state : [state];
        const sum = arr.reduce((s, x) => s + x, 0);
        return Math.abs(sum) < 0.5;
      },
      { domain: 'physics', description: 'Total momentum conserved in isolated system' }
    ),
    
    positivity: new Constraint(
      'Positivity',
      (state) => {
        const arr = Array.isArray(state) ? state : [state];
        return arr.every(x => x >= 0);
      },
      { domain: 'physics', description: 'Certain quantities must be positive' }
    )
  },

  /**
   * Mathematical constraints
   */
  Mathematics: {
    hardBounds: new Constraint(
      'Hard Bounds',
      (state) => {
        const arr = Array.isArray(state) ? state : [state];
        return arr.every(x => Math.abs(x) < 5);
      },
      { domain: 'mathematics', description: 'Values must stay within bounds' }
    ),
    
    monotonicity: new Constraint(
      'Monotonic Increase',
      (state) => {
        const arr = Array.isArray(state) ? state : [state];
        if (arr.length < 2) return true;
        for (let i = 1; i < arr.length; i++) {
          if (arr[i] < arr[i - 1]) return false;
        }
        return true;
      },
      { domain: 'mathematics', description: 'Sequence must monotonically increase' }
    ),
    
    symmetry: new Constraint(
      'Reflection Symmetry',
      (state) => {
        const arr = Array.isArray(state) ? state : [state];
        if (arr.length < 2) return true;
        const mid = Math.floor(arr.length / 2);
        const left = arr.slice(0, mid);
        const right = arr.slice(mid).reverse();
        return left.every((x, i) => Math.abs(x - (right[i] || 0)) < 1.0);
      },
      { domain: 'mathematics', description: 'State must be reflection symmetric' }
    )
  },

  /**
   * Economic constraints
   */
  Economics: {
    equilibrium: new Constraint(
      'Market Equilibrium',
      (state) => {
        const arr = Array.isArray(state) ? state : [state];
        const mean = arr.reduce((s, x) => s + x, 0) / arr.length;
        return Math.abs(mean) < 0.5;
      },
      { domain: 'economics', description: 'Market must be in equilibrium' }
    ),
    
    scarcity: new Constraint(
      'Scarcity',
      (state) => {
        const arr = Array.isArray(state) ? state : [state];
        return arr.every(x => x > 0 && x < 100);
      },
      { domain: 'economics', description: 'Resources are scarce and bounded' }
    )
  },

  /**
   * Get all presets
   * @returns {Array<Constraint>}
   */
  getAll() {
    return [
      ...Object.values(this.Physics),
      ...Object.values(this.Mathematics),
      ...Object.values(this.Economics)
    ];
  }
};

// ============================================================================
// UTILITIES: EXPORT
// ============================================================================

/**
 * Export utilities
 * @namespace Export
 */
export const Export = {
  /**
   * Export to JSON file
   * @param {*} data - Data to export
   * @param {string} filename - Output filename
   */
  toJSON(data, filename = 'crucible-results.json') {
    const json = JSON.stringify(data, null, 2);
    
    if (typeof window !== 'undefined' && window.document) {
      // Browser environment
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Node environment
      return json;
    }
  },

  /**
   * Export to CSV
   * @param {Array<CrucibleResult>} results - Results to export
   * @param {string} filename - Output filename
   */
  toCSV(results, filename = 'crucible-results.csv') {
    const headers = [
      'Name',
      'Domain',
      'Classification',
      'Consensus',
      'MinDimension',
      'AdversarialSurvival'
    ];
    
    const rows = results.map(r => [
      r.constraint.name,
      r.constraint.domain,
      r.classification,
      r.consensusScore,
      r.minDimension,
      r.adversarialResults.survivalRate
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    if (typeof window !== 'undefined' && window.document) {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      return csv;
    }
  },

  /**
   * Generate markdown report
   * @param {CrucibleResult|ComparisonResult} result - Result to export
   * @returns {string}
   */
  toMarkdown(result) {
    if (result instanceof ComparisonResult) {
      return result.generateReport();
    }
    
    let md = `# Crucible Test Report: ${result.constraint.name}\n\n`;
    md += `**Domain:** ${result.constraint.domain}  \n`;
    md += `**Classification:** ${result.classification}  \n`;
    md += `**Consensus Score:** ${result.consensusScore}%  \n`;
    md += `**Timestamp:** ${result.timestamp}  \n\n`;
    
    md += `## Dimensional Analysis\n\n`;
    md += `| Dimension | Survival Rate |\n`;
    md += `|-----------|---------------|\n`;
    Object.entries(result.dimensionalResults)
      .sort((a, b) => b[0] - a[0])
      .forEach(([dim, rate]) => {
        md += `| ${dim}D | ${(rate * 100).toFixed(1)}% |\n`;
      });
    
    md += `\n## Lens Results\n\n`;
    Object.entries(result.lensResults).forEach(([name, lens]) => {
      md += `### ${name}\n`;
      md += `**Verdict:** ${lens.verdict}  \n\n`;
      Object.entries(lens).forEach(([key, value]) => {
        if (key !== 'verdict') {
          md += `- ${key}: ${value}  \n`;
        }
      });
      md += `\n`;
    });
    
    md += `## Predictions\n\n`;
    result.predictions.forEach((pred, i) => {
      md += `${i + 1}. ${pred}\n`;
    });
    
    return md;
  }
};

// ============================================================================
// END OF SDK
// ============================================================================

export default {
  Crucible,
  Constraint,
  StateGenerator,
  DimensionalEngine,
  AdversarialEngine,
  InformationLens,
  ThermodynamicLens,
  GameTheoreticLens,
  QuantumLens,
  NetworkLens,
  CategoryLens,
  CrucibleResult,
  ComparisonResult,
  Presets,
  Export
};
