// RCF.js - Reality Constraint Fuzzer
// Node.js/Browser compatible

class State {
  constructor(vector, intent = 0.0, memory = 0.0) {
    this.vector = vector;
    this.intent = intent;
    this.memory = memory;
  }

  magnitude() {
    return Math.sqrt(this.vector.reduce((sum, v) => sum + v * v, 0));
  }

  clone() {
    return new State([...this.vector], this.intent, this.memory);
  }
}

class Constraint {
  constructor(name, check, persona = "Neutral", adaptive = false) {
    this.name = name;
    this.check = check;
    this.persona = persona;
    this.adaptive = adaptive;
    this.violationCount = 0;
  }

  evaluate(value) {
    const ok = this.check(value);
    if (!ok) this.violationCount++;
    return ok;
  }

  adapt() {
    if (this.adaptive && this.violationCount > 3) {
      this.check = (x) => Math.abs(x) > 0.1 && Math.abs(x) < 4.5;
    }
  }

  voice() {
    const voices = {
      Judge: "The Stern Judge: 'Order must be kept.'",
      Trickster: "The Trickster: 'Boundaries are illusions.'",
      Guardian: "The Guardian: 'I protect the fragile edge.'",
      Neutral: "Constraint speaks without drama."
    };
    return voices[this.persona] || voices.Neutral;
  }
}

class HardenedNet {
  constructor(constraints, limit = 5.0) {
    this.constraints = constraints;
    this.limit = limit;
    this.fatigueMap = new Map();
  }

  tension(value, drift) {
    // Check constraints
    for (const c of this.constraints) {
      if (!c.evaluate(value)) {
        return { code: -1, message: `Collision → ${c.voice()}` };
      }
    }

    // Check fatigue
    const sector = Math.round(value * 10) / 10;
    const fatigue = this.fatigueMap.get(sector) || 0;
    this.fatigueMap.set(sector, fatigue + 1);

    if (fatigue > 5 && Math.abs(value - Math.round(value)) < 0.05) {
      return { code: -2, message: "Crystallization → 'The familiar became brittle.'" };
    }

    return { code: 1, message: null };
  }
}

class ContractingNet extends HardenedNet {
  constructor(constraints, limit = 5.0) {
    super(constraints, limit);
    this.globalStress = 0.0;
  }

  tension(value, drift) {
    this.globalStress += 0.02 + Math.abs(drift) + 0.01;
    const effectiveLimit = this.limit - this.globalStress;

    if (Math.abs(value) >= effectiveLimit || effectiveLimit <= 0.1) {
      return { code: -3, message: "Global Collapse → 'The envelope shrank to silence.'" };
    }

    return super.tension(value, drift);
  }
}

// Spike Functions
function staticFn(s) {
  return new State(
    s.vector.map(v => v * 0.9),
    s.intent + 0.1,
    s.memory
  );
}

function entropyWeatherFn(s, storm = false) {
  const scale = storm ? 0.08 : 0.02;
  return new State(
    s.vector.map(v => v + (Math.random() - 0.5) * 2 * scale),
    s.intent + (storm ? 0.3 : 0.1),
    s.memory
  );
}

function resonanceFn(s) {
  const factor = 1.01 + 0.01 * Math.sin(s.intent);
  return new State(
    s.vector.map(v => v * factor),
    s.intent + 0.5,
    s.memory
  );
}

function anchorFn(s) {
  return new State(
    s.vector.map(v => v * 0.5),
    s.intent - 1.0,
    s.memory
  );
}

function memoryFn(s) {
  return new State([...s.vector], s.intent, s.memory + 0.2);
}

function intentPressureFn(s) {
  return new State(
    s.vector.map(v => v + s.intent * 0.01),
    s.intent,
    s.memory
  );
}

class TransformationEngine {
  transform(s) {
    const mean = s.vector.reduce((a, b) => a + b, 0) / s.vector.length;
    const drift = (0.5 - (mean % 1)) * 0.015;
    return {
      state: new State(
        s.vector.map(v => v + drift),
        s.intent,
        s.memory
      ),
      drift
    };
  }
}

class SimulationND {
  constructor(dimensions = 3, constraints = [], limit = 5.0, frames = 200) {
    this.dimensions = dimensions;
    this.constraints = constraints;
    this.limit = limit;
    this.frames = frames;
    
    this.state = new State(
      Array.from({ length: dimensions }, () => Math.random() * 1.0 + 0.5),
      0.0,
      0.0
    );
    
    this.net = new ContractingNet(constraints, limit);
    this.engine = new TransformationEngine();
    
    this.history = {
      volley: [],
      magnitude: [],
      intent: [],
      memory: []
    };
    
    this.poeticLog = [];
    this.survivors = [];
  }

  step(volley) {
    const storm = volley % 20 === 0;
    
    this.state = staticFn(this.state);
    this.state = entropyWeatherFn(this.state, storm);
    
    const { state: transformed, drift } = this.engine.transform(this.state);
    this.state = transformed;
    
    if (volley % 4 === 0) this.state = resonanceFn(this.state);
    if (volley > 30) this.state = anchorFn(this.state);
    if (volley % 5 === 0) this.state = memoryFn(this.state);
    if (volley % 7 === 0) this.state = intentPressureFn(this.state);

    const result = this.net.tension(this.state.magnitude(), drift);
    
    this.history.volley.push(volley);
    this.history.magnitude.push(this.state.magnitude());
    this.history.intent.push(this.state.intent);
    this.history.memory.push(this.state.memory);

    if (result.message) {
      this.poeticLog.push(result.message);
    }

    return result;
  }

  run() {
    let collapsed = false;
    
    for (let volley = 0; volley < this.frames; volley++) {
      const result = this.step(volley);
      
      if (result.code < 0) {
        console.log(`[!] Terminated at volley ${volley}: ${result.message}`);
        collapsed = true;
        break;
      }
    }

    if (!collapsed) {
      console.log("✓ Stable run achieved – 'The dance continued without collapse.'");
      this.survivors.push(this.state.clone());
    }

    console.log("\n--- Emergent Narrative ---");
    this.poeticLog.forEach(line => console.log(line));

    if (this.survivors.length > 0) {
      console.log("\n--- Survivor Genealogy ---");
      this.survivors.forEach((s, i) => {
        console.log(`Ancestor ${i + 1}: Magnitude=${s.magnitude().toFixed(3)}, Intent=${s.intent.toFixed(2)}, Memory=${s.memory.toFixed(2)}`);
      });
    }

    console.log("\n--- Commentary ---");
    if (this.poeticLog.length > 0) {
      console.log("Alan Watts voice: 'Collapse was not failure, but revelation. The system discovered itself.'");
    } else {
      console.log("Alan Watts voice: 'No collapse today. Stability is also discovery.'");
    }

    return this.history;
  }
}

// Example usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { State, Constraint, SimulationND };
}

// Run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  console.log("=".repeat(60));
  console.log("Reality Constraint Fuzzer (Polyform Engine)");
  console.log("=".repeat(60));

  const constraints = [
    new Constraint("HardBounds", x => Math.abs(x) > 0.1 && Math.abs(x) < 5.0, "Judge"),
    new Constraint("AntiInteger", x => Math.abs(x - Math.round(x)) > 0.05, "Trickster")
  ];

  const sim = new SimulationND(3, constraints, 5.0, 200);
  sim.run();
}