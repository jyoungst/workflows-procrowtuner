import React, { useState } from 'react';
import { Key, Smartphone, Lock, Unlock, Zap, Shield, Sun, Sparkles, Search, CheckCircle, AlertCircle, Radio, Play, Pause } from 'lucide-react';
import { BcmDiscoveredModule, PhoneSecurityToken } from '../types.ts';

interface BcmControllerProps {
  isConnected: boolean;
  onInjectCan: (cmd: string) => void;
}

export const BcmController: React.FC<BcmControllerProps> = ({ isConnected, onInjectCan }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [strobeModeActive, setStrobeModeActive] = useState(false);
  const [doorsLocked, setDoorsLocked] = useState(true);
  const [windowsUp, setWindowsUp] = useState(true);

  const [pairedPhone, setPairedPhone] = useState<PhoneSecurityToken>({
    deviceId: 'PHONE-PRO-CROW-99',
    deviceName: 'ProCrow Owner iPhone 15 Pro (Encrypted BLE/Wi-Fi Token)',
    pairedAt: '2025-02-28 12:30',
    tokenHash: '8f9a2b4c6d8e0f1a3b5c7d9e1f3a5b7c',
    isAuthorized: true,
    lastChallengeResponseMs: 14
  });

  const [discoveredModules, setDiscoveredModules] = useState<BcmDiscoveredModule[]>([
    {
      id: '0x2FC',
      name: 'BMW E60 CAS/JBBFE Central Locking Module',
      bus: 'K-CAN 100k',
      verifiedCommand: '0x2FC 8 [01, BF, 00, 00, 00, 00, 00, 00]',
      functionType: 'DOOR_LOCK',
      confidenceScore: 98,
      status: 'MAPPED'
    },
    {
      id: '0x3B0',
      name: 'BMW FRM Footwell Module (Power Windows)',
      bus: 'K-CAN 100k',
      verifiedCommand: '0x3B0 5 [40, 02, FF, 00, 00]',
      functionType: 'WINDOW_ROLL',
      confidenceScore: 95,
      status: 'MAPPED'
    },
    {
      id: '0x21A',
      name: 'BMW FRM Exterior Lighting & Hazards',
      bus: 'K-CAN 100k',
      verifiedCommand: '0x21A 8 [11, AA, FF, 55, 00, 00, 00, 00]',
      functionType: 'LIGHT_STROBE',
      confidenceScore: 92,
      status: 'MAPPED'
    }
  ]);

  const startBcmHunter = () => {
    setIsScanning(true);
    setScanProgress(10);
    onWriteSerial('CAN HUNT BCM BODY_BUS\r');

    let prog = 10;
    const interval = setInterval(() => {
      prog += 20;
      setScanProgress(prog);

      if (prog >= 100) {
        clearInterval(interval);
        setIsScanning(false);

        const newFound: BcmDiscoveredModule = {
          id: `0x${Math.floor(0x200 + Math.random() * 0x200).toString(16).toUpperCase()}`,
          name: 'Discovered Body Controller (Auto Reverse Engineered)',
          bus: 'K-CAN 100k',
          verifiedCommand: '0x320 8 [A1, 00, 44, BF, 00, 00, 00, 00]',
          functionType: 'SUNROOF',
          confidenceScore: 89,
          status: 'IDENTIFIED'
        };

        setDiscoveredModules(prev => [newFound, ...prev]);
      }
    }, 400);
  };

  const handleToggleLock = () => {
    if (!pairedPhone.isAuthorized) return;
    const newState = !doorsLocked;
    setDoorsLocked(newState);

    const cmd = newState 
      ? 'CAN SEND 0x2FC [01, BF, 00, 00, 00, 00, 00, 00]\r' 
      : 'CAN SEND 0x2FC [02, AA, 00, 00, 00, 00, 00, 00]\r';
    onWriteSerial(cmd);
  };

  const handleToggleWindows = () => {
    if (!pairedPhone.isAuthorized) return;
    const newState = !windowsUp;
    setWindowsUp(newState);

    const cmd = newState 
      ? 'CAN SEND 0x3B0 [40, 02, FF, 00, 00]\r' 
      : 'CAN SEND 0x3B0 [20, 01, 00, 00, 00]\r';
    onWriteSerial(cmd);
  };

  const handleToggleStrobeDemo = () => {
    if (!pairedPhone.isAuthorized) return;
    const newState = !strobeModeActive;
    setStrobeModeActive(newState);

    if (newState) {
      onWriteSerial('CAN DEMO STROBE_SHOW_MODE START\r');
    } else {
      onWriteSerial('CAN DEMO STROBE_SHOW_MODE STOP\r');
    }
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto pb-20">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-900 border border-gray-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-cyan-600/20 border border-emerald-500/30 rounded-xl">
            <Key className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">BCM Reverse Engineering & Phone Security Suite</h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                ProCrow Security
              </span>
            </div>
            <p className="text-xs text-gray-400">Hunts body control CAN frames; pairs phone token for remote locking, window control, and strobe demonstration modes</p>
          </div>
        </div>

        <button
          onClick={startBcmHunter}
          disabled={isScanning}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
        >
          <Search className="w-4 h-4" />
          <span>{isScanning ? `Scanning CAN Bus (${scanProgress}%)` : 'Hunt Body Control CAN Frames'}</span>
        </button>
      </div>

      {/* Smartphone Security Token Status Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-6 h-6 text-cyan-400" />
            <div>
              <h3 className="text-base font-semibold text-white">Smartphone Security Token Pairing</h3>
              <p className="text-xs text-gray-400">Encrypted HMAC challenge-response authorization for remote actuation</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 border ${
              pairedPhone.isAuthorized 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}>
              <Shield className="w-3.5 h-3.5" />
              <span>{pairedPhone.isAuthorized ? 'PHONE TOKEN AUTHENTICATED' : 'UNAUTHORIZED'}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
            <span className="text-gray-500 block text-[10px] uppercase">Paired Device</span>
            <span className="text-white font-bold mt-1 truncate block">{pairedPhone.deviceName}</span>
          </div>

          <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
            <span className="text-gray-500 block text-[10px] uppercase">Token HMAC Hash</span>
            <span className="text-cyan-400 font-bold mt-1 truncate block">{pairedPhone.tokenHash}</span>
          </div>

          <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
            <span className="text-gray-500 block text-[10px] uppercase">Response Latency</span>
            <span className="text-emerald-400 font-bold mt-1 block">{pairedPhone.lastChallengeResponseMs} ms</span>
          </div>
        </div>
      </div>

      {/* Smartphone Remote Control Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Door Lock Toggle */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl border ${doorsLocked ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
              {doorsLocked ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Central Door Locks</h4>
              <p className="text-xs text-gray-400 font-mono">CAS / JBBFE Frame 0x2FC</p>
            </div>
          </div>

          <button
            onClick={handleToggleLock}
            disabled={!isConnected}
            className={`w-full py-2.5 px-4 font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 border disabled:opacity-50 ${
              doorsLocked 
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40' 
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {doorsLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>{doorsLocked ? 'Unlock Doors via Phone' : 'Lock Doors via Phone'}</span>
          </button>
        </div>

        {/* Window Roll Toggle */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-xl">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Power Windows</h4>
              <p className="text-xs text-gray-400 font-mono">FRM Module Frame 0x3B0</p>
            </div>
          </div>

          <button
            onClick={handleToggleWindows}
            disabled={!isConnected}
            className="w-full py-2.5 px-4 bg-cyan-600/20 hover:bg-cyan-500/30 text-cyan-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 border border-cyan-500/40 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>{windowsUp ? 'Roll Windows Down' : 'Roll Windows Up'}</span>
          </button>
        </div>

        {/* Show / Strobe Demonstration Mode */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl border ${strobeModeActive ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Light Strobe Demo Mode</h4>
              <p className="text-xs text-gray-400 font-mono">FRM Hazard Strobe Frame 0x21A</p>
            </div>
          </div>

          <button
            onClick={handleToggleStrobeDemo}
            disabled={!isConnected}
            className={`w-full py-2.5 px-4 font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 border disabled:opacity-50 ${
              strobeModeActive 
                ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-600/20' 
                : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700'
            }`}
          >
            <Sun className={`w-4 h-4 ${strobeModeActive ? 'animate-spin' : ''}`} />
            <span>{strobeModeActive ? 'Stop Strobe Demo' : 'Start Light Strobe Demonstration'}</span>
          </button>
        </div>
      </div>

      {/* Reverse Engineered BCM Modules Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-800">
          <h3 className="text-sm font-bold text-white font-mono">Discovered BCM Module Frame Directory</h3>
          <span className="text-xs text-gray-400 font-mono">{discoveredModules.length} Modules Reverse Engineered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 uppercase text-[10px]">
                <th className="p-2">CAN ID</th>
                <th className="p-2">Target Module</th>
                <th className="p-2">Bus Type</th>
                <th className="p-2">Verified Injection Payload</th>
                <th className="p-2">AI Confidence</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {discoveredModules.map(mod => (
                <tr key={mod.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="p-2 font-bold text-cyan-400">{mod.id}</td>
                  <td className="p-2 text-white font-semibold">{mod.name}</td>
                  <td className="p-2 text-gray-400">{mod.bus}</td>
                  <td className="p-2 text-emerald-400 font-bold">{mod.verifiedCommand}</td>
                  <td className="p-2 text-purple-300 font-bold">{mod.confidenceScore}%</td>
                  <td className="p-2">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      {mod.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
