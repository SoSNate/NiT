import React, { useState, useEffect, useRef, useCallback } from 'react';

type ShapeType = 'sphere' | 'cylinder' | 'plate' | 'irregular';
type MaterialType = 'conductor' | 'insulator';
type ScenarioType = 'single' | 'external_charge' | 'two_charges' | 'grounded';

// ==========================================
// ELECTROSTATICS COMPANION - Physics 2
// ==========================================

function getChargePositions(
  shape: ShapeType,
  material: MaterialType,
  cx: number,
  cy: number,
  scenario: ScenarioType,
  externalCharge: { x: number; y: number; sign: number } | null,
  netCharge: number // -3 to 3
): { x: number; y: number; sign: number }[] {
  const count = Math.abs(netCharge) + (scenario === 'external_charge' ? 3 : 0);
  const charges: { x: number; y: number; sign: number }[] = [];

  if (material === 'insulator') {
    // In insulator: charges are fixed in place — distributed uniformly throughout volume
    if (shape === 'sphere') {
      const r = 60;
      const total = Math.max(6, count + 4);
      for (let i = 0; i < total; i++) {
        const angle = (i / total) * Math.PI * 2;
        // Place charges somewhat randomly inside sphere using polar coords
        const rr = r * 0.3 + (i % 3) * r * 0.2;
        charges.push({
          x: cx + Math.cos(angle + i * 0.3) * rr,
          y: cy + Math.sin(angle + i * 0.3) * rr,
          sign: netCharge >= 0 ? 1 : -1,
        });
      }
    } else if (shape === 'plate') {
      const w = 120, h = 80;
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 3; j++) {
          charges.push({
            x: cx - w / 2 + 20 + i * (w - 30) / 4,
            y: cy - h / 2 + 15 + j * (h - 30) / 2,
            sign: netCharge >= 0 ? 1 : -1,
          });
        }
      }
    }
  } else {
    // CONDUCTOR: charges go to surface only
    if (scenario === 'external_charge' && externalCharge) {
      // Charge separation (polarization): opposite charges drawn toward external charge side
      const side = externalCharge.x < cx ? -1 : 1; // Which side is the external charge?
      const r = shape === 'sphere' ? 65 : 80;
      const total = 8;
      for (let i = 0; i < total; i++) {
        const angle = (i / total) * Math.PI * 2;
        const isNearSide = Math.cos(angle) * side > 0.3;
        const isFarSide = Math.cos(angle) * side < -0.3;
        if (isNearSide) {
          // Induced charge opposite to external charge on near side
          charges.push({
            x: cx + Math.cos(angle) * r,
            y: cy + Math.sin(angle) * r,
            sign: -externalCharge.sign,
          });
        } else if (isFarSide) {
          // Same sign pushed to far side
          charges.push({
            x: cx + Math.cos(angle) * r,
            y: cy + Math.sin(angle) * r,
            sign: externalCharge.sign,
          });
        }
      }
    } else if (scenario === 'grounded') {
      // Grounded: excess charge escapes, only induced opposite charges remain
      const r = shape === 'sphere' ? 65 : 80;
      if (externalCharge) {
        const side = externalCharge.x < cx ? -1 : 1;
        for (let i = 0; i < 5; i++) {
          const angle = (-Math.PI / 2) + i * (Math.PI / 4);
          charges.push({
            x: cx + Math.cos(angle - side * 1.1) * r,
            y: cy + Math.sin(angle - side * 1.1) * r,
            sign: -externalCharge.sign,
          });
        }
      }
    } else if (scenario === 'two_charges') {
      // Two external charges: complex redistribution
      const r = 65;
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        // Bias toward right and left extremes
        const bias = Math.cos(angle);
        const sign = bias > 0.4 ? 1 : bias < -0.4 ? -1 : 0;
        if (sign !== 0) {
          charges.push({
            x: cx + Math.cos(angle) * r,
            y: cy + Math.sin(angle) * r,
            sign,
          });
        }
      }
    } else {
      // Default: uniform surface distribution
      const r = shape === 'sphere' ? 65 : 80;
      const total = Math.max(6, Math.abs(netCharge) * 3 + 4);
      for (let i = 0; i < total; i++) {
        const angle = (i / total) * Math.PI * 2;
        charges.push({
          x: cx + Math.cos(angle) * r,
          y: cy + Math.sin(angle) * r,
          sign: netCharge >= 0 ? 1 : -1,
        });
      }
    }
  }

  return charges;
}

