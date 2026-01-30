/**
 * ============================================================================
 * RCF ADAPTER - Bridge between Crucible SDK and RCF Core
 * ============================================================================
 * 
 * This adapter allows the Crucible SDK to work seamlessly with existing
 * RCF implementations (Python, JavaScript, etc.)
 * 
 * Provides bidirectional translation:
 * - RCF Constraints ↔ Crucible Constraints
 * - RCF States ↔ Crucible States
 * - RCF Results ↔ Crucible Results
 */

import { Constraint, Crucible, StateGenerator } from '../../src/crucible-sdk.js';

// ============================================================================
// RCF TO CRUCIBLE ADAPTERS
// ============================================================================

/**
 * Converts RCF constraint format to Crucible Constraint
 * 
 * RCF Format (Python-like):
 * {
 *   name: "HardBounds",
 *   score_fn: (state) => ...,
 *   weight: 1.0
 * }
 * 
 * Crucible Format:
 * new Constraint(name, checkFn, options)
 */
export class RCFConstraintAdapter {
  /**
   * Convert RCF constraint to Crucible constraint
   * @param {Object} rcfConstraint - RCF constraint object
   * @returns {Constraint}
   */
  static toCrucible(rcfConstraint) {
    const { name, score_fn, weight = 1.0, domain = 'rcf' } = rcfConstraint;
    
    // RCF constraints return scores (higher = better)
    // Crucible constraints return boolean (pass/fail)
    // Convert by checking if score > threshold
    const checkFunction = (state) => {
      try {
        const score = score_fn(state);
        // Positive score = constraint satisfied
        return score > 0;
      } catch (e) {
        return false;
      }
    };
    
    return new Constraint(name, checkFunction, {
      domain,
      metadata: {
        rcfWeight: weight,
        originalScoreFn: score_fn,
        source: 'rcf'
      }
    });
  }
  
  /**
   * Convert Crucible constraint to RCF format
   * @param {Constraint} crucibleConstraint - Crucible constraint
   * @returns {Object} RCF constraint
   */
  static toRCF(crucibleConstraint) {
    return {
      name: crucibleConstraint.name,
      score_fn: (state) => {
        // Boolean to score: true = 1.0, false = -1.0
        return crucibleConstraint.test(state) ? 1.0 : -1.0;
      },
      weight: crucibleConstraint.metadata?.rcfWeight || 1.0
    };
  }
  
  /**
   * Batch convert RCF constraints
   * @param {Array} rcfConstraints - Array of RCF constraints
   * @returns {Array<Constraint>}
   */
  static batchToCrucible(rcfConstraints) {
    return rcfConstraints.map(c => this.toCrucible(c));
  }
}

/**
 * Converts RCF state format to Crucible state format
 * 
 * RCF State:
 * {
 *   id: "uuid",
 *   values: [1, 2, 3],
 *   intent: [0.1, 0.2, 0.3],
 *   history: [[...], [...]]
 * }
 * 
 * Crucible State:
 * [1, 2, 3] or {values: [...], metadata: {...}}
 */
export class RCFStateAdapter {
  /**
   * Convert RCF state to Crucible state
   * @param {Object} rcfState - RCF state object
   * @returns {Array|Object}
   */
  static toCrucible(rcfState, includeMetadata = false) {
    if (!rcfState) return [];
    
    // Simple mode: just return values array
    if (!includeMetadata) {
      return rcfState.values || [];
    }
    
    // Full mode: include all metadata
    return {
      values: rcfState.values || [],
      intent: rcfState.intent || [],
      history: rcfState.history || [],
      id: rcfState.id,
      metadata: {
        source: 'rcf',
        hasIntent: Boolean(rcfState.intent),
        hasHistory: Boolean(rcfState.history?.length)
      }
    };
  }
  
