import React, { useState } from 'react';
import { Shield, AlertTriangle, Radio, Wifi, Zap, Lock, Unlock, Play, Pause, Terminal, GitBranch, RefreshCw } from 'lucide-react';
import { CanFrame, CasEwsState } from '../types.ts';

interface CanBusSnifferProps {
  canFrames: Record<string, CanFrame>;
  isConnected: boolean;
  onInjectCan: (cmd: string) => void;
}

export const CanBusSniffer: React.FC<CanBusSnifferProps> = ({ canFrames, isConnected, onInjectCan }) => {
  const [filter, setFilter] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [injectFrameId, setInjectFrameId] = useState('0x316');
  const [injectDataBytes, setInjectDataBytes] = useState('05,12,00,64,00,00,00,00');

  const [isGithubSyncing, setIsGithubSyncing] = useState(false);

  const [casState, setCasState] = useState<CasEwsState>({
    status: 'IDLE',
    capturedSecretKey: null,
    isnCode: null,
    rollingCode: null,
    esp32EmulatorConnected: true,
    esp32Ip: '192.168.43.105'
  });

  const frameList = Object.values(canFrames).filter(f => 
    f.id.toLowerCase().includes(filter.toLowerCase()) || 
    (f.notes && f.notes.toLowerCase().includes(filter.toLowerCase()))
  );

  const startCasSniffing = () => {
    setCasState(prev => ({ ...prev, status: 'SNIFFING' }));
    
    // Simulate CAS3 / EWS4 CAN Key handshake sniffing
    setTimeout(() => {
      setCasState(prev => ({
        ...prev,
        status: 'SYNC_FAILED',
        notes: 'CAS ISN Handshake Timed Out (EWS Rolling Code Mismatch)'
      }));
    }, 3000);
  };

  const activateEsp32Fallback = () => {
    setCasState(prev => ({
      ...prev,
      status: 'EMULATING',
      capturedSecretKey: 'B4-9F-88-C1-00-DE',
      isnCode: '0x1A4F',
      rollingCode: '0x99A0'
    }));
  };

  const handleSyncGithubRepo = () => {
    setIsGithubSyncing(true);
    setTimeout(() => {
      setIsGithubSyncing(false);
    }, 1800);
  };

  const handleInjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!injectFrameId || !injectDataBytes) return;
    onInjectCan(`CAN SEND ${injectFrameId} [${injectDataBytes}]\r`);
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto pb-20">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-900 border border-gray-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/20 border border-cyan-500/30 rounded-xl">
            <Radio className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">CAN Bus Reverse Engineering & Exploits Suite</h2>
            <p className="text-xs text-gray-400">Low-level 500kbps CAN Sniffer, Packet Injector & BMW CAS/EWS Emulator Link</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSyncGithubRepo}
            disabled={isGithubSyncing}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-cyan-400 font-mono text-xs font-bold rounded-xl border border-gray-700 transition-colors flex items-center space-x-1.5"
          >
            <GitBranch className={`w-3.5 h-3.5 ${isGithubSyncing ? 'animate-spin' : ''}`} />
            <span>{isGithubSyncing ? 'Syncing Github Repos...' : 'Sync Github Exploits'}</span>
          </button>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-green-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isPaused ? 'Resume Capture' : 'Pause Capture'}</span>
          </button>
        </div>
      </div>

      {/* BMW CAS / EWS Immobilizer Exploit & ESP32 Fallback Panel */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-base font-semibold text-white">BMW CAS / EWS Anti-Theft Key Extractor & Emulator</h3>
              <p className="text-xs text-gray-400">Captures ISN sync packets; activates ESP32-D Wi-Fi node if vehicle sync fails</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {casState.status === 'IDLE' && (
              <button
                onClick={startCasSniffing}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sniff CAS Key</span>
              </button>
            )}

            {casState.status === 'SYNC_FAILED' && (
              <button
                onClick={activateEsp32Fallback}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 animate-pulse"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Activate ESP32-D CAN Emulator</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
            <span className="text-gray-500 block text-[10px] uppercase">CAS State</span>
            <span className={`font-bold mt-1 block ${casState.status === 'EMULATING' ? 'text-green-400' : casState.status === 'SYNC_FAILED' ? 'text-red-400' : 'text-amber-400'}`}>
              {casState.status}
            </span>
          </div>

          <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
            <span className="text-gray-500 block text-[10px] uppercase">Extracted ISN</span>
            <span className="text-white font-bold mt-1 block">{casState.isnCode || 'Not Captured'}</span>
          </div>

          <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
            <span className="text-gray-500 block text-[10px] uppercase">ESP32-D Node IP</span>
            <span className="text-cyan-400 font-bold mt-1 block">{casState.esp32Ip}</span>
          </div>

          <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
            <span className="text-gray-500 block text-[10px] uppercase">Rolling Secret Key</span>
            <span className="text-purple-400 font-bold mt-1 block">{casState.capturedSecretKey || 'Encrypted'}</span>
          </div>
        </div>
      </div>

      {/* Packet Injector */}
      <form onSubmit={handleInjectSubmit} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 shrink-0">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>CAN Injector:</span>
        </div>
        <input
          type="text"
          value={injectFrameId}
          onChange={(e) => setInjectFrameId(e.target.value)}
          placeholder="ID (e.g. 0x316)"
          className="w-28 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
        />
        <input
          type="text"
          value={injectDataBytes}
          onChange={(e) => setInjectDataBytes(e.target.value)}
          placeholder="Bytes e.g. A0,11,FC,00,00,00,00,00"
          className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-colors shrink-0"
        >
          Send CAN Frame
        </button>
      </form>

      {/* CAN Sniffer Live Frame Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by CAN ID or Description..."
            className="w-full sm:w-72 bg-gray-950 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
          <span className="text-xs text-gray-500 font-mono hidden sm:block">
            Unique IDs: {frameList.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 uppercase text-[10px]">
                <th className="p-2">CAN ID</th>
                <th className="p-2">DLC</th>
                <th className="p-2">Payload (Bytes 0-7)</th>
                <th className="p-2">Count</th>
                <th className="p-2">Interval</th>
                <th className="p-2">Description / Module</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {frameList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-600 italic">
                    No CAN frames captured yet. Connect USB hardware to sniff bus activity.
                  </td>
                </tr>
              ) : (
                frameList.map(frame => (
                  <tr key={frame.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="p-2 font-bold text-cyan-400">{frame.id}</td>
                    <td className="p-2 text-gray-400">{frame.dlc}</td>
                    <td className="p-2 text-emerald-400 font-bold space-x-1">
                      {frame.data.map((b, i) => (
                        <span key={i} className="inline-block bg-gray-950 px-1 py-0.5 rounded border border-gray-800">
                          {b}
                        </span>
                      ))}
                    </td>
                    <td className="p-2 text-white font-semibold">{frame.count}</td>
                    <td className="p-2 text-gray-400">{frame.deltaMs} ms</td>
                    <td className="p-2 text-gray-400 italic">{frame.notes || 'Unmapped OEM Frame'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
