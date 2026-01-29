// rcf.go - Reality Constraint Fuzzer
package main

import (
	"fmt"
	"math"
	"math/rand"
	"time"
)

type State struct {
	Vector []float64
	Intent float64
	Memory float64
}

func NewState(vector []float64, intent, memory float64) *State {
	return &State{Vector: vector, Intent: intent, Memory: memory}
}

func (s *State) Magnitude() float64 {
	sum := 0.0
	for _, v := range s.Vector {
		sum += v * v
	}
	return math.Sqrt(sum)
}

func (s *State) Clone() *State {
	vec := make([]float64, len(s.Vector))
	copy(vec, s.Vector)
	return &State{Vector: vec, Intent: s.Intent, Memory: s.Memory}
}

type Constraint struct {
	Name           string
	Check          func(float64) bool
	Persona        string
	Adaptive       bool
	ViolationCount int
}

func NewConstraint(name string, check func(float64) bool, persona string, adaptive bool) *Constraint {
	return &Constraint{
		Name:           name,
		Check:          check,
		Persona:        persona,
		Adaptive:       adaptive,
		ViolationCount: 0,
	}
}

func (c *Constraint) Evaluate(value float64) bool {
	ok := c.Check(value)
	if !ok {
		c.ViolationCount++
	}
	return ok
}

func (c *Constraint) Voice() string {
	voices := map[string]string{
		"Judge":     "The Stern Judge: 'Order must be kept.'",
		"Trickster": "The Trickster: 'Boundaries are illusions.'",
		"Guardian":  "The Guardian: 'I protect the fragile edge.'",
		"Neutral":   "Constraint speaks without drama.",
	}
	if v, ok := voices[c.Persona]; ok {
		return v
	}
	return voices["Neutral"]
}

type HardenedNet struct {
	Constraints []*Constraint
	Limit       float64
	FatigueMap  map[int]int
}

func NewHardenedNet(constraints []*Constraint, limit float64) *HardenedNet {
	return &HardenedNet{
		Constraints: constraints,
		Limit:       limit,
		FatigueMap:  make(map[int]int),
	}
}

func (n *HardenedNet) Tension(value, drift float64) (int, string) {
	for _, c := range n.Constraints {
		if !c.Evaluate(value) {
			return -1, fmt.Sprintf("Collision → %s", c.Voice())
		}
	}

	sector := int(math.Round(value * 10))
	n.FatigueMap[sector]++

	if n.FatigueMap[sector] > 5 && math.Abs(value-math.Round(value)) < 0.05 {
		return -2, "Crystallization → 'The familiar became brittle.'"
	}

	return 1, ""
}

type ContractingNet struct {
	Base         *HardenedNet
	GlobalStress float64
}

func NewContractingNet(constraints []*Constraint, limit float64) *ContractingNet {
	return &ContractingNet{
		Base:         NewHardenedNet(constraints, limit),
		GlobalStress: 0.0,
	}
}

func (n *ContractingNet) Tension(value, drift float64) (int, string) {
	n.GlobalStress += 0.02 + math.Abs(drift) + 0.01
	effectiveLimit := n.Base.Limit - n.GlobalStress

	if math.Abs(value) >= effectiveLimit || effectiveLimit <= 0.1 {
		return -3, "Global Collapse → 'The envelope shrank to silence.'"
	}

	return n.Base.Tension(value, drift)
}

// Spike Functions
func staticFn(s *State) *State {
	vec := make([]float64, len(s.Vector))
	for i, v := range s.Vector {
		vec[i] = v * 0.9
	}
	return NewState(vec, s.Intent+0.1, s.Memory)
}

func entropyWeatherFn(s *State, storm bool) *State {
	scale := 0.02
	if storm {
		scale = 0.08
	}

	vec := make([]float64, len(s.Vector))
	for i, v := range s.Vector {
		vec[i] = v + rand.NormFloat64()*scale
	}

	intentDelta := 0.1
	if storm {
		intentDelta = 0.3
	}

	return NewState(vec, s.Intent+intentDelta, s.Memory)
}

func resonanceFn(s *State) *State {
	factor := 1.01 + 0.01*math.Sin(s.Intent)
	vec := make([]float64, len(s.Vector))
	for i, v := range s.Vector {
		vec[i] = v * factor
	}
	return NewState(vec, s.Intent+0.5, s.Memory)
}

func anchorFn(s *State) *State {
	vec := make([]float64, len(s.Vector))
	for i, v := range s.Vector {
		vec[i] = v * 0.5
	}
	return NewState(vec, s.Intent-1.0, s.Memory)
}

func memoryFn(s *State) *State {
	vec := make([]float64, len(s.Vector))
	copy(vec, s.Vector)
	return NewState(vec, s.Intent, s.Memory+0.2)
}