  /**
   * Convert Crucible state to RCF state
   * @param {Array|Object} crucibleState - Crucible state
   * @returns {Object} RCF state
   */
  static toRCF(crucibleState) {
    if (Array.isArray(crucibleState)) {
      return {
        id: this._generateId(),
        values: crucibleState,
        intent: new Array(crucibleState.length).fill(0),
        history: []
      };
    }
    
    return {
      id: crucibleState.id || this._generateId(),
      values: crucibleState.values || [],
      intent: crucibleState.intent || [],
      history: crucibleState.history || []
    };
  }
  
  /**
   * Batch convert states
   * @param {Array} rcfStates - Array of RCF states
   * @returns {Array}
   */
  static batchToCrucible(rcfStates, includeMetadata = false) {
    return rcfStates.map(s => this.toCrucible(s, includeMetadata));
  }
  
  static _generateId() {
    return Math.random().toString(16).substr(2, 8);
  }
}

/**
 * Converts RCF results to Crucible results and vice versa
 */
export class RCFResultAdapter {
  /**
   * Convert RCF simulation results to format usable by Crucible
   * @param {Object} rcfResult - RCF result object
   * @returns {Object}
   */
  static toCrucible(rcfResult) {
    return {
      trajectory: rcfResult.trajectory || [],
      scores: rcfResult.scores || [],
      violations: rcfResult.violations || [],
      finalState: rcfResult.final_state || rcfResult.trajectory?.slice(-1)[0],
      metadata: {
        source: 'rcf',
        steps: rcfResult.steps,
        collapsed: rcfResult.collapsed || false
      }
    };
  }
  
  /**
   * Extract ILK (Irreducible Law Kernel) from RCF results
   * @param {Object} rcfResult - RCF shovel/archaeology result
   * @returns {Object}
   */
  static extractILK(rcfResult) {
    return {
      fundamentalLaws: rcfResult.fundamental_laws || [],
      emergentLaws: rcfResult.emergent_laws || [],
      failedCandidates: rcfResult.failed_candidates || [],
      lawScores: rcfResult.lawscores || {},
      dimensionalSurvival: rcfResult.dimensional_survival || {}
    };
  }
}

// ============================================================================
// UNIFIED RCF-CRUCIBLE ENGINE
// ============================================================================

/**
 * Unified engine that can run both RCF and Crucible tests
 */
export class UnifiedRCFEngine {
  constructor(options = {}) {
    this.crucible = new Crucible(options);
    this.rcfMode = options.rcfMode || 'hybrid'; // 'rcf', 'crucible', 'hybrid'
  }
  
  /**
   * Test constraint using both RCF and Crucible methodologies
   * @param {Object|Constraint} constraint - Can be RCF or Crucible format
   * @param {Array} states - Can be RCF or Crucible format
   * @param {Object} options - Test options
   * @returns {Promise<Object>} Unified results
   */
  async test(constraint, states, options = {}) {
    // Convert to Crucible format
    const crucibleConstraint = constraint instanceof Constraint
      ? constraint
      : RCFConstraintAdapter.toCrucible(constraint);
    
    const crucibleStates = Array.isArray(states[0]) || typeof states[0] === 'number'
      ? states
      : RCFStateAdapter.batchToCrucible(states);
    
    // Run Crucible test
    const crucibleResult = await this.crucible.test(
      crucibleConstraint,
      crucibleStates,
      options
    );
    
    // If hybrid mode, also run RCF-style simulation
    if (this.rcfMode === 'hybrid' || this.rcfMode === 'rcf') {
      const rcfResult = await this.runRCFSimulation(constraint, states);
      
      // Merge results
      return this.mergeResults(crucibleResult, rcfResult);
    }
    
    return crucibleResult;
  }
  
