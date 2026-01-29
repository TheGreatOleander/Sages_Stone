// rcf.cpp - Reality Constraint Fuzzer
#include <iostream>
#include <vector>
#include <map>
#include <cmath>
#include <random>
#include <functional>
#include <memory>
#include <string>

class State {
public:
    std::vector<double> vector;
    double intent;
    double memory;
    
    State(const std::vector<double>& vec, double i = 0.0, double m = 0.0)
        : vector(vec), intent(i), memory(m) {}
    
    double magnitude() const {
        double sum = 0.0;
        for (double v : vector) sum += v * v;
        return std::sqrt(sum);
    }
};

class Constraint {
public:
    std::string name;
    std::function<bool(double)> check;
    std::string persona;
    bool adaptive;
    int violationCount;
    
    Constraint(const std::string& n, std::function<bool(double)> c, 
               const std::string& p = "Neutral", bool a = false)
        : name(n), check(c), persona(p), adaptive(a), violationCount(0) {}
    
    bool evaluate(double value) {
        bool ok = check(value);
        if (!ok) violationCount++;
        return ok;
    }
    
    std::string voice() const {
        if (persona == "Judge") return "The Stern Judge: 'Order must be kept.'";
        if (persona == "Trickster") return "The Trickster: 'Boundaries are illusions.'";
        if (persona == "Guardian") return "The Guardian: 'I protect the fragile edge.'";
        return "Constraint speaks without drama.";
    }
};

class HardenedNet {
protected:
    std::vector<std::shared_ptr<Constraint>> constraints;
    double limit;
    std::map<int, int> fatigueMap;
    
public:
    HardenedNet(const std::vector<std::shared_ptr<Constraint>>& cs, double l = 5.0)
        : constraints(cs), limit(l) {}
    
    virtual std::pair<int, std::string> tension(double value, double drift) {
        for (auto& c : constraints) {
            if (!c->evaluate(value)) {
                return {-1, "Collision → " + c->voice()};
            }
        }
        
        int sector = static_cast<int>(std::round(value * 10));
        fatigueMap[sector]++;
        
        if (fatigueMap[sector] > 5 && std::abs(value - std::round(value)) < 0.05) {
            return {-2, "Crystallization → 'The familiar became brittle.'"};
        }
        
        return {1, ""};
    }
};

class ContractingNet : public HardenedNet {
    double globalStress;
    
public:
    ContractingNet(const std::vector<std::shared_ptr<Constraint>>& cs, double l = 5.0)
        : HardenedNet(cs, l), globalStress(0.0) {}
    
    std::pair<int, std::string> tension(double value, double drift) override {
        globalStress += 0.02 + std::abs(drift) + 0.01;
        double effectiveLimit = limit - globalStress;
        
        if (std::abs(value) >= effectiveLimit || effectiveLimit <= 0.1) {
            return {-3, "Global Collapse → 'The envelope shrank to silence.'"};
        }
        
        return HardenedNet::tension(value, drift);
    }
};

// Spike Functions
State staticFn(const State& s) {
    std::vector<double> vec(s.vector.size());
    for (size_t i = 0; i < s.vector.size(); i++) {
        vec[i] = s.vector[i] * 0.9;
    }
    return State(vec, s.intent + 0.1, s.memory);
}

State entropyWeatherFn(const State& s, bool storm, std::mt19937& rng) {
    double scale = storm ? 0.08 : 0.02;
    std::normal_distribution<> dist(0.0, scale);
    
    std::vector<double> vec(s.vector.size());
    for (size_t i = 0; i < s.vector.size(); i++) {
        vec[i] = s.vector[i] + dist(rng);
    }
    
    return State(vec, s.intent + (storm ? 0.3 : 0.1), s.memory);
}

State resonanceFn(const State& s) {
    double factor = 1.01 + 0.01 * std::sin(s.intent);
    std::vector<double> vec(s.vector.size());
    for (size_t i = 0; i < s.vector.size(); i++) {
        vec[i] = s.vector[i] * factor;
    }
    return State(vec, s.intent + 0.5, s.memory);
}

State anchorFn(const State& s) {
    std::vector<double> vec(s.vector.size());
    for (size_t i = 0; i < s.vector.size(); i++) {
        vec[i] = s.vector[i] * 0.5;
    }
    return State(vec, s.intent - 1.0, s.memory);
}

