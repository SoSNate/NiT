import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// --- COULOMB'S LAW SANDBOX ---
export function CoulombSimulator() {
  const [q1, setQ1] = useState(2); // in uC
  const [q2, setQ2] = useState(-3); // in uC
  const [distance, setDistance] = useState(1.5); // in meters
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw grid
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    
    // Draw subtle grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 30;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Positions of charges (centered vertically, separated by distance)
    const cy = height / 2;
    const scale = 100; // pixels per meter
    const midX = width / 2;
    const cx1 = midX - (distance / 2) * scale;
    const cx2 = midX + (distance / 2) * scale;

    // Calculate electric field vector at grid points (simplified visualization)
    const fieldGrid = 40;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let x = fieldGrid / 2; x < width; x += fieldGrid) {
      for (let y = fieldGrid / 2; y < height; y += fieldGrid) {
        // Avoid calculating inside the charge circles
        const r1_sq = (x - cx1) ** 2 + (y - cy) ** 2;
        const r2_sq = (x - cx2) ** 2 + (y - cy) ** 2;
        if (r1_sq < 900 || r2_sq < 900) continue;

        // E = kQ/r^2
        const dx1 = x - cx1;
        const dy1 = y - cy;
        const dist1 = Math.sqrt(r1_sq);
        const e1 = (q1 / r1_sq) * 10000;
        const ex1 = e1 * (dx1 / dist1);
        const ey1 = e1 * (dy1 / dist1);

        const dx2 = x - cx2;
        const dy2 = y - cy;
        const dist2 = Math.sqrt(r2_sq);
        const e2 = (q2 / r2_sq) * 10000;
        const ex2 = e2 * (dx2 / dist2);
        const ey2 = e2 * (dy2 / dist2);

        const totalEx = ex1 + ex2;
        const totalEy = ey1 + ey2;
        const totalE = Math.sqrt(totalEx ** 2 + totalEy ** 2);
        if (totalE < 0.1) continue;

        // Draw small arrow for electric field vector
        const arrowLength = Math.min(20, totalE * 0.1);
        const angle = Math.atan2(totalEy, totalEx);
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        // Dynamic intensity color based on field strength
        const strength = Math.min(255, Math.floor(totalE * 2));
        ctx.strokeStyle = `rgba(${100 + strength / 2}, ${150 + strength / 4}, 255, ${0.1 + (strength / 255) * 0.6})`;
        ctx.fillStyle = ctx.strokeStyle;
        
        ctx.beginPath();
        ctx.moveTo(-arrowLength / 2, 0);
        ctx.lineTo(arrowLength / 2, 0);
        ctx.stroke();

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(arrowLength / 2, 0);
        ctx.lineTo(arrowLength / 2 - 4, -3);
        ctx.lineTo(arrowLength / 2 - 4, 3);
        ctx.fill();
        
        ctx.restore();
      }
    }

    // Force vector between the two charges
    // F = k q1 q2 / r^2
    const k = 8.987;
    const force = (k * Math.abs(q1) * Math.abs(q2)) / (distance ** 2);
    const attractive = (q1 > 0) !== (q2 > 0);

    // Draw attractive/repulsive force arrows on charges
    const arrowMax = 60;
    const forceArrowLen = Math.min(arrowMax, force * 5 + 10);

    ctx.lineWidth = 3;
    const forceColor = attractive ? '#34d399' : '#f87171';
    ctx.strokeStyle = forceColor;
    ctx.fillStyle = forceColor;

    const drawForceArrow = (cx: number, dir: number) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + dir * forceArrowLen, cy);
      ctx.stroke();

      // Arrow head
      ctx.beginPath();
      ctx.moveTo(cx + dir * forceArrowLen, cy);
      ctx.lineTo(cx + dir * forceArrowLen - dir * 8, cy - 6);
      ctx.lineTo(cx + dir * forceArrowLen - dir * 8, cy + 6);
      ctx.fill();
    };

    if (attractive) {
      drawForceArrow(cx1 + 25, 1);
      drawForceArrow(cx2 - 25, -1);
    } else {
      drawForceArrow(cx1 - 25, -1);
      drawForceArrow(cx2 + 25, 1);
    }

    // Draw Charge 1
    ctx.beginPath();
    ctx.arc(cx1, cy, 20 + Math.abs(q1) * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = q1 >= 0 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(59, 130, 246, 0.25)';
    ctx.strokeStyle = q1 >= 0 ? '#ef4444' : '#3b82f6';
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${q1 > 0 ? '+' : ''}${q1} μC`, cx1, cy);

    // Draw Charge 2
    ctx.beginPath();
    ctx.arc(cx2, cy, 20 + Math.abs(q2) * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = q2 >= 0 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(59, 130, 246, 0.25)';
    ctx.strokeStyle = q2 >= 0 ? '#ef4444' : '#3b82f6';
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${q2 > 0 ? '+' : ''}${q2} μC`, cx2, cy);

    // Draw distance label
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx1, cy + 40);
    ctx.lineTo(cx1, cy + 55);
    ctx.moveTo(cx2, cy + 40);
    ctx.lineTo(cx2, cy + 55);
    ctx.moveTo(cx1, cy + 48);
    ctx.lineTo(cx2, cy + 48);
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText(`r = ${distance.toFixed(2)} m`, midX, cy + 62);

  }, [q1, q2, distance]);

  // Compute force for UI readouts
  const k = 8.9875;
  const forceVal = (k * Math.abs(q1) * Math.abs(q2)) / (distance ** 2);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl p-5 overflow-hidden text-right" dir="rtl">
      <h3 className="text-xl font-black text-white mb-2">סימולטור חוק קולון</h3>
      
      <div className="relative flex-1 bg-slate-950 rounded-2xl overflow-hidden border border-white/5 min-h-[220px]">
        <canvas ref={canvasRef} width={500} height={250} className="w-full h-full block" />
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-slate-300">
          כוח חשמלי: <span className="text-emerald-400 font-bold">{forceVal.toFixed(2)} N</span>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {/* Sliders */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400">מטען 1 (q₁):</span>
            <span className={`font-bold ${q1 >= 0 ? 'text-red-400' : 'text-blue-400'}`}>{q1} μC</span>
          </div>
          <input type="range" min="-8" max="8" step="1" value={q1} onChange={e => setQ1(Number(e.target.value))}
            className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400">מטען 2 (q₂):</span>
            <span className={`font-bold ${q2 >= 0 ? 'text-red-400' : 'text-blue-400'}`}>{q2} μC</span>
          </div>
          <input type="range" min="-8" max="8" step="1" value={q2} onChange={e => setQ2(Number(e.target.value))}
            className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400">מרחק (r):</span>
            <span className="text-emerald-400 font-bold">{distance.toFixed(2)} מטר</span>
          </div>
          <input type="range" min="0.5" max="3" step="0.1" value={distance} onChange={e => setDistance(Number(e.target.value))}
            className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
        </div>
      </div>
    </div>
  );
}