  /**
   * Run RCF-style pressure simulation
   * @param {*} constraint - Constraint (any format)
   * @param {Array} states - Initial states
   * @returns {Promise<Object>}
   */
  async runRCFSimulation(constraint, states) {
    // This would call your existing RCF Python/JS implementation
    // For now, we'll simulate the interface
    
    const rcfConstraint = constraint instanceof Constraint
      ? RCFConstraintAdapter.toRCF(constraint)
      : constraint;
    
    const rcfStates = Array.isArray(states[0]) || typeof states[0] === 'number'
      ? states.map(s => RCFStateAdapter.toRCF(s))
      : states;
    
    // Simulate RCF pressure testing
    const trajectory = [];
    const scores = [];
    let currentState = rcfStates[0];
    
    for (let step = 0; step < 100; step++) {
      const score = rcfConstraint.score_fn(currentState);
      trajectory.push(currentState.values || currentState);
      scores.push(score);
      
      // Apply pressure
      currentState = this.applyPressure(currentState, 0.1);
    }
    
    return {
      trajectory,
      scores,
      final_state: currentState,
      collapsed: scores[scores.length - 1] < 0,
      steps: 100
    };
  }
  
  /**
   * Apply RCF-style pressure to state
   * @param {Object} state - State to modify
   * @param {number} pressure - Pressure amount
   * @returns {Object} Modified state
   */
  applyPressure(state, pressure) {
    const values = state.values || state;
    const perturbedValues = values.map(v => 
      v * (1 - pressure * 0.1) + (Math.random() - 0.5) * pressure
    );
    
    if (state.values) {
      return { ...state, values: perturbedValues };
    }
    return perturbedValues;
  }
  
  /**
   * Merge Crucible and RCF results
   * @param {Object} crucibleResult - Crucible result
   * @param {Object} rcfResult - RCF result
   * @returns {Object} Merged result
   */
  mergeResults(crucibleResult, rcfResult) {
    return {
      // Crucible results
      classification: crucibleResult.classification,
      consensusScore: crucibleResult.consensusScore,
      lensResults: crucibleResult.lensResults,
      dimensionalResults: crucibleResult.dimensionalResults,
      predictions: crucibleResult.predictions,
      
      // RCF results
      rcf: {
        trajectory: rcfResult.trajectory,
        scores: rcfResult.scores,
        collapsed: rcfResult.collapsed,
        finalScore: rcfResult.scores[rcfResult.scores.length - 1]
      },
      
      // Unified analysis
      unified: {
        survivalRate: rcfResult.collapsed ? 0 : 1,
        consistencyCheck: this.checkConsistency(crucibleResult, rcfResult),
        verdict: this.unifiedVerdict(crucibleResult, rcfResult)
      }
    };
  }
  
  /**
   * Check if Crucible and RCF agree
   * @param {Object} crucibleResult
   * @param {Object} rcfResult
   * @returns {Object}
   */
  checkConsistency(crucibleResult, rcfResult) {
    const crucibleSurvives = crucibleResult.isFundamental() || crucibleResult.isEmergent();
    const rcfSurvives = !rcfResult.collapsed;
    
    return {
      agree: crucibleSurvives === rcfSurvives,
      crucibleSays: crucibleSurvives ? 'SURVIVES' : 'FAILS',
      rcfSays: rcfSurvives ? 'SURVIVES' : 'COLLAPSES',
      confidence: crucibleSurvives === rcfSurvives ? 'HIGH' : 'CONFLICTED'
    };
  }
  
  /**
   * Generate unified verdict
   * @param {Object} crucibleResult
   * @param {Object} rcfResult
   * @returns {string}
   */
  unifiedVerdict(crucibleResult, rcfResult) {
    const consistency = this.checkConsistency(crucibleResult, rcfResult);
    
    if (!consistency.agree) {
      return 'CONFLICTED: Methods disagree - investigate further';
    }
    
    if (crucibleResult.isFundamental() && !rcfResult.collapsed) {
      return 'FUNDAMENTAL: Both methods confirm';
    }
    
    if (crucibleResult.isEmergent() && !rcfResult.collapsed) {
      return `EMERGENT: Requires ≥${crucibleResult.minDimension}D`;
    }
    
    return 'NON-FUNDAMENTAL: Both methods reject';
  }
}

// ============================================================================
// PYTHON BRIDGE (for calling Python RCF from JavaScript)
// ============================================================================

/**
 * Bridge to Python RCF implementation via child process or HTTP
 */
