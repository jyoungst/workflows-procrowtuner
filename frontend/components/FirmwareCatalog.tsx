import React, { useState } from 'react';
import { Database, Download, Upload, Cpu, CheckCircle, RefreshCw, FileCode, Shield, Layers, Search, HardDrive } from 'lucide-react';
import { FirmwareDump } from '../types.ts';

interface FirmwareCatalogProps {
  onWriteSerial: (cmd: string) => void;
}

export const FirmwareCatalog: React.FC<FirmwareCatalogProps> = ({ onWriteSerial }) => {
  const [dumps, setDumps] = useState<FirmwareDump[]>([
    {
      id: 'dump-01',
      fileName: 'BMW_MS430056_Siemens_C167_512KB.bin',
      moduleType: 'DME_ECU',
      fileSizeMb: 0.5,
      sha256Checksum: '9a3f82b1c4e51087ff2e903a41b2c890123456789abcdef0123456789abcdef0',
      extractedAt: '2025-02-27 18:40',
      targetHardware: 'Legacy Siemens 16-bit C167',
      retrofitStatus: 'RETROFIT_READY',
      driveSynced: true,
      notes: 'Full flash dump extracted via OBD K-Line. AI memory map decoded for Speeduino / Arduino Uno Q adaptation.'
    },
    {
      id: 'dump-02',
      fileName: 'BMW_CAS3_9S12_256KB_Flash_EEPROM.bin',
      moduleType: 'CAS_IMMOBILIZER',
      fileSizeMb: 0.25,
      sha256Checksum: 'e812d4a9019b8823f00112233445566778899aabbccddeeff001122334455667',
      extractedAt: '2025-02-28 09:12',
      targetHardware: 'Motorola MC9S12XDP512',
      retrofitStatus: 'MAPPED',
      driveSynced: true,
      notes: 'ISN extracted (0x1A4F). Mapped for ESP32-D & Arduino Uno Q standalone sync.'
    },
    {
      id: 'dump-03',
      fileName: 'Speeduino_Teensy41_Full_EEPROM_v202410.msq',
      moduleType: 'SPEEDUINO_EEPROM',
      fileSizeMb: 0.12,
      sha256Checksum: '5c1234567890abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      extractedAt: '2025-02-28 11:05',
      targetHardware: 'Teensy 4.1 ARM Cortex-M7',
      retrofitStatus: 'ANALYZED',
      driveSynced: false,
      notes: 'Contains 16x16 VE and Spark maps for stage 2 retrofitted turbo setup.'
    }
  ]);

  const [filter, setFilter] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);

  const handleStartExtraction = (type: string) => {
    setIsExtracting(true);
    setExtractProgress(10);
    onWriteSerial(`DUMP EXTRACT ${type}\r`);

    const interval = setInterval(() => {
      setExtractProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExtracting(false);
          
          // Add new simulated dump
          const newDump: FirmwareDump = {
            id: `dump-${Date.now()}`,
            fileName: `Extracted_${type}_${Date.now().toString().slice(-4)}.bin`,
            moduleType: type as any,
            fileSizeMb: 1.2,
            sha256Checksum: 'a8b7c6d5e4f3a2b100112233445566778899aabbccddeeff0011223344556677',
            extractedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            targetHardware: 'Arduino Uno Q / Teensy Bridge',
            retrofitStatus: 'CATALOGED',
            driveSynced: false,
            notes: 'Extracted via Xtrons USB Host. Queued for Hermes LLM deep data analysis and memory offset breaking.'
          };

          setDumps(d => [newDump, ...d]);
          return 100;
        }
        return prev + 20;
      });
    }, 400);
  };

  const filteredDumps = dumps.filter(d => 
    d.fileName.toLowerCase().includes(filter.toLowerCase()) ||
    d.moduleType.toLowerCase().includes(filter.toLowerCase()) ||
    d.targetHardware.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto pb-20">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-900 border border-gray-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 rounded-xl">
            <Database className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">DME / CAS / EWS Firmware Extraction & Catalog</h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded">Procrow AI Disassembler</span>
            </div>
            <p className="text-xs text-gray-400">Stores full binary dumps (&lt;20MB) for AI code breaking and legacy component retrofitting</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleStartExtraction('DME_ECU')}
            disabled={isExtracting}
            className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExtracting ? `Extracting Dump (${extractProgress}%)` : 'Extract DME Dump'}</span>
          </button>
        </div>
      </div>

      {/* Extraction Banner / Progress */}
      {isExtracting && (
        <div className="bg-gray-900 border border-cyan-500/40 p-4 rounded-2xl space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-cyan-400 font-bold">DME/CAS Memory Address Extraction in Progress...</span>
            <span className="text-white">{extractProgress}%</span>
          </div>
          <div className="w-full bg-gray-950 h-2 rounded-full overflow-hidden border border-gray-800">
            <div className="bg-cyan-500 h-full transition-all duration-300" style={{ width: `${extractProgress}%` }} />
          </div>
        </div>
      )}

      {/* Catalog Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center space-x-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl">
            <FileCode className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase font-mono block">Cataloged Dumps</span>
            <span className="text-xl font-bold text-white font-mono">{dumps.length} Binaries</span>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center space-x-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl">
            <Cpu className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase font-mono block">Speed Factor</span>
            <span className="text-xl font-bold text-cyan-400 font-mono">AI &gt; 16/32-Bit</span>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl">
            <HardDrive className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase font-mono block">Drive Sync</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">Auto Cloud Backup</span>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl">
            <Layers className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-xs text-gray-400 uppercase font-mono block">Retrofit Status</span>
            <span className="text-xl font-bold text-amber-400 font-mono">Discontinued Ready</span>
          </div>
        </div>
      </div>

      {/* Firmware Catalog List */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-gray-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search by file, ECU type, or target..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <span className="text-xs text-gray-400 font-mono">Max File Size: 20MB per ECU extraction</span>
        </div>

        <div className="space-y-3">
          {filteredDumps.map(dump => (
            <div key={dump.id} className="p-4 bg-gray-950 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg shrink-0">
                    <FileCode className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-mono text-sm font-bold text-white break-all">{dump.fileName}</h3>
                    <p className="text-xs text-gray-400">{dump.moduleType} • {dump.fileSizeMb} MB • Extracted: {dump.extractedAt}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg border ${
                    dump.retrofitStatus === 'RETROFIT_READY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    dump.retrofitStatus === 'MAPPED' ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' :
                    'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  }`}>
                    {dump.retrofitStatus}
                  </span>

                  <button className="p-2 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded-lg transition-colors border border-gray-800" title="Download Binary">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono bg-gray-900 p-2.5 rounded-lg border border-gray-800/80">
                <div>
                  <span className="text-gray-500 uppercase text-[10px] block">Target Architecture</span>
                  <span className="text-gray-200 font-semibold">{dump.targetHardware}</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase text-[10px] block">SHA-256 Checksum</span>
                  <span className="text-cyan-400 truncate block">{dump.sha256Checksum}</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed italic">{dump.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
