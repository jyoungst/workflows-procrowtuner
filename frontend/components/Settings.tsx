import React, { useState } from 'react';
import { Settings, Save, Server, Radio, HardDrive, Cpu, Database } from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const [tcpPort, setTcpPort] = useState('35000');
  const [baudRate, setBaudRate] = useState('115200');
  const [arduinoQPort, setArduinoQPort] = useState('230400');
  const [hermesEndpoint, setHermesEndpoint] = useState('http://192.168.43.50:8080/v1');
  const [esp32Ip, setEsp32Ip] = useState('192.168.43.105');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto h-full overflow-y-auto space-y-6 pb-20">
      <div className="flex items-center space-x-3 bg-gray-900 border border-gray-800 p-4 rounded-2xl">
        <div className="p-3 bg-cyan-500/20 border border-cyan-500/30 rounded-xl">
          <Settings className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">System & Hardware Settings</h2>
          <p className="text-xs text-gray-400">Configure host socket parameters, serial baud rates, and remote tuning endpoints</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Network Host Settings */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center space-x-2 text-white font-semibold pb-2 border-b border-gray-800">
            <Server className="w-5 h-5 text-blue-400" />
            <h3>Xtrons Host Wi-Fi Socket Server</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Local TCP Port (Hermes Pass-through)</label>
              <input
                type="text"
                value={tcpPort}
                onChange={(e) => setTcpPort(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Hermes Local LLM Endpoint</label>
              <input
                type="text"
                value={hermesEndpoint}
                onChange={(e) => setHermesEndpoint(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Speeduino / Teensy / Arduino Uno Q Hardware Settings */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center space-x-2 text-white font-semibold pb-2 border-b border-gray-800">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h3>Teensy 4.1 & Arduino Uno Q Hardware Gateways</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Teensy 4.1 Serial Baud Rate</label>
              <select
                value={baudRate}
                onChange={(e) => setBaudRate(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="115200">115200 (Standard Speeduino)</option>
                <option value="230400">230400 (High-Speed CAN)</option>
                <option value="500000">500000 (Raw CAN Interface)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Arduino Uno Q Gateway Baud</label>
              <select
                value={arduinoQPort}
                onChange={(e) => setArduinoQPort(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="115200">115200 Baud</option>
                <option value="230400">230400 Baud (Fast Loop)</option>
                <option value="460800">460800 Baud (Ultra High-Speed)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dump Storage & Catalog Settings */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center space-x-2 text-white font-semibold pb-2 border-b border-gray-800">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3>DME / CAS Firmware Extraction Catalog Parameters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Max Binary Dump Size Limit</label>
              <input
                type="text"
                value="20 MB"
                disabled
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-sm text-gray-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">ESP32-D Wi-Fi CAN Emulator IP</label>
              <input
                type="text"
                value={esp32Ip}
                onChange={(e) => setEsp32Ip(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/20"
        >
          <Save className="w-4 h-4" />
          <span>{isSaved ? 'Settings Saved Successfully!' : 'Save System Configuration'}</span>
        </button>
      </form>
    </div>
  );
};
