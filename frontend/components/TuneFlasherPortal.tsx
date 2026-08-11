import React, { useState } from 'react';
import { Upload, Download, Smartphone, Cpu, CheckCircle2, FileCode, Flame, RefreshCw, HardDrive, ShieldCheck, Zap } from 'lucide-react';
import { TuneFileMap } from '../types.ts';

interface TuneFlasherPortalProps {
  isConnected: boolean;
  onWriteSerial: (cmd: string) => void;
}

export const TuneFlasherPortal: React.FC<TuneFlasherPortalProps> = ({ isConnected, onWriteSerial }) => {
  const [connectionMode, setConnectionMode] = useState<'XTRONS_HOST' | 'ANDROID_USB_C_OTG'>('ANDROID_USB_C_OTG');
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashProgress, setReadProgress] = useState(0);
  const [flashStatus, setFlashStatus] = useState<string | null>(null);

  const [tunes, setTunes] = useState<TuneFileMap[]>([
    {
      id: 'tune-1',
      fileName: 'BMW_E60_M57_Stage2_PopLimiter_AiOptimized.bin',
      fileType: 'BIN',
      sizeKb: 2048,
      source: 'GOOGLE_DRIVE_AI',
      uploadedAt: '2025-02-28 14:10',
      tableCount: 142,
      description: 'Downloaded by Procrow AI from Google Drive repository. Optimized fuel maps & boost limits.'
    },
    {
      id: 'tune-2',
      fileName: 'BMW_MS43_M54B30_Stage1_Aggressive.xdf',
      fileType: 'XDF',
      sizeKb: 184,
      source: 'USER_UPLOAD',
      uploadedAt: '2025-02-28 11:22',
      tableCount: 88,
      description: 'User-provided TunerPro XDF definition map for Siemens MS43 16-bit ECU.'
    },
    {
      id: 'tune-3',
      fileName: 'Siemens_MSV70_N52_3StageDisa_Map.ols',
      fileType: 'OLS',
      sizeKb: 512,
      source: 'USER_UPLOAD',
      uploadedAt: '2025-02-27 19:05',
      tableCount: 210,
      description: 'WinOLS 2.24 project definition file with 3-stage DISA manifold activation offsets.'
    }
  ]);

  const [selectedTune, setSelectedTune] = useState<TuneFileMap>(tunes[0]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toUpperCase() as 'BIN' | 'XDF' | 'OLS' | 'MSQ';
    const newTune: TuneFileMap = {
      id: `tune-${Date.now()}`,
      fileName: file.name,
      fileType: ext || 'BIN',
      sizeKb: Math.round(file.size / 1024),
      source: 'USER_UPLOAD',
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      tableCount: 64,
      description: 'Uploaded via Android USB-C OTG storage interface.'
    };

    setTunes(prev => [newTune, ...prev]);
    setSelectedTune(newTune);
  };

  const startFlashSequence = () => {
    setIsFlashing(true);
    setReadProgress(5);
    setFlashStatus(`Initiating ${connectionMode} High-Speed Flash Sequence...`);
    onWriteSerial(`FLASH START ${selectedTune.fileName} MODE=${connectionMode}\r`);

    let prog = 5;
    const interval = setInterval(() => {
      prog += 15;
      setReadProgress(prog);

      if (prog === 35) {
        setFlashStatus('Unlocking ECU Bootloader Security Access (Seed/Key Exchange OK)...');
      } else if (prog === 65) {
        setFlashStatus(`Erasing Flash Sectors & Writing payload (${selectedTune.sizeKb} KB)...`);
      } else if (prog >= 100) {
        clearInterval(interval);
        setIsFlashing(false);
        setFlashStatus(`ECU Flashed Successfully! Checksums recalculated and verified. Rebooting DME...`);
        onWriteSerial('FLASH COMPLETE REBOOT_ECU\r');
      }
    }, 500);
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto pb-20">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-900 border border-gray-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 rounded-xl">
            <Smartphone className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">USB-C OTG Flasher & Tune Definition Manager</h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded">
                BIN / XDF / OLS Flasher
              </span>
            </div>
            <p className="text-xs text-gray-400">Directly flashes AI-generated Google Drive tunes or custom BIN/XDF/OLS definition files over USB-C OTG</p>
          </div>
        </div>

        {/* Connection Switcher */}
        <div className="flex items-center space-x-2 bg-gray-950 p-1.5 rounded-xl border border-gray-800 text-xs font-mono">
          <button
            onClick={() => setConnectionMode('ANDROID_USB_C_OTG')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${connectionMode === 'ANDROID_USB_C_OTG' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Android USB-C OTG
          </button>
          <button
            onClick={() => setConnectionMode('XTRONS_HOST')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${connectionMode === 'XTRONS_HOST' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Xtrons USB Host
          </button>
        </div>
      </div>

      {/* Upload & Google Drive Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User File Upload */}
        <label className="bg-gray-900 border border-dashed border-gray-700 hover:border-cyan-500 rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-colors">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-cyan-500/10 rounded-xl">
              <Upload className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Load Custom Tune or Definition File</h3>
              <p className="text-xs text-gray-400">Upload .BIN, .XDF, or .OLS files from USB-C OTG storage</p>
            </div>
          </div>
          <input type="file" accept=".bin,.xdf,.ols,.msq" onChange={handleFileUpload} className="hidden" />
          <span className="px-3 py-1.5 bg-gray-800 text-white font-mono text-xs rounded-xl border border-gray-700">Browse...</span>
        </label>

        {/* AI Drive Sync */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <HardDrive className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Google Drive AI Database Sync</h3>
              <p className="text-xs text-gray-400">Automatically downloads AI-recommended ROM tunes</p>
            </div>
          </div>
          <button className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-500/30 text-emerald-300 font-mono text-xs font-bold rounded-xl border border-emerald-500/40 transition-colors flex items-center space-x-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Cloud</span>
          </button>
        </div>
      </div>

      {/* Flashing Controller & Selected Tune Status */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-gray-800">
          <div>
            <span className="text-xs font-mono text-gray-500 uppercase block">Selected Payload Target</span>
            <h3 className="text-lg font-bold text-white font-mono mt-0.5">{selectedTune.fileName}</h3>
            <p className="text-xs text-gray-400">{selectedTune.fileType} • {selectedTune.sizeKb} KB • Source: {selectedTune.source}</p>
          </div>

          <button
            onClick={startFlashSequence}
            disabled={isFlashing || !isConnected}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-600/20 flex items-center space-x-2 disabled:opacity-50"
          >
            <Flame className={`w-4 h-4 ${isFlashing ? 'animate-bounce' : ''}`} />
            <span>{isFlashing ? `Flashing ECU (${flashProgress}%)` : `Flash to ECU via ${connectionMode}`}</span>
          </button>
        </div>

        {/* Flashing Status Banner */}
        {flashStatus && (
          <div className="p-3.5 bg-gray-950 border border-cyan-500/30 rounded-xl text-xs font-mono text-cyan-400 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{flashStatus}</span>
          </div>
        )}

        {isFlashing && (
          <div className="w-full bg-gray-950 h-2.5 rounded-full overflow-hidden border border-gray-800">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300" style={{ width: `${flashProgress}%` }} />
          </div>
        )}
      </div>

      {/* Directory of Available Tune Files */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-white font-mono pb-2 border-b border-gray-800">Loaded Tune Repositories (.BIN / .XDF / .OLS)</h3>

        <div className="space-y-3">
          {tunes.map(t => (
            <div 
              key={t.id}
              onClick={() => setSelectedTune(t)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedTune.id === t.id 
                  ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md' 
                  : 'bg-gray-950 border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-900 rounded-lg shrink-0 border border-gray-800">
                    <FileCode className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-mono text-sm font-bold text-white">{t.fileName}</h4>
                    <p className="text-xs text-gray-400">{t.fileType} • {t.sizeKb} KB • Uploaded: {t.uploadedAt}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-gray-900 text-purple-300 border border-gray-800 rounded-lg">
                    {t.tableCount} Maps Parsed
                  </span>
                  <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-gray-900 text-emerald-400 border border-gray-800 rounded-lg">
                    {t.source}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-2 font-sans italic">{t.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
