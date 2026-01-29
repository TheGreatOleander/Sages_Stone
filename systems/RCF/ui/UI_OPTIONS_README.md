# RCF Explorer - UI Options

This directory contains alternative UI implementations for the Reality Constraint Fuzzer (RCF) Explorer. Each implementation provides the same core functionality but is optimized for different platforms and deployment scenarios.

---

## Available Implementations

### 1. **React/TSX Web**
- **File:** `rcf_explorer.tsx`
- **Platform:** Web browsers
- **Tech:** React, TypeScript, Lucide icons
- **Best for:** Modern web apps, embedded components
- **Deployment:** Requires bundler (Vite, Next.js, etc.)

**Features:**
- Full interactive simulation controls
- Real-time charting with Canvas
- Collapse cartography visualization
- 3D mesh rendering (Apple Mesh)
- Survivor genealogy tracking
- Emergent narrative log
- JSON export

---

### 2. **Windows WPF/C# Desktop**
- **File:** `RCFExplorer.xaml`
- **Platform:** Windows 10/11
- **Tech:** WPF, C#/.NET
- **Best for:** Native Windows desktop application

**Features:**
- Native Windows look and feel
- Hardware-accelerated rendering
- Tab-based visualization system
- Real-time Canvas charts
- File system integration for exports
- Docked control panel

**Build Requirements:**
- Visual Studio 2022 or later
- .NET 6.0 or later
- Create a WPF project and add this as MainWindow.xaml
- Implement the code-behind in C# with RCF simulation logic

---

### 3. **macOS SwiftUI Native**
- **File:** `RCFExplorerApp.swift`
- **Platform:** macOS 13+ (Ventura and later)
- **Tech:** SwiftUI, Swift Charts
- **Best for:** Native macOS desktop application

**Features:**
- Native macOS design language
- Apple Silicon optimized
- Built-in Charts framework integration
- Split-view interface
- Native save panel for exports
- Smooth animations

**Build Requirements:**
- Xcode 14 or later
- macOS 13+ deployment target
- Create new macOS App project in Xcode
- Replace ContentView with this code
- Enable App Sandbox with file access

---

### 4. **Puter.js Cloud Desktop**
- **File:** `rcf_explorer_puter.html`
- **Platform:** Web-based cloud OS (Puter.com)
- **Tech:** Vanilla JavaScript, Puter SDK, HTML5 Canvas
- **Best for:** Cloud-native deployment, no installation needed

**Features:**
- Zero installation - runs in browser
- Puter filesystem integration
- Save runs directly to Puter cloud storage
- Responsive design
- Self-contained single HTML file

**Deployment:**
1. Upload to Puter.com as an app
2. Or host on any static web server
3. Or open directly in browser (file:// protocol)

**Puter Integration:**
```javascript
// Save data to Puter cloud
await puter.fs.write('rcf_run.csv', csvData);

// Show native dialogs
puter.ui.alert('Simulation complete!');
```

---

## Feature Comparison Matrix

| Feature | React/TSX | Windows WPF | macOS SwiftUI | Puter.js |
|---------|-----------|-------------|---------------|----------|
| **Cross-platform** | ✓ | ✗ (Windows only) | ✗ (macOS only) | ✓ |
| **Native look** | ✗ | ✓ | ✓ | ✗ |
| **Installation required** | ✗ (web) | ✓ | ✓ | ✗ |
| **Offline capable** | ✓ | ✓ | ✓ | ✗ |
| **Cloud integration** | Depends | No | No | ✓ (Puter) |
| **Real-time charts** | ✓ | ✓ | ✓ | ✓ |
| **3D visualization** | ✓ | Future | Future | Future |
| **File export** | ✓ | ✓ | ✓ | ✓ |
| **Bundle size** | Medium | Large | Medium | Small |

---

## Which One Should You Use?

### Choose **React/TSX** if:
- Building a web application
- Want component reusability
- Need to embed in existing React projects
- Targeting modern browsers

### Choose **Windows WPF** if:
- Building enterprise Windows software
- Need deep OS integration
- Want professional desktop UX
- Targeting Windows-only environments

### Choose **macOS SwiftUI** if:
- Building native Apple apps
- Want Mac-first experience
- Need Apple ecosystem integration
- Targeting Apple Silicon performance

### Choose **Puter.js** if:
- Want instant deployment
- No installation friction
- Cloud-first storage model
- Prototyping or demos
- Public access without downloads

---

## Common Architecture

All implementations share the same **RCF core simulation logic**:

```
State → Transformations → Constraint Check → History
   ↓           ↓                ↓               ↓
Vector    (Static, Entropy,  (Bounds,      (Magnitude,
Intent     Resonance, etc.)   Integer,      Intent,
Memory                         Fatigue)      Memory)
```

The UI layer is swappable without changing the underlying physics.

---

## Adding Your Own UI

Want to create an implementation for another platform? Here's the minimal interface:

```javascript
// Core simulation state
{
  vector: [numbers],      // N-dimensional state
  intent: number,         // Accumulated directional bias
  memory: number,         // Historical weight
  globalStress: number    // Envelope contraction
}

// Required methods
- step()                  // Advance simulation one frame
- reset()                 // Return to initial conditions
- checkConstraints()      // Evaluate admissibility
- exportData()            // Serialize history

// UI must display
- Current volley/frame
- Real-time magnitude
- Global stress level
- Collapse detection
- At least one chart
```

---

## License

All UI implementations inherit the same license as the main RCF project. See LICENSE.md in the repository root.

---

## Support

For bugs or questions specific to a UI implementation:
- Open an issue on GitHub
- Tag with the platform name
- Include screenshot if visual bug

---

Built with constraint-preserving principles.  
Form follows failure.
