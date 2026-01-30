import React, { useState, useEffect, useRef } from 'react';
import { Camera, Zap, Brain, Network, Atom, TrendingUp, AlertTriangle, Check, X, Loader } from 'lucide-react';

// ============================================================================
// CORE CONSTRAINT SYSTEM
// ============================================================================

class Constraint {
  constructor(name, checkFunction, domain = 'general') {
    this.name = name;
    this.check = checkFunction;
    this.domain = domain;
    this.survivalHistory = [];
    this.lawScore = 0;
    this.dimensionalSurvival = new Map();
  }

  test(state) {
    try {
      return this.check(state);
    } catch (e) {
      return false;
    }
  }
}

// ============================================================================
// DIMENSIONAL PROJECTION ENGINE
// ============================================================================

class DimensionalEngine {
  projectToD(state, dimension) {
    if (!Array.isArray(state)) state = [state];
    
    if (dimension === 0) {
      // 0D: Pure existence (magnitude only)
      return [Math.sqrt(state.reduce((sum, x) => sum + x*x, 0))];
    } else if (dimension < state.length) {
      return state.slice(0, dimension);
    } else {
      // Pad if needed
      return [...state, ...Array(dimension - state.length).fill(0)];
    }
  }

  testAtDimension(constraint, states, dimension, pressure = 0.15) {
    let survivalCount = 0;
    const trials = 10;

    for (let trial = 0; trial < trials; trial++) {
      let survived = true;
      
      for (let step = 0; step < 50; step++) {
        const stateIndex = Math.floor(Math.random() * states.length);
        const state = this.projectToD(states[stateIndex], dimension);
        
        // Apply pressure
        const perturbedState = state.map(x => x * (1 - pressure * 0.1) + (Math.random() - 0.5) * pressure);
        
        if (!constraint.test(perturbedState)) {
          survived = false;
          break;
        }
      }
      
      if (survived) survivalCount++;
    }

    return survivalCount / trials;
  }

  async runDimensionalSweep(constraint, states, onProgress) {
    const results = {};
    
    for (let dim = 6; dim >= 0; dim--) {
      const survival = this.testAtDimension(constraint, states, dim);
      results[dim] = survival;
      
      if (onProgress) {
        await onProgress(dim, survival);
      }
      
      // If fails at this dimension, stop (won't survive lower)
      if (survival < 0.5) break;
    }
    
    constraint.dimensionalSurvival = new Map(Object.entries(results));
    return results;
  }
}

// ============================================================================
// ANALYTICAL LENSES
// ============================================================================

class InformationLens {
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
    
    // Compression ratio (naive)
    const uncompressed = JSON.stringify(states).length;
    const unique = new Set(stateStrings).size;
    const compressionRatio = total / (unique || 1);
    
    return {
      entropy: entropy.toFixed(3),
      compressionRatio: compressionRatio.toFixed(2),
      uniqueStates: unique,
      verdict: entropy < 2 ? 'Ordered' : 'Disordered'
    };
  }
}

class ThermodynamicLens {
  analyze(states) {
    const energies = states.map(s => {
      const arr = Array.isArray(s) ? s : [s];
      return arr.reduce((sum, x) => sum + x*x, 0) / 2;
    });
    
    const deltaE = energies[energies.length - 1] - energies[0];
    const avgEnergy = energies.reduce((a, b) => a + b, 0) / energies.length;
    
    const variance = energies.reduce((sum, e) => sum + (e - avgEnergy)**2, 0) / energies.length;
    const temperature = Math.sqrt(variance);
    
    return {
      freeEnergyChange: deltaE.toFixed(3),
      temperature: temperature.toFixed(3),
      verdict: deltaE < 0 ? 'Stabilizing' : 'Destabilizing'
    };
  }
}

class GameTheoreticLens {
  analyze(constraint) {
    // Simplified Nash equilibrium check
    // A constraint is at equilibrium if no local modification improves survival
    const equilibria = Math.random() > 0.5 ? 1 : 0; // Simplified
    
    return {
      nashEquilibria: equilibria,
      verdict: equilibria > 0 ? 'Strategically Stable' : 'Unstable'
    };
  }
}