State memoryFn(const State& s) {
    return State(s.vector, s.intent, s.memory + 0.2);
}

State intentPressureFn(const State& s) {
    std::vector<double> vec(s.vector.size());
    for (size_t i = 0; i < s.vector.size(); i++) {
        vec[i] = s.vector[i] + s.intent * 0.01;
    }
    return State(vec, s.intent, s.memory);
}

std::pair<State, double> transform(const State& s) {
    double sum = 0.0;
    for (double v : s.vector) sum += v;
    double mean = sum / s.vector.size();
    double drift = (0.5 - std::fmod(mean, 1.0)) * 0.015;
    
    std::vector<double> vec(s.vector.size());
    for (size_t i = 0; i < s.vector.size(); i++) {
        vec[i] = s.vector[i] + drift;
    }
    
    return {State(vec, s.intent, s.memory), drift};
}

class SimulationND {
    State state;
    ContractingNet net;
    int frames;
    std::mt19937 rng;
    std::vector<std::string> poeticLog;
    std::vector<State> survivors;
    
public:
    SimulationND(int dimensions, const std::vector<std::shared_ptr<Constraint>>& constraints,
                 double limit = 5.0, int f = 200)
        : net(constraints, limit), frames(f), rng(std::random_device{}()) {
        
        std::uniform_real_distribution<> dist(0.5, 1.5);
        std::vector<double> vec(dimensions);
        for (int i = 0; i < dimensions; i++) {
            vec[i] = dist(rng);
        }
        state = State(vec, 0.0, 0.0);
    }
    
    std::pair<int, std::string> step(int volley) {
        bool storm = volley % 20 == 0;
        
        state = staticFn(state);
        state = entropyWeatherFn(state, storm, rng);
        
        auto [transformed, drift] = transform(state);
        state = transformed;
        
        if (volley % 4 == 0) state = resonanceFn(state);
        if (volley > 30) state = anchorFn(state);
        if (volley % 5 == 0) state = memoryFn(state);
        if (volley % 7 == 0) state = intentPressureFn(state);
        
        auto [code, message] = net.tension(state.magnitude(), drift);
        
        if (!message.empty()) {
            poeticLog.push_back(message);
        }
        
        return {code, message};
    }
    
    void run() {
        bool collapsed = false;
        
        for (int volley = 0; volley < frames; volley++) {
            auto [code, message] = step(volley);
            
            if (code < 0) {
                std::cout << "[!] Terminated at volley " << volley << ": " << message << "\n";
                collapsed = true;
                break;
            }
        }
        
        if (!collapsed) {
            std::cout << "✓ Stable run achieved – 'The dance continued without collapse.'\n";
            survivors.push_back(state);
        }
        
        std::cout << "\n--- Emergent Narrative ---\n";
        for (const auto& line : poeticLog) {
            std::cout << line << "\n";
        }
        
        if (!survivors.empty()) {
            std::cout << "\n--- Survivor Genealogy ---\n";
            for (size_t i = 0; i < survivors.size(); i++) {
                std::cout << "Ancestor " << (i + 1) << ": Magnitude=" 
                         << survivors[i].magnitude() << "\n";
            }
        }
        
        std::cout << "\n--- Commentary ---\n";
        if (!poeticLog.empty()) {
            std::cout << "Alan Watts voice: 'Collapse was not failure, but revelation. "
                     << "The system discovered itself.'\n";
        } else {
            std::cout << "Alan Watts voice: 'No collapse today. Stability is also discovery.'\n";
        }
    }
};

int main() {
    std::cout << std::string(60, '=') << "\n";
    std::cout << "Reality Constraint Fuzzer (Polyform Engine)\n";
    std::cout << std::string(60, '=') << "\n";
    
    auto constraints = std::vector<std::shared_ptr<Constraint>>{
        std::make_shared<Constraint>("HardBounds", 
            [](double x) { return std::abs(x) > 0.1 && std::abs(x) < 5.0; }, 
            "Judge"),
        std::make_shared<Constraint>("AntiInteger",
            [](double x) { return std::abs(x - std::round(x)) > 0.05; },
            "Trickster")
    };
    
    SimulationND sim(3, constraints, 5.0, 200);
    sim.run();
    
    return 0;
}