import React, { useState } from 'react';
import { Cpu, Flame, Save, Download, Upload, Sliders, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';
import { SpeeduinoTune } from '../types.ts';

interface SpeeduinoPortalProps {
  isConnected: boolean;
  onWriteSerial: (cmd: string) => void;
}

// Generate default 16x16 VE Map
const defaultRpmBins = [800, 1200, 1600, 2000, 2400, 2800, 3200, 3600, 4000, 4400, 4800, 5200, 5600, 6000, 6500, 7000];
const defaultLoadBins = [20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 220, 250];

const initialVeMap: number[][] = Array(16).fill(0).map((_, loadIdx) => {
  return Array(16).fill(0).map((_, rpmIdx) => {
    const base = 35 + (loadIdx * 4) + (rpmIdx * 2.5);
    return Math.min(Math.round(base), 140);
  });
});

export const SpeeduinoPortal: React.FC<SpeeduinoPortalProps> = ({ isConnected, onWriteSerial }) => {
  const [activeTable, setActiveTable] = useState<'VE' | 'IGNITION' | 'AFR'>('VE');
  const [tune, setTune] = useState<SpeeduinoTune>({
    fileName: 'Teensy_Speeduino_Aggressive_Stage2.msq',
    lastSaved: '2025-02-28 10:15',
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

  const burnToTeensyEcu = () => {
    setIsBurning(true);
    // Speeduino command 'B' triggers EEPROM burn page write on Teensy 4.1
    onWriteSerial('B\r');

    setTimeout(() => {
      setIsBurning(false);
      setTune(prev => ({ ...prev, burnStatus: 'synced' }));
      setBurnNotification('Flash page written successfully to Teensy 4.1 EEPROM!');
      setTimeout(() => setBurnNotification(null), 3000);
    }, 1200);
  };

  // Color generator for heatmap UI
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
              <h2 className="text-xl font-bold text-white">Speeduino Standalone Portal (Teensy 4.1)</h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded">Live Tuner</span>
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

      {/* Selector Tabs */}
      <div className="flex items-center justify-between bg-gray-900 p-1.5 rounded-xl border border-gray-800">
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

        <div className="text-xs text-gray-400 font-mono hidden md:block">
          Grid: 16x16 Interpolated • Selected: Row {selectedCell ? selectedCell.row + 1 : '--'}, Col {selectedCell ? selectedCell.col + 1 : '--'}
        </div>
      </div>

      {/* 16x16 Interactive Tune Grid */}
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
    </div>
  );
};
