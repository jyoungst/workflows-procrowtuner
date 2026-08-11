import React, { useState } from 'react';
import { Copy, Cpu, ArrowRight, Download, CheckCircle2, RefreshCw, FileCode, Layers, Zap, ChevronLeft, ChevronRight, Sliders, Flame, HardDrive, Sparkles } from 'lucide-react';
import { CopycatMapProfile, CopycatTableKey } from '../types.ts';

interface StockCopycatTunerProps {
  onWriteSerial: (cmd: string) => void;
}

// Bin axes for 16x16 grid
const defaultRpmBins = [800, 1200, 1600, 2000, 2400, 2800, 3200, 3600, 4000, 4400, 4800, 5200, 5600, 6000, 6500, 7000];
const defaultLoadBins = [20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 220, 250];

// Helper grid generators
const generateSampleMap = (base: number, loadSlope: number, rpmSlope: number) => {
  return Array(16).fill(0).map((_, loadIdx) => {
    return Array(16).fill(0).map((_, rpmIdx) => {
      const val = base + (loadIdx * loadSlope) + (rpmIdx * rpmSlope);
      return Math.min(Math.max(Math.round(val), 0), 255);
    });
  });
};

const TABLE_DEFINITIONS: { key: CopycatTableKey; label: string; unit: string; description: string }[] = [
  { key: 'partThrottleFuel', label: '1. Part-Throttle VE / Fuel Map', unit: 'VE %', description: 'Cruising & light acceleration volumetric efficiency extracted from factory DME byte offsets.' },
  { key: 'fullThrottleFuel', label: '2. Full Load WOT Fuel Map', unit: 'VE %', description: 'Wide-open throttle power enrichment targets copied from factory high-load fuel curves.' },
  { key: 'vanosIntakeCamAdvance', label: '3. VANOS Intake Cam Timing', unit: '° CRK', description: 'Continuous variable intake camshaft advance curve extracted from OEM DME ECU.' },
  { key: 'vanosExhaustCamAdvance', label: '4. VANOS Exhaust Cam Timing', unit: '° CRK', description: 'Continuous variable exhaust camshaft retard/advance overlap map.' },
  { key: 'ignitionBase', label: '5. Base Ignition Spark Advance', unit: '° BTDC', description: 'Factory timing map before knock sensor corrections & air temp retard offsets.' },
  { key: 'dwellControl', label: '6. Coil Dwell Time Control', unit: 'ms', description: 'Primary ignition coil charging dwell duration mapped across battery voltage & RPM.' },
];