export class PythonRCFBridge {
  constructor(options = {}) {
    this.pythonPath = options.pythonPath || 'python3';
    this.rcfModulePath = options.rcfModulePath || '../../../Sages_Stone_Core/systems/RCF/RCF.py';
    this.mode = options.mode || 'subprocess'; // 'subprocess' or 'http'
  }
  
  /**
   * Call Python RCF implementation
   * @param {string} method - Python method to call
   * @param {Object} params - Parameters to pass
   * @returns {Promise<Object>}
   */
  async call(method, params) {
    if (this.mode === 'subprocess') {
      return this.callSubprocess(method, params);
    } else {
      return this.callHTTP(method, params);
    }
  }
  
  /**
   * Call via subprocess (Node.js only)
   * @param {string} method
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async callSubprocess(method, params) {
    // This would use child_process in Node.js
    // Example implementation:
    
    const pythonScript = `
import sys
import json
sys.path.append('${this.rcfModulePath}')
from RCF import *

params = json.loads('''${JSON.stringify(params)}''')
result = ${method}(**params)
print(json.dumps(result))
`;
    
    // In real implementation, would exec Python and capture output
    // For now, return mock
    console.log('Would execute Python:', method, params);
    return { status: 'mock', method, params };
  }
  
  /**
   * Call via HTTP server (universal)
   * @param {string} method
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async callHTTP(method, params) {
    // Assumes Python RCF is running as HTTP server
    const response = await fetch('http://localhost:5000/rcf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, params })
    });
    
    return response.json();
  }
  
  /**
   * Run full RCF simulation via Python
   * @param {Object} constraint - RCF constraint
   * @param {Array} states - Initial states
   * @returns {Promise<Object>}
   */
  async runSimulation(constraint, states) {
    return this.call('run_simulation', {
      constraint,
      states,
      steps: 100
    });
  }
  
  /**
   * Run shovel (archaeological dig)
   * @param {Array} seedConstraints - Seed constraints
   * @returns {Promise<Object>}
   */
  async runShovel(seedConstraints) {
    return this.call('dig', {
      seed_constraints: seedConstraints,
      auto_generate: true
    });
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick convert: RCF constraint → Crucible test
 */
export async function testRCFConstraint(rcfConstraint, rcfStates, options = {}) {
  const engine = new UnifiedRCFEngine();
  return engine.test(rcfConstraint, rcfStates, options);
}

/**
 * Import RCF archaeological results into Crucible
 */
export function importRCFArchaeology(rcfResults) {
  const ilk = RCFResultAdapter.extractILK(rcfResults);
  
  // Convert to Crucible constraints
  const fundamentalConstraints = ilk.fundamentalLaws.map(law => 
    RCFConstraintAdapter.toCrucible({
      name: law.name,
      score_fn: law.check_function,
      weight: law.lawscore
    })
  );
  
  return {
    fundamental: fundamentalConstraints,
    emergent: ilk.emergentLaws,
    failed: ilk.failedCandidates,
    ilk: ilk
  };
}

/**
 * Create hybrid test suite (both RCF and Crucible)
 */
export async function hybridTestSuite(constraints, states) {
  const engine = new UnifiedRCFEngine({ rcfMode: 'hybrid' });
  
  const results = [];
  for (const constraint of constraints) {
    const result = await engine.test(constraint, states);
    results.push(result);
  }
  
  return {
    results,
    summary: {
      total: results.length,
      fundamental: results.filter(r => r.classification === 'FUNDAMENTAL').length,
      emergent: results.filter(r => r.classification === 'EMERGENT').length,
      failed: results.filter(r => r.classification === 'NON-FUNDAMENTAL').length,
      conflicts: results.filter(r => !r.unified.consistencyCheck.agree).length
    }
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  RCFConstraintAdapter,
  RCFStateAdapter,
  RCFResultAdapter,
  UnifiedRCFEngine,
  PythonRCFBridge,
  testRCFConstraint,
  importRCFArchaeology,
  hybridTestSuite
};