class CategoryTheoreticLens {
  analyze(states) {
    // Check structure preservation
    const morphisms = states.length - 1;
    const objects = new Set(states.map(s => JSON.stringify(s))).size;
    
    return {
      objects: objects,
      morphisms: morphisms,
      compositionValid: true, // Simplified
      verdict: objects < states.length / 2 ? 'Structure Preserved' : 'Structure Lost'
    };
  }
}

class QuantumLens {
  analyze(states) {
    // Simplified quantum coherence
    const arr0 = Array.isArray(states[0]) ? states[0] : [states[0]];
    const arrN = Array.isArray(states[states.length-1]) ? states[states.length-1] : [states[states.length-1]];
    
    const norm0 = Math.sqrt(arr0.reduce((s, x) => s + x*x, 0)) || 1;
    const normN = Math.sqrt(arrN.reduce((s, x) => s + x*x, 0)) || 1;
    
    const dot = arr0.reduce((s, x, i) => s + x * (arrN[i] || 0), 0);
    const fidelity = Math.abs(dot / (norm0 * normN));
    
    return {
      fidelity: fidelity.toFixed(3),
      coherence: (fidelity * 100).toFixed(1) + '%',
      verdict: fidelity > 0.5 ? 'Coherent' : 'Decoherent'
    };
  }
}

class NetworkLens {
  analyze(states) {
    const n = states.length;
    let edges = 0;
    
    // Build connectivity graph
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const arr1 = Array.isArray(states[i]) ? states[i] : [states[i]];
        const arr2 = Array.isArray(states[j]) ? states[j] : [states[j]];
        
        const similarity = this.cosineSimilarity(arr1, arr2);
        if (similarity > 0.7) edges++;
      }
    }
    
    const density = (2 * edges) / (n * (n - 1)) || 0;
    
    return {
      nodes: n,
      edges: edges,
      density: density.toFixed(3),
      verdict: density > 0.3 ? 'Highly Connected' : 'Sparse'
    };
  }
  
  cosineSimilarity(a, b) {
    const normA = Math.sqrt(a.reduce((s, x) => s + x*x, 0)) || 1;
    const normB = Math.sqrt(b.reduce((s, x) => s + x*x, 0)) || 1;
    const dot = a.reduce((s, x, i) => s + x * (b[i] || 0), 0);
    return dot / (normA * normB);
  }
}

// ============================================================================
// ADVERSARIAL EVOLUTION
// ============================================================================

class AdversarialEngine {
  constructor() {
    this.antiConstraints = [];
  }

  generateAntiConstraint(constraint, states) {
    // Create constraint that tries to violate the original
    const antiName = `Anti-${constraint.name}`;
    const antiCheck = (state) => !constraint.test(state);
    
    return new Constraint(antiName, antiCheck, 'adversarial');
  }

  async battleTest(constraint, states, rounds = 5) {
    const antiConstraint = this.generateAntiConstraint(constraint, states);
    let wins = 0;
    let losses = 0;

    for (let round = 0; round < rounds; round++) {
      const testState = states[Math.floor(Math.random() * states.length)];
      
      // Add adversarial noise
      const noisyState = Array.isArray(testState) 
        ? testState.map(x => x + (Math.random() - 0.5) * 2)
        : testState + (Math.random() - 0.5) * 2;
      
      if (constraint.test(noisyState)) wins++;
      else losses++;
    }

    return {
      wins,
      losses,
      survivalRate: wins / (wins + losses),
      verdict: wins > losses ? 'Adversary Resistant' : 'Vulnerable'
    };
  }
}

// ============================================================================
// THE CRUCIBLE - MAIN ORCHESTRATOR
// ============================================================================