export const StockCopycatTuner: React.FC<StockCopycatTunerProps> = ({ onWriteSerial }) => {
  const [profiles, setProfiles] = useState<CopycatMapProfile[]>([
    {
      id: 'copy-01',
      stockDmeName: 'BMW MS43 Siemens M54B30 Factory DME',
      ecuFamily: 'Siemens MS43 (16-bit C167)',
      extractedMaps: {
        partThrottleFuel: generateSampleMap(40, 3.5, 2.0),
        fullThrottleFuel: generateSampleMap(75, 2.5, 3.0),
        vanosIntakeCamAdvance: generateSampleMap(5, 1.2, 1.5),
        vanosExhaustCamAdvance: generateSampleMap(0, 0.8, 1.1),
        ignitionBase: generateSampleMap(10, 0.5, 1.2),
        dwellControl: generateSampleMap(2.5, 0.1, 0.05),
      },
      rpmBins: defaultRpmBins,
      loadBins: defaultLoadBins,
      targetStandaloneEcu: 'Speeduino Teensy 4.1',
      transferredAt: '2025-02-28 13:40',
      compatibilityMatchPercent: 98
    },
    {
      id: 'copy-02',
      stockDmeName: 'BMW EDC16C35 M57N2 Factory Diesel DDE',
      ecuFamily: 'Bosch EDC16C35 (32-bit MPC563)',
      extractedMaps: {
        partThrottleFuel: generateSampleMap(30, 4.0, 1.5),
        fullThrottleFuel: generateSampleMap(90, 3.0, 2.5),
        vanosIntakeCamAdvance: generateSampleMap(0, 0, 0),
        vanosExhaustCamAdvance: generateSampleMap(0, 0, 0),
        ignitionBase: generateSampleMap(8, 0.3, 0.8),
        dwellControl: generateSampleMap(3.0, 0.05, 0.02),
      },
      rpmBins: defaultRpmBins,
      loadBins: defaultLoadBins,
      targetStandaloneEcu: 'Arduino Uno Q',
      transferredAt: '2025-02-27 16:15',
      compatibilityMatchPercent: 94
    },
    {
      id: 'copy-03',
      stockDmeName: 'VAG ME7.5 Bosch 1.8T Factory ECU',
      ecuFamily: 'Bosch ME7.5 (16-bit C167)',
      extractedMaps: {
        partThrottleFuel: generateSampleMap(35, 3.8, 2.2),
        fullThrottleFuel: generateSampleMap(80, 2.8, 3.2),
        vanosIntakeCamAdvance: generateSampleMap(10, 1.0, 0.8),
        vanosExhaustCamAdvance: generateSampleMap(5, 0.5, 0.5),
        ignitionBase: generateSampleMap(12, 0.4, 1.4),
        dwellControl: generateSampleMap(2.8, 0.08, 0.04),
      },
      rpmBins: defaultRpmBins,
      loadBins: defaultLoadBins,
      targetStandaloneEcu: 'Speeduino Teensy 4.1',
      transferredAt: '2025-02-28 10:05',
      compatibilityMatchPercent: 96
    }
  ]);

  // Selected state
  const [selectedProfileId, setSelectedProfileId] = useState<string>('copy-01');
  const [selectedTableIndex, setSelectedTableIndex] = useState<number>(0);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>({ row: 8, col: 8 });

  const [isExtracting, setIsExtracting] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  const activeProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0];
  const activeTableDef = TABLE_DEFINITIONS[selectedTableIndex];
  const activeTableData = activeProfile.extractedMaps[activeTableDef.key];

  // Navigation handlers
  const handlePrevTable = () => {
    setSelectedTableIndex(prev => (prev > 0 ? prev - 1 : TABLE_DEFINITIONS.length - 1));
  };

  const handleNextTable = () => {
    setSelectedTableIndex(prev => (prev < TABLE_DEFINITIONS.length - 1 ? prev + 1 : 0));
  };

  const handleCellModify = (delta: number) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;

    setProfiles(prevProfiles => {
      return prevProfiles.map(prof => {
        if (prof.id !== selectedProfileId) return prof;

        const currentMap = prof.extractedMaps[activeTableDef.key];
        const newMap = currentMap.map((r, rIdx) => {
          if (rIdx !== row) return r;
          const newRow = [...r];
          newRow[col] = Math.max(0, Math.min(255, newRow[col] + delta));
          return newRow;
        });

        return {
          ...prof,
          extractedMaps: {
            ...prof.extractedMaps,
            [activeTableDef.key]: newMap
          }
        };
      });
    });
  };

  const startCopycatExtraction = () => {
    setIsExtracting(true);
    onWriteSerial('COPYCAT EXTRACT FACTORY_DME_MAPS\r');

    setTimeout(() => {
      setIsExtracting(false);
      setTransferSuccess(`Extracted & translated ${activeProfile.stockDmeName} factory maps into ${activeProfile.targetStandaloneEcu} format!`);
      setTimeout(() => setTransferSuccess(null), 4000);
    }, 2000);
  };

  const handleInjectTableToStandalone = () => {
    onWriteSerial(`COPYCAT INJECT_TABLE ${activeTableDef.key} PROFILE=${activeProfile.id}\r`);
    setTransferSuccess(`Injected "${activeTableDef.label}" map into ${activeProfile.targetStandaloneEcu} EEPROM RAM!`);
    setTimeout(() => setTransferSuccess(null), 3500);
  };

  const getCellBgColor = (val: number) => {
    const pct = Math.min(1, Math.max(0, val / 150));
    return `rgba(${Math.round(255 * pct)}, ${Math.round(180 * (1 - pct))}, ${Math.round(255 * (1 - pct))}, 0.35)`;
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto pb-20">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-900 border border-gray-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 rounded-xl">
            <Copy className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Stock DME / ECU Copycat Map Cloner</h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded">
                Factory Map Copycat
              </span>
            </div>
            <p className="text-xs text-gray-400">Extracts OEM factory fuel, spark, and VANOS/VVT maps from original DME binaries and translates them directly into Standalone tables</p>
          </div>
        </div>

        <button
          onClick={startCopycatExtraction}
          disabled={isExtracting}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 shadow-lg shadow-cyan-600/20 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isExtracting ? 'animate-spin' : ''}`} />
          <span>{isExtracting ? 'Copycatting Factory DME...' : 'Re-Extract Stock DME Maps'}</span>
        </button>
      </div>

      {transferSuccess && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-mono flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{transferSuccess}</span>
        </div>
      )}

      {/* Selectable Factory DME Profiles (Horizontal Cards) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">1. Select Target Factory DME Profile</h3>
          <span className="text-xs font-mono text-cyan-400">{profiles.length} Factory DMEs Loaded</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {profiles.map(prof => {
            const isSelected = prof.id === selectedProfileId;
            return (
              <div
                key={prof.id}
                onClick={() => setSelectedProfileId(prof.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-cyan-500/10 border-cyan-500/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30' 
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                    isSelected ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-gray-950 text-gray-400 border-gray-800'
                  }`}>
                    {prof.ecuFamily}
                  </span>
                  <span className="text-xs text-emerald-400 font-mono font-bold">{prof.compatibilityMatchPercent}% Match</span>
                </div>

                <h4 className="text-sm font-bold text-white font-mono truncate">{prof.stockDmeName}</h4>
                <p className="text-[11px] text-gray-400 mt-1 font-mono">Standalone Target: <span className="text-cyan-300 font-semibold">{prof.targetStandaloneEcu}</span></p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table Selection & Cycling Navigation Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <Sliders className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">2. Cycle & Inspect Extracted Tables</h3>
              <p className="text-xs text-gray-400">Selected Table: <span className="text-cyan-400 font-bold">{activeTableDef.label}</span></p>
            </div>
          </div>

          {/* Previous / Next Cycling Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevTable}
              className="p-2 bg-gray-950 hover:bg-gray-800 text-gray-200 rounded-xl border border-gray-800 transition-colors flex items-center space-x-1 text-xs font-mono"
            >
              <ChevronLeft className="w-4 h-4 text-cyan-400" />
              <span>Prev Table</span>
            </button>

            <span className="text-xs font-mono font-bold text-white px-2">
              {selectedTableIndex + 1} / {TABLE_DEFINITIONS.length}
            </span>

            <button
              onClick={handleNextTable}
              className="p-2 bg-gray-950 hover:bg-gray-800 text-gray-200 rounded-xl border border-gray-800 transition-colors flex items-center space-x-1 text-xs font-mono"
            >
              <span>Next Table</span>
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Clickable Table Selector Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {TABLE_DEFINITIONS.map((td, idx) => {
            const isTabActive = idx === selectedTableIndex;
            return (
              <button
                key={td.key}
                onClick={() => setSelectedTableIndex(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-bold shrink-0 transition-all ${
                  isTabActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 border border-purple-400'
                    : 'bg-gray-950 text-gray-400 hover:text-gray-200 border border-gray-800'
                }`}
              >
                {td.label}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 font-sans italic bg-gray-950 p-2.5 rounded-xl border border-gray-800/80">
          {activeTableDef.description}
        </p>
      </div>

      {/* 16x16 Interactive Copycat Map Grid */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              {activeTableDef.label} (Unit: {activeTableDef.unit})
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleCellModify(-1)}
              disabled={!selectedCell}
              className="px-3 py-1 bg-gray-950 hover:bg-gray-800 text-white rounded-lg text-xs font-mono font-bold border border-gray-800 disabled:opacity-40"
            >
              -1
            </button>
            <button
              onClick={() => handleCellModify(1)}
              disabled={!selectedCell}
              className="px-3 py-1 bg-gray-950 hover:bg-gray-800 text-white rounded-lg text-xs font-mono font-bold border border-gray-800 disabled:opacity-40"
            >
              +1
            </button>

            <button
              onClick={handleInjectTableToStandalone}
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 shadow-md shadow-purple-600/20"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Copycat Table to Standalone</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
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
                  {activeProfile.rpmBins.map((rpm, colIdx) => (
                    <th key={colIdx} className="p-1 text-cyan-400 font-bold border border-gray-800 bg-gray-950 text-center">
                      {rpm}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeProfile.loadBins.slice().reverse().map((load, revRowIdx) => {
                  const rowIdx = 15 - revRowIdx;
                  return (
                    <tr key={rowIdx}>
                      <td className="p-1 text-purple-400 font-bold border border-gray-800 bg-gray-950 text-center">
                        {load}
                      </td>
                      {activeTableData[rowIdx].map((cellValue, colIdx) => {
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
      </div>
    </div>
  );
};
