// rcf.rs - Reality Constraint Fuzzer
use std::collections::HashMap;

#[derive(Clone, Debug)]
struct State {
    vector: Vec<f64>,
    intent: f64,
    memory: f64,
}

impl State {
    fn new(vector: Vec<f64>, intent: f64, memory: f64) -> Self {
        State { vector, intent, memory }
    }

    fn magnitude(&self) -> f64 {
        self.vector.iter().map(|v| v * v).sum::<f64>().sqrt()
    }
}

struct Constraint {
    name: String,
    check: Box<dyn Fn(f64) -> bool>,
    persona: String,
    adaptive: bool,
    violation_count: u32,
}

impl Constraint {
    fn new(name: &str, check: Box<dyn Fn(f64) -> bool>, persona: &str, adaptive: bool) -> Self {
        Constraint {
            name: name.to_string(),
            check,
            persona: persona.to_string(),
            adaptive,
            violation_count: 0,
        }
    }

    fn evaluate(&mut self, value: f64) -> bool {
        let ok = (self.check)(value);
        if !ok {
            self.violation_count += 1;
        }
        ok
    }

    fn voice(&self) -> String {
        match self.persona.as_str() {
            "Judge" => "The Stern Judge: 'Order must be kept.'".to_string(),
            "Trickster" => "The Trickster: 'Boundaries are illusions.'".to_string(),
            "Guardian" => "The Guardian: 'I protect the fragile edge.'".to_string(),
            _ => "Constraint speaks without drama.".to_string(),
        }
    }
}

struct HardenedNet {
    constraints: Vec<Constraint>,
    limit: f64,
    fatigue_map: HashMap<i32, u32>,
}

impl HardenedNet {
    fn new(constraints: Vec<Constraint>, limit: f64) -> Self {
        HardenedNet {
            constraints,
            limit,
            fatigue_map: HashMap::new(),
        }
    }

    fn tension(&mut self, value: f64, _drift: f64) -> (i32, Option<String>) {
        // Check constraints
        for c in &mut self.constraints {
            if !c.evaluate(value) {
                return (-1, Some(format!("Collision → {}", c.voice())));
            }
        }

        // Check fatigue
        let sector = (value * 10.0).round() as i32;
        let fatigue = self.fatigue_map.entry(sector).or_insert(0);
        *fatigue += 1;

        if *fatigue > 5 && (value - value.round()).abs() < 0.05 {
            return (-2, Some("Crystallization → 'The familiar became brittle.'".to_string()));
        }

        (1, None)
    }
}

struct ContractingNet {
    base: HardenedNet,
    global_stress: f64,
}

impl ContractingNet {
    fn new(constraints: Vec<Constraint>, limit: f64) -> Self {
        ContractingNet {
            base: HardenedNet::new(constraints, limit),
            global_stress: 0.0,
        }
    }

    fn tension(&mut self, value: f64, drift: f64) -> (i32, Option<String>) {
        self.global_stress += 0.02 + drift.abs() + 0.01;
        let effective_limit = self.base.limit - self.global_stress;

        if value.abs() >= effective_limit || effective_limit <= 0.1 {
            return (-3, Some("Global Collapse → 'The envelope shrank to silence.'".to_string()));
        }

        self.base.tension(value, drift)
    }
}

// Spike Functions
fn static_fn(s: &State) -> State {
    State::new(
        s.vector.iter().map(|v| v * 0.9).collect(),
        s.intent + 0.1,
        s.memory,
    )
}

fn entropy_weather_fn(s: &State, storm: bool) -> State {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    let scale = if storm { 0.08 } else { 0.02 };
    
    State::new(
        s.vector.iter().map(|v| v + rng.gen::<f64>() * 2.0 * scale - scale).collect(),
        s.intent + if storm { 0.3 } else { 0.1 },
        s.memory,
    )
}

fn resonance_fn(s: &State) -> State {
    let factor = 1.01 + 0.01 * s.intent.sin();
    State::new(
        s.vector.iter().map(|v| v * factor).collect(),
        s.intent + 0.5,
        s.memory,
    )
}

fn anchor_fn(s: &State) -> State {
    State::new(
        s.vector.iter().map(|v| v * 0.5).collect(),
        s.intent - 1.0,
        s.memory,
    )
}

fn memory_fn(s: &State) -> State {
    State::new(s.vector.clone(), s.intent, s.memory + 0.2)
}