func intentPressureFn(s *State) *State {
	vec := make([]float64, len(s.Vector))
	for i, v := range s.Vector {
		vec[i] = v + s.Intent*0.01
	}
	return NewState(vec, s.Intent, s.Memory)
}

type TransformationEngine struct{}

func (e *TransformationEngine) Transform(s *State) (*State, float64) {
	sum := 0.0
	for _, v := range s.Vector {
		sum += v
	}
	mean := sum / float64(len(s.Vector))
	drift := (0.5 - math.Mod(mean, 1.0)) * 0.015

	vec := make([]float64, len(s.Vector))
	for i, v := range s.Vector {
		vec[i] = v + drift
	}

	return NewState(vec, s.Intent, s.Memory), drift
}

type SimulationND struct {
	State      *State
	Net        *ContractingNet
	Engine     *TransformationEngine
	Frames     int
	History    map[string][]float64
	PoeticLog  []string
	Survivors  []*State
}

func NewSimulationND(dimensions int, constraints []*Constraint, limit float64, frames int) *SimulationND {
	vec := make([]float64, dimensions)
	for i := range vec {
		vec[i] = rand.Float64()*1.0 + 0.5
	}

	return &SimulationND{
		State:  NewState(vec, 0.0, 0.0),
		Net:    NewContractingNet(constraints, limit),
		Engine: &TransformationEngine{},
		Frames: frames,
		History: map[string][]float64{
			"volley":    {},
			"magnitude": {},
			"intent":    {},
			"memory":    {},
		},
		PoeticLog: []string{},
		Survivors: []*State{},
	}
}

func (sim *SimulationND) Step(volley int) (int, string) {
	storm := volley%20 == 0

	sim.State = staticFn(sim.State)
	sim.State = entropyWeatherFn(sim.State, storm)

	transformed, drift := sim.Engine.Transform(sim.State)
	sim.State = transformed

	if volley%4 == 0 {
		sim.State = resonanceFn(sim.State)
	}
	if volley > 30 {
		sim.State = anchorFn(sim.State)
	}
	if volley%5 == 0 {
		sim.State = memoryFn(sim.State)
	}
	if volley%7 == 0 {
		sim.State = intentPressureFn(sim.State)
	}

	code, message := sim.Net.Tension(sim.State.Magnitude(), drift)

	sim.History["volley"] = append(sim.History["volley"], float64(volley))
	sim.History["magnitude"] = append(sim.History["magnitude"], sim.State.Magnitude())
	sim.History["intent"] = append(sim.History["intent"], sim.State.Intent)
	sim.History["memory"] = append(sim.History["memory"], sim.State.Memory)

	if message != "" {
		sim.PoeticLog = append(sim.PoeticLog, message)
	}

	return code, message
}

func (sim *SimulationND) Run() {
	collapsed := false

	for volley := 0; volley < sim.Frames; volley++ {
		code, message := sim.Step(volley)

		if code < 0 {
			fmt.Printf("[!] Terminated at volley %d: %s\n", volley, message)
			collapsed = true
			break
		}
	}

	if !collapsed {
		fmt.Println("✓ Stable run achieved – 'The dance continued without collapse.'")
		sim.Survivors = append(sim.Survivors, sim.State.Clone())
	}

	fmt.Println("\n--- Emergent Narrative ---")
	for _, line := range sim.PoeticLog {
		fmt.Println(line)
	}

	if len(sim.Survivors) > 0 {
		fmt.Println("\n--- Survivor Genealogy ---")
		for i, s := range sim.Survivors {
			fmt.Printf("Ancestor %d: Magnitude=%.3f, Intent=%.2f, Memory=%.2f\n",
				i+1, s.Magnitude(), s.Intent, s.Memory)
		}
	}

	fmt.Println("\n--- Commentary ---")
	if len(sim.PoeticLog) > 0 {
		fmt.Println("Alan Watts voice: 'Collapse was not failure, but revelation. The system discovered itself.'")
	} else {
		fmt.Println("Alan Watts voice: 'No collapse today. Stability is also discovery.'")
	}
}

func main() {
	rand.Seed(time.Now().UnixNano())

	fmt.Println(strings.Repeat("=", 60))
	fmt.Println("Reality Constraint Fuzzer (Polyform Engine)")
	fmt.Println(strings.Repeat("=", 60))

	constraints := []*Constraint{
		NewConstraint("HardBounds", func(x float64) bool {
			return math.Abs(x) > 0.1 && math.Abs(x) < 5.0
		}, "Judge", false),
		NewConstraint("AntiInteger", func(x float64) bool {
			return math.Abs(x-math.Round(x)) > 0.05
		}, "Trickster", false),
	}

	sim := NewSimulationND(3, constraints, 5.0, 200)
	sim.Run()
}