export default function ElectrostaticsCompanion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [material, setMaterial] = useState<MaterialType>('conductor');
  const [shape, setShape] = useState<ShapeType>('sphere');
  const [scenario, setScenario] = useState<ScenarioType>('single');
  const [netCharge, setNetCharge] = useState(2);
  const [animPhase, setAnimPhase] = useState(0);
  const animRef = useRef<number>(0);

  // Animate for pulsing effect
  useEffect(() => {
    let t = 0;
    const loop = () => {
      t += 0.04;
      setAnimPhase(t);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, W, H);

    // Draw subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 25) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 25) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    const cx = W / 2;
    const cy = H / 2;

    // External charge positions for polarization scenario
    const externalCharge: { x: number; y: number; sign: number } | null =
      scenario === 'external_charge'
        ? { x: cx - 155, y: cy, sign: 1 }
        : scenario === 'grounded'
        ? { x: cx - 155, y: cy, sign: 1 }
        : null;

    const twoExternalCharges =
      scenario === 'two_charges'
        ? [
            { x: cx - 160, y: cy - 40, sign: 1 },
            { x: cx + 160, y: cy + 40, sign: -1 },
          ]
        : null;

    // Draw external charges
    const drawExternalCharge = (ecx: number, ecy: number, sign: number) => {
      ctx.beginPath();
      ctx.arc(ecx, ecy, 14, 0, Math.PI * 2);
      ctx.fillStyle = sign > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)';
      ctx.fill();
      ctx.strokeStyle = sign > 0 ? '#ef4444' : '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sign > 0 ? '+' : '−', ecx, ecy);
    };

    if (externalCharge) drawExternalCharge(externalCharge.x, externalCharge.y, externalCharge.sign);
    if (twoExternalCharges) {
      twoExternalCharges.forEach(ec => drawExternalCharge(ec.x, ec.y, ec.sign));
    }

    // Draw the body (conductor/insulator)
    ctx.save();
    if (shape === 'sphere') {
      // Glow effect
      const glow = ctx.createRadialGradient(cx, cy - 15, 5, cx, cy, 75);
      glow.addColorStop(0, material === 'conductor' ? 'rgba(148,163,184,0.15)' : 'rgba(251,191,36,0.1)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, 90, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, 70, 0, Math.PI * 2);
      ctx.fillStyle = material === 'conductor' ? 'rgba(148,163,184,0.06)' : 'rgba(251,191,36,0.04)';
      ctx.fill();
      ctx.strokeStyle = material === 'conductor' ? '#94a3b8' : '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    } else if (shape === 'plate') {
      ctx.beginPath();
      ctx.roundRect(cx - 130, cy - 90, 260, 180, 14);
      ctx.fillStyle = material === 'conductor' ? 'rgba(148,163,184,0.06)' : 'rgba(251,191,36,0.04)';
      ctx.fill();
      ctx.strokeStyle = material === 'conductor' ? '#94a3b8' : '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    } else if (shape === 'cylinder') {
      ctx.beginPath();
      ctx.roundRect(cx - 55, cy - 90, 110, 180, 30);
      ctx.fillStyle = material === 'conductor' ? 'rgba(148,163,184,0.06)' : 'rgba(251,191,36,0.04)';
      ctx.fill();
      ctx.strokeStyle = material === 'conductor' ? '#94a3b8' : '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    ctx.restore();

    // Material label
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = material === 'conductor' ? '#94a3b8' : '#f59e0b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(material === 'conductor' ? '⚡ מוליך' : '🧱 מבודד', cx, cy - 95);

    // Draw ground wire if grounded
    if (scenario === 'grounded') {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 72);
      ctx.lineTo(cx, H - 10);
      ctx.stroke();
      // Ground symbol
      for (let i = 0; i < 3; i++) {
        const len = 18 - i * 4;
        ctx.beginPath();
        ctx.moveTo(cx - len, H - 10 - i * 7);
        ctx.lineTo(cx + len, H - 10 - i * 7);
        ctx.stroke();
      }
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('ארקה (Ground)', cx, H - 10 - 24);
    }

    // Compute and draw charge positions
    const allExternalCharges = twoExternalCharges ? twoExternalCharges[0] : externalCharge;
    const chargePositions = getChargePositions(shape, material, cx, cy, scenario, allExternalCharges, netCharge);

    chargePositions.forEach((ch, i) => {
      const pulse = 1 + Math.sin(animPhase + i * 0.8) * 0.12;
      ctx.save();
      ctx.beginPath();
      ctx.arc(ch.x, ch.y, 8 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = ch.sign > 0 ? 'rgba(239,68,68,0.9)' : 'rgba(59,130,246,0.9)';
      ctx.shadowColor = ch.sign > 0 ? '#ef4444' : '#3b82f6';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ch.sign > 0 ? '+' : '−', ch.x, ch.y);
    });

    // Field lines (only for conductor in single mode)
    if (material === 'conductor' && scenario === 'single' && netCharge !== 0) {
      const r = 70;
      const lineCount = 8;
      ctx.strokeStyle = netCharge > 0 ? 'rgba(239,68,68,0.25)' : 'rgba(59,130,246,0.25)';
      ctx.lineWidth = 1;
      for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        ctx.lineTo(cx + Math.cos(angle) * (r + 60), cy + Math.sin(angle) * (r + 60));
        ctx.stroke();
      }
    }

    // Polarization arrows for external charge scenario
    if (scenario === 'external_charge' && material === 'conductor') {
      ctx.strokeStyle = 'rgba(167, 243, 208, 0.6)';
      ctx.lineWidth = 1.5;
      // Draw an arrow through the body suggesting charge flow
      const arrowX1 = cx - 60, arrowX2 = cx + 60;
      ctx.beginPath();
      ctx.moveTo(arrowX1, cy);
      ctx.lineTo(arrowX2, cy);
      ctx.stroke();
      // Arrow head
      ctx.fillStyle = 'rgba(167, 243, 208, 0.6)';
      ctx.beginPath();
      ctx.moveTo(arrowX2, cy);
      ctx.lineTo(arrowX2 - 8, cy - 6);
      ctx.lineTo(arrowX2 - 8, cy + 6);
      ctx.fill();
      ctx.fillStyle = 'rgba(167,243,208,0.8)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('הפרדת מטענים', cx, cy - 12);
    }

  }, [material, shape, scenario, netCharge, animPhase]);

  const scenarioLabels: Record<ScenarioType, string> = {
    single: 'גוף בודד',
    external_charge: '+ מטען חיצוני',
    two_charges: 'שני מטענים חיצוניים',
    grounded: 'ארקה (Ground)',
  };

  const scenarioDesc: Record<ScenarioType, string> = {
    single: 'מטען על גוף בודד — ראה כיצד הוא מתפזר',
    external_charge: 'מטען חיצוני גורם לקיטוב (polarization) — הפרדת מטענים',
    two_charges: 'שני מטענים חיצוניים — התפלגות מורכבת',
    grounded: 'ארקה: המטענים המודרים בורחים, רק המוניית נשארת',
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#090d16] text-white text-right font-sans" dir="rtl">
      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-slate-950" style={{ minHeight: 280 }}>
        <canvas ref={canvasRef} width={520} height={290} className="w-full h-full block" />
        {/* Info box */}
        <div className="absolute bottom-2 right-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 max-w-[200px]">
          <p className="text-[10px] text-slate-400 leading-relaxed">{scenarioDesc[scenario]}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-3 space-y-3">
        {/* Material toggle */}
        <div className="flex gap-2">
          {(['conductor', 'insulator'] as MaterialType[]).map(m => (
            <button key={m} onClick={() => setMaterial(m)}
              className={`flex-1 py-2 rounded-xl border text-xs font-black transition-all ${
                material === m
                  ? m === 'conductor'
                    ? 'bg-slate-500/30 text-slate-200 border-slate-400/40 shadow-lg'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}>
              {m === 'conductor' ? '⚡ מוליך' : '🧱 מבודד'}
            </button>
          ))}
        </div>

        {/* Shape selector */}
        <div className="flex gap-1.5">
          {(['sphere', 'plate', 'cylinder'] as ShapeType[]).map(s => (
            <button key={s} onClick={() => setShape(s)}
              className={`flex-1 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                shape === s
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}>
              {s === 'sphere' ? '● כדור' : s === 'plate' ? '▬ לוח' : '▮ גליל'}
            </button>
          ))}
        </div>

        {/* Scenario selector */}
        <div className="grid grid-cols-2 gap-1.5">
          {(Object.keys(scenarioLabels) as ScenarioType[]).map(sc => (
            <button key={sc} onClick={() => setScenario(sc)}
              className={`py-1.5 px-2 rounded-xl border text-[10px] font-bold transition-all text-right ${
                scenario === sc
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}>
              {scenarioLabels[sc]}
            </button>
          ))}
        </div>

        {/* Net charge slider */}
        <div>
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-slate-400">מטען נטו על הגוף:</span>
            <span className={`font-black ${netCharge > 0 ? 'text-red-400' : netCharge < 0 ? 'text-blue-400' : 'text-slate-400'}`}>
              {netCharge > 0 ? `+${netCharge}Q` : netCharge < 0 ? `${netCharge}Q` : 'נייטרלי'}
            </span>
          </div>
          <input type="range" min="-3" max="3" step="1" value={netCharge} onChange={e => setNetCharge(Number(e.target.value))}
            className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
