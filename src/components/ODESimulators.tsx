import React, { useState, useEffect, useRef } from 'react';

// --- ODE SLOPE FIELD (שדה כיוונים) GENERATOR ---
export function SlopeFieldSimulator() {
  const [equation, setEquation] = useState<'linear' | 'separable' | 'sine' | 'logistic'>('linear');
  const [clickPoints, setClickPoints] = useState<{ x: number; y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Define ODEs: dy/dx = f(x, y)
  const f = (x: number, y: number): number => {
    switch (equation) {
      case 'linear':
        return x + y;
      case 'separable':
        return -y * (x || 0.1);
      case 'sine':
        return Math.sin(x) - y;
      case 'logistic':
        return 0.5 * y * (3 - y); // dy/dx = r * y * (K - y)
      default:
        return x + y;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Grid details
    const xMin = -4, xMax = 4;
    const yMin = -4, yMax = 4;

    const toScreenX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toScreenY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;
    const toMathX = (px: number) => xMin + (px / width) * (xMax - xMin);
    const toMathY = (py: number) => yMin + ((height - py) / height) * (yMax - yMin);

    // Draw Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // X-axis
    ctx.moveTo(0, toScreenY(0));
    ctx.lineTo(width, toScreenY(0));
    // Y-axis
    ctx.moveTo(toScreenX(0), 0);
    ctx.lineTo(toScreenX(0), height);
    ctx.stroke();

    // Draw slope field ticks
    const steps = 18;
    ctx.lineWidth = 1;
    for (let i = 0; i <= steps; i++) {
      for (let j = 0; j <= steps; j++) {
        const mx = xMin + (i / steps) * (xMax - xMin);
        const my = yMin + (j / steps) * (yMax - yMin);

        const slope = f(mx, my);
        if (isNaN(slope) || !isFinite(slope)) continue;

        // Angle of the tick
        const angle = Math.atan(slope);
        const len = 12; // tick length in px

        const sx = toScreenX(mx);
        const sy = toScreenY(my);

        const dx = (Math.cos(angle) * len) / 2;
        const dy = (Math.sin(angle) * len) / 2;

        ctx.strokeStyle = 'rgba(96, 165, 250, 0.4)'; // light blue ticks
        ctx.beginPath();
        ctx.moveTo(sx - dx, sy + dy);
        ctx.lineTo(sx + dx, sy - dy);
        ctx.stroke();
      }
    }

    // Plot solution curves from click points (Euler integration)
    ctx.lineWidth = 2.5;
    clickPoints.forEach((point, pIdx) => {
      ctx.strokeStyle = `hsl(${(pIdx * 65) % 360}, 85%, 65%)`;
      
      // Integrate forward
      ctx.beginPath();
      let cx = point.x;
      let cy = point.y;
      ctx.moveTo(toScreenX(cx), toScreenY(cy));

      const h = 0.02; // step size
      for (let step = 0; step < 200; step++) {
        const slope = f(cx, cy);
        cy += h * slope;
        cx += h;
        if (cx > xMax || cy > yMax || cy < yMin) break;
        ctx.lineTo(toScreenX(cx), toScreenY(cy));
      }
      ctx.stroke();

      // Integrate backward
      ctx.beginPath();
      cx = point.x;
      cy = point.y;
      ctx.moveTo(toScreenX(cx), toScreenY(cy));
      for (let step = 0; step < 200; step++) {
        const slope = f(cx, cy);
        cy -= h * slope;
        cx -= h;
        if (cx < xMin || cy > yMax || cy < yMin) break;
        ctx.lineTo(toScreenX(cx), toScreenY(cy));
      }
      ctx.stroke();

      // Draw initial point dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(toScreenX(point.x), toScreenY(point.y), 4, 0, Math.PI * 2);
      ctx.fill();
    });

  }, [equation, clickPoints]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Convert pixel coordinates to math coordinates
    const xMin = -4, xMax = 4;
    const yMin = -4, yMax = 4;
    const mx = xMin + (px / canvas.clientWidth) * (xMax - xMin);
    const my = yMin + ((canvas.clientHeight - py) / canvas.clientHeight) * (yMax - yMin);

    setClickPoints(prev => [...prev, { x: mx, y: my }]);
  };

  const getEquationString = () => {
    switch (equation) {
      case 'linear': return "y' = x + y";
      case 'separable': return "y' = -xy";
      case 'sine': return "y' = sin(x) - y";
      case 'logistic': return "y' = 0.5y(3 - y)";
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl p-5 overflow-hidden text-right" dir="rtl">
      <h3 className="text-xl font-black text-white mb-1">שדה כיוונים (Slope Fields)</h3>
      <p className="text-slate-400 text-xs mb-3">לחץ על הגרף כדי לצייר פתרון פרטי (Integral Curve) העובר בנקודה</p>
      
      <div className="relative flex-1 bg-slate-950 rounded-2xl overflow-hidden border border-white/5 min-h-[220px]">
        <canvas ref={canvasRef} width={500} height={280} onClick={handleCanvasClick} className="w-full h-full block cursor-crosshair" />
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-xs font-mono text-slate-300">
          משוואה: <span className="text-blue-400 font-bold">{getEquationString()}</span>
        </div>
        <button onClick={() => setClickPoints([])} className="absolute bottom-3 left-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs px-2.5 py-1 rounded-lg transition-colors">נקה מסלולים</button>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <span className="text-slate-400 text-xs">בחר משוואה:</span>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => { setEquation('linear'); setClickPoints([]); }} className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${equation === 'linear' ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>y' = x + y</button>
          <button onClick={() => { setEquation('separable'); setClickPoints([]); }} className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${equation === 'separable' ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>y' = -xy</button>
          <button onClick={() => { setEquation('sine'); setClickPoints([]); }} className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${equation === 'sine' ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>y' = sin(x) - y</button>
          <button onClick={() => { setEquation('logistic'); setClickPoints([]); }} className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${equation === 'logistic' ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>לוגיסטית</button>
        </div>
      </div>
    </div>
  );
}

// --- MASS-SPRING-DAMPER OSCILLATOR ---
export function SpringOscillatorSimulator() {
  const [mass, setMass] = useState(2.0); // m
  const [damping, setDamping] = useState(1.0); // c
  const [stiffness, setStiffness] = useState(8.0); // k
  
  const [time, setTime] = useState(0);
  const [pos, setPos] = useState(2.0); // initial displacement
  const [vel, setVel] = useState(0);
  const [history, setHistory] = useState<{ t: number; x: number; v: number }[]>([]);

  // Simulation loop using Runge-Kutta 4th order or simple Euler
  useEffect(() => {
    let animId: number;
    let t = 0;
    let x = 2.0;
    let v = 0;
    setHistory([]);

    const step = () => {
      const dt = 0.05;
      
      // Spring force: F = -k*x - c*v
      // Acceleration: a = F/m
      const a = (-stiffness * x - damping * v) / mass;
      v += a * dt;
      x += v * dt;
      t += dt;

      setPos(x);
      setVel(v);
      setTime(t);
      
      setHistory(prev => {
        const next = [...prev, { t, x, v }];
        if (next.length > 100) next.shift();
        return next;
      });

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [mass, damping, stiffness]);

  // Determine system status: c^2 - 4*m*k
  const discriminant = damping * damping - 4 * mass * stiffness;
  let stateLabel = '';
  let stateColor = '';
  
  if (damping === 0) {
    stateLabel = 'תנודה לא מרוסנת (Undamped)';
    stateColor = 'text-blue-400';
  } else if (discriminant < 0) {
    stateLabel = 'תת-ריסון (Underdamped)';
    stateColor = 'text-yellow-400';
  } else if (discriminant === 0) {
    stateLabel = 'ריסון קריטי (Critically Damped)';
    stateColor = 'text-emerald-400';
  } else {
    stateLabel = 'ריסון יתר (Overdamped)';
    stateColor = 'text-red-400';
  }

  // Visual offsets for drawing the mass on screen
  const boxX = 250 + pos * 50; // Map position to pixels

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl p-5 overflow-hidden text-right" dir="rtl">
      <h3 className="text-xl font-black text-white mb-1">מתנד הרמוני מרוסן (סדר שני)</h3>
      <p className="text-slate-400 text-xs mb-3">פתרון משוואת \(my'' + cy' + ky = 0\)</p>

      {/* Visual representation */}
      <div className="relative h-[120px] bg-slate-950 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-start px-10 mb-4">
        {/* Wall */}
        <div className="w-3 h-full bg-slate-700 rounded-l-md border-r border-slate-800" />
        
        {/* Spring */}
        <svg className="absolute left-[52px]" width={boxX - 52} height="30" viewBox={`0 0 ${boxX - 52} 30`} preserveAspectRatio="none">
          <path d={`M 0 15 
            ${Array.from({ length: 12 }, (_, i) => {
              const x = ((boxX - 70) / 12) * (i + 0.5);
              const y = i % 2 === 0 ? 5 : 25;
              return `L ${x} ${y}`;
            }).join(' ')} 
            L ${boxX - 52} 15`} fill="none" stroke="#64748b" strokeWidth="2.5" />
        </svg>

        {/* Mass Box */}
        <div className="absolute rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 border border-emerald-400 flex items-center justify-center text-white text-xs font-bold"
          style={{ left: `${boxX}px`, width: '40px', height: '40px', transform: 'translateX(-50%)' }}>
          {mass}kg
        </div>

        {/* Dampener cylinder symbol */}
        <div className="absolute top-2 right-4 bg-slate-900/95 border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-300">
          סוג תנועה: <span className={`${stateColor}`}>{stateLabel}</span>
        </div>
      </div>

      {/* Real-time Graph of position vs velocity */}
      <div className="flex-1 bg-slate-950 rounded-2xl p-3 border border-white/5 min-h-[140px] flex flex-col justify-end">
        <div className="text-[10px] font-mono text-slate-500 mb-1 flex justify-between">
          <span>מהירות (v)</span>
          <span>מיקום (x)</span>
        </div>
        <div className="relative flex-1 flex items-center justify-center">
          {/* Phase space drawing container */}
          <svg className="w-full h-full" viewBox="0 0 200 100">
            <line x1="0" y1="50" x2="200" y2="50" stroke="rgba(255,255,255,0.1)" />
            <line x1="100" y1="0" x2="100" y2="100" stroke="rgba(255,255,255,0.1)" />
            {/* Draw trajectory */}
            {history.length > 1 && (
              <path d={`M ${100 + history[0].x * 35} ${50 - history[0].v * 10} ` + 
                history.slice(1).map(pt => `L ${100 + pt.x * 35} ${50 - pt.v * 10}`).join(' ')
              } fill="none" stroke="#10b981" strokeWidth="1.5" />
            )}
          </svg>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400">מסה (m):</span>
            <span className="text-emerald-400 font-bold">{mass.toFixed(1)} kg</span>
          </div>
          <input type="range" min="0.5" max="5" step="0.5" value={mass} onChange={e => setMass(Number(e.target.value))}
            className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400">ריסון (c):</span>
            <span className="text-yellow-400 font-bold">{damping.toFixed(1)}</span>
          </div>
          <input type="range" min="0" max="6" step="0.5" value={damping} onChange={e => setDamping(Number(e.target.value))}
            className="w-full accent-yellow-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400">קפיץ (k):</span>
            <span className="text-blue-400 font-bold">{stiffness.toFixed(1)} N/m</span>
          </div>
          <input type="range" min="1" max="15" step="1" value={stiffness} onChange={e => setStiffness(Number(e.target.value))}
            className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