// --- GAUSS'S LAW SANDBOX ---
export function GaussSimulator() {
  const [charge, setCharge] = useState(3); // nC
  const [radius, setRadius] = useState(1.2); // m
  const [shape, setShape] = useState<'sphere' | 'cylinder'>('sphere');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const scale = 80; // px per meter
    const rPx = radius * scale;

    // Draw E-field rays radiating outward
    const rayCount = Math.abs(charge) * 6;
    const chargeColor = charge >= 0 ? '#ef4444' : '#3b82f6';
    
    if (charge !== 0 && rayCount > 0) {
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = chargeColor;
      for (let i = 0; i < rayCount; i++) {
        const angle = (i * 2 * Math.PI) / rayCount;
        const dir = charge > 0 ? 1 : -1;
        
        ctx.beginPath();
        // Radiate lines outward from charge
        const startR = 15;
        const endR = 150;
        const sx = cx + Math.cos(angle) * startR;
        const sy = cy + Math.sin(angle) * startR;
        const ex = cx + Math.cos(angle) * endR;
        const ey = cy + Math.sin(angle) * endR;
        
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // Draw arrowheads indicating direction along the ray
        const arrowR = rPx;
        const ax = cx + Math.cos(angle) * arrowR;
        const ay = cy + Math.sin(angle) * arrowR;
        
        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(angle + (dir > 0 ? 0 : Math.PI));
        ctx.fillStyle = chargeColor;
        ctx.beginPath();
        ctx.moveTo(4, 0);
        ctx.lineTo(-4, -4);
        ctx.lineTo(-4, 4);
        ctx.fill();
        ctx.restore();
      }
    }

    // Draw Gaussian surface
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = '#a855f7'; // purple
    ctx.beginPath();
    if (shape === 'sphere') {
      ctx.arc(cx, cy, rPx, 0, Math.PI * 2);
    } else {
      // Cylinder 2D outline (box-like)
      ctx.rect(cx - rPx, cy - 70, rPx * 2, 140);
    }
    ctx.stroke();
    ctx.setLineDash([]); // Reset

    // Draw Charge in center
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fillStyle = chargeColor;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${charge > 0 ? '+' : ''}${charge}`, cx, cy);

    // Label Gaussian Surface
    ctx.fillStyle = '#c084fc';
    ctx.font = '10px monospace';
    ctx.fillText(shape === 'sphere' ? 'משטח גאוסיאני כדורי' : 'משטח גאוסיאני גלילי', cx, cy - rPx - 8);

  }, [charge, radius, shape]);

  // Compute flux: Φ = Q_enclosed / ε₀
  const e0 = 8.854; // inside math unit
  const flux = charge / e0;

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl p-5 overflow-hidden text-right" dir="rtl">
      <h3 className="text-xl font-black text-white mb-2">סימולטור חוק גאוס</h3>
      
      <div className="relative flex-1 bg-slate-950 rounded-2xl overflow-hidden border border-white/5 min-h-[220px]">
        <canvas ref={canvasRef} width={500} height={250} className="w-full h-full block" />
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-slate-300">
          שטף חשמלי (Φ): <span className="text-purple-400 font-bold">{flux.toFixed(3)} V·m</span>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {/* Shape selector */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-xs">סוג המשטח:</span>
          <div className="flex gap-2">
            <button onClick={() => setShape('sphere')} className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${shape === 'sphere' ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>כדור</button>
            <button onClick={() => setShape('cylinder')} className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${shape === 'cylinder' ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>גליל</button>
          </div>
        </div>

        {/* Sliders */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400">מטען כלוא (q):</span>
            <span className={`font-bold ${charge >= 0 ? 'text-red-400' : 'text-blue-400'}`}>{charge} nC</span>
          </div>
          <input type="range" min="-6" max="6" step="1" value={charge} onChange={e => setCharge(Number(e.target.value))}
            className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400">רדיוס המשטח (R):</span>
            <span className="text-purple-400 font-bold">{radius.toFixed(2)} מטר</span>
          </div>
          <input type="range" min="0.6" max="2.0" step="0.1" value={radius} onChange={e => setRadius(Number(e.target.value))}
            className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
        </div>
      </div>
    </div>
  );
}

// --- CAPACITOR SANDBOX ---
export function CapacitorSimulator() {
  const [voltage, setVoltage] = useState(1.5); // V
  const [distance, setDistance] = useState(1.0); // mm
  const [area, setArea] = useState(200); // mm^2
  const [dielectric, setDielectric] = useState(1.0); // dielectric constant kappa
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const midX = width / 2;
    const cy = height / 2;
    
    // Physical mapping (scale for visual representation)
    const gap = distance * 40; // gap in pixels (max 80px)
    const platelen = Math.min(220, 80 + area * 0.4);

    const topY = cy - gap / 2;
    const bottomY = cy + gap / 2;

    // Draw dielectric block if kappa > 1
    if (dielectric > 1) {
      ctx.fillStyle = `rgba(168, 85, 247, ${0.1 + (dielectric / 10) * 0.4})`;
      ctx.fillRect(midX - platelen / 2, topY + 4, platelen, gap - 8);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1;
      ctx.strokeRect(midX - platelen / 2, topY + 4, platelen, gap - 8);
      
      // Polarization charges inside dielectric
      ctx.fillStyle = 'rgba(59, 130, 246, 0.4)'; // negative charges near positive top plate
      ctx.fillText('- - - - -', midX, topY + 14);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)'; // positive charges near negative bottom plate
      ctx.fillText('+ + + + +', midX, bottomY - 14);
    }

    // Draw electric field lines between plates
    const eLinesCount = Math.floor(platelen / 18);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)'; // golden lines
    ctx.lineWidth = 1.5;
    for (let i = 0; i < eLinesCount; i++) {
      const lx = midX - platelen / 2 + (i + 0.5) * (platelen / eLinesCount);
      ctx.beginPath();
      ctx.moveTo(lx, topY + 4);
      ctx.lineTo(lx, bottomY - 4);
      ctx.stroke();

      // Small arrows pointing top-to-bottom (assuming top plate is positive)
      ctx.fillStyle = 'rgba(251, 191, 36, 0.8)';
      ctx.beginPath();
      ctx.moveTo(lx, cy);
      ctx.lineTo(lx - 3, cy - 4);
      ctx.lineTo(lx + 3, cy - 4);
      ctx.fill();
    }

    // Draw plates
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#e2e8f0'; // slate silver
    
    // Top Plate
    ctx.beginPath();
    ctx.moveTo(midX - platelen / 2, topY);
    ctx.lineTo(midX + platelen / 2, topY);
    ctx.stroke();

    // Bottom Plate
    ctx.beginPath();
    ctx.moveTo(midX - platelen / 2, bottomY);
    ctx.lineTo(midX + platelen / 2, bottomY);
    ctx.stroke();

    // Render positive charges (+) on top plate
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    const numSign = Math.floor(platelen / 20);
    for (let i = 0; i < numSign; i++) {
      const cx = midX - platelen / 2 + (i + 0.5) * (platelen / numSign);
      ctx.fillText('+', cx, topY - 8);
      ctx.fillText('-', cx, bottomY + 12);
    }

  }, [voltage, distance, area, dielectric]);

  // Calculations
  const e0 = 8.854; // pF/m approximation
  const cap = (dielectric * e0 * area) / (distance * 1000); // in pF
  const charge = cap * voltage; // in pC
  const energy = 0.5 * cap * (voltage ** 2); // in pJ

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl p-5 overflow-hidden text-right" dir="rtl">
      <h3 className="text-xl font-black text-white mb-2">סימולטור קבל לוחות</h3>
      
      <div className="relative flex-1 bg-slate-950 rounded-2xl overflow-hidden border border-white/5 min-h-[220px]">
        <canvas ref={canvasRef} width={500} height={250} className="w-full h-full block" />
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-slate-300 space-y-1">
          <div>קיבול (C): <span className="text-yellow-400 font-bold">{cap.toFixed(2)} pF</span></div>
          <div>מטען (Q): <span className="text-emerald-400 font-bold">{charge.toFixed(2)} pC</span></div>
          <div>אנרגיה (U): <span className="text-indigo-400 font-bold">{energy.toFixed(2)} pJ</span></div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400">מתח (V):</span>
            <span className="text-yellow-400 font-bold">{voltage.toFixed(2)} V</span>
          </div>
          <input type="range" min="0.1" max="3" step="0.1" value={voltage} onChange={e => setVoltage(Number(e.target.value))}
            className="w-full accent-yellow-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400">מרווח (d):</span>
            <span className="text-emerald-400 font-bold">{distance.toFixed(1)} mm</span>
          </div>
          <input type="range" min="0.5" max="3" step="0.1" value={distance} onChange={e => setDistance(Number(e.target.value))}
            className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400">שטח לוחות (A):</span>
            <span className="text-indigo-400 font-bold">{area} mm²</span>
          </div>
          <input type="range" min="100" max="400" step="10" value={area} onChange={e => setArea(Number(e.target.value))}
            className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400">קבוע דיאלקטרי (κ):</span>
            <span className="text-purple-400 font-bold">{dielectric.toFixed(1)}</span>
          </div>
          <input type="range" min="1" max="5" step="0.5" value={dielectric} onChange={e => setDielectric(Number(e.target.value))}
            className="w-full accent-purple-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
        </div>
      </div>
    </div>
  );
}

// --- LENZ'S LAW & INDUCTION ---
export function InductionSimulator() {
  const [magnetPos, setMagnetPos] = useState(0); // -100 to 100
  const [coilTurns, setCoilTurns] = useState(3);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevFluxRef = useRef(0);
  const [inducedCurrent, setInducedCurrent] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const cy = height / 2;
    const midX = width / 2;

    // Draw Coil / Solenoid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    const coilRadius = 35;
    
    // Draw loops of copper coil
    ctx.strokeStyle = '#d97706'; // copper color
    ctx.lineWidth = 4;
    for (let i = 0; i < coilTurns; i++) {
      const coilX = midX - 30 + i * 25;
      
      // Back half loop
      ctx.beginPath();
      ctx.arc(coilX, cy, coilRadius, -Math.PI / 2, Math.PI / 2, true);
      ctx.stroke();
    }

    // Magnet Position (mapped to pixels)
    // magnetPos ranges from -100 (left) to 100 (right)
    const magnetX = midX - 120 + (magnetPos / 100) * 120;
    
    // Draw Magnet
    const magnetW = 90;
    const magnetH = 30;
    
    // South side (Blue)
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(magnetX - magnetW/2, cy - magnetH/2, magnetW/2, magnetH);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', magnetX - magnetW/4, cy);

    // North side (Red)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(magnetX, cy - magnetH/2, magnetW/2, magnetH);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('N', magnetX + magnetW/4, cy);

    // Draw front half of copper coil loops (so magnet slides "inside")
    ctx.strokeStyle = '#f59e0b'; // copper color
    ctx.lineWidth = 4.5;
    for (let i = 0; i < coilTurns; i++) {
      const coilX = midX - 30 + i * 25;
      ctx.beginPath();
      ctx.arc(coilX, cy, coilRadius, -Math.PI / 2, Math.PI / 2, false);
      ctx.stroke();
    }

    // Calculate Magnetic Flux
    // Flux is maximum when magnet N-pole is directly inside coil (around magnetX = midX)
    const distToCoil = magnetX - midX;
    const flux = Math.exp(-(distToCoil ** 2) / 2500) * 10 * coilTurns;

    // Calculate induced EMF / Current: emf = -dFlux/dt
    const dFlux = flux - prevFluxRef.current;
    prevFluxRef.current = flux;
    
    // Multiply by factor to get measurable current visual
    const current = -dFlux * 15;
    setInducedCurrent(current);

    // Draw current flow arrows if current is flowing
    if (Math.abs(current) > 0.05) {
      ctx.strokeStyle = current > 0 ? '#10b981' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(midX, cy + 60, 20, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.fillStyle = current > 0 ? '#10b981' : '#ef4444';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(current > 0 ? '↻' : '↺', midX, cy + 60);
    }

  }, [magnetPos, coilTurns]);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl p-5 overflow-hidden text-right" dir="rtl">
      <h3 className="text-xl font-black text-white mb-2">חוק לנץ ואינדוקציה</h3>
      
      <div className="relative flex-1 bg-slate-950 rounded-2xl overflow-hidden border border-white/5 min-h-[220px]">
        <canvas ref={canvasRef} width={500} height={250} className="w-full h-full block" />
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-slate-300">
          זרם מושרה: <span className={`font-bold ${inducedCurrent > 0 ? 'text-emerald-400' : inducedCurrent < 0 ? 'text-red-400' : 'text-slate-400'}`}>{inducedCurrent.toFixed(2)} A</span>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400">הזז מגנט (משוך להזזה):</span>
            <span className="text-blue-400 font-bold">{magnetPos > 0 ? 'פנימה' : magnetPos < 0 ? 'החוצה' : 'מרכז'}</span>
          </div>
          <input type="range" min="-100" max="100" step="2" value={magnetPos} onChange={e => setMagnetPos(Number(e.target.value))}
            className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
        </div>

        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400">מספר כריכות בסליל:</span>
            <span className="text-amber-500 font-bold">{coilTurns} כריכות</span>
          </div>
          <input type="range" min="1" max="5" step="1" value={coilTurns} onChange={e => setCoilTurns(Number(e.target.value))}
            className="w-full accent-amber-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
