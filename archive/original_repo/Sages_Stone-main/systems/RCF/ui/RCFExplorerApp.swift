import SwiftUI
import Combine
import Charts

// MARK: - Data Models
struct RCFState {
    var vector: [Double]
    var intent: Double = 0.0
    var memory: Double = 0.0
    var globalStress: Double = 0.0
    var fatigueMap: [Double: Int] = [:]
    
    func magnitude() -> Double {
        sqrt(vector.reduce(0) { $0 + $1 * $1 })
    }
}

struct HistoryPoint: Identifiable {
    let id = UUID()
    let volley: Int
    let magnitude: Double
    let intent: Double
    let memory: Double
    let globalStress: Double
}

struct NarrativeEntry: Identifiable {
    let id = UUID()
    let message: String
    let icon: String
    let color: Color
}

struct LawScore: Identifiable {
    let id = UUID()
    let name: String
    let score: Double
    let stability: Double
    let persistence: Double
}

// MARK: - Simulation Engine
class RCFSimulation: ObservableObject {
    @Published var state: RCFState
    @Published var history: [HistoryPoint] = []
    @Published var narrative: [NarrativeEntry] = []
    @Published var lawScores: [LawScore] = []
    @Published var currentFrame: Int = 0
    @Published var isRunning: Bool = false
    @Published var isCollapsed: Bool = false
    @Published var collapseMessage: String = ""
    
    let dimensions: Int
    let frames: Int
    private var timer: Timer?
    
    init(dimensions: Int = 3, frames: Int = 200) {
        self.dimensions = dimensions
        self.frames = frames
        self.state = RCFState(
            vector: (0..<dimensions).map { _ in Double.random(in: 0.5...1.5) }
        )
    }
    
    func reset() {
        state = RCFState(
            vector: (0..<dimensions).map { _ in Double.random(in: 0.5...1.5) }
        )
        history.removeAll()
        narrative.removeAll()
        lawScores.removeAll()
        currentFrame = 0
        isCollapsed = false
        collapseMessage = ""
    }
    
    func run() {
        isRunning = true
        timer = Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { [weak self] _ in
            self?.step()
        }
    }
    
    func pause() {
        isRunning = false
        timer?.invalidate()
        timer = nil
    }
    
    private func step() {
        guard currentFrame < frames && !isCollapsed else {
            pause()
            if !isCollapsed {
                narrative.append(NarrativeEntry(
                    message: "✓ Stable run achieved — 'The dance continued without collapse.'",
                    icon: "checkmark.circle.fill",
                    color: .green
                ))
            }
            return
        }
        
        let volley = currentFrame
        let storm = volley % 20 == 0
        
        // Apply transformations
        state.vector = state.vector.map { $0 * 0.9 }
        state.intent += 0.1
        
        let scale = storm ? 0.08 : 0.02
        state.vector = state.vector.map { $0 + Double.random(in: -scale...scale) }
        state.intent += storm ? 0.3 : 0.1
        
        let mean = state.vector.reduce(0, +) / Double(state.vector.count)
        let drift = (0.5 - mean.truncatingRemainder(dividingBy: 1.0)) * 0.015
        state.vector = state.vector.map { $0 + drift }
        
        if volley % 4 == 0 {
            let factor = 1.01 + 0.01 * sin(state.intent)
            state.vector = state.vector.map { $0 * factor }
            state.intent += 0.5
            
            if storm {
                narrative.append(NarrativeEntry(
                    message: "⚡ Storm + Resonance at volley \(volley) → amplified chaos",
                    icon: "bolt.fill",
                    color: .yellow
                ))
            }
        }
        
        if volley > 30 {
            state.vector = state.vector.map { $0 * 0.5 }
            state.intent -= 1.0
        }
        
        if volley % 5 == 0 {
            state.memory += 0.2
        }
        
        if volley % 7 == 0 {
            state.vector = state.vector.map { $0 + state.intent * 0.01 }
        }
        
        let mag = state.magnitude()
        state.globalStress += 0.02 + abs(drift) + 0.01
        let effectiveLimit = 5.0 - state.globalStress
        
        // Check for collapse
        if mag >= effectiveLimit || effectiveLimit <= 0.1 {
            collapseMessage = "Global Collapse → 'The envelope shrank to silence.'"
            isCollapsed = true
            narrative.append(NarrativeEntry(
                message: "🌌 " + collapseMessage,
                icon: "exclamationmark.triangle.fill",
                color: .red
            ))
            return
        }
        
        if mag <= 0.1 || mag >= 5.0 {
            collapseMessage = "Collision → The Stern Judge: 'Order must be kept.'"
            isCollapsed = true
            narrative.append(NarrativeEntry(
                message: "⚠️ " + collapseMessage,
                icon: "exclamationmark.triangle.fill",
                color: .red
            ))
            return
        }
        
        if abs(mag - mag.rounded()) <= 0.05 {
            collapseMessage = "The Trickster: 'Boundaries are illusions.'"
            isCollapsed = true
            narrative.append(NarrativeEntry(
                message: "⚠️ " + collapseMessage,
                icon: "exclamationmark.triangle.fill",
                color: .red
            ))
            return
        }
        
        // Update history
        history.append(HistoryPoint(
            volley: volley,
            magnitude: mag,
            intent: state.intent,
            memory: state.memory,
            globalStress: state.globalStress
        ))
        
        // Calculate law scores
        if volley % 10 == 0 {
            let stabilityScore = 1.0 / (1.0 + state.globalStress)
            let persistenceScore = Double(volley) / Double(frames)
            let dimensionalScore = Double(dimensions) / 6.0
            let lawScore = (persistenceScore * stabilityScore * dimensionalScore) / (1.0 + abs(mag - 2.5))
            
            lawScores.append(LawScore(
                name: "Volley \(volley)",
                score: lawScore,
                stability: stabilityScore,
                persistence: persistenceScore
            ))
        }
        
        currentFrame += 1
    }
    