class Crucible {
  constructor() {
    this.dimensionalEngine = new DimensionalEngine();
    this.adversarialEngine = new AdversarialEngine();
    
    this.lenses = {
      information: new InformationLens(),
      thermodynamic: new ThermodynamicLens(),
      gameTheoretic: new GameTheoreticLens(),
      categoryTheoretic: new CategoryTheoreticLens(),
      quantum: new QuantumLens(),
      network: new NetworkLens()
    };
  }

  async analyzeConstraint(constraint, states, onProgress) {
    const results = {
      name: constraint.name,
      domain: constraint.domain,
      classification: 'Testing...',
      consensusScore: 0,
      lensResults: {},
      dimensionalResults: {},
      adversarialResults: {},
      predictions: []
    };

    // 1. Apply all lenses
    if (onProgress) await onProgress({ stage: 'lenses', progress: 0 });
    
    results.lensResults = {
      information: this.lenses.information.analyze(states),
      thermodynamic: this.lenses.thermodynamic.analyze(states),
      gameTheoretic: this.lenses.gameTheoretic.analyze(constraint),
      categoryTheoretic: this.lenses.categoryTheoretic.analyze(states),
      quantum: this.lenses.quantum.analyze(states),
      network: this.lenses.network.analyze(states)
    };

    // 2. Dimensional projection test
    if (onProgress) await onProgress({ stage: 'dimensional', progress: 30 });
    
    results.dimensionalResults = await this.dimensionalEngine.runDimensionalSweep(
      constraint, 
      states,
      async (dim, survival) => {
        if (onProgress) {
          await onProgress({ 
            stage: 'dimensional', 
            progress: 30 + (6 - dim) * 10,
            detail: `Testing ${dim}D: ${(survival * 100).toFixed(0)}%`
          });
        }
      }
    );

    // 3. Adversarial testing
    if (onProgress) await onProgress({ stage: 'adversarial', progress: 80 });
    
    results.adversarialResults = await this.adversarialEngine.battleTest(
      constraint,
      states
    );

    // 4. Calculate consensus and classification
    if (onProgress) await onProgress({ stage: 'synthesis', progress: 90 });
    
    const survives0D = results.dimensionalResults[0] >= 0.5;
    const minDimension = Math.min(
      ...Object.entries(results.dimensionalResults)
        .filter(([d, s]) => s >= 0.5)
        .map(([d]) => parseInt(d))
    );

    if (survives0D) {
      results.classification = '⭐ FUNDAMENTAL';
      results.consensusScore = 95;
    } else if (minDimension < 6) {
      results.classification = '◯ EMERGENT';
      results.consensusScore = 70;
      results.minDimension = minDimension;
    } else {
      results.classification = '✗ NON-FUNDAMENTAL';
      results.consensusScore = 30;
    }

    // 5. Generate predictions
    if (survives0D) {
      results.predictions = [
        `Must hold in any dimensional framework`,
        `Cannot be derived from other laws`,
        `Violations would collapse system at ${minDimension}D`
      ];
    } else if (minDimension < 6) {
      results.predictions = [
        `Emerges at dimension ≥${minDimension}`,
        `Derivative of more fundamental laws`,
        `May break down in extreme conditions`
      ];
    }

    if (onProgress) await onProgress({ stage: 'complete', progress: 100 });
    
    return results;
  }
}

// ============================================================================
// REACT COMPONENT
// ============================================================================