fn intent_pressure_fn(s: &State) -> State {
    State::new(
        s.vector.iter().map(|v| v + s.intent * 0.01).collect(),
        s.intent,
        s.memory,
    )
}

struct TransformationEngine;

impl TransformationEngine {
    fn transform(&self, s: &State) -> (State, f64) {
        let mean: f64 = s.vector.iter().sum::<f64>() / s.vector.len() as f64;
        let drift = (0.5 - mean.rem_euclid(1.0)) * 0.015;
        
        (
            State::new(
                s.vector.iter().map(|v| v + drift).collect(),
                s.intent,
                s.memory,
            ),
            drift,
        )
    }
}

struct SimulationND {
    state: State,
    net: ContractingNet,
    engine: TransformationEngine,
    frames: usize,
    history: History,
    poetic_log: Vec<String>,
    survivors: Vec<State>,
}

struct History {
    volley: Vec<usize>,
    magnitude: Vec<f64>,
    intent: Vec<f64>,
    memory: Vec<f64>,
}

impl SimulationND {
    fn new(dimensions: usize, constraints: Vec<Constraint>, limit: f64, frames: usize) -> Self {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        
        let vector: Vec<f64> = (0..dimensions)
            .map(|_| rng.gen::<f64>() * 1.0 + 0.5)
            .collect();
        
        SimulationND {
            state: State::new(vector, 0.0, 0.0),
            net: ContractingNet::new(constraints, limit),
            engine: TransformationEngine,
            frames,
            history: History {
                volley: Vec::new(),
                magnitude: Vec::new(),
                intent: Vec::new(),
                memory: Vec::new(),
            },
            poetic_log: Vec::new(),
            survivors: Vec::new(),
        }
    }

    fn step(&mut self, volley: usize) -> (i32, Option<String>) {
        let storm = volley % 20 == 0;
        
        self.state = static_fn(&self.state);
        self.state = entropy_weather_fn(&self.state, storm);
        
        let (transformed, drift) = self.engine.transform(&self.state);
        self.state = transformed;
        
        if volley % 4 == 0 { self.state = resonance_fn(&self.state); }
        if volley > 30 { self.state = anchor_fn(&self.state); }
        if volley % 5 == 0 { self.state = memory_fn(&self.state); }
        if volley % 7 == 0 { self.state = intent_pressure_fn(&self.state); }

        let (code, message) = self.net.tension(self.state.magnitude(), drift);
        
        self.history.volley.push(volley);
        self.history.magnitude.push(self.state.magnitude());
        self.history.intent.push(self.state.intent);
        self.history.memory.push(self.state.memory);

        if let Some(msg) = &message {
            self.poetic_log.push(msg.clone());
        }

        (code, message)
    }

    fn run(&mut self) {
        let mut collapsed = false;
        
        for volley in 0..self.frames {
            let (code, message) = self.step(volley);
            
            if code < 0 {
                println!("[!] Terminated at volley {}: {}", volley, message.unwrap_or_default());
                collapsed = true;
                break;
            }
        }

        if !collapsed {
            println!("✓ Stable run achieved – 'The dance continued without collapse.'");
            self.survivors.push(self.state.clone());
        }

        println!("\n--- Emergent Narrative ---");
        for line in &self.poetic_log {
            println!("{}", line);
        }

        if !self.survivors.is_empty() {
            println!("\n--- Survivor Genealogy ---");
            for (i, s) in self.survivors.iter().enumerate() {
                println!("Ancestor {}: Magnitude={:.3}, Intent={:.2}, Memory={:.2}",
                    i + 1, s.magnitude(), s.intent, s.memory);
            }
        }

        println!("\n--- Commentary ---");
        if !self.poetic_log.is_empty() {
            println!("Alan Watts voice: 'Collapse was not failure, but revelation. The system discovered itself.'");
        } else {
            println!("Alan Watts voice: 'No collapse today. Stability is also discovery.'");
        }
    }
}

fn main() {
    println!("{}", "=".repeat(60));
    println!("Reality Constraint Fuzzer (Polyform Engine)");
    println!("{}", "=".repeat(60));

    let constraints = vec![
        Constraint::new(
            "HardBounds",
            Box::new(|x| x.abs() > 0.1 && x.abs() < 5.0),
            "Judge",
            false,
        ),
        Constraint::new(
            "AntiInteger",
            Box::new(|x| (x - x.round()).abs() > 0.05),
            "Trickster",
            false,
        ),
    ];

    let mut sim = SimulationND::new(3, constraints, 5.0, 200);
    sim.run();
}