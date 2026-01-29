import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Download, Info, Eye, EyeOff, Zap, Activity, Brain, Target } from 'lucide-react';

const RCFExplorer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [dimensions, setDimensions] = useState(3);
  const [frames, setFrames] = useState(200);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [history, setHistory] = useState({ 
    volley: [], 
    magnitude: [], 
    intent: [], 
    memory: [],
    globalStress: [],
    drift: []
  });
  const [collapsed, setCollapsed] = useState(false);
  const [collapseMessage, setCollapseMessage] = useState("");
  const [collapseCode, setCollapseCode] = useState(0);
  const [narrativeLog, setNarrativeLog] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  const [showCollapseCarto, setShowCollapseCarto] = useState(false);
  const [showSurvivors, setShowSurvivors] = useState(false);
  const [show3DMesh, setShow3DMesh] = useState(false);
  const [survivors, setSurvivors] = useState([]);
  const [lawScores, setLawScores] = useState([]);
  
  const animationRef = useRef(null);
  const meshAnimationRef = useRef(null);
  const canvasRef = useRef(null);
  const cartoCanvasRef = useRef(null);
  const meshCanvasRef = useRef(null);

  const simStateRef = useRef({
    vector: null,
    intent: 0,
    memory: 0,
    globalStress: 0,
    fatigueMap: {},
    violationCounts: { hardBounds: 0, antiInteger: 0 }
  });

  const constraintPersonas = {
    judge: "The Stern Judge: 'Order must be kept.'",
    trickster: "The Trickster: 'Boundaries are illusions.'",
    guardian: "The Guardian: 'I protect the fragile edge.'"
  };

  const initSimulation = () => {
    simStateRef.current = {
      vector: Array(dimensions).fill(0).map(() => Math.random() * 1 + 0.5),
      intent: 0,
      memory: 0,
      globalStress: 0,
      fatigueMap: {},
      violationCounts: { hardBounds: 0, antiInteger: 0 }
    };
    setHistory({ 
      volley: [], 
      magnitude: [], 
      intent: [], 
      memory: [],
      globalStress: [],
      drift: []
    });
    setCurrentFrame(0);
    setCollapsed(false);
    setCollapseMessage("");
    setCollapseCode(0);
    setNarrativeLog([]);
    setSurvivors([]);
    setLawScores([]);
  };

  const magnitude = (vec) => Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));

  const checkConstraints = (mag, fatigueMap) => {
    if (mag <= 0.1 || mag >= 5.0) {
      return { 
        ok: false, 
        msg: `Collision → ${constraintPersonas.judge}`,
        code: -1
      };
    }
    
    if (Math.abs(mag - Math.round(mag)) <= 0.05) {
      return { 
        ok: false, 
        msg: constraintPersonas.trickster,
        code: -1
      };
    }

    const sector = Math.round(mag * 10) / 10;
    if (fatigueMap[sector] > 5 && Math.abs(mag - Math.round(mag)) < 0.05) {
      return {
        ok: false,
        msg: "Crystallization → 'The familiar became brittle.'",
        code: -2
      };
    }
    
    return { ok: true, code: 1 };
  };

  const stepSimulation = (volley) => {
    const state = simStateRef.current;
    const storm = volley % 20 === 0;

    state.vector = state.vector.map(v => v * 0.9);
    state.intent += 0.1;

    const scale = storm ? 0.08 : 0.02;
    state.vector = state.vector.map(v => v + (Math.random() - 0.5) * scale * 2);
    state.intent += storm ? 0.3 : 0.1;

    const meanMod = (state.vector.reduce((s, v) => s + v, 0) / state.vector.length) % 1;
    const drift = (0.5 - meanMod) * 0.015;
    state.vector = state.vector.map(v => v + drift);

    if (volley % 4 === 0) {
      const factor = 1.01 + 0.01 * Math.sin(state.intent);
      state.vector = state.vector.map(v => v * factor);
      state.intent += 0.5;
      
      if (storm) {
        setNarrativeLog(prev => [...prev, `⚡ Storm + Resonance at volley ${volley} → amplified chaos`]);
      }
    }

    if (volley > 30) {
      state.vector = state.vector.map(v => v * 0.5);
      state.intent -= 1.0;
    }

    if (volley % 5 === 0) {
      state.memory += 0.2;
    }

    if (volley % 7 === 0) {
      state.vector = state.vector.map(v => v + state.intent * 0.01);
    }

    const mag = magnitude(state.vector);

    state.globalStress += 0.02 + Math.abs(drift) + 0.01;
    const effectiveLimit = 5.0 - state.globalStress;

    if (mag >= effectiveLimit || effectiveLimit <= 0.1) {
      setCollapsed(true);
      setCollapseMessage("Global Collapse → 'The envelope shrank to silence.'");
      setCollapseCode(-3);
      setNarrativeLog(prev => [...prev, "🌌 Global Collapse → 'The envelope shrank to silence.'"]);
      return false;
    }

    const sector = Math.round(mag * 10) / 10;
    state.fatigueMap[sector] = (state.fatigueMap[sector] || 0) + 1;

    const constraintCheck = checkConstraints(mag, state.fatigueMap);
    if (!constraintCheck.ok) {
      setCollapsed(true);
      setCollapseMessage(constraintCheck.msg);
      setCollapseCode(constraintCheck.code);
      setNarrativeLog(prev => [...prev, `⚠️ ${constraintCheck.msg}`]);
      return false;
    }

    setHistory(prev => ({
      volley: [...prev.volley, volley],
      magnitude: [...prev.magnitude, mag],
      intent: [...prev.intent, state.intent],
      memory: [...prev.memory, state.memory],
      globalStress: [...prev.globalStress, state.globalStress],
      drift: [...prev.drift, Math.abs(drift)]
    }));

    if (volley % 10 === 0) {
      calculateLawScores(volley, mag, state);
    }

    return true;
  };

  const calculateLawScores = (volley, mag, state) => {
    const stabilityScore = 1 / (1 + state.globalStress);
    const persistenceScore = volley / frames;
    const dimensionalScore = dimensions / 6;
    
    const lawScore = (persistenceScore * stabilityScore * dimensionalScore) / 
                     (1 + Math.abs(mag - 2.5));
    
    setLawScores(prev => [...prev, {
      volley,
      score: lawScore,
      stability: stabilityScore,
      persistence: persistenceScore
    }]);
  };

  const runSimulation = () => {
    if (currentFrame >= frames || collapsed) {
      if (!collapsed && currentFrame >= frames) {
        setSurvivors(prev => [...prev, {
          vector: [...simStateRef.current.vector],
          intent: simStateRef.current.intent,
          memory: simStateRef.current.memory,
          magnitude: magnitude(simStateRef.current.vector),
          finalVolley: currentFrame
        }]);
        setNarrativeLog(prev => [...prev, "✨ Survivor recorded: system achieved stability"]);
      }
      setIsRunning(false);
      return;
    }

    const success = stepSimulation(currentFrame);
    setCurrentFrame(prev => prev + 1);

    if (!success) {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isRunning) {
      animationRef.current = setTimeout(runSimulation, 50);
    }
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [isRunning, currentFrame, collapsed]);

  useEffect(() => {
    drawChart();
  }, [history]);

  useEffect(() => {
    if (showCollapseCarto) drawCollapseCarto();
  }, [showCollapseCarto, history]);

  useEffect(() => {
    if (show3DMesh && survivors.length > 0) {
      const animate3DMesh = () => {
        draw3DMesh();
        meshAnimationRef.current = requestAnimationFrame(animate3DMesh);
      };
      animate3DMesh();
      return () => {
        if (meshAnimationRef.current) cancelAnimationFrame(meshAnimationRef.current);
      };
    }
  }, [show3DMesh, survivors]);

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (history.volley.length < 2) return;

    const maxVolley = Math.max(...history.volley, frames);
    const maxMag = Math.max(...history.magnitude, 5);
    const maxIntent = Math.max(...history.intent, 1);
    const maxMemory = Math.max(...history.memory, 1);
    const maxStress = Math.max(...history.globalStress, 1);

    const drawLine = (data, color, scale) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      data.forEach((val, i) => {
        const x = (history.volley[i] / maxVolley) * (width - 40) + 20;
        const y = height - 20 - (val / scale) * (height - 40);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    };

    drawLine(history.magnitude, '#3b82f6', maxMag);
    drawLine(history.intent, '#10b981', maxIntent);
    drawLine(history.memory, '#f59e0b', maxMemory);
    drawLine(history.globalStress, '#ef4444', maxStress);

    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = height - 20 - (i / 5) * (height - 40);
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
    }

    if (collapsed) {
      const collapseX = (currentFrame / maxVolley) * (width - 40) + 20;
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(collapseX, 20);
      ctx.lineTo(collapseX, height - 20);
      ctx.stroke();
    }
  };

  const drawCollapseCarto = () => {
    const canvas = cartoCanvasRef.current;
    if (!canvas || history.intent.length < 2) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const maxIntent = Math.max(...history.intent, 1);
    const maxMemory = Math.max(...history.memory, 1);
    const maxMag = Math.max(...history.magnitude, 1);

    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const x = (i / 5) * (width - 40) + 20;
      const y = (i / 5) * (height - 40) + 20;
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, height - 20);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
    }

    history.intent.forEach((intent, i) => {
      const x = (intent / maxIntent) * (width - 40) + 20;
      const y = height - 20 - (history.memory[i] / maxMemory) * (height - 40);
      const mag = history.magnitude[i];
      const hue = (mag / maxMag) * 60;
      
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px monospace';
    ctx.fillText('Intent →', width - 60, height - 5);
    ctx.save();
    ctx.translate(10, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Memory →', 0, 0);
    ctx.restore();
  };

  const draw3DMesh = () => {
    const canvas = meshCanvasRef.current;
    if (!canvas || survivors.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    const avgMag = survivors.reduce((sum, s) => sum + s.magnitude, 0) / survivors.length;
    const radius = Math.min(width, height) * 0.3 * (avgMag / 2.5);

    const resolution = 20;
    const rotation = Date.now() * 0.001;

    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const u = (i / resolution) * Math.PI * 2;
        const v = (j / resolution) * Math.PI;

        const x = radius * Math.cos(u) * Math.sin(v);
        const y = radius * Math.sin(u) * Math.sin(v);
        const z = radius * Math.cos(v) * 0.8;

        const rotX = x * Math.cos(rotation) - z * Math.sin(rotation);
        const rotZ = x * Math.sin(rotation) + z * Math.cos(rotation);

        const scale = 200 / (200 + rotZ);
        const projX = centerX + rotX * scale;
        const projY = centerY + y * scale;

        const brightness = Math.floor(128 + rotZ * 0.5);
        ctx.fillStyle = `rgb(${brightness}, ${brightness * 0.8}, ${brightness * 0.6})`;
        ctx.fillRect(projX, projY, 2, 2);
      }
    }

    ctx.fillStyle = '#10b981';
    ctx.font = '14px monospace';
    ctx.fillText('Constraint-Grown Apple', 10, 20);
  };

  const handleStart = () => {
    if (currentFrame === 0) {
      initSimulation();
    }
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    initSimulation();
  };

  const exportData = () => {
    const data = {
      parameters: { dimensions, frames },
      history,
      collapse: { occurred: collapsed, message: collapseMessage, code: collapseCode },
      survivors,
      lawScores,
      narrativeLog
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rcf_run_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Reality Constraint Fuzzer
          </h1>
          <p className="text-gray-300 italic text-lg">Where Collapse Becomes Revelation</p>
          <p className="text-gray-400 text-sm mt-2">"A law is not true because it is elegant. It is elegant because it survived."</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-gray-800 bg-opacity-50 rounded-lg p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Activity className="text-blue-400" size={24} />
                Simulation Canvas
              </h2>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 hover:bg-gray-700 rounded transition"
              >
                <Info size={20} />
              </button>
            </div>
            
            <canvas
              ref={canvasRef}
              width={700}
              height={350}
              className="w-full bg-gray-900 rounded border border-gray-700"
            />

            <div className="flex gap-4 mt-4 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-blue-500"></div>
                <span>Magnitude</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-green-500"></div>
                <span>Intent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-amber-500"></div>
                <span>Memory</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-red-500"></div>
                <span>Global Stress</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 backdrop-blur">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="text-purple-400" size={24} />
              Controls
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">
                  Dimensions: <span className="text-purple-400 font-mono">{dimensions}D</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={dimensions}
                  onChange={(e) => setDimensions(parseInt(e.target.value))}
                  disabled={isRunning}
                  className="w-full"
                />
                <div className="text-xs text-gray-400 mt-1">
                  {dimensions === 1 && "1D: Persistence"}
                  {dimensions === 2 && "2D: Interaction"}
                  {dimensions === 3 && "3D: Symmetry Pressure"}
                  {dimensions === 4 && "4D: Memory"}
                  {dimensions === 5 && "5D: Intent"}
                  {dimensions === 6 && "6D: Meta-Laws"}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Frames: {frames}</label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="50"
                  value={frames}
                  onChange={(e) => setFrames(parseInt(e.target.value))}
                  disabled={isRunning}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleStart}
                  disabled={isRunning || collapsed}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded transition flex items-center justify-center gap-2"
                >
                  <Play size={16} /> Start
                </button>
                <button
                  onClick={() => setIsRunning(false)}
                  disabled={!isRunning}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 px-4 py-2 rounded transition flex items-center justify-center gap-2"
                >
                  <Pause size={16} /> Pause
                </button>
              </div>

              <button
                onClick={handleReset}
                className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} /> Reset
              </button>

              <button
                onClick={exportData}
                disabled={history.volley.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded transition flex items-center justify-center gap-2"
              >
                <Download size={16} /> Export Data
              </button>

              <div className="text-center pt-2 border-t border-gray-700">
                <div className="text-3xl font-mono text-purple-400">{currentFrame}/{frames}</div>
                <div className="text-sm text-gray-400">Volley</div>
              </div>

              {collapsed && (
                <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded p-3">
                  <div className="text-sm font-semibold mb-1">Collapse Detected</div>
                  <div className="text-xs text-gray-300">{collapseMessage}</div>
                  <div className="text-xs text-red-400 mt-1">Code: {collapseCode}</div>
                </div>
              )}

              {!collapsed && currentFrame >= frames && currentFrame > 0 && (
                <div className="bg-green-900 bg-opacity-30 border border-green-500 rounded p-3">
                  <div className="text-sm font-semibold">✓ Stable Run Achieved</div>
                  <div className="text-xs text-gray-300 italic">The dance continued without collapse.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {showInfo && (
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 backdrop-blur mb-6">
            <h3 className="text-lg font-semibold mb-3">About This Simulation</h3>
            <div className="text-sm space-y-2 text-gray-300">
              <p><strong>Dimensions:</strong> Each dimension represents an independent pressure axis—not spatial geometry, but ontological channels.</p>
              <p><strong>Constraints:</strong> Hard bounds (0.1 to 5.0) and anti-integer rules enforce survival criteria.</p>
              <p><strong>Phenomena:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Entropy Weather:</strong> Periodic storms inject high variance every 20 volleys</li>
                <li><strong>Resonance:</strong> Amplification based on accumulated intent</li>
                <li><strong>Memory Echoes:</strong> Past states influence future allowances</li>
                <li><strong>Global Stress:</strong> The envelope contracts over time</li>
                <li><strong>Fatigue:</strong> Repeated visits to the same state region cause crystallization</li>
              </ul>
              <p className="italic pt-2">"A law is not true because it is elegant. It is elegant because it survived."</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setShowCollapseCarto(!showCollapseCarto)}
            className="bg-gray-800 bg-opacity-50 hover:bg-opacity-70 rounded-lg p-4 backdrop-blur transition flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Target className="text-amber-400" size={20} />
              Collapse Cartography
            </span>
            {showCollapseCarto ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>

          <button
            onClick={() => setShowSurvivors(!showSurvivors)}
            className="bg-gray-800 bg-opacity-50 hover:bg-opacity-70 rounded-lg p-4 backdrop-blur transition flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Brain className="text-green-400" size={20} />
              Survivor Genealogy
            </span>
            {showSurvivors ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>

          <button
            onClick={() => setShow3DMesh(!show3DMesh)}
            disabled={survivors.length === 0}
            className="bg-gray-800 bg-opacity-50 hover:bg-opacity-70 disabled:bg-gray-700 disabled:opacity-50 rounded-lg p-4 backdrop-blur transition flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Activity className="text-purple-400" size={20} />
              Apple Mesh
            </span>
            {show3DMesh ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {showCollapseCarto && (
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 backdrop-blur mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="text-amber-400" size={24} />
              Collapse Cartography (Failure Territories)
            </h3>
            <canvas
              ref={cartoCanvasRef}
              width={700}
              height={500}
              className="w-full bg-gray-900 rounded border border-gray-700"
            />
            <p className="text-sm text-gray-400 mt-2 italic">
              Intent vs Memory phase space, colored by magnitude. Reveals the forbidden territories.
            </p>
          </div>
        )}

        {show3DMesh && survivors.length > 0 && (
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 backdrop-blur mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Activity className="text-purple-400" size={24} />
              Constraint-Grown Apple from Nowhere
            </h3>
            <canvas
              ref={meshCanvasRef}
              width={600}
              height={600}
              className="w-full bg-gray-900 rounded border border-gray-700"
            />
            <p className="text-sm text-gray-400 mt-2 italic">
              Form emerges from survivor states. The mesh grows from collapse-tested geometry.
            </p>
          </div>
        )}

        {showSurvivors && survivors.length > 0 && (
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 backdrop-blur mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Brain className="text-green-400" size={24} />
              Survivor Genealogy
            </h3>
            <div className="space-y-3">
              {survivors.map((survivor, i) => (
                <div key={i} className="bg-gray-900 bg-opacity-50 rounded p-4 border border-green-500 border-opacity-30">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-green-400 font-semibold">Ancestor {i + 1}</span>
                    <span className="text-xs text-gray-400">Volley {survivor.finalVolley}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Magnitude: <span className="text-blue-400 font-mono">{survivor.magnitude.toFixed(3)}</span></div>
                    <div>Intent: <span className="text-green-400 font-mono">{survivor.intent.toFixed(2)}</span></div>
                    <div>Memory: <span className="text-amber-400 font-mono">{survivor.memory.toFixed(2)}</span></div>
                    <div>Dimensions: <span className="text-purple-400 font-mono">{survivor.vector.length}</span></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2 italic">
                    "Survived the pressure and became part of the lineage."
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {lawScores.length > 0 && (
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 backdrop-blur mb-6">
            <h3 className="text-lg font-semibold mb-3">Law Score Evolution</h3>
            <div className="space-y-2">
              {lawScores.slice(-5).map((score, i) => (
                <div key={i} className="flex justify-between items-center text-sm bg-gray-900 bg-opacity-50 rounded p-2">
                  <span className="text-gray-400">Volley {score.volley}</span>
                  <span className="text-purple-400 font-mono">Score: {score.score.toFixed(4)}</span>
                  <span className="text-blue-400 font-mono">Stability: {score.stability.toFixed(3)}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3 italic">
              LawScore = (Persistence × Stability × Dimensional) / (1 + deviation from equilibrium)
            </p>
          </div>
        )}

        {narrativeLog.length > 0 && (
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 backdrop-blur">
            <h3 className="text-lg font-semibold mb-3">Emergent Narrative</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {narrativeLog.map((line, i) => (
                <div key={i} className="text-sm text-gray-300 italic border-l-2 border-purple-500 pl-3">
                  {line}
                </div>
              ))}
              {!collapsed && currentFrame >= frames && currentFrame > 0 && (
                <div className="text-sm text-green-400 italic border-l-2 border-green-500 pl-3 mt-4">
                  Alan Watts voice: 'No collapse today. Stability is also discovery.'
                </div>
              )}
              {collapsed && (
                <div className="text-sm text-amber-400 italic border-l-2 border-amber-500 pl-3 mt-4">
                  Alan Watts voice: 'Collapse was not failure, but revelation. The system discovered itself.'
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RCFExplorer;