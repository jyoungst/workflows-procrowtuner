import React, { useState } from 'react';
import { ECU_DATABASE } from '../constants/ecuDatabase.ts';
import { EcuDefinition } from '../types.ts';
import { Cpu, Search, Layers, Download, CheckCircle, Zap, Shield, ArrowRight } from 'lucide-react';

interface EcuDatabaseViewProps {
  onSelectEcuForAnalysis: (ecu: EcuDefinition) => void;
}

export const EcuDatabaseView: React.FC<EcuDatabaseViewProps> = ({ onSelectEcuForAnalysis }) => {
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');

  const brands = ['ALL', ...Array.from(new Set(ECU_DATABASE.map(e => e.brand)))];

  const filteredEcus = ECU_DATABASE.filter(ecu => {
    const matchesSearch = ecu.family.toLowerCase().includes(search.toLowerCase()) || 
                          ecu.brand.toLowerCase().includes(search.toLowerCase()) ||
                          ecu.compatibilityNote.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = selectedBrand === 'ALL' || ecu.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto pb-20">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-900 border border-gray-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-xl">
            <Cpu className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Universal Automotive ECU Compatibility Matrix</h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded">
                {ECU_DATABASE.length} Profiles
              </span>
            </div>
            <p className="text-xs text-gray-400">Bosch, Siemens, Trionic, Marelli, Delphi, Caterpillar & Sagem AI Disassembly Support</p>
          </div>
        </div>

        <div className="text-xs text-gray-400 font-mono bg-gray-950 px-3 py-2 rounded-xl border border-gray-800">
          <span>Arduino Uno Q Legacy Bridge: </span>
          <span className="text-emerald-400 font-bold">{ECU_DATABASE.filter(e => e.supportedByArduinoQ).length} Ready</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ECU family (e.g. EDC16C35, MS43, Trionic T7, ME7.5)..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Brand Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {brands.map(brand => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                  selectedBrand === brand 
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' 
                    : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ECU Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEcus.map(ecu => (
          <div key={ecu.id} className="bg-gray-900 border border-gray-800 hover:border-cyan-500/50 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase px-2 py-0.5 bg-gray-950 text-cyan-400 rounded border border-gray-800 font-semibold">
                  {ecu.brand}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  ecu.architecture === '16-bit' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                  ecu.architecture === '32-bit' ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' :
                  'bg-blue-500/10 text-blue-400 border-blue-500/30'
                }`}>
                  {ecu.architecture}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white font-mono">{ecu.family}</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{ecu.compatibilityNote}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-gray-950 p-2.5 rounded-xl border border-gray-800">
                <div>
                  <span className="text-gray-500 text-[10px] uppercase block">Bus Protocol</span>
                  <span className="text-gray-200 font-semibold">{ecu.busType}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] uppercase block">Max Dump Size</span>
                  <span className="text-cyan-400 font-semibold">&lt; {ecu.maxDumpSizeMb} MB</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs">
                {ecu.supportedByArduinoQ ? (
                  <span className="text-emerald-400 font-mono text-[11px] flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Arduino Q Ready</span>
                  </span>
                ) : (
                  <span className="text-gray-500 font-mono text-[11px]">High Speed CAN</span>
                )}
              </div>

              <button
                onClick={() => onSelectEcuForAnalysis(ecu)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-cyan-600 hover:text-black text-cyan-400 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border border-gray-700"
              >
                <span>Analyze with AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
