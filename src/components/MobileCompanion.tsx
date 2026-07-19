import React, { useState, useEffect } from 'react';
import { subscribeToState, SyncState } from '../utils/sync';
import { CoulombSimulator, GaussSimulator, CapacitorSimulator, InductionSimulator } from './PhysicsSimulators';
import { SlopeFieldSimulator, SpringOscillatorSimulator } from './ODESimulators';
import ElectrostaticsCompanion from './ElectrostaticsCompanion';
import { Smartphone, Zap, Activity, Atom } from 'lucide-react';

export default function MobileCompanion() {
  const [activeSimulator, setActiveSimulator] = useState<string>('electrostatics');
  const [synced, setSynced] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  useEffect(() => {
    // Listen to changes from the desktop screen
    const unsubscribe = subscribeToState((state: SyncState) => {
      if (synced && state.moduleId) {
        setActiveSimulator(state.moduleId);
        const now = new Date();
        setLastSyncTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`);
      }
    });

    return unsubscribe;
  }, [synced]);

  const renderSimulator = () => {
    switch (activeSimulator) {
      case 'electrostatics':
        return <ElectrostaticsCompanion />;
      case 'coulomb':
        return <CoulombSimulator />;
      case 'gauss':
        return <GaussSimulator />;
      case 'capacitors':
        return <CapacitorSimulator />;
      case 'induction':
        return <InductionSimulator />;
      case 'slope':
      case 'diffeq':
        return <SlopeFieldSimulator />;
      case 'spring':
        return <SpringOscillatorSimulator />;
      default:
        return <ElectrostaticsCompanion />;
    }
  };

  const tabs = [
    { id: 'electrostatics', label: 'אלקטרוסטטיקה', icon: <Atom size={12} />, highlight: true },
    { id: 'coulomb', label: 'קולון', icon: <Zap size={12} /> },
    { id: 'gauss', label: 'גאוס', icon: <Zap size={12} /> },
    { id: 'capacitors', label: 'קבלים', icon: <Zap size={12} /> },
    { id: 'induction', label: 'לנץ', icon: <Activity size={12} /> },
    { id: 'slope', label: 'שדה כיוונים', icon: <Activity size={12} /> },
    { id: 'spring', label: 'קפיץ', icon: <Activity size={12} /> },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans select-none" dir="rtl">
      {/* Mobile Top Header */}
      <header className="border-b border-white/5 bg-[#0f172a] px-4 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <Smartphone className="text-emerald-400 animate-pulse" size={20} />
          <div>
            <h1 className="text-sm font-black text-white">מסך נלווה לשיעור</h1>
            {lastSyncTime ? (
              <p className="text-[10px] text-emerald-400/80 font-mono">סונכרן: {lastSyncTime}</p>
            ) : (
              <p className="text-[10px] text-slate-500">פיזיקה 2 — אלקטרוסטטיקה</p>
            )}
          </div>
        </div>

        <label className="flex items-center gap-1.5 cursor-pointer">
          <span className="text-[10px] text-slate-400 font-bold">סנכרון</span>
          <input
            type="checkbox"
            checked={synced}
            onChange={() => setSynced(!synced)}
            className="accent-emerald-500 rounded"
          />
        </label>
      </header>

      {/* Simulator selector tab */}
      <div className="flex overflow-x-auto gap-1.5 px-2 py-2 border-b border-white/5 bg-[#0d1527] shrink-0" style={{ scrollbarWidth: 'none' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveSimulator(tab.id);
              setSynced(false);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap border shrink-0 transition-all ${
              activeSimulator === tab.id
                ? tab.highlight
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-md shadow-purple-500/20'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : tab.highlight
                  ? 'bg-purple-900/20 text-purple-400 border-purple-800/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main simulator container */}
      <div className="flex-1 p-3 overflow-y-auto flex flex-col">
        {renderSimulator()}
      </div>
    </div>
  );
}