    func exportData() {
        // Create CSV export
        var csv = "Volley,Magnitude,Intent,Memory,GlobalStress\n"
        for point in history {
            csv += "\(point.volley),\(point.magnitude),\(point.intent),\(point.memory),\(point.globalStress)\n"
        }
        
        let panel = NSSavePanel()
        panel.allowedContentTypes = [.commaSeparatedText]
        panel.nameFieldStringValue = "rcf_run_\(Date().timeIntervalSince1970).csv"
        
        panel.begin { response in
            if response == .OK, let url = panel.url {
                try? csv.write(to: url, atomically: true, encoding: .utf8)
            }
        }
    }
}

// MARK: - Main View
struct RCFExplorerView: View {
    @StateObject private var simulation: RCFSimulation
    @State private var selectedTab = 0
    @State private var showInfo = false
    
    init(dimensions: Int = 3, frames: Int = 200) {
        _simulation = StateObject(wrappedValue: RCFSimulation(dimensions: dimensions, frames: frames))
    }
    
    var body: some View {
        HSplitView {
            // Left Control Panel
            VStack(alignment: .leading, spacing: 20) {
                Text("RCF EXPLORER")
                    .font(.title.bold())
                    .foregroundColor(.purple)
                
                Divider()
                
                // Configuration
                VStack(alignment: .leading, spacing: 15) {
                    Text("CONFIGURATION")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text("Dimensions: \(simulation.dimensions)")
                        .font(.caption.monospaced())
                    
                    Text("Frames: \(simulation.frames)")
                        .font(.caption.monospaced())
                }
                
                Divider()
                
                // Controls
                VStack(spacing: 10) {
                    Button(action: { simulation.run() }) {
                        Label("RUN", systemImage: "play.fill")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.green)
                    .disabled(simulation.isRunning)
                    
                    Button(action: { simulation.pause() }) {
                        Label("PAUSE", systemImage: "pause.fill")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.orange)
                    .disabled(!simulation.isRunning)
                    
                    Button(action: { simulation.reset() }) {
                        Label("RESET", systemImage: "arrow.counterclockwise")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.blue)
                    
                    Button(action: { simulation.exportData() }) {
                        Label("EXPORT", systemImage: "square.and.arrow.down")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.green)
                    .disabled(simulation.history.isEmpty)
                }
                
                Divider()
                
                // Current Status
                VStack(alignment: .leading, spacing: 15) {
                    Text("CURRENT STATUS")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Volley")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("\(simulation.currentFrame)/\(simulation.frames)")
                            .font(.title.monospaced().bold())
                            .foregroundColor(.blue)
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Magnitude")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(String(format: "%.3f", simulation.state.magnitude()))
                            .font(.title.monospaced().bold())
                            .foregroundColor(.blue)
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Global Stress")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text(String(format: "%.3f", simulation.state.globalStress))
                            .font(.title.monospaced().bold())
                            .foregroundColor(.red)
                    }
                }
                .padding()
                .background(Color(.darkGray).opacity(0.3))
                .cornerRadius(8)
                
                // Collapse/Success Messages
                if simulation.isCollapsed {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundColor(.red)
                            Text("COLLAPSE DETECTED")
                                .font(.caption.bold())
                                .foregroundColor(.red)
                        }
                        Text(simulation.collapseMessage)
                            .font(.caption)
                            .foregroundColor(.red.opacity(0.8))
                    }
                    .padding()
                    .background(Color.red.opacity(0.2))
                    .cornerRadius(8)
                }
                
