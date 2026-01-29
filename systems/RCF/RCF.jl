# RCF.jl - Reality Constraint Fuzzer

using Random
using Statistics

mutable struct State
    vector::Vector{Float64}
    intent::Float64
    memory::Float64
end

magnitude(s::State) = sqrt(sum(s.vector.^2))

mutable struct Constraint
    name::String
    check::Function
    persona::String
    adaptive::Bool
    violation_count::Int
    
    Constraint(name, check, persona="Neutral", adaptive=false) = 
        new(name, check, persona, adaptive, 0)
end

function evaluate!(c::Constraint, value::Float64)
    ok = c.check(value)
    if !ok
        c.violation_count += 1
    end
    return ok
end

function voice(c::Constraint)
    voices = Dict(
        "Judge" => "The Stern Judge: 'Order must be kept.'",
        "Trickster" => "The Trickster: 'Boundaries are illusions.'",
        "Guardian" => "The Guardian: 'I protect the fragile edge.'",
        "Neutral" => "Constraint speaks without drama."
    )
    return get(voices, c.persona, voices["Neutral"])
end

mutable struct HardenedNet
    constraints::Vector{Constraint}
    limit::Float64
    fatigue_map::Dict{Float64, Int}
    
    HardenedNet(constraints, limit=5.0) = new(constraints, limit, Dict())
end

function tension!(net::HardenedNet, value::Float64, drift::Float64)
    # Check constraints
    for c in net.constraints
        if !evaluate!(c, value)
            return (-1, "Collision → $(voice(c))")
        end
    end
    
    # Check fatigue
    sector = round(value, digits=1)
    net.fatigue_map[sector] = get(net.fatigue_map, sector, 0) + 1
    
    if net.fatigue_map[sector] > 5 && abs(value - round(value)) < 0.05
        return (-2, "Crystallization → 'The familiar became brittle.'")
    end
    
    return (1, nothing)
end

mutable struct ContractingNet <: Any
    base::HardenedNet
    global_stress::Float64
    
    ContractingNet(constraints, limit=5.0) = new(HardenedNet(constraints, limit), 0.0)
end

function tension!(net::ContractingNet, value::Float64, drift::Float64)
    net.global_stress += 0.02 + abs(drift) + 0.01
    effective_limit = net.base.limit - net.global_stress
    
    if abs(value) >= effective_limit || effective_limit <= 0.1
        return (-3, "Global Collapse → 'The envelope shrank to silence.'")
    end
    
    return tension!(net.base, value, drift)
end

# Spike Functions
static_fn(s::State) = State(s.vector .* 0.9, s.intent + 0.1, s.memory)

function entropy_weather_fn(s::State, storm::Bool=false)
    scale = storm ? 0.08 : 0.02
    noise = randn(length(s.vector)) .* scale
    return State(s.vector .+ noise, s.intent + (storm ? 0.3 : 0.1), s.memory)
end

resonance_fn(s::State) = State(s.vector .* (1.01 + 0.01 * sin(s.intent)), s.intent + 0.5, s.memory)

anchor_fn(s::State) = State(s.vector .* 0.5, s.intent - 1.0, s.memory)

memory_fn(s::State) = State(copy(s.vector), s.intent, s.memory + 0.2)

intent_pressure_fn(s::State) = State(s.vector .+ s.intent * 0.01, s.intent, s.memory)

struct TransformationEngine end

function transform(::TransformationEngine, s::State)
    drift = (0.5 - mean(s.vector) % 1) * 0.015
    return (State(s.vector .+ drift, s.intent, s.memory), drift)
end

mutable struct SimulationND
    state::State
    net::ContractingNet
    engine::TransformationEngine
    frames::Int
    history::Dict{String, Vector}
    poetic_log::Vector{String}
    survivors::Vector{State}
end

function SimulationND(dimensions::Int=3, constraints::Vector{Constraint}=Constraint[], 
                      limit::Float64=5.0, frames::Int=200)
    vector = rand(dimensions) .+ 0.5
    state = State(vector, 0.0, 0.0)
    net = ContractingNet(constraints, limit)
    engine = TransformationEngine()
    
    history = Dict(
        "volley" => Int[],
        "magnitude" => Float64[],
        "intent" => Float64[],
        "memory" => Float64[]
    )
    
    SimulationND(state, net, engine, frames, history, String[], State[])
end

function step!(sim::SimulationND, volley::Int)
    storm = volley % 20 == 0
    
    sim.state = static_fn(sim.state)
    sim.state = entropy_weather_fn(sim.state, storm)
    sim.state, drift = transform(sim.engine, sim.state)
    
    if volley % 4 == 0
        sim.state = resonance_fn(sim.state)
    end
    if volley > 30
        sim.state = anchor_fn(sim.state)
    end
    if volley % 5 == 0
        sim.state = memory_fn(sim.state)
    end
    if volley % 7 == 0
        sim.state = intent_pressure_fn(sim.state)
    end
    
    code, message = tension!(sim.net, magnitude(sim.state), drift)
    
    push!(sim.history["volley"], volley)
    push!(sim.history["magnitude"], magnitude(sim.state))
    push!(sim.history["intent"], sim.state.intent)
    push!(sim.history["memory"], sim.state.memory)
    
    if !isnothing(message)
        push!(sim.poetic_log, message)
    end
    
    return (code, message)
end

function run!(sim::SimulationND)
    collapsed = false
    
    for volley in 0:sim.frames-1
        code, message = step!(sim, volley)
        
        if code < 0
            println("[!] Terminated at volley $volley: $message")
            collapsed = true
            break
        end
    end
    
    if !collapsed
        println("✓ Stable run achieved – 'The dance continued without collapse.'")
        push!(sim.survivors, deepcopy(sim.state))
    end
    
    println("\n--- Emergent Narrative ---")
    for line in sim.poetic_log
        println(line)
    end
    
    if !isempty(sim.survivors)
        println("\n--- Survivor Genealogy ---")
        for (i, s) in enumerate(sim.survivors)
            println("Ancestor $i: Magnitude=$(round(magnitude(s), digits=3)), " *
                   "Intent=$(round(s.intent, digits=2)), Memory=$(round(s.memory, digits=2))")
        end
    end
    
    println("\n--- Commentary ---")
    if !isempty(sim.poetic_log)
        println("Alan Watts voice: 'Collapse was not failure, but revelation. The system discovered itself.'")
    else
        println("Alan Watts voice: 'No collapse today. Stability is also discovery.'")
    end
    
    return sim.history
end

# Example usage
if abspath(PROGRAM_FILE) == @__FILE__
    println("=" ^ 60)
    println("Reality Constraint Fuzzer (Polyform Engine)")
    println("=" ^ 60)
    
    constraints = [
        Constraint("HardBounds", x -> 0.1 < abs(x) < 5.0, "Judge"),
        Constraint("AntiInteger", x -> abs(x - round(x)) > 0.05, "Trickster")
    ]
    
    sim = SimulationND(3, constraints, 5.0, 200)
    run!(sim)
end