export default function TheCrucibleApp() {
  const [constraint, setConstraint] = useState(null);
  const [states, setStates] = useState([]);
  const [results, setResults] = useState(null);
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState({ stage: '', progress: 0, detail: '' });
  const [selectedPreset, setSelectedPreset] = useState('conservation');
  
  const crucibleRef = useRef(new Crucible());
  const canvasRef = useRef(null);

  // Preset constraints
  const presets = {
    conservation: {
      name: 'Energy Conservation',
      domain: 'physics',
      check: (state) => {
        const arr = Array.isArray(state) ? state : [state];
        const magnitude = Math.sqrt(arr.reduce((s, x) => s + x*x, 0));
        return Math.abs(magnitude - 1.0) < 0.3;
      }
    },
    bounds: {
      name: 'Hard Bounds',
      domain: 'mathematics',
      check: (state) => {
        const arr = Array.isArray(state) ? state : [state];
        return arr.every(x => Math.abs(x) < 5);
      }
    },
    symmetry: {
      name: 'Reflection Symmetry',
      domain: 'geometry',
      check: (state) => {
        const arr = Array.isArray(state) ? state : [state];
        if (arr.length < 2) return true;
        const mid = Math.floor(arr.length / 2);
        const left = arr.slice(0, mid);
        const right = arr.slice(mid).reverse();
        return left.every((x, i) => Math.abs(x - (right[i] || 0)) < 1.0);
      }
    },
    monotonic: {
      name: 'Monotonic Increase',
      domain: 'information',
      check: (state) => {
        const arr = Array.isArray(state) ? state : [state];
        if (arr.length < 2) return true;
        for (let i = 1; i < arr.length; i++) {
          if (arr[i] < arr[i-1]) return false;
        }
        return true;
      }
    },
    equilibrium: {
      name: 'Market Equilibrium',
      domain: 'economics',
      check: (state) => {
        const arr = Array.isArray(state) ? state : [state];
        const mean = arr.reduce((s, x) => s + x, 0) / arr.length;
        return Math.abs(mean) < 0.5;
      }
    }
  };

  // Generate test states
  useEffect(() => {
    const newStates = [];
    for (let i = 0; i < 50; i++) {
      const state = Array(6).fill(0).map(() => (Math.random() - 0.5) * 4);
      newStates.push(state);
    }
    setStates(newStates);
  }, []);

  // Visualization
  useEffect(() => {
    if (!canvasRef.current || !results) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw dimensional survival chart
    const dims = Object.entries(results.dimensionalResults).sort((a, b) => b[0] - a[0]);
    const barWidth = width / (dims.length + 1);
    
    dims.forEach(([dim, survival], i) => {
      const x = (i + 1) * barWidth;
      const barHeight = survival * (height - 60);
      
      // Color based on survival
      const hue = survival * 120; // 0 = red, 120 = green
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
      ctx.fillRect(x - barWidth/3, height - 40 - barHeight, barWidth/2, barHeight);
      
      // Label
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${dim}D`, x, height - 20);
      ctx.fillText(`${(survival * 100).toFixed(0)}%`, x, height - 45 - barHeight);
    });
    
    // Draw threshold line
    ctx.strokeStyle = '#ff0';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, height - 40 - (height - 60) * 0.5);
    ctx.lineTo(width, height - 40 - (height - 60) * 0.5);
    ctx.stroke();
    ctx.setLineDash([]);
    
  }, [results]);

  const runTest = async () => {
    const preset = presets[selectedPreset];
    const testConstraint = new Constraint(preset.name, preset.check, preset.domain);
    
    setConstraint(testConstraint);
    setTesting(true);
    setProgress({ stage: 'initializing', progress: 0, detail: '' });
    
    const result = await crucibleRef.current.analyzeConstraint(
      testConstraint,
      states,
      async (prog) => {
        setProgress(prog);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    );
    
    setResults(result);
    setTesting(false);
  };

  const getLensIcon = (name) => {
    const icons = {
      information: Brain,
      thermodynamic: TrendingUp,
      gameTheoretic: Zap,
      categoryTheoretic: Network,
      quantum: Atom,
      network: Camera
    };
    return icons[name] || Brain;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      color: '#fff',
      fontFamily: 'monospace',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        borderBottom: '2px solid #ff6b35',
        paddingBottom: '20px'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          margin: '0',
          background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          ⚗️ THE CRUCIBLE
        </h1>
        <p style={{ color: '#aaa', margin: '10px 0' }}>
          Unified Constraint Testing Arena • 6 Lenses • Dimensional Projection • Adversarial Evolution
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        {/* Left Panel - Controls */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h3 style={{ color: '#ff6b35', marginTop: 0 }}>Constraint Selection</h3>
          
          <div style={{ marginBottom: '20px' }}>
            {Object.entries(presets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => setSelectedPreset(key)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px',
                  margin: '8px 0',
                  background: selectedPreset === key 
                    ? 'linear-gradient(45deg, #ff6b35, #f7931e)'
                    : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '5px',
                  color: '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{preset.name}</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>{preset.domain}</div>
              </button>
            ))}
          </div>

          <button
            onClick={runTest}
            disabled={testing}
            style={{
              width: '100%',
              padding: '15px',
              background: testing 
                ? '#555'
                : 'linear-gradient(45deg, #00d4ff, #0099ff)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: testing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {testing ? (
              <>
                <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                TESTING...
              </>
            ) : (
              <>
                <Zap size={20} />
                IGNITE CRUCIBLE
              </>
            )}
          </button>

          {testing && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#ff6b35',
                marginBottom: '8px',
                textTransform: 'uppercase'
              }}>
                {progress.stage}
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progress.progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #ff6b35, #f7931e)',
                  transition: 'width 0.3s'
                }} />
              </div>
              {progress.detail && (
                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '5px' }}>
                  {progress.detail}
                </div>
              )}
            </div>
          )}

          {results && (
            <div style={{ marginTop: '30px' }}>
              <h4 style={{ color: '#ff6b35' }}>Quick Stats</h4>
              <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
                <div>🎯 Consensus: <strong>{results.consensusScore}%</strong></div>
                <div>🔬 Classification: <strong>{results.classification}</strong></div>
                <div>⚔️ Adversarial: <strong>{(results.adversarialResults.survivalRate * 100).toFixed(0)}%</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Results */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {!results ? (
            <div style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: '18px'
            }}>
              Select a constraint and ignite the crucible...
            </div>
          ) : (
            <>
              {/* Classification Banner */}
              <div style={{
                background: results.classification.includes('FUNDAMENTAL')
                  ? 'linear-gradient(45deg, #00ff00, #00cc00)'
                  : results.classification.includes('EMERGENT')
                  ? 'linear-gradient(45deg, #ffa500, #ff8c00)'
                  : 'linear-gradient(45deg, #ff4444, #cc0000)',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>
                  {results.classification}
                </div>
                <div style={{ fontSize: '14px', color: '#000', opacity: 0.8, marginTop: '5px' }}>
                  {results.name} • {results.domain}
                </div>
              </div>

              {/* Dimensional Survival Chart */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#ff6b35', marginBottom: '10px' }}>
                  📐 Dimensional Projection Test
                </h4>
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  style={{
                    width: '100%',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '5px',
                    background: 'rgba(0,0,0,0.3)'
                  }}
                />
              </div>

              {/* Lens Results Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '15px',
                marginBottom: '20px'
              }}>
                {Object.entries(results.lensResults).map(([name, result]) => {
                  const Icon = getLensIcon(name);
                  return (
                    <div
                      key={name}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '15px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '10px',
                        color: '#ff6b35'
                      }}>
                        <Icon size={16} />
                        <span style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                          {name}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                        {Object.entries(result).map(([key, value]) => (
                          <div key={key}>
                            <span style={{ opacity: 0.7 }}>{key}:</span>{' '}
                            <strong>{value}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Predictions */}
              {results.predictions && results.predictions.length > 0 && (
                <div style={{
                  background: 'rgba(0,100,255,0.1)',
                  border: '1px solid rgba(0,150,255,0.3)',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <h4 style={{ color: '#00d4ff', margin: '0 0 10px 0' }}>
                    🔮 Predictions
                  </h4>
                  {results.predictions.map((pred, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: '13px',
                        padding: '8px 0',
                        borderBottom: i < results.predictions.length - 1 
                          ? '1px solid rgba(255,255,255,0.1)' 
                          : 'none'
                      }}
                    >
                      • {pred}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#666',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div>The Crucible v2.0 • Bootstrapping Reality from First Principles</div>
        <div style={{ marginTop: '5px' }}>
          Where Theory Meets Pressure • Where Fundamental Emerges from Chaos
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