                if !simulation.isCollapsed && simulation.currentFrame >= simulation.frames && simulation.currentFrame > 0 {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                            Text("STABLE RUN")
                                .font(.caption.bold())
                                .foregroundColor(.green)
                        }
                        Text("The dance continued without collapse.")
                            .font(.caption.italic())
                            .foregroundColor(.green.opacity(0.8))
                    }
                    .padding()
                    .background(Color.green.opacity(0.2))
                    .cornerRadius(8)
                }
                
                Spacer()
            }
            .padding()
            .frame(width: 300)
            .background(Color(.darkGray).opacity(0.2))
            
            // Right Visualization Panel
            TabView(selection: $selectedTab) {
                // Magnitude Timeline
                VStack {
                    if !simulation.history.isEmpty {
                        Chart(simulation.history) { point in
                            LineMark(
                                x: .value("Volley", point.volley),
                                y: .value("Magnitude", point.magnitude)
                            )
                            .foregroundStyle(.blue)
                        }
                        .chartYScale(domain: 0...6)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .padding()
                    } else {
                        Text("No data yet. Run simulation to begin.")
                            .foregroundColor(.secondary)
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                    }
                }
                .tabItem {
                    Label("Magnitude", systemImage: "chart.line.uptrend.xyaxis")
                }
                .tag(0)
                
                // Phase Space
                VStack {
                    if !simulation.history.isEmpty {
                        Chart(simulation.history) { point in
                            PointMark(
                                x: .value("Intent", point.intent),
                                y: .value("Memory", point.memory)
                            )
                            .foregroundStyle(Color.purple.opacity(0.6))
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .padding()
                    } else {
                        Text("No data yet. Run simulation to begin.")
                            .foregroundColor(.secondary)
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                    }
                }
                .tabItem {
                    Label("Phase Space", systemImage: "circle.grid.cross")
                }
                .tag(1)
                
                // Narrative
                ScrollView {
                    VStack(alignment: .leading, spacing: 10) {
                        ForEach(simulation.narrative) { entry in
                            HStack(alignment: .top, spacing: 12) {
                                Image(systemName: entry.icon)
                                    .foregroundColor(entry.color)
                                Text(entry.message)
                                    .font(.body.italic())
                                    .foregroundColor(.primary)
                            }
                            .padding()
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color(.darkGray).opacity(0.2))
                            .cornerRadius(8)
                        }
                        
                        if !simulation.isCollapsed && simulation.currentFrame >= simulation.frames && simulation.currentFrame > 0 {
                            HStack(alignment: .top, spacing: 12) {
                                Image(systemName: "quote.bubble")
                                    .foregroundColor(.green)
                                Text("Alan Watts voice: 'No collapse today. Stability is also discovery.'")
                                    .font(.body.italic())
                                    .foregroundColor(.green)
                            }
                            .padding()
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.green.opacity(0.2))
                            .cornerRadius(8)
                        }
                    }
                    .padding()
                }
                .tabItem {
                    Label("Narrative", systemImage: "text.bubble")
                }
                .tag(2)
                
                // Law Scores
                ScrollView {
                    VStack(spacing: 10) {
                        ForEach(simulation.lawScores.suffix(10)) { score in
                            HStack {
                                VStack(alignment: .leading) {
                                    Text(score.name)
                                        .font(.headline)
                                    Text("Stability: \(score.stability, specifier: "%.3f")")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                Spacer()
                                Text("\(score.score, specifier: "%.4f")")
                                    .font(.title.monospaced().bold())
                                    .foregroundColor(.purple)
                            }
                            .padding()
                            .background(Color(.darkGray).opacity(0.3))
                            .cornerRadius(8)
                        }
                    }
                    .padding()
                }
                .tabItem {
                    Label("Law Scores", systemImage: "scalemass")
                }
                .tag(3)
            }
        }
        .frame(minWidth: 1000, minHeight: 700)
    }
}

// MARK: - App Entry Point
@main
struct RCFExplorerApp: App {
    var body: some Scene {
        WindowGroup {
            RCFExplorerView(dimensions: 3, frames: 200)
                .frame(minWidth: 1000, minHeight: 700)
        }
    }
}
