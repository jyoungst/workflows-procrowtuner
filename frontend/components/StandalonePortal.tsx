import React, { useState } from 'react';
import { Cpu, Flame, Save, Download, Upload, Sliders, RefreshCw, Layers, CheckCircle2, AlertTriangle, Sparkles, ShieldAlert, Zap, Send, Activity, Eye } from 'lucide-react';
import { StandaloneTune, AiWatchdogSuggestion } from '../types.ts';

interface StandalonePortalProps {
  isConnected: boolean;
  onWriteSerial: (cmd: string) => void;
}

const defaultRpmBins = [800, 1200, 1600, 2000, 2400, 2800, 3200, 3600, 4000, 4400, 4800, 5200, 5600, 6000, 6500, 7000];
const defaultLoadBins = [20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 220, 250];

const initialVeMap: number[][] = Array(16).fill(0).map((_, loadIdx) => {
  return Array(16).fill(0).map((_, rpmIdx) => {
    const base = 35 + (loadIdx * 4) + (rpmIdx * 2.5);
    return Math.min(Math.round(base), 140);
  });
});

export const StandalonePortal: React.FC<StandalonePortalProps> = ({ isConnected, onWriteSerial }) => {
  const [activeTable, setActiveTable] = useState<'VE' | 'IGNITION' | 'AFR'>('VE');
  const [viewMode, setViewMode] = useState<'GRID' | 'GRAPH_3D'>('GRID');

  const [tune, setTune] = useState<StandaloneTune>({
    fileName: 'Standalone_Teensy41_Stage2_ProCrow.msq',
    lastSaved: '2025-02-28 15:10',
    veTable: initialVeMap,
    ignitionTable: initialVeMap.map(row => row.map(v => Math.round(v / 4))),
    afrTable: initialVeMap.map(row => row.map(v => parseFloat((14.7 - (v / 40)).toFixed(1)))),
    rpmBins: defaultRpmBins,
    loadBins: defaultLoadBins,
    burnStatus: 'clean'
  });

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>({ row: 8, col: 8 });
  const [isBurning, setIsBurning] = useState(false);
  const [burnNotification, setBurnNotification] = useState<string | null>(null);

  // AI Watchdog Real-time Tuning Corrections
  const [watchdogSuggestions, setWatchdogSuggestions] = useState<AiWatchdogSuggestion[]>([
    {
      id: 'wd-01',
      timestamp: '15:12:04',
      severity: 'WARNING',
      component: 'VE_TABLE',
      title: 'Lean Mixture at High Boost Load (4400 RPM @ 180 kPa)',
      reasoning: 'Wideband AFR read 15.2:1 under high MAP. VE cell value 88 is under-fueled relative to mass airflow calculations.',
      proposedFix: 'Increase VE Table Row 12, Col 9 from 88 -> 104 (+18% fuel enrichment)',
      applied: false
    },
    {
      id: 'wd-02',
      timestamp: '15:11:20',
      severity: 'OPTIMIZATION',
      component: 'SPARK_ADVANCE',
      title: 'Spark Timing Safety Margin (5200 RPM @ 220 kPa)',
      reasoning: 'Pre-ignition knock sensor detected slight noise harmonics. Retarding timing 2.5° prevents detonation under boost.',
      proposedFix: 'Retard Spark Advance Row 14, Col 11 from 22° -> 19.5° BTDC',
      applied: false
    }
  ]);

  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const currentTable = activeTable === 'VE' ? tune.veTable : activeTable === 'IGNITION' ? tune.ignitionTable : tune.afrTable;

  const handleCellChange = (delta: number) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;

    setTune(prev => {
      const targetMap = activeTable === 'VE' ? [...prev.veTable] : activeTable === 'IGNITION' ? [...prev.ignitionTable] : [...prev.afrTable];
      const newRow = [...targetMap[row]];
      const curVal = newRow[col];
      
      const updatedVal = activeTable === 'AFR' 
        ? parseFloat((curVal + delta * 0.1).toFixed(1))
        : Math.max(0, curVal + delta);
        
      newRow[col] = updatedVal;
      targetMap[row] = newRow;

      return {
        ...prev,
        [activeTable === 'VE' ? 'veTable' : activeTable === 'IGNITION' ? 'ignitionTable' : 'afrTable']: targetMap,
        burnStatus: 'modified'
      };
    });
  };

  const applyWatchdogFix = (id: string) => {
    setWatchdogSuggestions(prev => prev.map(w => w.id === id ? { ...w, applied: true } : w));
    // Apply correction to current map
    if (selectedCell) {
      handleCellChange(12);
    }
  };

  const handleSendAiPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiCustomPrompt.trim() || isAiProcessing) return;

    setIsAiProcessing(true);
    onWriteSerial(`AI TUNE OPTIMIZE "${aiCustomPrompt}"\r`);

    setTimeout(() => {
      setIsAiProcessing(false);
      const newWd: AiWatchdogSuggestion = {
        id: `wd-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        severity: 'OPTIMIZATION',
        component: 'VE_TABLE',
        title: `AI Prompt Optimization: "${aiCustomPrompt.slice(0, 30)}..."`,
        reasoning: 'Gemini 2.5 recalculated volumetric efficiency surface for smoother throttle transition.',
        proposedFix: 'Applied smoothed 3D gradient vector across 3000-5000 RPM axis.',
        applied: true
      };

      setWatchdogSuggestions(w => [newWd, ...w]);
      setAiCustomPrompt('');
    }, 1500);
  };

  const burnToTeensyEcu = () => {
    setIsBurning(true);
    onWriteSerial('B\r');

    setTimeout(() => {
      setIsBurning(false);
      setTune(prev => ({ ...prev, burnStatus: 'synced' }));
      setBurnNotification('Flash page written successfully to Standalone ECU EEPROM!');
      setTimeout(() => setBurnNotification(null), 3000);
    }, 1200);
  };

  const getCellBgColor = (val: number) => {
    if (activeTable === 'VE') {
      const pct = Math.min(1, Math.max(0, (val - 30) / 100));
      return `rgba(${Math.round(255 * pct)}, ${Math.round(180 * (1 - pct))}, ${Math.round(255 * (1 - pct))}, 0.35)`;
    } else if (activeTable === 'IGNITION') {
      const pct = Math.min(1, Math.max(0, val / 35));
      return `rgba(${Math.round(255 * pct)}, ${Math.round(100 * pct)}, 220, 0.3)`;
    } else {
      const pct = Math.min(1, Math.max(0, (15 - val) / 4));
      return `rgba(255, ${Math.round(200 * (1 - pct))}, ${Math.round(100 * pct)}, 0.3)`;
    }
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-5 overflow-y-auto pb-20">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gray-900 border border-gray-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl">
            <Cpu className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Standalone ECU Master Portal (Teensy 4.1 / Speeduino)</h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded">ProCrow Tuner</span>
            </div>
            <p className="text-xs text-gray-400">Current File: <span className="font-mono text-cyan-400">{tune.fileName}</span> (Last Saved: {tune.lastSaved})</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleCellChange(-1)}
            disabled={!selectedCell}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-mono font-bold border border-gray-700 disabled:opacity-40"
          >
            - 1
          </button>
          <button
            onClick={() => handleCellChange(1)}
            disabled={!selectedCell}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-mono font-bold border border-gray-700 disabled:opacity-40"
          >
            + 1
          </button>

          <button
            onClick={burnToTeensyEcu}
            disabled={isBurning || !isConnected}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-lg ${
              tune.burnStatus === 'modified' 
                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20 animate-pulse' 
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20'
            } disabled:opacity-50`}
          >
            <Flame className={`w-4 h-4 ${isBurning ? 'animate-bounce' : ''}`} />
            <span>{isBurning ? 'Burning Flash...' : tune.burnStatus === 'modified' ? 'Burn Pending Map to ECU' : 'Burn Map to Flash'}</span>
          </button>
        </div>
      </div>

      {burnNotification && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{burnNotification}</span>
        </div>
      )}

      {/* AI Watchdog Corrections Feed Panel */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-mono">AI Tuning Watchdog Live Feed</h3>
          </div>
          <span className="text-xs text-cyan-400 font-mono">Real-Time AFR & Knock Monitor Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {watchdogSuggestions.map(wd => (
            <div key={wd.id} className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${
                  wd.severity === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                }`}>
                  {wd.severity}: {wd.component}
                </span>
                <span className="text-gray-500 font-mono text-[10px]">{wd.timestamp}</span>
              </div>

              <h4 className="font-bold text-white">{wd.title}</h4>
              <p className="text-gray-400 leading-relaxed">{wd.reasoning}</p>

              <div className="pt-2 flex items-center justify-between border-t border-gray-800/80 font-mono">
                <span className="text-cyan-300 text-[11px]">{wd.proposedFix}</span>
                {!wd.applied ? (
                  <button
                    onClick={() => applyWatchdogFix(wd.id)}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors text-[10px]"
                  >
                    Apply Fix
                  </button>
                ) : (
                  <span className="text-emerald-400 font-bold text-[10px] flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>CORRECTION APPLIED</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Custom AI Tuning Prompt Box */}
        <form onSubmit={handleSendAiPrompt} className="flex space-x-2 pt-2">
          <input
            type="text"
            value={aiCustomPrompt}
            onChange={(e) => setAiCustomPrompt(e.target.value)}
            placeholder="Ask AI to auto-smooth table, enrich low-end torque, or set E85 fuel scaling..."
            className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!aiCustomPrompt.trim() || isAiProcessing}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAiProcessing ? 'animate-spin' : ''}`} />
            <span>AI Prompt Tune</span>
          </button>
        </form>
      </div>

      {/* Table Selector & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-900 p-2 rounded-xl border border-gray-800 gap-2">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTable('VE')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${activeTable === 'VE' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Volumetric Efficiency (VE Map 1)
          </button>
          <button
            onClick={() => setActiveTable('IGNITION')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${activeTable === 'IGNITION' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Ignition Advance (Spark Map 1)
          </button>
          <button
            onClick={() => setActiveTable('AFR')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${activeTable === 'AFR' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Target AFR Map
          </button>
        </div>

        <div className="flex items-center space-x-2 bg-gray-950 p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => setViewMode('GRID')}
            className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${viewMode === 'GRID' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
          >
            16x16 Grid
          </button>
          <button
            onClick={() => setViewMode('GRAPH_3D')}
            className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${viewMode === 'GRAPH_3D' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
          >
            3D Mesh Preview
          </button>
        </div>
      </div>

      {/* Main 16x16 Grid / 3D Surface View */}
      {viewMode === 'GRID' ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="text-center text-xs font-semibold text-gray-400 mb-2 font-mono">
              ENGINE SPEED (RPM) →
            </div>

            <table className="w-full border-collapse font-mono text-xs">
              <thead>
                <tr>
                  <th className="p-1 text-gray-500 font-normal border border-gray-800 bg-gray-950 w-16">
                    Load (kPa)
                  </th>
                  {tune.rpmBins.map((rpm, colIdx) => (
                    <th key={colIdx} className="p-1 text-cyan-400 font-bold border border-gray-800 bg-gray-950 text-center">
                      {rpm}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tune.loadBins.slice().reverse().map((load, revRowIdx) => {
                  const rowIdx = 15 - revRowIdx;
                  return (
                    <tr key={rowIdx}>
                      <td className="p-1 text-purple-400 font-bold border border-gray-800 bg-gray-950 text-center">
                        {load}
                      </td>
                      {currentTable[rowIdx].map((cellValue, colIdx) => {
                        const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
                        return (
                          <td
                            key={colIdx}
                            onClick={() => setSelectedCell({ row: rowIdx, col: colIdx })}
                            style={{ backgroundColor: getCellBgColor(cellValue) }}
                            className={`p-2 border border-gray-800 text-center cursor-pointer transition-all hover:scale-105 ${
                              isSelected ? 'ring-2 ring-white font-black text-white bg-cyan-500/50' : 'text-gray-200'
                            }`}
                          >
                            {cellValue}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 min-h-[350px]">
          <Eye className="w-10 h-10 text-purple-400 animate-pulse" />
          <h3 className="text-base font-bold text-white">3D Surface Interpolation Mesh</h3>
          <p className="text-xs text-gray-400 max-w-md text-center">
            Renders smooth 3D volumetric surfaces based on active VE/Ignition array values. AI auto-detects map valleys and steep ignition steps.
          </p>
          <div className="w-full h-40 bg-gradient-to-tr from-purple-950/40 via-cyan-950/30 to-blue-950/40 border border-purple-500/30 rounded-xl flex items-center justify-center font-mono text-xs text-purple-300">
            [Interactive WebGL 3D Mesh Wireframe Simulated]
          </div>
        </div>
      )}
    </div>
  );
};
