import React, { useState } from 'react';
import { Cpu, Zap, AlertTriangle, CheckCircle2, Play, Code, HardDrive, RefreshCw, FileCode, Shield, Sparkles } from 'lucide-react';
import { MissingSignalAnomaly, Esp32RomJob } from '../types.ts';

interface AiSignalEmulatorProps {
  isConnected: boolean;
  onWriteSerial: (cmd: string) => void;
}

export const AiSignalEmulator: React.FC<AiSignalEmulatorProps> = ({ isConnected, onWriteSerial }) => {
  const [anomalies, setAnomalies] = useState<MissingSignalAnomaly[]>([
    {
      id: 'anom-01',
      signalName: 'CAN ID 0x329 (DME Wheel Speed Rear Left & Cruise Control)',
      expectedHz: 50,
      lastSeenMsAgo: 14500,
      severity: 'CRITICAL',
      suggestedEmulationLogic: 'Replay wheel speed frequency synthesis from Transmission Output Shaft RPM on CAN 0x1A0',
      approvalStatus: 'PENDING_APPROVAL'
    },
    {
      id: 'anom-02',
      signalName: 'K-CAN ID 0x130 (CAS Key Status / Terminal 15 Power Ignition)',
      expectedHz: 10,
      lastSeenMsAgo: 8200,
      severity: 'WARNING',
      suggestedEmulationLogic: 'Emulate constant Terminal 15 Active (Byte 0: 0x45) for standalone Speeduino engine bench running',
      approvalStatus: 'APPROVED'
    }
  ]);

  const [esp32Job, setEsp32Job] = useState<Esp32RomJob>({
    id: 'rom-job-1049',
    targetDevice: 'ESP32-D Wi-Fi/Bluetooth Node',
    romVersion: 'v2.4-AiCompiled-Procrow',
    compiledAt: '2025-02-28 14:30',
    flashedToEsp32: false,
    generatedCppCode: `#include <CAN.h>
#include <WiFi.h>

// Procrow AI Compiled Specialty ROM for ESP32-D
// Auto-synthesizes missing CAN 0x329 Wheel Speed & 0x130 CAS Terminal 15

void setup() {
  Serial.begin(115200);
  CAN.setPins(5, 4); // CRX, CTX
  if (!CAN.begin(500E3)) {
    Serial.println("CAN Init Failed!");
    while (1);
  }
}

void loop() {
  // Emulate CAS Terminal 15
  uint8_t casData[8] = { 0x45, 0x00, 0x12, 0x00, 0x00, 0x00, 0x00, 0x00 };
  CAN.beginPacket(0x130);
  CAN.write(casData, 8);
  CAN.endPacket();

  delay(20); // 50Hz Loop
}`
  });

  const [isCompiling, setIsCompiling] = useState(false);
  const [isFlashingRom, setIsFlashingRom] = useState(false);

  const approveAnomalyLogic = (id: string) => {
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, approvalStatus: 'APPROVED' } : a));
  };

  const startAiCompiler = () => {
    setIsCompiling(true);
    onWriteSerial('AI COMPILE ESP32_D_SPECIALTY_ROM\r');

    setTimeout(() => {
      setIsCompiling(false);
      setEsp32Job(prev => ({
        ...prev,
        compiledAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        romVersion: 'v2.5-AiCompiled-Procrow-Updated'
      }));
    }, 1800);
  };

  const flashRomToEsp32 = () => {
    setIsFlashingRom(true);
    onWriteSerial('ESP32_D FLASH_OTA_ROM_START\r');

    setTimeout(() => {
      setIsFlashingRom(false);
      setEsp32Job(prev => ({ ...prev, flashedToEsp32: true }));
    }, 2200);
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto pb-20">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-900 border border-gray-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-600/20 border border-purple-500/30 rounded-xl">
            <Cpu className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Missing Signal AI Detection & ESP32-D Compiler</h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded">
                Procrow Signal Logic Engine
              </span>
            </div>
            <p className="text-xs text-gray-400">Detects missing ECU signals, replays Google Drive logs, and compiles custom C++ ROMs for the ESP32-D Wi-Fi node</p>
          </div>
        </div>

        <button
          onClick={startAiCompiler}
          disabled={isCompiling}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 shadow-lg shadow-purple-600/20 disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isCompiling ? 'animate-spin' : ''}`} />
          <span>{isCompiling ? 'AI Compiling Logic C++...' : 'Compile ESP32-D Specialty ROM'}</span>
        </button>
      </div>

      {/* Detected Missing Signals List */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-base font-semibold text-white">Detected Missing ECU Signals & Anomalies</h3>
              <p className="text-xs text-gray-400">AI monitors CAN stream for missing sensor/module heartbeats</p>
            </div>
          </div>
          <span className="text-xs font-mono text-gray-400">{anomalies.length} Signals Requiring Logic Emulation</span>
        </div>

        <div className="space-y-3">
          {anomalies.map(anom => (
            <div key={anom.id} className="p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${
                      anom.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {anom.severity}
                    </span>
                    <h4 className="font-mono text-sm font-bold text-white">{anom.signalName}</h4>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Expected Rate: {anom.expectedHz} Hz • Last Packet Seen: {anom.lastSeenMsAgo / 1000}s ago</p>
                </div>

                <div className="shrink-0">
                  {anom.approvalStatus === 'PENDING_APPROVAL' ? (
                    <button
                      onClick={() => approveAnomalyLogic(anom.id)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-colors shadow-md shadow-amber-500/20"
                    >
                      Approve AI Emulation Logic
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold rounded-xl border border-emerald-500/30 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>LOGIC APPROVED & QUEUED</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="p-2.5 bg-gray-900 rounded-lg border border-gray-800 text-xs font-mono text-cyan-300">
                <span className="text-gray-500 uppercase text-[10px] block mb-0.5">AI Proposed Emulation Synthesis Logic</span>
                {anom.suggestedEmulationLogic}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generated C++ ESP32-D ROM Source Code Preview */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pb-3 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <Code className="w-6 h-6 text-cyan-400" />
            <div>
              <h3 className="text-base font-semibold text-white">AI Compiled C++ Source Code for ESP32-D</h3>
              <p className="text-xs text-gray-400">Target: {esp32Job.targetDevice} • Version: {esp32Job.romVersion}</p>
            </div>
          </div>

          <button
            onClick={flashRomToEsp32}
            disabled={isFlashingRom || !isConnected}
            className={`px-4 py-2 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center space-x-2 border disabled:opacity-50 ${
              esp32Job.flashedToEsp32 
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400 shadow-cyan-600/20'
            }`}
          >
            <Zap className={`w-4 h-4 ${isFlashingRom ? 'animate-spin' : ''}`} />
            <span>{isFlashingRom ? 'OTA Flashing ESP32-D Node...' : esp32Job.flashedToEsp32 ? 'ROM Flashed to ESP32-D (Active)' : 'Flash ROM to ESP32-D via Wi-Fi'}</span>
          </button>
        </div>

        <pre className="p-4 bg-gray-950 border border-gray-800 rounded-xl font-mono text-xs text-cyan-400 overflow-x-auto leading-relaxed max-h-60">
          {esp32Job.generatedCppCode}
        </pre>
      </div>
    </div>
  );
};
